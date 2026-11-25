#!/usr/bin/env node
/**
 * EP04-003 — Redirect check script
 *
 * Usage:
 *   node scripts/legacy-redirects/check.mjs --base https://staging.example --env staging
 *   node scripts/legacy-redirects/check.mjs --static              (offline map self-check, no network)
 *
 * Options:
 *   --base <url>          Base URL of the site to check (required unless --static)
 *   --env <name>          Environment label for the report filename (default: "check")
 *   --concurrency <n>     Parallel requests (default: 8)
 *   --limit <n>           Only check the first N paths
 *   --only-failures       Skip OK rows in the CSV output
 *   --www-host <host>     Also check www variant against top 200 GSC paths (warnings only, no exit-code impact)
 *   --static              Offline self-check of the redirect map, no network
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dir  = dirname(fileURLToPath(import.meta.url))
const ROOT   = resolve(__dir, '../..')
const INP    = join(__dir, 'input')
const MAP_FILE = join(ROOT, 'server/data/legacy-redirects.json')

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const arg  = (flag, def) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : def }
const flag = (f) => args.includes(f)

const BASE         = arg('--base', '').replace(/\/$/, '')
const ENV_LABEL    = arg('--env', 'check')
const CONCURRENCY  = parseInt(arg('--concurrency', '8'), 10)
const LIMIT        = arg('--limit', null) ? parseInt(arg('--limit', '0'), 10) : null
const ONLY_FAIL    = flag('--only-failures')
const WWW_HOST     = arg('--www-host', '')
const STATIC_MODE  = flag('--static')

if (!STATIC_MODE && !BASE) {
  console.error('Error: --base <url> is required (or use --static for offline self-check)')
  process.exit(1)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const HOST_RE = /^https?:\/\/(www\.)?bimmerparts\.nl/i

function stripHost(u) {
  return u ? u.replace(HOST_RE, '') : u
}

function normalizeKey(path) {
  let p = path
  try { p = decodeURIComponent(p) } catch { /* keep raw */ }
  // Only normalize the path part, preserve query string intact
  const qi = p.indexOf('?')
  let pathPart = qi >= 0 ? p.slice(0, qi) : p
  const query  = qi >= 0 ? p.slice(qi)    : ''
  pathPart = pathPart.replace(/\/+$/, '').replace(/\.html$/i, '').toLowerCase()
  return (pathPart || '/') + query.toLowerCase()
}

// RFC-4180 CSV parser that handles quoted fields with embedded commas and escaped quotes
function parseCsvLine(line) {
  const fields = []
  let i = 0
  while (i <= line.length) {
    if (i === line.length) { fields.push(''); break }
    if (line[i] === '"') {
      let field = ''
      i++ // skip opening quote
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2 }
        else if (line[i] === '"') { i++; break }
        else { field += line[i++] }
      }
      fields.push(field)
      if (line[i] === ',') i++
    } else {
      const end = line.indexOf(',', i)
      if (end === -1) { fields.push(line.slice(i)); break }
      fields.push(line.slice(i, end))
      i = end + 1
    }
  }
  return fields
}

function readCsvRows(file) {
  if (!existsSync(file)) return []
  const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean)
  if (!lines.length) return []
  const header = parseCsvLine(lines[0]).map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = parseCsvLine(line)
    return Object.fromEntries(header.map((h, i) => [h, (vals[i] ?? '').trim()]))
  })
}

function readLines(name) {
  const p = join(INP, name)
  if (!existsSync(p)) return []
  return readFileSync(p, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => stripHost(l))
}

// ── Load redirect map ─────────────────────────────────────────────────────────
if (!existsSync(MAP_FILE)) {
  console.error(`Map not found: ${MAP_FILE}\nRun build.py first.`)
  process.exit(1)
}
const map = JSON.parse(readFileSync(MAP_FILE, 'utf8'))

// ── Load expected-gone list ───────────────────────────────────────────────────
// Paths in this file are expected to 404; treated as ok-expected-gone, not an error.
const expectedGoneFile = join(INP, 'expected-gone.txt')
const expectedGone = new Set(
  existsSync(expectedGoneFile)
    ? readFileSync(expectedGoneFile, 'utf8')
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'))
        .map(l => normalizeKey(stripHost(l)))
    : []
)

// ══════════════════════════════════════════════════════════════════════════════
// STATIC SELF-CHECK (--static)
// ══════════════════════════════════════════════════════════════════════════════
if (STATIC_MODE) {
  console.log('\n── Static self-check ────────────────────────────────────────')
  if (expectedGone.size) console.log(`  expected-gone list: ${expectedGone.size} path(s) — intentional 404s, not checked`)

  const newProductsFile = join(INP, 'new_products.json')
  const carModelsFile   = join(INP, 'car-models.json')
  const newProducts     = existsSync(newProductsFile) ? JSON.parse(readFileSync(newProductsFile, 'utf8')) : []
  const carModelsRaw    = existsSync(carModelsFile) ? JSON.parse(readFileSync(carModelsFile, 'utf8')) : []
  const carModels       = Array.isArray(carModelsRaw) ? carModelsRaw : (carModelsRaw.data || [])

  const knownSlugs = new Set(newProducts.map(p => p.slug).filter(Boolean))
  const knownUUIDs = new Set(carModels.map(m => m.id).filter(Boolean))

  const errors = {
    selfLoop:     [],
    chainTarget:  [],
    homepageOnly: [],
    badUUID:      [],
    badSlug:      [],
  }

  const keySet = new Set(Object.keys(map))

  for (const [k, v] of Object.entries(map)) {
    if (k === v) errors.selfLoop.push(k)
    if (keySet.has(v)) errors.chainTarget.push({ from: k, via: v, to: map[v] })
    if (v === '/' && k !== '/') errors.homepageOnly.push(k)

    const uuidMatch = v.match(/^\/producten\?car_model=([0-9a-f-]{36})$/i)
    if (uuidMatch && !knownUUIDs.has(uuidMatch[1])) errors.badUUID.push({ key: k, uuid: uuidMatch[1] })

    const slugMatch = v.match(/^\/producten\/(.+)$/)
    if (slugMatch && !knownSlugs.has(slugMatch[1])) errors.badSlug.push({ key: k, slug: slugMatch[1] })
  }

  const counts = {
    total:      Object.keys(map).length,
    toProduct:  Object.values(map).filter(v => v.startsWith('/producten/') && !v.includes('?')).length,
    toCarModel: Object.values(map).filter(v => v.includes('?car_model=')).length,
    toGeneric:  Object.values(map).filter(v => v === '/producten').length,
    toHomepage: Object.values(map).filter(v => v === '/').length,
    toOther:    Object.values(map).filter(v => !v.startsWith('/producten') && v !== '/').length,
  }

  console.log('\nMap statistics:')
  console.log(`  Total entries                : ${counts.total}`)
  console.log(`  → /producten/<slug>          : ${counts.toProduct}`)
  console.log(`  → /producten?car_model=      : ${counts.toCarModel}`)
  console.log(`  → /producten (generic)       : ${counts.toGeneric}`)
  console.log(`  → / (homepage)               : ${counts.toHomepage}`)
  console.log(`  → other pages                : ${counts.toOther}`)

  console.log('\nSelf-check results:')
  console.log(`  Self-loops (key→itself)      : ${errors.selfLoop.length}`)
  console.log(`  Chain targets (A→B, B in map): ${errors.chainTarget.length}`)
  console.log(`  Homepage-only (k≠/)          : ${errors.homepageOnly.length}  (${errors.homepageOnly.join(', ') || 'none'})`)
  console.log(`  Unknown car_model UUIDs      : ${errors.badUUID.length}`)
  console.log(`  Unknown product slugs        : ${errors.badSlug.length}`)

  if (errors.selfLoop.length)    console.log('\n  Self-loops:', errors.selfLoop.slice(0, 10))
  if (errors.chainTarget.length) {
    console.log('\n  Chains (first 10):')
    errors.chainTarget.slice(0, 10).forEach(e => console.log(`    ${e.from} → ${e.via} → ${e.to}`))
  }
  if (errors.badUUID.length) {
    console.log('\n  Bad UUIDs (first 10):')
    errors.badUUID.slice(0, 10).forEach(e => console.log(`    ${e.key} → ${e.uuid}`))
  }
  if (errors.badSlug.length) {
    console.log('\n  Bad product slugs (first 20):')
    errors.badSlug.slice(0, 20).forEach(e => console.log(`    ${e.key} → /producten/${e.slug}`))
  }

  // Check for map keys that the middleware would skip due to the asset-extension filter.
  // The allowlist must match ASSET_EXT in server/middleware/legacy-redirects.ts exactly.
  const ASSET_EXT_RE = /\.(js|css|map|mjs|ts|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|eot|otf|pdf|xml|txt|json|csv|zip|gz|mp4|webm|mp3|ogg)$/i
  const skippedByMiddleware = Object.keys(map).filter(k => {
    // Middleware skips keys that: don't start with /_/api AND match ASSET_EXT_RE
    // (The /_/ and /api/ prefixes would never be in the redirect map, so just check the regex.)
    return ASSET_EXT_RE.test(k)
  })
  console.log(`\nMiddleware asset-filter check:`)
  console.log(`  Keys skipped by ASSET_EXT filter: ${skippedByMiddleware.length}`)
  if (skippedByMiddleware.length) {
    console.log('  (These map entries are unreachable — the middleware returns early before the lookup)')
    skippedByMiddleware.slice(0, 20).forEach(k => console.log(`    ${k}`))
    if (skippedByMiddleware.length > 20) console.log(`    ... and ${skippedByMiddleware.length - 20} more`)
  }

  const totalErrors = errors.selfLoop.length + errors.chainTarget.length + errors.badUUID.length + errors.badSlug.length + skippedByMiddleware.length
  if (totalErrors > 0) {
    console.log(`\n✗ Self-check failed: ${totalErrors} issue(s) found.\n`)
    process.exit(1)
  } else {
    console.log('\n✓ Self-check passed.\n')
    process.exit(0)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// NETWORK CHECK
// ══════════════════════════════════════════════════════════════════════════════

// ── Build input set (dedupe on normalized key, keep original spelling) ────────
const gscRows = readCsvRows(join(INP, 'gsc_pages.csv'))
const clicks  = {}  // normalizedKey → clicks
// Keep insertion order: GSC first (traffic-weighted for top-20 failure report)
const keyOrder = []   // normalized keys in insertion order
const origByKey = {}  // normalizedKey → original path string (first seen wins)

function addPath(original) {
  if (!original) return
  const stripped = stripHost(original)
  if (!stripped) return
  const k = normalizeKey(stripped)
  if (origByKey[k]) return  // already seen; keep original spelling
  origByKey[k] = stripped
  keyOrder.push(k)
}

for (const row of gscRows) {
  if (!row.url) continue
  const path = stripHost(row.url)
  if (path) {
    addPath(path)
    clicks[normalizeKey(path)] = parseInt(row.clicks || '0', 10)
  }
}
for (const u of readLines('old_pages.txt'))      addPath(u)
for (const u of readLines('old_categories.txt')) addPath(u)
for (const u of readLines('old_products.txt'))   addPath(u)
for (const k of Object.keys(map))               addPath(k)

const allKeys = LIMIT ? keyOrder.slice(0, LIMIT) : keyOrder

console.log(`\nChecking ${allKeys.length} paths against ${BASE} (concurrency ${CONCURRENCY})`)

// Top 200 by GSC clicks (normalized keys)
const top200Keys = [...Object.entries(clicks)]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 200)
  .map(([k]) => k)

// ── Fetch helpers ─────────────────────────────────────────────────────────────
const TIMEOUT_MS = 10_000
const MAX_HOPS   = 5

async function fetchOnce(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const r = await fetch(url, {
      redirect: 'manual',
      signal:   ctrl.signal,
      headers:  { 'User-Agent': 'bimmerparts-redirect-check/1.0' },
    })
    return r
  } catch (e) {
    return { error: e.message }
  } finally {
    clearTimeout(timer)
  }
}

async function fetchWithRetry(url) {
  let r = await fetchOnce(url)
  if (r.error || (r.status >= 500 && r.status < 600)) {
    await new Promise(res => setTimeout(res, 1500))
    r = await fetchOnce(url)
  }
  return r
}

async function followHops(startUrl) {
  const seen = new Set()
  let url = startUrl
  let hops = 0
  while (hops <= MAX_HOPS) {
    if (seen.has(url)) return { finalUrl: url, finalStatus: null, hops, error: 'loop' }
    seen.add(url)
    const r = await fetchWithRetry(url)
    if (r.error) return { finalUrl: url, finalStatus: null, hops, error: `network:${r.error}` }
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get('location')
      if (!loc) return { finalUrl: url, finalStatus: r.status, hops, error: 'missing-location' }
      url = new URL(loc, url).href
      hops++
      continue
    }
    return { finalUrl: url, finalStatus: r.status, hops, error: null }
  }
  return { finalUrl: url, finalStatus: null, hops, error: 'too-many-hops' }
}

// ── Check one path ────────────────────────────────────────────────────────────
// originalPath: the URL as it appears in input files (host already stripped)
// key:          normalizeKey(originalPath) — used for map lookup
// variantLabel: 'base' | 'html' | 'slash' | 'upper' | 'www'
async function checkPath(originalPath, key, variantLabel = 'base') {
  const url      = BASE + originalPath
  const expected = map[key]  // may be undefined for paths not in map

  const result = {
    variant:      variantLabel,
    old_url:      originalPath,
    expected:     expected ?? '',
    location:     '',
    status:       '',
    final_url:    '',
    final_status: '',
    hops:         0,
    error:        '',
    warning:      '',
  }

  const r = await fetchWithRetry(url)
  if (r.error) {
    result.error = `network:${r.error}`
    return result
  }

  result.status = r.status

  if (expected === undefined) {
    // Path not in the redirect map — just check it's reachable
    if (r.status === 200) {
      result.error = ''  // OK: path exists on new site, no redirect needed
      result.status = 'ok-same-url'
    } else if (r.status === 404 && expectedGone.has(key)) {
      result.status = 'ok-expected-gone'
    } else if (r.status >= 300 && r.status < 400) {
      // .html variant of a same-url page redirects to its canonical — that's correct
      const SAME_URL_PAGES = new Set(['/', '/contact', '/bmw-model-codes', '/mini-model-codes', '/cobra-suspension', '/eventuri'])
      const cleanKey = key.replace(/\.html$/i, '')
      if (SAME_URL_PAGES.has(cleanKey)) {
        const rawLoc = r.headers.get('location') || ''
        const loc = rawLoc ? (() => { try { return new URL(rawLoc, BASE).pathname } catch { return rawLoc } })() : ''
        if (loc === cleanKey) {
          result.status = 'ok-html-canonical'
          return result
        }
      }
      result.error = `unexpected-redirect:${r.status}`
    } else {
      result.error = `missing-redirect:${r.status}`
    }
    return result
  }

  // Path IS in the map — expect a 301
  if (r.status !== 301) {
    if ([302, 307, 308].includes(r.status)) {
      result.error = `wrong-redirect-type:${r.status}`
    } else if (r.status === 200) {
      result.error = 'no-redirect:200'
    } else {
      result.error = `unexpected-status:${r.status}`
    }
  }

  const rawLocation = r.headers.get('location') || ''
  if (rawLocation) {
    const loc = new URL(rawLocation, BASE)
    result.location = loc.pathname + loc.search
  }

  // Verify Location matches expected (path+query; note fragment in expected)
  if (result.location) {
    const expClean = expected.split('#')[0]
    if (expClean !== result.location) {
      const msg = `wrong-target:expected=${expClean} got=${result.location}`
      result.error = result.error ? result.error + ',' + msg : msg
    }
    // Report if expected had a fragment (informational)
    if (expected.includes('#') && rawLocation.includes('#')) {
      const expFrag = expected.split('#')[1] || ''
      const locFrag = new URL(rawLocation, BASE).hash.slice(1)
      if (expFrag !== locFrag) result.warning = `fragment-mismatch:expected=#${expFrag} got=#${locFrag}`
    }
  }

  // Follow hops for final status
  if (rawLocation) {
    const targetUrl = new URL(rawLocation, url).href
    const { finalUrl, finalStatus, hops, error: hopError } = await followHops(targetUrl)
    result.final_url    = (() => { try { const u = new URL(finalUrl); return u.pathname + u.search } catch { return finalUrl } })()
    result.final_status = finalStatus
    result.hops         = hops + 1  // include this first hop

    if (hopError === 'loop') {
      result.error = result.error ? result.error + ',loop' : 'loop'
    } else if (hopError === 'too-many-hops') {
      result.error = result.error ? result.error + ',chain' : 'chain'
    } else if (hopError) {
      result.error = result.error ? result.error + `,${hopError}` : hopError
    } else if (finalStatus !== 200) {
      result.error = result.error ? result.error + `,final-not-200:${finalStatus}` : `final-not-200:${finalStatus}`
    }

    if (result.hops > 1 && !result.error) {
      result.error = `chain:${result.hops}-hops`
    }
  }

  return result
}

// ── Check www variant ─────────────────────────────────────────────────────────
// Requests https://wwwHost + path, follows all hops, verifies final URL path
// matches expected target. 2-hop chains (www→apex→target) are a warning, not error.
async function checkWwwPath(originalPath, key, wwwHost) {
  const url      = `https://${wwwHost}${originalPath}`
  const expected = map[key]

  const result = {
    variant:      'www',
    old_url:      originalPath,
    expected:     expected ?? '',
    location:     '',
    status:       '',
    final_url:    '',
    final_status: '',
    hops:         0,
    error:        '',
    warning:      '',
  }

  const { finalUrl, finalStatus, hops, error: hopError } = await followHops(url)
  result.hops         = hops
  result.final_status = finalStatus
  result.final_url    = (() => { try { const u = new URL(finalUrl); return u.pathname + u.search } catch { return finalUrl } })()

  if (hopError === 'loop')          { result.error = 'loop'; return result }
  if (hopError === 'too-many-hops') { result.error = 'chain'; return result }
  if (hopError)                     { result.error = hopError; return result }

  if (expected) {
    const expClean = expected.split('#')[0]
    if (result.final_url !== expClean) {
      result.error = `wrong-final-target:expected=${expClean} got=${result.final_url}`
      return result
    }
  }

  if (finalStatus !== 200) {
    result.error = `final-not-200:${finalStatus}`
    return result
  }

  if (hops >= 2) result.warning = `www-2-hops:${hops}`

  return result
}

// ── Build variant path strings ────────────────────────────────────────────────
// Uppercase only the path part, not the query string
function upperPath(p) {
  const qi = p.indexOf('?')
  if (qi === -1) return p.toUpperCase()
  return p.slice(0, qi).toUpperCase() + p.slice(qi)
}

// Build variants from the normalized key so we never produce double-.html or .html/ artifacts.
// Also skip .html variant for query-string paths (index.php?...) since appending .html is nonsensical.
function variantsForKey(k) {
  const hasQuery = k.includes('?')
  const items = []
  if (!hasQuery && k !== '/') items.push({ original: k + '.html',  key: normalizeKey(k + '.html'),  label: 'html'  })
  items.push(      { original: k + '/',          key: normalizeKey(k + '/'),       label: 'slash' })
  items.push(      { original: upperPath(k),     key: normalizeKey(upperPath(k)),  label: 'upper' })
  return items
}

// ── Concurrency pool ──────────────────────────────────────────────────────────
async function runPool(items, fn, concurrency, label = '') {
  const results = []
  const queue   = [...items]
  let done = 0
  const total = items.length

  async function worker() {
    while (queue.length) {
      const item = queue.shift()
      results.push(await fn(item))
      done++
      if (done % 50 === 0 || done === total) {
        process.stdout.write(`\r  ${label}${done}/${total} checked...`)
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  process.stdout.write('\n')
  return results
}

// ── Run base checks ───────────────────────────────────────────────────────────
const baseResults = await runPool(
  allKeys,
  (k) => checkPath(origByKey[k], k, 'base'),
  CONCURRENCY,
)

// ── Variant checks (top 200 by GSC clicks) ────────────────────────────────────
let variantResults = []
if (top200Keys.length) {
  console.log(`\nVariant checks on top ${top200Keys.length} paths (html / slash / upper)...`)
  const variantItems = top200Keys.flatMap(k => variantsForKey(k))
  variantResults = await runPool(
    variantItems,
    ({ original, key, label }) => checkPath(original, key, label),
    CONCURRENCY,
    'variant ',
  )
  const varOk = variantResults.filter(r => !r.error).length
  console.log(`  Variant ok: ${varOk}/${variantResults.length}`)
}

// ── www checks (top 200, warnings only) ──────────────────────────────────────
let wwwResults = []
if (WWW_HOST && top200Keys.length) {
  console.log(`\nWWW checks (--www-host ${WWW_HOST}) on top ${top200Keys.length} paths...`)
  wwwResults = await runPool(
    top200Keys,
    (k) => checkWwwPath(origByKey[k] || k, k, WWW_HOST),
    CONCURRENCY,
    'www ',
  )
  const wwwWarn = wwwResults.filter(r => r.warning?.startsWith('www-2-hops')).length
  const wwwErr  = wwwResults.filter(r => r.error).length
  console.log(`  www OK: ${wwwResults.length - wwwErr - wwwWarn}  warnings(2-hops): ${wwwWarn}  errors: ${wwwErr}`)
}

// ── Write report CSV ──────────────────────────────────────────────────────────
const reportsDir = join(__dir, 'reports')
mkdirSync(reportsDir, { recursive: true })
const now   = new Date()
const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`
const reportFile = join(reportsDir, `redirect-check-${ENV_LABEL}-${stamp}.csv`)

const allResults = [...baseResults, ...variantResults, ...wwwResults]

const csvEsc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`
const csvRow  = r => [r.variant, r.old_url, r.expected, r.location, r.status, r.final_url, r.final_status, r.hops, r.error, r.warning].map(csvEsc).join(',')
const csvHead = 'variant,old_url,expected,location,status,final_url,final_status,hops,error,warning\n'

const csvRows = allResults
  .filter(r => !ONLY_FAIL || r.error || r.warning)
  .map(csvRow)
  .join('\n')

writeFileSync(reportFile, csvHead + csvRows, 'utf8')
console.log(`\nReport: ${reportFile}`)

// ── Console summary ───────────────────────────────────────────────────────────
const baseOk          = baseResults.filter(r => !r.error)
const baseExpGone     = baseResults.filter(r => r.status === 'ok-expected-gone')
const baseErrors      = baseResults.filter(r => r.error)
const errByType  = {}
for (const r of baseErrors) {
  const type = r.error.split(':')[0].split(',')[0]
  errByType[type] = (errByType[type] || 0) + 1
}
const varErrors = variantResults.filter(r => r.error)
const wwwWarnCount = wwwResults.filter(r => r.warning && !r.error).length
const wwwErrCount  = wwwResults.filter(r => r.error).length

console.log('\n── Summary ──────────────────────────────────────────────────')
console.log(`  Base checks  total        : ${baseResults.length}`)
console.log(`  Base checks  OK           : ${baseOk.length}`)
if (baseExpGone.length) console.log(`  Base checks  expected-gone: ${baseExpGone.length}  (intentional 404s — ${baseExpGone.map(r => r.old_url).join(', ')})`)
console.log(`  Base checks  errors       : ${baseErrors.length}`)
if (variantResults.length) {
  console.log(`  Variant checks ok    : ${variantResults.length - varErrors.length}/${variantResults.length}`)
  console.log(`  Variant checks errors: ${varErrors.length}`)
}
if (wwwResults.length) {
  console.log(`  www warnings (2-hops): ${wwwWarnCount}`)
  console.log(`  www errors           : ${wwwErrCount}`)
}

if (Object.keys(errByType).length) {
  console.log('\n  Base error types:')
  for (const [t, n] of Object.entries(errByType).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${t.padEnd(32)} ${n}`)
  }
}

// Top 20 base failures by GSC clicks
const topFails = baseErrors
  .map(r => ({ ...r, _clicks: clicks[normalizeKey(r.old_url)] || 0 }))
  .sort((a, b) => b._clicks - a._clicks)
  .slice(0, 20)

if (topFails.length) {
  console.log('\n  Top base failures by GSC clicks:')
  for (const r of topFails) {
    console.log(`    [${r._clicks} clicks] ${r.old_url}  error=${r.error}`)
  }
}

console.log('')

// Exit 1 on base errors OR variant errors; www warnings do NOT affect exit code
const exitErrors = baseErrors.length + varErrors.length + wwwErrCount
process.exit(exitErrors > 0 ? 1 : 0)
