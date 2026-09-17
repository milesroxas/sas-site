# Performance measurement runbook

Repeatable before/after captures for the work-page performance work in
[performance-audit-work-pages.md](performance-audit-work-pages.md). Written so an
agent can run it end to end on request ("run the perf capture against X") and
so two runs weeks apart compare like for like.

Results land in `docs/perf/<label>/` (git-tracked JSON plus a summary table), so
a "before" survives until its "after" exists.

## What a run answers

| Question | Tool | Numbers kept |
|---|---|---|
| Bytes and requests at load, and what the LCP element is | Lighthouse desktop + mobile, 3 runs, median | transfer total, request count, script bytes, media bytes, LCP ms, LCP element, TBT, CLS (object counts come from the capture) |
| Does media actually gate | Playwright cold-cache capture with a scroll timeline | mp4 requests at load vs after scroll, poster priority, first R2 connection reuse, refetch on scroll back |
| Does the theme bootstrap survive blocked storage | Playwright with `localStorage` throwing | `data-theme` present, `html` opacity |

Field data (Speed Insights) is read separately, seven days after a prod deploy
(section 5).

For Streak Field work, also use [Streak Field captures](#streak-field-captures)
below. The [feature plan](streak-field-media-plan.md#acceptance-and-measurement)
owns acceptance thresholds; the [performance roadmap](performance-audit-work-pages.md#6-execution-order-and-expected-impact)
owns sequencing. This runbook describes how to collect comparable evidence.

## 1. Targets

Always the same three URLs, so runs compare:

These are the media control routes. Pin their content/version for a comparison;
shader variants are separate labeled cases, not a silent change to the control.

| Key | Path | Why |
|---|---|---|
| `vault` | `/works/vault-workforce-screening` | heaviest page, 10 videos |
| `interchecks` | `/works/interchecks` | image hero, control (since 2026-09-16; `/works/adacore` was the control before, it is a draft now and 404s) |
| `home` | `/` | hero handoff surface, refraction media |

Before a run, `curl -sI` each target and confirm `200`; a draft returns a 404 page whose LCP is a paragraph, and the summary will not tell you.

Hosts:

- `prod` = `https://www.suits-sandals.com` (Vercel Production target, built from `main`; the apex 301s here). Cut over from Webflow on 2026-09-09; runs before that used `preview.suits-sandals.com`.
- `preview` = the Vercel preview URL for the branch under test (`vercel ls`, or the PR check). `preview.suits-sandals.com` is the `preview` git branch's domain and lags production by that branch's deployment, so do not use it as a stand-in for prod.
- `local` = `http://localhost:3001`, smoke only, never for numbers (no CDN, dev bundles, no Brotli).

Earlier captures used unauthenticated preview deployments with `x-robots-tag: noindex`
and indexable production. Confirm the selected deployment's headers and access
before a new run; the repository source check does not establish current hosting
or deployment-protection settings.

## 2. Setup (once per machine)

```bash
pnpm dlx lighthouse --version
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Playwright's Chromium (`@playwright/test`, already installed) drives the capture
scripts. Their source is embedded in section 6; they are not currently runnable
files in the repo's `scripts/` directory. Before a new capture, save those code
blocks as files in a chosen scratch directory and substitute its absolute path
for `SCRATCH` below. Do not assume a prior session's scratch files still exist.
The scripts load Playwright through `createRequire(<repo>/package.json)`.

## 3. Run

`LABEL` names the run (`before-video-gating`, `after-video-gating`). `HOST` is a
full origin.

```bash
cd /Users/milesroxas/SITES/sas-site
LABEL=before-video-gating
HOST=https://www.suits-sandals.com
OUT=docs/perf/$LABEL && mkdir -p "$OUT"
```

### 3.1 Lighthouse, 3 runs per page per preset

```bash
for key in vault interchecks home; do
  case $key in
    vault) route=/works/vault-workforce-screening ;;
    interchecks) route=/works/interchecks ;;
    home) route=/ ;;
  esac
  curl -s -o /dev/null "$HOST$route"   # warm the HTML and image cache before the first run
  for preset in desktop mobile; do
    for i in 1 2 3; do
      flags="--output=json --output-path=$OUT/$key-$preset-$i.json --quiet --chrome-flags=--headless=new"
      if [ "$preset" = desktop ]; then flags="$flags --preset=desktop"; fi
      pnpm dlx lighthouse "$HOST$route" ${=flags}
    done
  done
done
```

About 7 minutes for 18 runs (roughly 20 s each), so it fits one foreground
call. Never name the loop variable `path`: in zsh that is the `PATH` array, and
every command after the first iteration fails with `command not found`.

### 3.2 Summarise to a table

Save section 6.3 as `$SCRATCH/lh-summary.cjs`, then:

```bash
node "$SCRATCH/lh-summary.cjs" "$OUT"
```

Writes `$OUT/summary.md` and prints the table (median of the runs per row).

### 3.3 Cold-cache media capture (Playwright)

Proves gating independent of Lighthouse's throttling. Source: section 6.1.

```bash
node "$SCRATCH/perf-capture.mjs" "$HOST" "$OUT"
```

Writes `$OUT/capture-<key>.json` and prints one block per page:

```
vault    at load: mp4=1 posters=10 (poster priority: High, preload link: yes)
         first R2 request: connection reused = true
         after scroll to end: mp4=10, attached at scrollY: [1200, 1800, ...]
         video state at end: 10/10 with source, 10/10 play when centred; mp4 refetched on return: 0
```

Pass criteria after video gating, for the original media control configuration:

- `mp4` at load: 1 (hero) on `vault`, 0 on `interchecks` before M4; since 2026-09-16 both read 2 because a loop sits inside two screens of the fold (see M4 in the audit doc).
- Hero poster: priority `High` (some Chrome builds report `VeryHigh`), and a `<link rel=preload as=image fetchpriority=high>` in the head.
- After scrolling to the end: every video has a source, and every video plays once centred in view (`playing` equals `videos`).
- Scroll back to the top: zero new mp4 objects requested.
- `attached at scrollY` lists the scroll positions at which new mp4 objects were first requested; after gating they should trail the reader by about two screens rather than all sitting at load.

### 3.4 Theme guard

Source: section 6.2. Loads each page with `localStorage` access throwing and
checks `html[data-theme]` is set and computed opacity is `1`.

```bash
node "$SCRATCH/theme-guard.mjs" "$HOST"
```

### 3.5 PageSpeed Insights (Lightrider) read

PSI is its own environment: Lightrider runs WebGL in software, its CPU multiplier is 1.2x on slow hardware (not the 4x of a local mobile run), and Chrome there is usually a version behind the desktop. Its TBT does not reproduce locally (2026-09-16: 1,970 ms on PSI mobile vs 260 ms local at 4x, 20 ms at 1.2x); read PSI for LCP, Speed Index and the insight lists, and read the task list from the local trace.

The anonymous API quota (`https://www.googleapis.com/pagespeedonline/v5/runPagespeed`) is often exhausted. Run the analysis in the browser at https://pagespeed.web.dev/, copy the report URL, and scrape it with headless Chromium (section 6.5): the report page renders both form factors from one URL. Record score, the five metrics, and the insight lines with their estimated savings in `notes.md`.

Local approximation of the PSI environment (home, mobile preset):

```bash
pnpm dlx lighthouse "$HOST/" --output=json --output-path=$OUT/home-mobile-sw.json --quiet \
  --chrome-flags="--headless=new --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader"
# add --throttling.cpuSlowdownMultiplier=1.2 for PSI's multiplier
```

### 3.6 Long-task attribution (CPU profile)

Lighthouse's `long-tasks` audit names a chunk, not a function. Section 6.4 drives the page under Moto G emulation at 4x CPU with a sampling profiler and prints, per long task, the leaf functions, the chunks on the stack and the entry function:

```bash
node "$SCRATCH/cpu-profile.mjs" "$HOST/"
```

Run it before touching hydration or provider order, and paste the top entries for the two largest tasks into `notes.md`.

### 3.7 Commit the run

```bash
rm docs/perf/$LABEL/*-[0-9].json
git add docs/perf/$LABEL
```

Keep `summary.md`, `notes.md` (the capture and theme-guard output, plus a
sentence on what it shows), and the capture JSON. Raw Lighthouse JSON is about
700 KB per run and is not committed; rerun if a detail is needed.

## 4. Compare

```bash
diff <(sed -n '/^| page/,$p' docs/perf/before-X/summary.md) <(sed -n '/^| page/,$p' docs/perf/after-X/summary.md)
```

Lab noise is about 10% on LCP and 3 points on the score. What counts as real:

- `mediaKb` (Lighthouse) and `mp4` at load (capture): an order of magnitude on `vault`.
- `lcp`: 1 to 2 s on `vault` mobile after gating. The rest of the gap is script (`scriptKb`) and waits for the bundle diet.
- `lcpEl`: stays the hero. If it flips to a body image, the hero poster preload is not firing.
- `kb` on `interchecks` and `home`: small change expected; a large one means something unrelated shipped.

Paste both tables into the audit doc's status section when a phase closes.

For Streak Field, record results in the feature plan as well and distinguish
initial loading, deferred runtime loading, steady animation, and fallback.
The feature plan's small regression thresholds trigger investigation; compare
them against observed run-to-run noise before attributing a regression. A
better Lighthouse score with no working qualified live path does not pass the
feature milestone.

## 5. Field (Speed Insights)

Seven days after prod. Vercel dashboard, project `sas-site`, Speed Insights,
route filter `/works/[slug]`, P75. Record LCP, FCP, INP and the LCP element
attribution. `www.suits-sandals.com` has served the Next site since 2026-09-09, so
field samples are public traffic from that date; anything earlier was team and
client traffic on the Vercel alias and is not comparable.

## Streak Field captures

This is an additional procedure for the shader feature. The existing media
scripts below do not instrument shader frames, simulation, or resources. Add
focused instrumentation during feature Phase 0; do not report those checks as
automated or passing until it exists and has run. No shader capture was run
when this procedure was added.

### Comparison matrix

| Case | Purpose | Expected path |
| --- | --- | --- |
| Existing media control | Protect current image/video loading and transitions. | Unchanged authored media, with its current priority/visibility rules. |
| Shader selected, poster-only rollout mode | Verify content resolution, first paint, and transitions independently of the runtime. | Preset/entry poster; no Streak runtime load or replaced-video request. |
| Shader selected, qualified hardware | Verify the actual product and its runtime cost. | Poster first, then the live field after eligibility and intro/transition settlement. |
| Shader selected, ineligible or failed runtime | Verify graceful degradation. | Complete poster/background, usable content and navigation, no recurring GPU work or retry loop. |

Keep content and layout fixed between poster/live shader cases. A video-to-shader
comparison measures a source change, including removed video bytes; it does not
prove one shader renderer is faster than another. For renderer comparisons,
match the preset, seed, slot size, density, DPR, complexity, and capture history.
Record visual differences instead of treating unequal quality as a free win.

### Record with every run

- Source commit and deployment URL, content version or fixture revision, visual
  mode, preset/implementation revision, seed, overrides, and surface theme.
- Device, OS, browser/version, viewport, DPR, actual renderer/backend, quality
  tier, hardware versus software rendering, cache state, and throttling.
- Initial HTML/script/media bytes and requests separately from deferred
  graphics requests and total bytes after interaction. Include eligible and
  ineligible paths; no Three on a route that never activates any canvas remains
  a loading check, while a live shader route legitimately loads its runtime.
- Poster request priority, paint/layout behavior, eligibility and first-live-frame
  timing, and any hidden legacy media requests. Observe which element becomes LCP.
- Frame intervals and dropped frames on real qualified hardware, main-thread
  work, GPU timings where available, draw/simulation counts, active contexts,
  resource counts, and plateau behavior. Report unsupported measurements as
  unavailable, not zero.

Use the durations, cycle counts, and quality thresholds from the feature plan
rather than maintaining a second budget here. Reproduce software rendering as
a fallback test, and run the live path on real hardware separately. Do not
special-case Lighthouse or user agents to hide work from measurement.

### Lifecycle and interaction sequence

1. Capture cold load and the first qualified live frame. Confirm the initial
   poster is complete before shader readiness and the live visual eventually appears.
2. Scroll the field out of view and back; cover the page with the menu; enter
   Ask; return through its shrink/unwipe; close the menu. Check resource admission
   and draw/simulation activity at each settled state.
3. Pause/resume, background the tab, change reduced-motion preference, and inject
   runtime failure/context loss. Check visible fallback and absence of retry loops.
4. Repeat route/menu/Ask cycles, including rapid interruption, back/forward,
   hero handoff, and IndustryWork takeover. Check resource plateaus and matching
   posters, crops, names, and cleanup.
5. Compare media controls and shader modes against the feature's acceptance
   table. Record failed gates with affected device/placement and a concrete next
   action; a supported-device live failure cannot be closed as a fallback success.

Save the baseline under `docs/perf/streak-field-baseline/` and subsequent stages
under `docs/perf/streak-field-<phase>/`, with mode/device labels in each result.
Keep compact capture data, frame/resource summaries, and reproduction notes in
the repo following the existing raw-Lighthouse retention policy. Record both
product and performance verdicts in the feature plan. Retest production field
behavior after rollout using the same public-traffic hygiene as section 5.

## 6. Script sources

### 6.1 `perf-capture.mjs`

```js
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const { chromium } = createRequire('/Users/milesroxas/SITES/sas-site/package.json')('@playwright/test')

const [host, outDir] = process.argv.slice(2)
const pages = { vault: '/works/vault-workforce-screening', interchecks: '/works/interchecks', home: '/' }
// Video objects by CDP resource type, not URL: some uploads have no
// extension (`Vault Hero`), and range requests re-hit the same object, so
// count distinct objects.
const isMp4 = (r) => r.type === 'Media'
const isPoster = (r) => /poster/.test(r.url)
const uniqueMp4 = (rs) => new Set(rs.filter(isMp4).map((r) => r.url.split('?')[0])).size
const browser = await chromium.launch()

for (const [key, p] of Object.entries(pages)) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  const reqs = []
  const r2 = []
  cdp.on('Network.requestWillBeSent', (e) => {
    reqs.push({ url: e.request.url, type: e.type, priority: e.request.initialPriority, phase: 'load', scrollY: 0 })
  })
  cdp.on('Network.responseReceived', (e) => {
    if (/media\.suits-sandals\.com/.test(e.response.url)) {
      r2.push({ url: e.response.url, reused: e.response.connectionReused })
    }
  })

  await page.goto(host + p, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const atLoad = reqs.slice()
  const preloadLink = await page.evaluate(() =>
    Boolean(document.querySelector('link[rel="preload"][as="image"][fetchpriority="high"]')),
  )
  const posterReq = atLoad.find(isPoster)

  // Scroll to the end in 600px steps, tagging each request with the scroll
  // position that triggered it.
  const attachedAt = []
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 600; y < total + 600; y += 600) {
    const before = reqs.length
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(700)
    const seenBefore = new Set(reqs.slice(0, before).filter(isMp4).map((r) => r.url.split('?')[0]))
    for (const r of reqs.slice(before)) {
      r.phase = 'scroll'
      r.scrollY = y
      const obj = r.url.split('?')[0]
      if (isMp4(r) && !seenBefore.has(obj)) {
        attachedAt.push(y)
        seenBefore.add(obj)
      }
    }
  }
  // Chromium pauses muted autoplay loops that are off screen, so "plays when
  // in view" is measured per video: centre it, wait, read `paused`.
  const count = await page.evaluate(() => document.querySelectorAll('video').length)
  const videos = []
  for (let i = 0; i < count; i++) {
    await page.evaluate((i) => document.querySelectorAll('video')[i].scrollIntoView({ block: 'center' }), i)
    await page.waitForTimeout(900)
    videos.push(
      await page.evaluate((i) => {
        const v = document.querySelectorAll('video')[i]
        return { source: Boolean(v.querySelector('source')), playing: !v.paused, readyState: v.readyState }
      }, i),
    )
  }
  const beforeBack = reqs.length
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(1500)
  const refetchOnReturn = uniqueMp4(reqs.slice(beforeBack))

  const summary = {
    key,
    atLoad: {
      requests: atLoad.length,
      mp4: uniqueMp4(atLoad),
      posters: atLoad.filter(isPoster).length,
      posterPriority: posterReq?.priority ?? null,
      preloadLink,
    },
    firstR2ConnectionReused: r2[0]?.reused ?? null,
    afterScroll: {
      mp4: uniqueMp4(reqs),
      attachedAtScrollY: attachedAt,
      videos: videos.length,
      withSource: videos.filter((v) => v.source).length,
      playing: videos.filter((v) => v.playing).length,
    },
    refetchOnReturn,
  }
  const a = summary.atLoad
  const s = summary.afterScroll
  console.log(
    `${key.padEnd(8)} at load: mp4=${a.mp4} posters=${a.posters} (poster priority: ${a.posterPriority}, preload link: ${preloadLink ? 'yes' : 'no'})`,
  )
  console.log(`         first R2 request: connection reused = ${summary.firstR2ConnectionReused}`)
  console.log(`         after scroll to end: mp4=${s.mp4}, attached at scrollY: [${attachedAt.join(', ')}]`)
  console.log(
    `         video state at end: ${s.withSource}/${s.videos} with source, ${s.playing}/${s.videos} play when centred; mp4 refetched on return: ${refetchOnReturn}`,
  )
  if (outDir) {
    fs.writeFileSync(path.join(outDir, `capture-${key}.json`), JSON.stringify({ summary, requests: reqs }, null, 2))
  }
  await ctx.close()
}
await browser.close()
```

### 6.2 `theme-guard.mjs`

```js
import { createRequire } from 'node:module'

const { chromium } = createRequire('/Users/milesroxas/SITES/sas-site/package.json')('@playwright/test')
const host = process.argv[2]
const browser = await chromium.launch()
const ctx = await browser.newContext()
await ctx.addInitScript(() => {
  Object.defineProperty(window, 'localStorage', {
    get() {
      throw new DOMException('blocked', 'SecurityError')
    },
  })
})
const page = await ctx.newPage()
for (const p of ['/', '/works/vault-workforce-screening']) {
  await page.goto(host + p, { waitUntil: 'domcontentloaded' })
  const r = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    opacity: getComputedStyle(document.documentElement).opacity,
  }))
  console.log(p.padEnd(36), r, r.theme && r.opacity === '1' ? 'PASS' : 'FAIL')
}
await browser.close()
```

### 6.3 `lh-summary.cjs`

```js
const fs = require('node:fs')
const path = require('node:path')

const dir = process.argv[2]
const rows = {}
const sum = (items, pred) => items.filter(pred).reduce((s, i) => s + (i.transferSize || 0), 0)

for (const f of fs.readdirSync(dir).filter((f) => /-\d\.json$/.test(f))) {
  const [key, preset] = f.replace(/-\d\.json$/, '').split('-')
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
  const a = r.audits
  const items = a['network-requests'].details.items
  // Lighthouse 13 moved the element into the LCP breakdown insight; older
  // versions kept it under largest-contentful-paint-element.
  const lcpNode =
    a['lcp-breakdown-insight']?.details?.items?.find((i) => i.type === 'node') ??
    a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node
  ;(rows[`${key}-${preset}`] ||= []).push({
    perf: Math.round(r.categories.performance.score * 100),
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    fcp: Math.round(a['first-contentful-paint'].numericValue),
    tbt: Math.round(a['total-blocking-time'].numericValue),
    cls: +a['cumulative-layout-shift'].numericValue.toFixed(3),
    kb: Math.round(a['total-byte-weight'].numericValue / 1024),
    scriptKb: Math.round(sum(items, (i) => i.resourceType === 'Script') / 1024),
    mediaKb: Math.round(sum(items, (i) => i.resourceType === 'Media') / 1024),
    requests: items.length,
    lcpEl: (lcpNode?.selector || lcpNode?.nodeLabel || '').slice(0, 48),
  })
}

const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const cols = ['perf', 'lcp', 'fcp', 'tbt', 'cls', 'kb', 'scriptKb', 'mediaKb', 'requests']
let md = `| page | ${cols.join(' | ')} | lcp element |\n|---|${cols.map(() => '---:').join('|')}|---|\n`
for (const [k, runs] of Object.entries(rows).sort()) {
  md += `| ${k} | ${cols.map((c) => median(runs.map((r) => r[c]))).join(' | ')} | ${runs[0].lcpEl} |\n`
}
const n = Object.values(rows)[0]?.length ?? 0
fs.writeFileSync(path.join(dir, 'summary.md'), `# ${path.basename(dir)}\n\nMedian of ${n} runs. kb = total transfer.\n\n${md}`)
console.log(md)
```

### 6.4 `cpu-profile.mjs`

```js
// Mobile emulation + 4x CPU throttle; records long tasks with a sampling CPU
// profile so each long task can be attributed to functions and chunks.
import { createRequire } from 'node:module'
const { chromium, devices } = createRequire('/Users/milesroxas/SITES/sas-site/package.json')('@playwright/test')
const url = process.argv[2] || 'https://www.suits-sandals.com/'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ ...devices['Moto G4'], deviceScaleFactor: 1.75 })
const page = await context.newPage()
const cdp = await context.newCDPSession(page)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
await cdp.send('Profiler.enable')
await cdp.send('Profiler.setSamplingInterval', { interval: 500 })
await page.addInitScript(() => {
  window.__longtasks = []
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__longtasks.push({ start: e.startTime, dur: e.duration })
  }).observe({ type: 'longtask', buffered: true })
})
await cdp.send('Profiler.start')
await page.goto(url, { waitUntil: 'load', timeout: 120000 })
await page.waitForTimeout(12000)
const nowAtStop = await page.evaluate(() => performance.now())
const { profile } = await cdp.send('Profiler.stop')
const longtasks = await page.evaluate(() => window.__longtasks)
console.log('long tasks (ms since nav start):')
for (const t of longtasks) console.log(' ', Math.round(t.start), Math.round(t.dur))
const nodes = new Map(profile.nodes.map((n) => [n.id, n]))
const parent = new Map()
for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id)
let ts = profile.startTime
const samples = []
for (let i = 0; i < profile.samples.length; i++) { ts += profile.timeDeltas[i]; samples.push({ ts, node: profile.samples[i] }) }
// Profiler timestamps are monotonic microseconds; align on the stop instant.
const originUs = profile.endTime - nowAtStop * 1000
for (const t of longtasks.filter((t) => t.dur >= 50)) {
  const s = originUs + t.start * 1000, e = s + t.dur * 1000
  const inTask = samples.filter((x) => x.ts >= s && x.ts <= e)
  const byLeaf = new Map(), byUrl = new Map(), byTop = new Map()
  for (const x of inTask) {
    let n = nodes.get(x.node)
    const leaf = n
    const leafKey = `${leaf.callFrame.functionName || '(anon)'} ${leaf.callFrame.url.split('/').pop()}:${leaf.callFrame.lineNumber}`
    byLeaf.set(leafKey, (byLeaf.get(leafKey) || 0) + 1)
    const chain = []
    while (n) { chain.push(n); n = nodes.get(parent.get(n.id)) }
    for (const u of new Set(chain.map((c) => c.callFrame.url.split('/').pop()).filter(Boolean))) byUrl.set(u, (byUrl.get(u) || 0) + 1)
    const top = chain.filter((c) => c.callFrame.url).slice(-1)[0]
    if (top) { const k = `${top.callFrame.functionName || '(anon)'} ${top.callFrame.url.split('/').pop()}:${top.callFrame.lineNumber}`; byTop.set(k, (byTop.get(k) || 0) + 1) }
  }
  const fmt = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${v} ${k}`).join('\n      ')
  console.log(`\n## task @${Math.round(t.start)} ${Math.round(t.dur)}ms samples=${inTask.length}`)
  console.log('   leaf:\n      ' + fmt(byLeaf))
  console.log('   urls:\n      ' + fmt(byUrl))
  console.log('   entry:\n      ' + fmt(byTop))
}
await browser.close()
```

### 6.5 `psi-scrape.mjs`

```js
// Dumps the visible text of a PageSpeed Insights report for both form factors.
import { createRequire } from 'node:module'
const { chromium } = createRequire('/Users/milesroxas/SITES/sas-site/package.json')('@playwright/test')
const url = process.argv[2] // https://pagespeed.web.dev/analysis/<slug>/<id>?form_factor=mobile
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 2000 } })
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 })
await page.waitForTimeout(4000)
for (const ff of ['mobile', 'desktop']) {
  const tab = page.getByRole('tab', { name: new RegExp(ff, 'i') }).first()
  if (await tab.count()) { await tab.click(); await page.waitForTimeout(2500) }
  console.log(`\n=================== ${ff} ===================\n`)
  console.log((await page.evaluate(() => document.body.innerText)).slice(0, 20000))
}
await browser.close()
```

The insight rows print collapsed (title and estimated savings only); the report's audit bodies live in a shadow DOM that the text dump does not expand. For the resource lists behind an insight, run the same page locally with Lighthouse and read the JSON.

## 7. Gotchas

- Lighthouse mobile applies 4x CPU slowdown and simulated 4G; the desktop preset barely throttles. Compare like presets only.
- Never take numbers from `localhost`: no CDN, dev bundles, no compression parity.
- `HEAD` to R2 reports `cf-cache-status: DYNAMIC`; probe the CDN by hand with `GET`.
- A Vercel preview URL's first hit after a deploy is a function cold start on the RSC and image routes; the median of three covers it, but drop an obvious outlier.
- Chromium pauses muted autoplay loops that are off screen, so a "playing" count only means something for a video centred in view; the capture script measures per video for that reason.
- Headless Chromium keeps a 15px scrollbar; capture scroll positions are relative to a 1280x800 viewport.
- The `html { opacity: 0 }` anti-flash rule means a page with no `data-theme` looks loaded in the DOM but paints white. The theme guard script is the check for that.
- Lighthouse's LCP is a simulation (Lantern), not the observed paint. It estimates LCP from every request that started before the observed LCP paint, treating all but low-priority images as required. A hero `<video preload="auto">` with an inline `<source>` starts its mp4 at ~200 ms, so the mp4 and the whole script graph land in the LCP estimate even though the observed LCP is the 35 KB poster at 430 ms (home mobile, 2026-09-16: observed 0.43 s, reported 9.1 s). Read `metrics.observedLargestContentfulPaint` next to the reported value before attributing an LCP change to rendering.
- The `redirects` audit listing the page URL twice is the `Critical-CH` restart from `withPayload` (780 ms on mobile), not a real redirect.
- `long-tasks` and `bootup-time` attribute by chunk; under Turbopack the hot leaf is usually the chunk registry (`registerChunk` / module factories), which means module evaluation of what hydration pulled in, not application code. The CPU-profile script (6.4) shows which chunks are on the stack; a task whose leaf is one GSAP function called from React's commit is the reveal shells' layout reads and writes (P1-7).
- Lighthouse's final full-page screenshot resizes the viewport at the end of a run; a late long task in the React chunk (about 9 s after navigation on the home page) is that resize, not page behaviour, and does not appear when the page is profiled without Lighthouse.
- A draft route returns a 404 page that still scores; `lcp element` becomes a paragraph. Check status codes first (section 1).
