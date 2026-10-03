// One-off: downsizes oversized static images in public/images in place (same file names, same formats).
import sharp from 'sharp'
import { readdirSync, statSync, renameSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'public/images'
const LIMIT = 250 * 1024
// Logos / series images are shown at ~100-300px wide; photos/banners up to full-width hero
const maxWidth = (f) => (/series|mini|logo|i8|strongflex|k&n/i.test(f) ? 640 : 1920)

let before = 0, after = 0
for (const f of readdirSync(dir)) {
  const src = join(dir, f)
  if (!/\.(png|jpe?g)$/i.test(f) || statSync(src).size < LIMIT) continue
  const size = statSync(src).size
  const tmp = src + '.tmp'
  const img = sharp(src).resize({ width: maxWidth(f), withoutEnlargement: true })
  await (/\.png$/i.test(f) ? img.png({ compressionLevel: 9, palette: true, quality: 85 }) : img.jpeg({ quality: 80, mozjpeg: true })).toFile(tmp)
  if (statSync(tmp).size < size) { renameSync(tmp, src); before += size; after += statSync(src).size; console.log(f, Math.round(size / 1024), '->', Math.round(statSync(src).size / 1024), 'KB') }
  else { (await import('node:fs')).unlinkSync(tmp) }
}
console.log(`public/images: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`)
