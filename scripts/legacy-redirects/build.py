#!/usr/bin/env python3
"""
Builds the 301 redirect map from the OLD bimmerparts.nl URLs to the new site.

Inputs  (scripts/legacy-redirects/input/):
  old_pages.txt, old_categories.txt, old_products.txt   old sitemap URLs (one per line)
  new_products.json                                     [{slug,name,sku}] from /api/public/products
  car-models.json                                       /api/public/car-models
  old_products_sku.csv (optional)                       columns: old_path,sku  -> exact SKU matching (best)

Outputs:
  server/data/legacy-redirects.json                     { "/old-path": "/new-path" } used by the server middleware
  scripts/legacy-redirects/review.csv                   products that could NOT be matched with confidence

Run:  python3 scripts/legacy-redirects/build.py
"""
import csv, json, os, re
from collections import Counter

ROOT = os.path.dirname(os.path.abspath(__file__))
INP = os.path.join(ROOT, "input")
OUT_JSON = os.path.join(ROOT, "..", "..", "server", "data", "legacy-redirects.json")
HOST = re.compile(r"^https?://(www\.)?bimmerparts\.nl", re.I)

def lines(name):
    p = os.path.join(INP, name)
    return [HOST.sub("", l.strip()) for l in open(p) if l.strip()] if os.path.exists(p) else []

def key(path):  # normalised lookup key, mirrors server/middleware/legacy-redirects.ts
    path = path.split("?")[0].split("#")[0]
    path = re.sub(r"\.html$", "", path, flags=re.I).rstrip("/").lower()
    return path or "/"

def core(k):  # /webwinkel-product-123/real-slug  ->  /real-slug (old shop's nested product URLs)
    return "/" + k.split("/")[-1] if k.startswith("/webwinkel-product-") else k

def slugify(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def toks(s): return {t for t in slugify(s).split("-") if t}

redirects = {}

# ── 1. Content pages (manual mapping) ─────────────────────────────────────────
PAGES = {
    "/over-bimmerparts": "/over-ons",
    "/werkplaats": "/over-ons",
    "/product-aanvraag": "/contact",
    "/bestellen": "/contact",
    "/betalen": "/contact",
    "/verzenden-en-ophalen": "/contact",
    "/ruilen-en-retourneren": "/contact",
    "/onze-merken": "/producten",
    "/recensies": "/",
    "/montagehandleidingen": "/producten",
    "/cookie-verklaring": "/privacy",
    "/disclaimer": "/privacy",
    "/algemene-voorwaarden": "/terms",
    "/cobra-suspension": "/cobra-suspension",
    "/eventuri": "/eventuri",
    "/webwinkel-page-5449727/account-gegevens": "/account",
    "/car-care": "/producten",
    "/lifestyle": "/producten",
}
for old, new in PAGES.items():
    if key(old) != new: redirects[key(old)] = new

# ── 2. Series + car-model pages ───────────────────────────────────────────────
SERIES_ANCHOR = {"1-serie": "1-Series", "2-serie": "2-Series", "3-serie": "3-Series", "4-serie": "4-Series",
                 "5-serie": "5-Series", "6-serie": "6-Series", "7-serie": "7-Series", "8-serie": "8-Series",
                 "x-serie": "X", "z-serie": "Z", "i-serie": "i"}
models = json.load(open(os.path.join(INP, "car-models.json")))
models = models.get("data", models)
by_code = {}
for m in models:
    by_code.setdefault((m.get("code") or "").lower(), []).append(m)

cat_stats = Counter()
for p in lines("old_categories.txt"):
    k = key(p)
    name = k.strip("/")
    if name in SERIES_ANCHOR:
        redirects[k] = "/bmw-model-codes#series-" + SERIES_ANCHOR[name]; cat_stats["series"] += 1; continue
    if name == "mini":
        redirects[k] = "/mini-model-codes"; cat_stats["series"] += 1; continue
    code = next((t for t in re.split(r"[-/]", name) if t in by_code), None)
    if code:
        redirects[k] = f"/producten?car_model={by_code[code][0]['id']}"; cat_stats["model"] += 1
    else:
        redirects[k] = "/producten"; cat_stats["fallback"] += 1

# ── 3. Products ───────────────────────────────────────────────────────────────
new = [p for p in json.load(open(os.path.join(INP, "new_products.json"))) if p.get("slug")]
by_slug = {slugify(p["slug"]): p for p in new}
by_sku = {(p.get("sku") or "").strip().lower(): p for p in new if p.get("sku")}
tokens = [(p, toks(p["slug"]) | toks(p.get("name") or "")) for p in new]

sku_map = {}
sku_csv = os.path.join(INP, "old_products_sku.csv")
if os.path.exists(sku_csv):
    for r in csv.DictReader(open(sku_csv)):
        sku_map[key(r["old_path"])] = (r["sku"] or "").strip().lower()

# Extra signals: Search Console pages (traffic-weighted, also catches URLs missing from the old sitemap)
# and titles / part numbers fetched from the old shop (fetch_old_titles.py)
clicks = {}
gsc = os.path.join(INP, "gsc_pages.csv")
gsc_urls = []
if os.path.exists(gsc):
    for r in csv.DictReader(open(gsc)):
        clicks[key(HOST.sub("", r["url"]))] = int(r["clicks"]); gsc_urls.append(HOST.sub("", r["url"]))
meta_by_key = {}
meta_file = os.path.join(INP, "old_pages_meta.json")
meta = json.load(open(meta_file)) if os.path.exists(meta_file) else {"categories": {}, "products": {}}
for url, info in meta["products"].items():
    meta_by_key[key(HOST.sub("", url))] = info

def split_title(title):  # "BMW LED Portierprojectoren - 63312414105" -> (name, partno)
    m = re.match(r"^(.*?)\s+-\s+([A-Za-z0-9. /]+)$", title.strip())
    return (m.group(1), re.sub(r"[^a-z0-9]", "", m.group(2).lower())) if m else (title, "")

sku_norm = {re.sub(r"[^a-z0-9]", "", (p.get("sku") or "").lower()): p for p in new if p.get("sku")}

def best_match(ot):
    best, bs, second = None, 0, 0
    for p, t in tokens:
        if not t: continue
        j = len(ot & t) / len(ot | t)
        if j > bs: second, bs, best = bs, j, p
        elif j > second: second = j
    return best, bs, second

known_keys = set(redirects) | {key(x) for x in PAGES} | {"/", "/bmw-model-codes", "/mini-model-codes", "/contact", "/over-ons"}
candidates = list(dict.fromkeys(lines("old_products.txt") + [u for u in gsc_urls if key(u) not in known_keys]))

stats, review = Counter(), []
for old in candidates:
    k = key(old)
    if k in redirects or k in known_keys: continue
    target, tier, score, guess = None, "", 0, ""
    info = meta_by_key.get(k)
    title, partno = split_title(info["title"]) if info and info.get("title") else ("", "")
    if k in sku_map and sku_map[k] in by_sku:
        target, tier = by_sku[sku_map[k]]["slug"], "sku"
    elif slugify(core(k)) in by_slug:
        target, tier = by_slug[slugify(core(k))]["slug"], "exact"
    elif partno and len(partno) >= 5 and partno in sku_norm:
        target, tier = sku_norm[partno]["slug"], "partno"
    else:
        best, bs, second = best_match(toks(core(k)))
        if title:  # the old page title is a better signal than its URL slug
            b2, s2, sec2 = best_match(toks(title))
            if s2 > bs: best, bs, second = b2, s2, sec2
        score, guess = round(bs, 2), (best["slug"] if best else "")
        # Only auto-apply very close matches; a wrong 301 is worse than a generic one
        if best and bs >= 0.75 and bs - second >= 0.1:
            target, tier = best["slug"], "high"
        else:
            tier = "review" if bs >= 0.4 else "none"
    stats[tier] += 1
    if target:
        redirects[k] = f"/producten/{target}"
    else:
        redirects[k] = "/producten"
        review.append((old, title, guess, tier, score, clicks.get(k, 0)))

# Old platform query-style category URLs: /website/index.php?ProductCategory=<id>  ->  same target as its canonical page
for cid, canon_url in meta["categories"].items():
    tgt = redirects.get(key(HOST.sub("", canon_url))) if canon_url else None
    if tgt: redirects[f"/website/index.php?productcategory={cid}"] = tgt; stats["category-id"] += 1

review.sort(key=lambda r: -r[5])

# ── 4. Manual overrides (filled in from review.csv): old_path,new_slug ─────────────
manual = os.path.join(INP, "manual.csv")
if os.path.exists(manual):
    for r in csv.DictReader(open(manual)):
        if r.get("new_slug"):
            redirects[key(r["old_path"])] = "/producten/" + r["new_slug"].strip().strip("/"); stats["manual"] += 1

# ── Write ─────────────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
json.dump(dict(sorted(redirects.items())), open(OUT_JSON, "w"), ensure_ascii=False, indent=0)
with open(os.path.join(ROOT, "review.csv"), "w", newline="") as f:
    w = csv.writer(f); w.writerow(["old_path", "old_title", "best_guess_new_slug", "confidence", "score", "clicks_3m", "correct_new_slug (fill in)"])
    w.writerows([r + ("",) for r in review])
print("categories:", dict(cat_stats)); print("products:", dict(stats)); print("total redirects:", len(redirects))
