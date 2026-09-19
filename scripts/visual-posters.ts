/**
 * Render the shipped look posters from Storybook, for every effect.
 *
 * One still per effect, look and ground polarity, screenshotted from the
 * `Immersive/VisualPosters` capture rig and written to
 * `public/images/<effect's posterDirectory>/<look>-<surface>.webp` at the size
 * `STREAK_POSTER_SIZE` declares. An effect drawn with alpha keeps it, so the
 * page's CSS ground shows through exactly as it does under the live effect;
 * one that draws an opaque frame ships that frame, and the slot blends it.
 *
 *   pnpm storybook -p 6106            (in another terminal)
 *   pnpm exec tsx scripts/visual-posters.ts --base http://localhost:6106
 *   pnpm exec tsx scripts/visual-posters.ts --effect lightLeak --only amber-v1
 *
 * Headless Chromium renders WebGL through SwiftShader here; slow, but the
 * output is the same program the GPU runs. Re-run after changing a look,
 * the defaults, or the poster size, and bump the effect's `lookRevision`.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { SURFACES } from '../src/features/immersive/studio/effect'
import { EFFECT_IDS, effectOf } from '../src/features/immersive/studio/effects'
import { STREAK_POSTER_SIZE } from '../src/features/immersive/visual/posters'

const args = process.argv.slice(2)
const option = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : null)
const base = option('--base') ?? 'http://localhost:6006'
const onlyEffect = option('--effect')
const onlyLook = option('--only')
/** Seconds the effect runs before capture, so lives have staggered and drift has spread. */
const SETTLE_MS = 2500

const storyUrl = (effect: string, look: string, surface: string) =>
  `${base}/iframe.html?id=immersive-visualposters--capture&viewMode=story&args=effect:${effect};look:${look};surface:${surface}`

async function main() {
  const browser = await chromium.launch({
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ],
  })
  const page = await browser.newPage({
    viewport: { width: STREAK_POSTER_SIZE.width, height: STREAK_POSTER_SIZE.height },
    deviceScaleFactor: 1,
  })
  try {
    for (const id of EFFECT_IDS) {
      if (onlyEffect && onlyEffect !== id) continue
      const effect = effectOf(id)
      const outDir = path.resolve('public/images', effect.posterDirectory)
      await mkdir(outDir, { recursive: true })
      for (const look of Object.keys(effect.looks)) {
        if (onlyLook && onlyLook !== look) continue
        for (const surface of SURFACES) {
          await page.goto(storyUrl(id, look, surface), { waitUntil: 'networkidle' })
          const rig = page.locator(`[data-visual-poster-rig="${id}-${look}-${surface}"]`)
          await rig.waitFor()
          await rig.locator('canvas').waitFor()
          await page.waitForTimeout(SETTLE_MS)
          const png = await rig.locator('canvas').screenshot({ omitBackground: true, type: 'png' })
          const webp = await sharp(png)
            .resize(STREAK_POSTER_SIZE.width, STREAK_POSTER_SIZE.height, { fit: 'cover' })
            .webp({ quality: 74, alphaQuality: 85, effort: 6 })
            .toBuffer()
          const file = path.join(outDir, `${look}-${surface}.webp`)
          await writeFile(file, webp)
          console.log(
            `wrote ${path.relative(process.cwd(), file)} (${(webp.length / 1024).toFixed(0)} kB)`,
          )
        }
      }
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
