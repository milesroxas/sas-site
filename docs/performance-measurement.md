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

## 1. Targets

Always the same three URLs, so runs compare:

| Key | Path | Why |
|---|---|---|
| `vault` | `/works/vault-workforce-screening` | heaviest page, 10 videos |
| `adacore` | `/works/adacore` | image hero, control |
| `home` | `/` | hero handoff surface, refraction media |

Hosts:

- `prod` = `https://preview.suits-sandals.com` (the production alias; `www` is still Webflow).
- `preview` = the Vercel preview URL for the branch under test (`vercel ls`, or the PR check).
- `local` = `http://localhost:3001`, smoke only, never for numbers (no CDN, dev bundles, no Brotli).

Both hosts answer `x-robots-tag: noindex`; no auth needed.

## 2. Setup (once per machine)

```bash
pnpm dlx lighthouse --version
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Playwright's Chromium (`@playwright/test`, already installed) drives the capture
scripts. The scripts live in the session scratchpad and load Playwright through
`createRequire(<repo>/package.json)`; sources are in section 6. `SCRATCH` below
is that directory.

## 3. Run

`LABEL` names the run (`before-video-gating`, `after-video-gating`). `HOST` is a
full origin.

```bash
cd /Users/milesroxas/SITES/sas-site
LABEL=before-video-gating
HOST=https://preview.suits-sandals.com
OUT=docs/perf/$LABEL && mkdir -p "$OUT"
```

### 3.1 Lighthouse, 3 runs per page per preset

```bash
for key in vault adacore home; do
  case $key in
    vault) route=/works/vault-workforce-screening ;;
    adacore) route=/works/adacore ;;
    home) route=/ ;;
  esac
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

Pass criteria after video gating:

- `mp4` at load: 1 (hero) on `vault`, 0 on `adacore`.
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

### 3.5 Commit the run

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
- `kb` on `adacore` and `home`: small change expected; a large one means something unrelated shipped.

Paste both tables into the audit doc's status section when a phase closes.

## 5. Field (Speed Insights)

Seven days after prod. Vercel dashboard, project `sas-site`, Speed Insights,
route filter `/works/[slug]`, P75. Record LCP, FCP, INP and the LCP element
attribution. Until `www.suits-sandals.com` cuts over from Webflow the samples are
team and client traffic, so weight lab over field.

## 6. Script sources

### 6.1 `perf-capture.mjs`

```js
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const { chromium } = createRequire('/Users/milesroxas/SITES/sas-site/package.json')('@playwright/test')

const [host, outDir] = process.argv.slice(2)
const pages = { vault: '/works/vault-workforce-screening', adacore: '/works/adacore', home: '/' }
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

## 7. Gotchas

- Lighthouse mobile applies 4x CPU slowdown and simulated 4G; the desktop preset barely throttles. Compare like presets only.
- Never take numbers from `localhost`: no CDN, dev bundles, no compression parity.
- `HEAD` to R2 reports `cf-cache-status: DYNAMIC`; probe the CDN by hand with `GET`.
- A Vercel preview URL's first hit after a deploy is a function cold start on the RSC and image routes; the median of three covers it, but drop an obvious outlier.
- Chromium pauses muted autoplay loops that are off screen, so a "playing" count only means something for a video centred in view; the capture script measures per video for that reason.
- Headless Chromium keeps a 15px scrollbar; capture scroll positions are relative to a 1280x800 viewport.
- The `html { opacity: 0 }` anti-flash rule means a page with no `data-theme` looks loaded in the DOM but paints white. The theme guard script is the check for that.
