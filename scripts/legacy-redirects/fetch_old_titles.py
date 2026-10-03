#!/usr/bin/env python3
"""Throttled fetch of title/part-number/canonical for old pages (1 req/sec) -> input/old_pages_meta.json
Usage: fetch_old_titles.py <to_fetch.json>   (json: {"ids":[...], "fallback":[{"clicks":n,"url":...}]})"""
import json, re, sys, time, html, urllib.request, os
ROOT = os.path.dirname(os.path.abspath(__file__))
todo = json.load(open(sys.argv[1]))
out = {"categories": {}, "products": {}}
def get(url):
    for _ in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (redirect-migration)"})
            return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
        except Exception:
            time.sleep(3)
    return ""
def canon(h):
    m = re.search(r'rel="canonical" href="([^"]+)', h); return m.group(1) if m else ""
for i in todo["ids"]:
    h = get(f"https://www.bimmerparts.nl/website/index.php?ProductCategory={i}")
    out["categories"][i] = canon(h); time.sleep(1)
for r in todo["fallback"]:
    h = get(r["url"])
    t = re.search(r'property="og:title" content="([^"]*)', h)
    title = html.unescape(t.group(1)).strip() if t else ""
    out["products"][r["url"]] = {"title": title, "canonical": canon(h), "clicks": r["clicks"]}
    time.sleep(1)
json.dump(out, open(os.path.join(ROOT, "input", "old_pages_meta.json"), "w"), indent=0, ensure_ascii=False)
print("done", len(out["categories"]), len(out["products"]))
