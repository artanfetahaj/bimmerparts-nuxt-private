# Legacy Redirects — EP04-003

301-redirect infrastructure for migrating `www.bimmerparts.nl` (old WooCommerce shop) to this Nuxt site.

---

## Input files (`input/`)

| File | What it is | How to get / refresh |
|---|---|---|
| `old_pages.txt` | All old-site page URLs (one per line, host stripped OK) | Export from old sitemap XML or crawl |
| `old_categories.txt` | Old category page URLs | Export from old sitemap `sitemap-categories.xml` |
| `old_products.txt` | Old product page URLs | Export from old sitemap `sitemap-products.xml` |
| `gsc_pages.csv` | Google Search Console top pages, columns `url,clicks` | GSC → Performance → Pages → Export CSV |
| `old_pages_meta.json` | Titles + canonicals fetched from old shop | Run `fetch_old_titles.py` (max 1 req/sec) |
| `new_products.json` | `[{slug,name,sku}]` from new API | `GET /api/public/products` |
| `car-models.json` | `[{id,code,name}]` from new API | `GET /api/public/car-models` |
| `old_products_sku.csv` | Manual old-path → SKU mapping, columns `old_path,sku` | Optional; highest-confidence matching |
| `manual.csv` | Manual overrides, columns `old_path,new_slug` | Fill from `review.csv` |

**Before the DNS switch**, refresh `gsc_pages.csv`, `old_pages_meta.json`, `new_products.json`, and `car-models.json` to get the most current data.

---

## Filling `manual.csv`

1. Open `review.csv` — it lists all unmatched URLs sorted by GSC clicks.
2. For each row where `best_guess_new_slug` looks wrong, look up the correct product slug on the new site.
3. Add a row to `manual.csv`: `old_path,new_slug` (slug only, no `/producten/` prefix).
4. Re-run `build.py` to regenerate `server/data/legacy-redirects.json`.

Never add a guess as truth. Only add an entry when you are sure of the correct target.

---

## Building the redirect map

```bash
python3 scripts/legacy-redirects/build.py
```

Output:
- `server/data/legacy-redirects.json` — 301 map used by the server middleware
- `review.csv` — unmatched URLs needing manual review

The script prints before/after stats for how many entries still fall back to the generic `/producten`.
**Do not commit a new JSON that has more plain `/producten` entries than the previous version without reviewing why.**

---

## Running the check

### Offline self-check (no network, no server needed)

Validates the JSON map for internal consistency: self-loops, chains, unknown UUIDs, unknown product slugs.

```bash
npm run redirects:check:static
# or:
node scripts/legacy-redirects/check.mjs --static
```

### Network check against staging

```bash
npm run redirects:check -- --base https://staging.bimmerparts.nl --env staging
```

Extra options:

| Option | Default | Description |
|---|---|---|
| `--concurrency <n>` | 8 | Parallel requests |
| `--limit <n>` | all | Only check first N paths |
| `--only-failures` | off | Skip OK rows in CSV |
| `--www-host <host>` | off | Also test `www.` variant (top 200 GSC paths) |

The report lands in `scripts/legacy-redirects/reports/redirect-check-<env>-<YYYYMMDD-HHmm>.csv`.

### After the DNS switch (production)

```bash
node scripts/legacy-redirects/check.mjs --base https://bimmerparts.nl --env production --www-host www.bimmerparts.nl
```

---

## Go-live checklist

- [ ] Crawl / export old site URLs **before** DNS switch (refresh `old_pages.txt`, `old_categories.txt`, `old_products.txt`)
- [ ] Refresh `gsc_pages.csv` from Search Console
- [ ] Refresh `new_products.json` and `car-models.json` from new API
- [ ] Run `fetch_old_titles.py` for unmatched products (max 1 req/sec)
- [ ] Fill `manual.csv` for high-traffic unmatched URLs (use `review.csv`)
- [ ] Run `build.py`, review stats diff, check fallback quality
- [ ] Run `--static` self-check: 0 errors
- [ ] Deploy to staging
- [ ] Run network check on staging: 0 errors, exit code 0
- [ ] Review any chain/loop warnings
- [ ] Switch DNS
- [ ] Run network check on production within 30 min of switch
- [ ] Run `--www-host www.bimmerparts.nl` to verify www→apex hops
- [ ] Monitor 404s (see **404 monitoring** note in task description)

---

## Architecture notes

The 301s are served by `server/middleware/legacy-redirects.ts` (Nitro server middleware).  
**This middleware only runs in SSR / `node-server` mode.** It does NOT run when the site is built with `nuxt generate` (static output). Check how production is deployed before go-live — see the hosting note in the task spec (EP04-003).
