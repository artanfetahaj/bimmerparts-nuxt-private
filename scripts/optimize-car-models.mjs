// One-off: converts public/car-models/*.png (up to 21 MB each) into small lowercase .webp files.
// Displayed at max ~160x90 (320px @2x) in nav/dialog/model pages, so 640px wide is plenty.
import sharp from 'sharp'
import { readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'public/car-models'
let before = 0, after = 0
for (const f of readdirSync(dir).filter(f => /\.png$/i.test(f))) {
  const src = join(dir, f)
  const dest = join(dir, f.replace(/\.png$/i, '').toLowerCase() + '.webp')
  before += statSync(src).size
  await sharp(src).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }).toFile(dest)
  after += statSync(dest).size
  unlinkSync(src)
}
console.log(`car-models: ${(before / 1e6).toFixed(0)} MB -> ${(after / 1e6).toFixed(1)} MB`)
