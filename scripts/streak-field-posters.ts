/**
 * Render the shipped Streak Field posters from Storybook.
 *
 * One still per look and ground polarity, screenshotted from the
 * `Immersive/StreakFieldPosters` capture rig on a transparent ground and
 * written to `public/images/streak-field/<look>-<surface>.webp` at the size
 * `STREAK_POSTER_SIZE` declares. Alpha stays, so the page's CSS ground shows
 * through exactly as it does under the live field.
 *
 *   pnpm storybook -p 6106            (in another terminal)
 *   pnpm exec tsx scripts/streak-field-posters.ts --base http://localhost:6106
 *
 * Headless Chromium renders WebGL through SwiftShader here; slow, but the
 * output is the same program the GPU runs. Re-run after changing a look,
 * the defaults, or the poster size, and bump `STREAK_LOOK_REVISION`.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { STREAK_LOOK_IDS } from '../src/features/immersive/visual/looks'
import { STREAK_POSTER_SIZE } from '../src/features/immersive/visual/posters'

const args = process.argv.slice(2)
const baseIndex = args.indexOf('--base')
const base = baseIndex >= 0 ? args[baseIndex + 1] : 'http://localhost:6006'
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
/** Seconds the field runs before capture, so lives have staggered and drift has spread. */
const SETTLE_MS = 2500
const OUT_DIR = path.resolve('public/images/streak-field')

const storyUrl = (look: string, surface: string) =>
  `${base}/iframe.html?id=immersive-streakfieldposters--capture&viewMode=story&args=look:${look};surface:${surface}`

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
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
    for (const look of STREAK_LOOK_IDS) {
      if (only && only !== look) continue
      for (const surface of ['dark', 'light'] as const) {
        await page.goto(storyUrl(look, surface), { waitUntil: 'networkidle' })
        const rig = page.locator(`[data-streak-poster="${look}-${surface}"]`)
        await rig.waitFor()
        await rig.locator('canvas').waitFor()
        await page.waitForTimeout(SETTLE_MS)
        const png = await rig.locator('canvas').screenshot({ omitBackground: true, type: 'png' })
        const webp = await sharp(png)
          .resize(STREAK_POSTER_SIZE.width, STREAK_POSTER_SIZE.height, { fit: 'cover' })
          .webp({ quality: 74, alphaQuality: 85, effort: 6 })
          .toBuffer()
        const file = path.join(OUT_DIR, `${look}-${surface}.webp`)
        await writeFile(file, webp)
        console.log(
          `wrote ${path.relative(process.cwd(), file)} (${(webp.length / 1024).toFixed(0)} kB)`,
        )
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
