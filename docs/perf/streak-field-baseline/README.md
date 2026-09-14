# Streak Field baseline (Phase 0 and Phase 2 record)

Status: partial. Recorded 2026-09-13 with the implementation of `docs/streak-field-media-plan.md`; context plateau added 2026-09-14. Everything below that is a number was produced on the implementing machine's tooling, not on the hardware matrix the plan asks for; the hardware, production-preview and 30-second trace measurements remain open.

## Ownership decision

The Streak Field renders through **one admitted local classic WebGL2 canvas per document**, owned by the `StreakVisual` slot, with a `streak` lease on the document GPU budget (`src/lib/webgl/gpu-budget.ts`, `STREAK_LIVE_CEILING = 1` among `GPU_LIVE_CEILING = 3` contexts shared with the lenses, the footer light leak, galleries and the global backdrop). The shared-canvas prototype at the persistent root was **not** attempted: the plan makes it a measured comparison against this baseline, and no equal-appearance measurement exists yet. The consumer contract (`Visual`, `StreakVisual`, the descriptor) is the same either way, so a later shared implementation replaces the runtime module, not the CMS or the slots.

Related root changes shipped with this baseline:

- `GlobalCanvasRoot` is now a real dynamic import boundary that mounts the global canvas only once a route activates it.
- The WebGL store's `isActive` boolean is a reference-counted lease (`acquireActive`), so unmounting one provider never deactivates another.

## What was verified

| Check | Method | Result |
| --- | --- | --- |
| Types, lint, unit tests | `pnpm exec tsc --noEmit`, `pnpm exec biome check`, `pnpm exec vitest run` | Pass (resolver precedence, admission lifecycle, validators, grid coverage, ref walker). |
| Poster-only paths | Storybook `Immersive/StreakVisual` stories, `data-visual-status` | Card placement, degraded preset, reduced motion and held-by-owner stay `poster`; no runtime chunk is requested. |
| Posters | `scripts/streak-field-posters.ts` against Storybook in headless Chromium (SwiftShader) | Eight stills, one per look and ground, 1600×900 WebP with alpha, 10 kB to 160 kB each (the dense looks are high-entropy and compress poorly; a hero preloads one). |
| Software renderer refusal | Headless Chromium (SwiftShader) with the site probe | The probe refuses the context (`failIfMajorPerformanceCaveat`); every story stays `poster` and no runtime chunk is requested. |
| Document budget and context loss | `pnpm exec vitest run src/lib/webgl` | Ranking across kinds, the streak cap, eviction and readmission, idempotent release, the context census and its `<html>` mirror. |
| Live lifecycle | Storybook `ForcedLifecycle` story (`admission="force"`, stories only) in headed Chrome on the implementing Mac's GPU, driven by Playwright | `poster → preparing → live`; the runtime chunk loads only then; the pause control moves the slot to `suspended` and back; a hidden document suspends it. |
| Poster twins | Storybook stories under both toolbar themes and on a dark hero band | Only the matching ground's still has a box; the hidden twin stays unloaded until the theme reveals it. |

## Context plateau across 20 route/menu/Ask cycles (2026-09-14)

Recorded against a workspace dev build (`next dev`, Turbopack) on the implementing Mac in headless Chromium with hardware GL (`--use-angle=metal`), 1440×900, after the document GPU budget and `ContextGuard` landed (`src/lib/webgl/gpu-budget.ts`, `src/lib/webgl/components/context-guard`). A dev build measures lifecycle, not load performance; the production-preview and 30-second trace gates stay open below.

One cycle: scroll `/` to the footer (hero lens live, footer light leak mounts), back to the top, open the takeover menu, on odd cycles submit a question to Ask and return to the menu, navigate through the menu to `/expertise/website-strategy-ux-development`, return home through the brand link, wait 3.5s, force a GC, snapshot. The snapshot reads the registry's `<html data-gpu-*>` mirror (leases wanted, admitted, contexts that exist) plus `canvas` elements, `[data-visual]` statuses and the JS heap.

| Point | Cycle 1 | Cycle 10 | Cycle 20 |
| --- | --- | --- | --- |
| Home, footer in view: contexts / canvases | 2 / 2 | 2 / 2 | 2 / 2 |
| Expertise route: contexts / canvases | 0 / 0 | 0 / 0 | 0 / 0 |
| Home, settled: leases / admitted / contexts / canvases | 1 / 1 / 1 / 1 | 1 / 1 / 1 / 1 | 1 / 1 / 1 / 1 |
| Home, settled: JS heap after GC | 48 MB | 48 MB | 48 MB |

Every one of the 20 cycles returned to the same settled state. `THREE.WebGLRenderer: Context Lost.` printed exactly twice per cycle (40 in all): the leak's canvas at the scroll gate and the lens's at the route change, both R3F's own teardown `forceContextLoss()`. No console errors, no `failed` slot. Ask reached its transcript on every odd cycle. The Streak Field did not take part on these routes (no CMS entry in this workspace's database selects one); its lifecycle is covered by the Storybook checks below and the unit tests on the registry.

Failure injection on the same page, `WEBGL_lose_context.loseContext()` on a live canvas:

| Canvas | Before | After 1.5s |
| --- | --- | --- |
| Home hero lens | leases 1, contexts 1, canvases 1 | leases 0, contexts 0, canvases 0; the DOM media element remains |
| Footer light leak | leases 1, contexts 1, canvases 1 | leases 0, contexts 0, canvases 0 |
| Storybook `Blocks/ScrollGallery` Default | leases 1, contexts 1, canvases 1 | leases 0, contexts 0, canvases 0 (the block swaps to its stacked grid) |
| Storybook `Immersive/StreakVisual` ForcedLifecycle | `live` | `failed (context-lost)`; pause → 8s release → resume still runs `live → suspended → poster → live` |
| `/demo/immersive` global backdrop | mounts under admission: leases 1, contexts 1, WebGPU renderer | not injected (WebGPU device loss has no synthetic trigger) |

Verdict: resource plateau **passes** on this build. Registrations, admitted leases and live contexts return to baseline every cycle, the heap does not grow, and a real loss on every canvas kind falls back without a retry loop.

### `gpu-plateau.mjs`

Save beside the repo (it resolves `@playwright/test` from the repo's `node_modules`, so run it from the repo root), start a dev server on a free port, and run `node gpu-plateau.mjs http://localhost:<port> 20`. Cycle lines print as they complete; the plateau summary and the loss injection follow.

```js
// 20-cycle context/resource plateau gate (docs/streak-field-media-plan.md, "Resources").
// Usage: node gpu-plateau.mjs <origin> [cycles=20] [--headed]
import { chromium } from '@playwright/test'

const base = process.argv[2] ?? 'http://localhost:3401'
const cycles = Number(process.argv[3] ?? 20)
const headed = process.argv.includes('--headed')
const browser = await chromium.launch({
  headless: !headed,
  args: [
    '--use-gl=angle',
    '--use-angle=metal',
    '--ignore-gpu-blocklist',
    '--enable-gpu-rasterization',
    '--js-flags=--expose-gc',
  ],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
let contextLostLogs = 0
const errors = []
page.on('console', (m) => {
  const t = m.text()
  if (/Context Lost/i.test(t)) contextLostLogs += 1
  if (m.type() === 'error' && !/favicon|404/.test(t)) errors.push(t.slice(0, 160))
})
page.on('pageerror', (e) => errors.push(`pageerror: ${String(e.message).slice(0, 160)}`))

const snap = () =>
  page.evaluate(() => {
    const d = document.documentElement.dataset
    const mem = performance.memory
    return {
      route: location.pathname,
      leases: Number(d.gpuLeases ?? 0),
      admitted: Number(d.gpuAdmitted ?? 0),
      contexts: Number(d.gpuContexts ?? 0),
      canvases: document.querySelectorAll('canvas').length,
      visuals: [...document.querySelectorAll('[data-visual]')].map(
        (n) => `${n.dataset.visualStatus}${n.dataset.visualFailure ? `(${n.dataset.visualFailure})` : ''}`,
      ),
      heapMB: mem ? Math.round(mem.usedJSHeapSize / 1048576) : null,
    }
  })
const gc = () => page.evaluate(() => typeof gc === 'function' && gc())
const wait = (ms) => page.waitForTimeout(ms)

await page.goto(`${base}/`, { waitUntil: 'networkidle' })
await wait(3000)
// Route B: the first internal menu link that is not the current page.
await page.getByRole('button', { name: 'Open menu' }).click()
await wait(2500)
const routeB = await page.evaluate(() => {
  const links = [...document.querySelectorAll('#site-menu a[href^="/"]')]
  const hrefs = links.map((a) => a.getAttribute('href')).filter((h) => h && h !== '/' && !h.startsWith('/#'))
  return hrefs[0] ?? null
})
await page.getByRole('button', { name: 'Close menu' }).click()
await wait(2000)
console.log('route B:', routeB)
// Warm the dev compile for route B so cycle timings measure the page, not Turbopack.
if (routeB) await fetch(`${base}${routeB}`)

const rows = []
const cycle = async (i) => {
  // 1. Home, hero lens live, footer leak mounts at the bottom.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await wait(2500)
  const bottom = await snap()
  await page.evaluate(() => window.scrollTo(0, 0))
  await wait(1500)
  // 2. Menu cover (streak fields release, menu clones the hero poster).
  await page.getByRole('button', { name: 'Open menu' }).click()
  await wait(2500)
  let askSeen = false
  if (i % 2 === 1) {
    // 3. Ask enter/exit on odd cycles.
    const input = page.locator('#site-menu input[aria-label="Ask a question"]')
    if ((await input.count()) > 0) {
      await input.fill('What do you do?')
      await input.press('Enter')
      const transcript = page.getByLabel('Ask transcript')
      try {
        await transcript.waitFor({ state: 'visible', timeout: 5000 })
        askSeen = true
      } catch {}
      await wait(1500)
      const back = page.getByRole('button', { name: 'Back to menu' })
      if ((await back.count()) > 0) {
        await back.click()
        await wait(1500)
      }
    }
  }
  // 4. Route change through the menu, then back home via the brand link.
  if (routeB) {
    await page.locator(`#site-menu a[href="${routeB}"]`).first().click()
    await page.waitForURL((u) => u.pathname === routeB, { timeout: 30000, waitUntil: 'commit' })
    await wait(3500)
    var onB = await snap()
    await page.locator('header a[href="/"]').first().click()
    await page.waitForURL((u) => u.pathname === '/', { timeout: 30000, waitUntil: 'commit' })
  } else {
    await page.getByRole('button', { name: 'Close menu' }).click()
  }
  await wait(3500)
  await gc()
  await wait(500)
  const home = await snap()
  rows.push({ cycle: i, bottom, onB, home, askSeen, contextLostLogs })
  console.log(
    `cycle ${String(i).padStart(2)} | bottom ctx=${bottom.contexts} cv=${bottom.canvases} | B ctx=${onB?.contexts ?? '-'} cv=${onB?.canvases ?? '-'} | home leases=${home.leases} adm=${home.admitted} ctx=${home.contexts} cv=${home.canvases} heap=${home.heapMB}MB visuals=${JSON.stringify(home.visuals)} ask=${askSeen} lostLogs=${contextLostLogs}`,
  )
}
for (let i = 1; i <= cycles; i++) await cycle(i)

const first = rows[0].home
const last = rows[rows.length - 1].home
const mid = rows[Math.floor(rows.length / 2)].home
console.log('\n== plateau')
console.log(`home contexts: first=${first.contexts} mid=${mid.contexts} last=${last.contexts}`)
console.log(`home leases:   first=${first.leases} mid=${mid.leases} last=${last.leases}`)
console.log(`home canvases: first=${first.canvases} mid=${mid.canvases} last=${last.canvases}`)
console.log(`heap MB:       first=${first.heapMB} mid=${mid.heapMB} last=${last.heapMB}`)
console.log(`context-lost console lines: ${contextLostLogs} (teardown noise; one per unmounted canvas)`)
console.log(`console errors: ${errors.length}${errors.length ? `\n  ${[...new Set(errors)].slice(0, 8).join('\n  ')}` : ''}`)

// Failure injection: a real loss on each live canvas must drop it and leave the DOM layer.
console.log('\n== real context loss')
await page.evaluate(() => window.scrollTo(0, 0))
await wait(2000)
const lose = (selector) =>
  page.evaluate((sel) => {
    const c = document.querySelector(sel)
    if (!c) return 'no canvas'
    const gl = c.getContext('webgl2') ?? c.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return 'lost'
  }, selector)
const before = await snap()
console.log('hero lens before:', await lose('[data-hero-media] canvas'), JSON.stringify(before))
await wait(1500)
const afterLens = await snap()
console.log('hero lens after: ', JSON.stringify(afterLens), 'lens canvases:', await page.locator('[data-hero-media] canvas').count(), 'dom media:', await page.locator('[data-hero-media] img, [data-hero-media] video').count())
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await wait(2500)
console.log('leak before:', JSON.stringify(await snap()))
console.log('leak lose:', await lose('[style*="mix-blend-mode"] canvas'))
await wait(1500)
console.log('leak after: ', JSON.stringify(await snap()), 'leak canvases:', await page.locator('[style*="mix-blend-mode"] canvas').count())
await browser.close()
```

## Not measured (open gates)

- Cold and warm load on the production preview with `/`, Vault and Adacore as controls (`docs/performance-measurement.md`).
- Real-hardware 30-second traces: p50/p95 frame intervals, dropped frames, draw and simulation counts, GPU timings.
- The plateau above on a production build, and with a route whose CMS entry selects a live Streak Field, so a `streak` lease takes part in the cycle.
- The shared-canvas prototype's four placements and its cost against this baseline.

Until those land, the live tier is admitted only on desktop hardware WebGL2 with a fine pointer, at the placement ceilings in `src/features/immersive/visual/placement.ts`, with the frame watchdog stepping to the degraded tier and then to the poster.
