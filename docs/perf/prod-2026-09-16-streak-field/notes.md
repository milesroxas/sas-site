# prod-2026-09-16-streak-field

Production `https://www.suits-sandals.com` at `e937927` (main, 2026-09-16), the first lab run since Streak Field (`a4f1edd`), the document GPU budget (`68ea997`) and the live docked menu window (`e68bdcb`) shipped. Lighthouse 13.4.1 on local Chrome 153 with a GPU, 4x CPU on mobile. `summary.md` is the median of three runs per row.

Control change: `/works/adacore` is a draft since 2026-09-14 and returns a 404 page (it scored 71 mobile with a paragraph as the LCP element before the mistake was caught; those runs were deleted). `/works/interchecks` (image hero, six loops) is the image-hero control from this run on.

## Compared with `prod-www-video-gating` (2026-09-09, `7829a73`)

| page | perf | lcp | tbt | mediaKb | scriptKb |
|---|---:|---:|---:|---:|---:|
| home-mobile | 64 → 67 | 10.2 → 8.8 s | 298 → 263 | 796 → **2,695** | 1,100 → 1,016 |
| home-desktop | 91 → 91 | 1.9 → 1.8 s | 7 → 6 | 1,852 → **3,638** | 1,100 → 1,016 |
| vault-mobile | 69 → 65 | 8.8 → 9.4 s | 202 → 320 | 1,921 → 1,921 | 1,122 → 1,028 |
| vault-desktop | 90 → 91 | 1.9 → 1.9 s | 15 → 9 | 1,921 → 1,921 | 1,122 → 1,028 |
| interchecks-mobile | new | 11.4 s | 846 | 535 | 1,028 |
| interchecks-desktop | new | 2.0 s | 198 | 463 | 1,028 |

Home and Vault are within run noise on score and LCP. Home media doubled: the Featured Work section is the second section and its Vault hero mp4 (1.7 MB) sits inside `VideoMedia`'s two-screen source gate, so it attaches at load on both presets. Script is flat at about 1 MB gz; nothing from the bundle diet has shipped.

## Media capture (Playwright, 1280x800, cold cache)

```
vault        at load: mp4=2 posters=10 (poster priority: High, preload link: yes)
             first R2 request: connection reused = true
             after scroll to end: mp4=10, attached at scrollY: [1800, 1800, 3000, 4200, 4800, 7800, 9600, 10200]
             video state at end: 10/10 with source, 10/10 play when centred; mp4 refetched on return: 0
interchecks  at load: mp4=2 posters=6 (poster priority: Medium, preload link: no)
             first R2 request: connection reused = false
             after scroll to end: mp4=6, attached at scrollY: [600, 1200, 4200, 4200]
             video state at end: 6/6 with source, 6/6 play when centred; mp4 refetched on return: 0
home         at load: mp4=3 posters=4 (poster priority: High, preload link: yes)
             first R2 request: connection reused = true
             after scroll to end: mp4=5, attached at scrollY: [1200, 1200]
             video state at end: 3/3 with source, 3/3 play when centred; mp4 refetched on return: 0
```

Gating still holds (nothing refetches on scroll-back, every loop plays when centred). Two things it now shows that the 09-09 capture did not: `mp4=3` at load on `/` and `mp4=2` on Vault (a loop inside two screens of the fold), and on interchecks the first R2 connection is not reused and the poster is Medium priority (image hero, so no video poster preload; the hero `<img>` preload has no `fetchpriority`).

## Theme guard

```
/                                    { theme: 'light', opacity: '1' } PASS
/works/vault-workforce-screening     { theme: 'light', opacity: '1' } PASS
```

## PageSpeed Insights, same day

Report `o918r5yj7y` (Lightrider, Lighthouse 13.4.1, Chrome 151): mobile **41** (FCP 1.2 s, LCP 9.0 s, TBT 1,970 ms, CLS 0, SI 6.6 s), desktop 62 (FCP 0.3 s, LCP 0.9 s, TBT 1,210 ms, SI 3.1 s). Mobile insights: render-blocking 1,010 ms, image delivery 113 KiB, unused JS 386 KiB, payload 4,201 KiB, 12 long tasks, main thread 6.2 s, JS execution 3.3 s, 9 non-composited animations. No CrUX data.

Software-GL repro of the home mobile run (`--use-angle=swiftshader`): TBT 260 ms at 4x, 20 ms at PSI's 1.2x multiplier. The PSI TBT is Lightrider's hardware, not a local-reproducible task.

## Why the lab LCP is 9 s

`metrics.observedLargestContentfulPaint` is 430 ms on home mobile (the hero poster, 35 KB, preloaded at high priority). The reported 8.8 to 9.1 s is Lantern's estimate over every request that started before that paint: 1.0 MB gz script, the 956 KB hero mp4 (started at 210 ms, `preload="auto"`, inline `<source>`), fonts, CSS, three posters. Interchecks has no video hero and still reads 11.4 s because its script graph is the same size and its hero `<img>` has a 1.2 s observed render delay. The `redirects` audit adds 780 ms for the Critical-CH restart on every page.

## Long-task attribution (cpu-profile.mjs, Moto G emulation, 4x CPU, no Lighthouse)

Home: six long tasks in the first second; the largest is 434 ms at 977 ms. 467 of its 715 samples are inside one GSAP core function (minified `t` in the 29 KB GSAP chunk) reached from React's hydration commit through the reveal-shell chunk, with Lenis `actualScroll` reads beside it. The earlier tasks (83 to 111 ms each) are Turbopack module evaluation (`registerChunk`) of Sentry, the app-router runtime, zod plus the AI SDK, and the three.js/R3F effects chunk.

Interchecks: seven long tasks; the largest is 262 ms at 790 ms, 328 of 404 samples in the same GSAP function from the same commit path. Lighthouse's forced-reflow insight attributes 67 ms (home) and 154 ms (interchecks) to that commit.

Reading: on a throttled phone the single biggest task is the reveal shells' layout reads and writes during hydration (audit P1-7, program item M8), and the rest of the blocking time is evaluating modules that mobile never uses (M3). Identify the GSAP function with a source map before changing the shells.

## Chunk inventory (home, `curl --compressed`, 37 scripts, 955 KB gz)

| gz KB | contents |
|---:|---|
| 122 | zod (483 `_zod` refs) + AI SDK |
| 96 + 82 | three.js core, `WebGLRenderer` |
| 69 + 18 + 6 | Sentry browser SDK with tracing, init chunk |
| 63 | react-dom |
| 48 | R3F + drei |
| 42 | lexical renderer, GSAP glue, tabler |
| 30 | effects chunk: `RefractionMedia`, `LightLeak`, demo `StreakField` scene (via the `@/features/immersive` barrel) |
| 29 + 17 | GSAP core, ScrollTrigger |
| 28 + 22 | c15t consent UI, providers |
| 12 | Lenis |

Raw Lighthouse JSON was deleted per the runbook; rerun for details.
