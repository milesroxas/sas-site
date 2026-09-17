# Work page performance audit (`/works/[slug]`)

Date: 2026-09-03. Deployment audited: `57f6f47` on the production alias `preview.suits-sandals.com` (also `sas-site-sas-team.vercel.app`). Scope: the case-study route, its shared layout, and everything a work page ships to the browser. Documentation only, no code changes were made.

## 0. Status

### Current direction, 2026-09-16

Two tracks, run together:

1. **Streak Field** (unchanged from 2026-09-13, below): CMS-selectable shader visuals with posters as the complete fallback. The feature is implemented and on production since 2026-09-14; its open gates are hardware traces and the shared-canvas comparison, recorded in the [feature plan](streak-field-media-plan.md#implementation-record-2026-09-13).
2. **Mobile score program**, [section 9](#9-mobile-score-program-2026-09-16): the research-backed sequence that takes PageSpeed Insights mobile from 41 to the 80s without changing what a visitor on a real phone or a desktop GPU sees. Mobile already gets no WebGL (coarse pointer gate), so the mobile score is a loading problem, not a rendering one: the hero mp4 and one megabyte of script start before the poster paints, the Critical-CH restart costs a full round trip, and the two below-fold videos on the home page fetch at load.

The 2026-09-16 review ([status entry](#2026-09-16-review-fresh-psi-lab-and-field-read)) replaces the earlier measurements. The stored lab baseline is now `docs/perf/prod-2026-09-16-streak-field/`; `/works/adacore` is a draft (404 in production) and `/works/interchecks` is the image-hero control from this run on.

### Direction recorded 2026-09-13 (Streak Field)

Deliver **CMS-selectable Streak Field visuals for website heroes, previews, and composition blocks**, with named code presets, per-entry variation, graceful degradation, and cohesive existing navigation. The [Streak Field implementation plan](streak-field-media-plan.md) defines the feature and its acceptance gates. [Section 6](#6-execution-order-and-expected-impact) below defines the coordinated performance work. This direction supersedes the September 12 blanket WebGL deferral and the older removal-first recommendations.

Performance is part of delivering the feature: optimized first-paint posters, deferred runtime bytes, bounded animation, reliable pause/failure handling, and no regression to media loading or navigation. A poster-only deployment is a rollout/fallback mode. Feature completion requires working live shader visuals on qualified hardware as well as complete fallback behavior. A shared canvas, WebGPU, vgpu, and live GPU page transitions are implementation options, not the end goal.

The planned WebGL work is now scoped to supporting Streak Field. Measure the current WebGL2 effect as the baseline and reuse the persistent-root location where the shared-rendering prototype passes. Do not wait for an unspecified replacement project, create a second competing runtime, or rewrite all effects before shipping the pilot. Retained effects still count toward the total GPU and loading budget.

The dated entries below are history, not a second execution queue. Sections 1–5 retain the original audit evidence and recommendations; shipped status and present priorities come from this section and sections 6–8. Old package upgrade targets, CMS inventories, forecasts, and lab numbers must be rechecked before implementation. No new performance measurements or application changes were made for this roadmap revision.

### Verified repository state, 2026-09-13 (rechecked 2026-09-16)

Checked against `de03f43` on 2026-09-13; rechecked against `e937927` (production, 2026-09-16) with production requests, the chunk inventory and the fresh lab run described in the [2026-09-16 review](#2026-09-16-review-fresh-psi-lab-and-field-read). Rows marked **09-16** changed since the 09-13 check.

Lockfile and installed packages agree on Next 16.3.4, React 19.2.7, Payload 3.88.0, Three 0.182.0, R3F 9.6.1, Drei 10.7.7, PostHog JS 1.399.2, and Sentry Next.js 10.65.0. These are verified versions, not new upgrade recommendations.

| Area | Current implementation and evidence | Roadmap status |
| --- | --- | --- |
| Streak Field | Update 2026-09-13: shader visual selection, the resolver, the poster-first `StreakVisual` slot and the bounded local runtime are implemented (see the plan's [implementation record](streak-field-media-plan.md#implementation-record-2026-09-13)); the baseline record is at [`docs/perf/streak-field-baseline/`](perf/streak-field-baseline/README.md). **09-16:** on production since `a4f1edd` (2026-09-14) with the document GPU budget (`68ea997`) and the live docked menu window (`e68bdcb`). The home hero is still the gradient video, so the home page exercises the lens path, not a live field; Streak posters appear only in the menu previews. | CMS feature **implemented and deployed**; hardware measurements and the shared-canvas comparison remain **open**. |
| Persistent graphics | Update 2026-09-13: [GlobalCanvasRoot](../src/components/GlobalCanvasRoot/index.tsx) is a real dynamic import boundary mounted only once a route activates the canvas, and the store's activity flag is a reference-counted lease. [GlobalCanvas](../src/lib/webgl/components/global-canvas/index.tsx) keeps the WebGPU-first factory; Streak Field owns one admitted local classic canvas. **09-16:** the production home page still ships three.js core (82 + 96 KB gz), R3F/drei (48 KB) and a 30 KB effects chunk that bundles `RefractionMedia`, `LightLeak` and the demo `StreakField` scene, on every route including mobile, because `HeroBackground`, `ClosingLightLeak` and `Menu/LiveVisual` import the `@/features/immersive` barrel, and the barrel re-exports `StreakField` from `ui/streak-field.tsx`, which statically imports the scene and R3F `Canvas`. The lazy runtime boundary in `StreakVisual` is bypassed by that edge. | Global-canvas split **done**; the per-effect boundary is **open** and is now [M3](#9-mobile-score-program-2026-09-16). Shared-canvas comparison remains **open**. |
| Graphics admission | Update 2026-09-13: Streak Field admission runs through its own probe (`src/features/immersive/visual/capability.ts`: real WebGL2 without a performance caveat, software-renderer names, float-target support), a document ceiling, hidden/covered/paused gates, first-frame readiness and a frame watchdog. [GPU detection](../src/lib/webgl/utils/gpu-detection.ts) is unchanged for the other effects. | Streak Field lifecycle **done**; the retained lens's idle repaint (section 0 note) is still **open**. |
| Home lens and footer leak | [HeroBackground](../src/Home/hero/HeroBackground.tsx) waits for HeroBand settlement; the lens texture hook still invalidates on visible video frames. [ClosingLightLeak](../src/Footer/Closing/ClosingLightLeak.tsx) gates mounting but statically imports its effect. | Existing behavior is present. Idle-work and loading/coexistence improvements remain **open**; historical draw rates were not remeasured. |
| Image delivery | [ImageMedia](../src/components/Media/ImageMedia/index.tsx) prefers CDN URLs, uses quality 90, and defaults `sizes` to `100vw`. [Next config](../next.config.ts) allows qualities 75/90, caps device sizes at 2560, and sets a one-year minimum optimizer TTL. | Core image fixes are **implemented**. Per-placement sizes and shared blur cleanup remain open. There is no per-call quality override in Media today. |
| Video loading/posters | [VideoMedia](../src/components/Media/VideoMedia/index.tsx) keeps priority sources eager, gates default loops by visibility, and leaves controlled videos eager with metadata preload. Its native `poster` is still a raw URL; Carousel additionally renders an optimized Media poster overlay. **09-16:** the priority hero keeps `preload="auto"` and an inline `<source>`, so the 956 KB home mp4 starts at ~210 ms, before the poster paints; Lighthouse charges it to LCP (see the review). The default gate's two-screen `rootMargin` now catches the home page's second section (Featured Work, Vault hero mp4, 1.7 MB) at load on both form factors, which the 2026-09-09 baseline did not show (`mediaKb` 796 → 2,695 mobile). | Video gating is **implemented**. Hero source deferral ([M1](#9-mobile-score-program-2026-09-16)), load-event gating for near-fold loops (M4) and responsive posters (M5) are **open**. |
| Menu prefetch/warmup | [TakeoverMenu](../src/Header/Menu/index.tsx) sets `menuLinkPrefetch = open ? undefined : false`. Closed links disable prefetch; opening restores Next's default. `warmMedia` preloads image previews on button intent/open, skips videos, and does not call `router.prefetch` or prepare shaders. **09-16:** the home page still fires 20 `?_rsc=` prefetches (76 KB) between 470 and 660 ms from links outside the menu (header, footer, index and legal links, `/demo/immersive`), two per route. | Closed-menu fix is **implemented**. Prefetch-on-intent for chrome links is [M7](#9-mobile-score-program-2026-09-16). |
| Ask loading | TakeoverMenu imports MenuAsk; [FooterClosing](../src/Footer/Closing/FooterClosing.tsx) imports [ClosingAsk](../src/Footer/Closing/ClosingAsk.tsx), which imports `useAskChat` directly. These paths have no lazy chat boundary. | Ask split remains **open**. Footer work targets ClosingAsk, not the separate AskWidget component. |
| Analytics | [PostHog](../src/providers/Analytics/PostHog.tsx) dynamically imports after environment/internal-traffic/consent checks and idle scheduling; canvas recording is disabled. AnalyticsProvider composes PostHog and Reb2b. | Loading/consent/internal-traffic logic is **implemented**. The historical PostHog 1.429.5 upgrade has **not landed** in this checkout. Remote project settings are unverified. |
| Sentry | [Browser instrumentation](../src/instrumentation-client.ts) has no Replay integration but still configures console logging and `enableLogs: true`. [Shared options](../sentry.shared.ts) sample production traces at 0.2. **09-16:** `ac860fe` (2026-09-13) runs the SDK and the sourcemap upload on the production deployment only. The SDK still costs 69 + 18 KB gz and its init chunk is the second-largest main-thread item on a 4x-throttled phone (270 to 360 ms). | Replay removal and preview gating are **implemented**. Production logging reduction, tracing removal for public traffic and idle init are [M3c](#9-mobile-score-program-2026-09-16). |
| Layout and theme | [Frontend layout](../src/app/(frontend)/layout.tsx) gates AdminBar on draft mode and preconnects to the configured media host. [InitTheme](../src/providers/Theme/InitTheme/index.tsx) guards storage/matchMedia. SpeedInsights is still unconditional with no `beforeSend`. | AdminBar/preconnect/theme fixes are **implemented**. Speed Insights draft/internal filtering remains **open**. |
| Client hints | Installed Payload `withPayload` appends `Accept-CH`, `Vary`, and `Critical-CH` on `/:path*`. Next config has no header scoping. **09-16:** production still sends `critical-ch` on `/`; Lighthouse's `redirects` audit reports the same-URL restart at **780 ms** on mobile and it is the "Had redirects" line in PSI. | **Open**, now [M2](#9-mobile-score-program-2026-09-16). The fix must rewrite the composed `headers()` after `withPayload`, not add a second rule. |
| Performance automation | Package scripts contain build/test/migration checks; the only checked-in GitHub workflow runs Payload jobs. The pre-push hook checks migrations. Capture scripts are examples in the runbook, not checked-in runnable files under `scripts/`. | CI bundle budgets and shader instrumentation are **not implemented**. |

This table is the current source inventory. The execution stages below describe future work. Historical measurements remain useful baselines only when their deployment, content, and capture method are identified.

### 2026-09-16 review: fresh PSI, lab and field read

Production `e937927` (main). What shipped since the 2026-09-13 revision: Streak Field as CMS media (`a4f1edd`), the document GPU budget with real context-loss handling (`68ea997`), the live docked menu window (`e68bdcb`), Sentry gated to the production deployment (`ac860fe`), and the Webreel pointer detection in the cursor provider (`e937927`). Nothing from the September 12 non-WebGL list shipped except the Sentry deployment gate. PostHog JS is still 1.399.2.

**PageSpeed Insights, `/`, 2026-09-16 16:13 EDT** (report `o918r5yj7y`, Lighthouse 13.4.1, Chrome 151 on Lightrider, no CrUX data yet):

| | Mobile | Desktop |
|---|---:|---:|
| Performance | **41** | 62 |
| FCP | 1.2 s | 0.3 s |
| LCP | 9.0 s | 0.9 s |
| TBT | 1,970 ms | 1,210 ms |
| CLS | 0 | 0 |
| Speed Index | 6.6 s | 3.1 s |

Mobile insights: render-blocking requests 1,010 ms (the 51 KB stylesheet), image delivery 113 KiB (two raw JPEG posters), unused JavaScript 386 KiB, total payload 4,201 KiB, 12 long tasks, main-thread 6.2 s, JS execution 3.3 s, 9 non-composited animations, legacy JS 14 KiB, forced reflow. The desktop TBT fell from 4,410 ms on 09-12 to 1,210 ms (the lens's idle repaint no longer dominates on Lightrider, cause not isolated); mobile TBT rose from 300 ms to 1,970 ms on the same environment, which no local run reproduces (next paragraph). The PSI API's anonymous quota was exhausted; the report page was scraped with headless Chromium (runbook section 3.6).

**Lab, `docs/perf/prod-2026-09-16-streak-field/`** (Lighthouse 13.4.1, Chrome 153, local GPU, medians of 3; `/works/adacore` is a draft since 2026-09-14 and 404s, so `/works/interchecks` is the image-hero control from now on):

| page | perf | lcp | fcp | tbt | kb | scriptKb | mediaKb | lcp element |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| home-mobile | 67 | 8774 | 1890 | 263 | 4140 | 1016 | 2695 | hero `<video>` |
| home-desktop | 91 | 1826 | 565 | 6 | 5080 | 1016 | 3638 | hero `<video>` |
| vault-mobile | 65 | 9406 | 2028 | 320 | 4009 | 1028 | 1921 | hero `<video>` |
| vault-desktop | 91 | 1890 | 564 | 9 | 4030 | 1028 | 1921 | hero `<video>` |
| interchecks-mobile | 52 | 11399 | 2024 | 846 | 2497 | 1028 | 535 | hero `<img>` |
| interchecks-desktop | 83 | 1951 | 537 | 198 | 2547 | 1028 | 463 | hero `<img>` |

Against the 2026-09-09 baseline (`prod-www-video-gating`): home and Vault are within noise on score and LCP; home `mediaKb` doubled because the Featured Work section's Vault mp4 (1.7 MB) now attaches at load (it is the second section, inside the two-screen gate); script is 1,016 to 1,028 KB gz per page (955 KB summed from the chunk inventory), unchanged. Interchecks is a new control, not a regression signal: its hero image is requested at `sizes="100vw"` without `fetchpriority` (the Lighthouse LCP checklist fails "fetchpriority=high should be applied", P1-4 still open), four loops attach at ~930 ms, and its hydration is heavier (TBT 760 to 846 ms, a 570 ms unattributed layout task at 1.6 s and a 400 ms React task at 6.9 s).

Software-GL repro (home, mobile preset, `--use-angle=swiftshader`): TBT 260 ms at 4x CPU, 20 ms at PSI's 1.2x multiplier. Lightrider's 1,970 ms is therefore its hardware stretching the same tasks. The CPU-profile probe (runbook 3.6 and 6.4, Moto G emulation at 4x, no Lighthouse) attributes them: on home the largest task is 434 ms at 977 ms, and 467 of its 715 samples sit in one GSAP core function reached from React's hydration commit through the reveal-shell chunk, with Lenis scroll reads beside it; on interchecks the same function takes 328 of 404 samples in a 262 ms task. Lighthouse's forced-reflow insight blames the same commit (67 ms home, 154 ms interchecks). The five smaller tasks before it (80 to 110 ms each) are Turbopack module evaluation of Sentry, the app-router runtime, zod plus the AI SDK, and the three.js/R3F effects chunk, none of which a phone uses in the first second. The late 270 ms task Lighthouse lists at about 9 s is its own full-page-screenshot resize and does not appear outside Lighthouse.

**Why LCP reads 9 s when the poster paints at 0.4 s.** In the home mobile trace the observed LCP is 430 ms (the hero poster). Lighthouse's Lantern model estimates the throttled LCP from every network request that started before that paint and treats all of them except low-priority images as required: 1.0 MB gz of script, the 956 KB hero mp4 (`preload="auto"`, inline `<source>`, started at 210 ms at Low priority), fonts, CSS and three posters. On simulated slow 4G that graph takes 9 s. The same holds for Vault (1.7 MB hero mp4) and for image-hero pages through the script graph alone (interchecks 11.4 s). Two changes move it: no video bytes before the poster paints (M1), and far less script in the initial graph (M3). In the field the LCP element is the poster on every page, so the score gap is a lab artifact in its size but not in its cause: the same requests contend for a real slow link.

**Other findings from this run:** the Critical-CH restart is reported by Lighthouse as a same-URL redirect worth 780 ms on mobile (M2); 20 `?_rsc=` prefetches from chrome links land at 470 to 660 ms (M7); the hero preload carries `fetchPriority="high"` on video-hero pages but image heroes still lack it; the theme guard passes on `/` and Vault; the media capture (Playwright, 1280 px viewport) shows `mp4=3` at load on `/`, 2 on Vault, 2 on interchecks, every loop plays when centred and nothing refetches on scroll-back; the chunk inventory puts zod plus the AI SDK at 122 KB gz, three.js at 82 + 96 KB, R3F/drei at 48 KB, the effects chunk (lens, leak, demo Streak scene) at 30 KB, Sentry at 69 + 18 + 6 KB, c15t at 28 KB, and the Streak runtime at 30 KB in the initial script list of a page whose hero is a video.

Field: Speed Insights has no public P75 worth reading yet (the 09-16 first read was planned on data still mixed with admin loads; M10 lands the filter first). PSI shows no CrUX data for the origin.

### Earlier status and measurements

2026-09-09, branch `perf/cold-start-1-3` (preview deploy first). A prod re-check that day found that none of the tier 1 items below had shipped except the menu `prefetch={false}`, and added two cold-path findings the original audit missed: every `/_next/static` URL carries `?dpl=<deployment>`, so the browser cache is empty after each deploy, and `<Image>` sources go through the Payload file route (a function answering `max-age=0`), so the optimizer serves `max-age=60` to browsers and re-fetches the origin per variant. Shipped in that branch:

- Next 16.3.4: immutable content-addressed static assets (`/_next/static/immutable/*`, no `dpl` query) so chunks and fonts survive redeploys in the browser cache. The `experimental.viewTransition` flag no longer exists in 16.3; the integration is built in.
- `ImageMedia` resolves its source from the R2 host (`getCdnMediaUrl`, shared with `VideoMedia`) and falls back to the Payload route only when `NEXT_PUBLIC_MEDIA_URL` is unset. `images.minimumCacheTTL` is one year (URLs carry `?updatedAt`), `qualities` is `[75, 90]` with `ImageMedia` at 90, `deviceSizes` stops at 2560, and the default `sizes` is a valid `100vw`.
- `AdminBar` renders only in draft mode (preview links, admin live preview), so anonymous visitors on prerendered pages no longer call `/api/users/me`.

Branch `perf/video-gating-hero-priority` (2026-09-09) ships the next slice, verified in Chromium against the `Components/Media` stories and measured before and after on the Vault, Adacore and home pages (`docs/perf/before-video-gating`, `docs/perf/after-video-gating`): Vault load drops from 23.3 MB to 4.1 MB and from 10 video objects to 2, Adacore mobile LCP from 9.7 s to 4.3 s. Merged as PR #15 (`76f5ea0`) and confirmed on the live alias the same day (`docs/perf/prod-video-gating`). Vault and home mobile LCP stay near 9.3 s because Lighthouse's simulated 4G is dominated by the 1.78 MB hero mp4 (phase 5) and the 1.1 MB of script (P0-2).

- Video gating (P0-1): `VideoMedia` has three modes. `priority` (every hero) keeps the source in the HTML with `preload="auto"` and preloads the poster at `fetchpriority="high"` through React's `preload()`. The default self-playing loop renders poster only, attaches its `<source>` two screens ahead (one-shot, so scrolling back never re-downloads) and plays or pauses with its own box. `autoPlay={false}` (Carousel) keeps the eager metadata source because its controller owns `play()` and reads `readyState`. The hero handoff is untouched: it clones `[data-hero-media] video`, which is always the priority path.
- `preconnect` to the media host from the root layout head (P1-4). There is no `fetchpriority` for `<video>` itself; the poster preload is the equivalent for the LCP frame.
- Theme bootstrap guard (P1-9): the storage and `matchMedia` reads sit in a `try`, so a blocked-storage browser still gets `data-theme` and the `html { opacity: 0 }` rule releases.
- `videoFixture` now carries its real poster (`mediaFixture`), so Storybook video stories paint what production paints.

2026-09-10: the PostHog slice of P0-2 is done, Sentry Replay is gone, and Google Analytics is gone.

- `src/providers/Analytics/PostHog.tsx` imports `posthog-js` dynamically inside the consent effect and waits for idle time before doing so. The 216 KB SDK chunk is absent from the initial HTML (verified against a prerendered page in `.next/server/app`); only the provider component ships, and it carries no SDK code.
- GA4 and `@next/third-parties` are removed. The provider was a second consent-gated tracker duplicating PostHog pageviews with every ads signal denied, so it bought nothing. `AnalyticsProvider` now composes PostHog and Reb2b.
- Sentry Replay is removed from `src/instrumentation-client.ts`. It recorded every visitor in buffer mode before any consent, which the CNIL's draft recommendation on session replay (February 2026) says needs consent even for debugging, and it ran a second DOM recorder beside PostHog's. Sentry keeps error monitoring, which is its job. Initial JS per prerendered page, measured as `gzip -9` of every chunk the HTML references in a local build (compare the deltas, not the absolutes, with the transfer figures in section 2):

  | Page | Before | After |
  |---|---|---|
  | `/post` | 842 KB | 803 KB |
  | `/` | 971 KB | 932 KB |
  | `/works/vault-workforce-screening` | 938 KB | 900 KB |

- Session replay runs in PostHog only, for the UX team, behind the `measurement` category. The recorder (33 KB gzipped, `recorder.js`) is fetched through the proxy after consent and after idle, and it runs for every consenting visitor. PostHog's project-level sample rate only decides which recordings upload, so it controls quota, not browser cost: in posthog-js 1.399.2, `_startRecorder` runs after the sampling decision whatever the outcome. If browser cost ever matters, decide sampling in code before init.
- Canvas recording is forced off via `session_recording.captureCanvas.recordCanvas`, the local override that beats the project-level remote config. With canvas recording on, rrweb forces `preserveDrawingBuffer` on every WebGL context and re-encodes frames several times a second, against the media budget P0-1 just bought back.
- Errors stay with Sentry on both client and server. PostHog exception autocapture is off, so no second autocapture script loads and no exception is billed twice.
- Server-side conversion events use `posthog-node` behind `afterResponse` (`next/server` `after()`), so no flush lands in a request path or inside a Payload transaction.
- Pending: posthog-js 1.429.5 stops a looping background video from emitting a recording event on every autoplay toggle, and every case study has those. The pnpm 24-hour release cooldown blocks it until 2026-09-11 18:22 UTC.

Still open from tier 1: the rest of the bundle diet (P0-2, mainly the WebGL split, the Ask composer, and Sentry console logging in production), posters through `next/image` and real `sizes` on the blocks that pass none (P1-5), `Critical-CH` scoping (P1-8), Speed Insights draft-mode and internal-traffic filtering (section 7).

2026-09-12: plan for the next slice. Nothing perf-related has merged since the `prod-www-video-gating` baseline (`7829a73`); the 22 commits since are Ask, analytics and UI work. The stored `docs/perf/prod-www-video-gating/summary.md` baseline reports desktop 90 to 98, mobile 64 to 72, and about 1.1 MB gzipped of script on the measured routes. These are the earlier capture results, not a fresh production measurement.

September 12 decision, superseded September 13: the WebGL half of P0-2 was deferred pending a replacement technique. It is now part of the Streak Field delivery sequence in section 6. Loading boundaries, capability checks, lifecycle fixes, and necessary coexistence changes may be implemented there; avoid a separate cleanup of infrastructure that the selected runtime will replace.

The September 12 non-WebGL proposal was `perf/tier1-non-webgl`, measured before and after with the runbook (label `after-tier1-non-webgl`). Its remaining items can ship independently under section 6; the entire list is not a prerequisite for Streak Field:

1. Ask composer split (P0-2). `TakeoverMenu` and `FooterClosing` render a static composer shell; the chat module (`useAskChat`, `@ai-sdk/react`, `ai`, zod) loads through `next/dynamic` on first intent: the menu button's existing `warmMedia` hover hook, and focus on the closing card's input. Must not change `CHAT_WIPE_*` timings, the preview-slot geometry the menu measures, or the closing band's `data-reveal="panel"` entrance. Verify: no zod or AI SDK chunk in the initial script list of a prerendered page; menu open and footer focus still land the first keystroke without a visible stall.
2. Sentry in production (P0-2). Drop `consoleLoggingIntegration` and `enableLogs` from `src/instrumentation-client.ts` outside development; lower `tracesSampleRate` for public traffic. Error capture and `captureRouterTransitionStart` stay eager.
3. Image pipeline (P1-5). Posters render through `next/image` (same `getCdnMediaUrl` source as `ImageMedia`) so they get `srcset` and the one-year optimizer cache; real `sizes` on MediaBlock, Carousel, showcase grid, testimonial and the centered-media hero (today they fall back to the `100vw` default and pick the widest candidate). Hero quality stays 90.
4. Proposed `Critical-CH` and `Vary` scoping to `/admin` (P1-8). Source verification on September 13 found that `withPayload` appends a catch-all rule after user `headers()`, so implementation must change the final composed header rules and verify public/admin responses, not only add an admin rule.
5. Speed Insights hygiene (section 7). Do not render `SpeedInsights` in draft mode; filter team and admin traffic in `beforeSend` using the same internal-traffic signal the PostHog provider already applies (`5c2b7a8`), so field and product analytics agree on what "public" means. First public field read is 2026-09-16; land this before it.
6. `posthog-js` to 1.429.5 (see the pending note above). The pnpm cooldown lifted 2026-09-11 18:22 UTC. Re-run the Vault media capture afterwards and confirm the recorder stops emitting an event per autoplay toggle on the looping case-study videos.
7. CI bundle budget (P0-2 guardrail): a per-route gzipped script budget from the `next build` output so the Ask split cannot regress, set just above the post-slice number and tightened again after the WebGL work.

Expected effect: roughly 120 KB gzipped off every page from the Ask split and Sentry, fewer image bytes on mobile from real `sizes`, one less first-visit round trip in Chrome, and clean field data from 09-16. Mobile LCP on Vault and home stays hero-mp4 bound until phase 5 (encoding) and the WebGL re-audit.

2026-09-12, PageSpeed Insights read on `/` (report `vqjeu9zzdo`, Lighthouse 13.4.1 on Lightrider): desktop 59 with FCP 0.3 s, LCP 0.9 s, CLS 0, but TBT 4,410 ms, Speed Index 5.8 s, 8.6 s main-thread; mobile 64 with LCP 8.7 s, TBT 300 ms, matching the `prod-www-video-gating` baseline. The desktop TBT is not in our lab numbers (170 ms locally, 7 ms in the baseline) and is not a regression. Reproduced locally by forcing software WebGL plus a 4x CPU slowdown (TBT 2,520 ms, 20 long tasks, 2.5 s of "Other" attributed to the three.js chunk in back-to-back ~100 ms tasks); mobile under the same conditions stays at 190 ms. Cause: the home hero lens (`src/Home/hero/HeroBackground.tsx`, `RefractionMedia` with `HERO_LENS` over the 24 fps looping hero mp4) is `frameloop="demand"`, but `useBackdropTexture` in `glass-media-internals.ts` invalidates on every `requestVideoFrameCallback` while on screen, so the full-viewport canvas repaints 24 times per second indefinitely with the pointer nowhere near it (measured with a draw-call probe: 24 draws/s for 20 s, intro settled, unchanged after hover and leave). `useDeviceDetection().hasGPU` admits any WebGL context that is not coarse-pointer-and-no-hover and not reduced motion, so Lightrider's SwiftShader on a fine-pointer desktop profile qualifies and renders every frame on the CPU. Real desktops with a GPU do not pay this in TBT, but the loop is still 24 full-viewport shader passes per second for an undistorted image whenever the lens is at rest. September 13 action: include capability and idle-work handling in the Streak Field runtime/coexistence stage. A retained video-backed lens should not repaint while `uHover` is 0 and no proximity is active; let the DOM video show through. Known software renderers such as SwiftShader and llvmpipe should use fallback behavior when identified. Do not reject Mesa categorically, since it also supports hardware acceleration; unknown renderer identity requires conservative admission and runtime measurement. Other PSI desktop findings map to open items: "Had redirects, +125 ms" is the `Critical-CH` restart (P1-8, item 4 above; Lighthouse reports it as a same-URL redirect); render-blocking CSS 50 KB is P2-10; unused JS 335 KB is P0-2.

## 1. Original audit summary (2026-09-03)

Historical snapshot. Several causes below have since been fixed; use the verified repository-state table for current implementation status. Original traffic and deployment descriptions are not claims about today's production site.

The work pages are not slow because of rendering or interaction. TTFB (0.45s), INP (56ms), CLS (0.01) and FID (4ms) are all green. The pages are slow because of what they ask the browser to download in the first two seconds. Field P75 on desktop is FCP 4.65s and LCP 4.86s, and those two numbers being almost equal is the tell: first paint itself is being starved, and the hero paints as soon as anything paints.

Three root causes account for most of the gap:

1. **Media flood at load.** Every `<video>` on a work page is `autoPlay` with no viewport gating, so all of them start downloading during the LCP window. The Vault page carries 10 videos totalling 21.6 MB, Arturo 9 videos at 12.4 MB. Their posters are raw JPEGs from R2 (four of them 140 to 185 KB) that bypass image optimization.
2. **1.0 MB gzipped of JavaScript on every page** (3.4 MB raw across 30 chunks). Roughly 60% of it cannot run on a work page: three.js, React Three Fiber and drei are shipped through a `next/dynamic` call that is not actually a code split; the AI SDK and a full copy of zod ship through the header and footer Ask composers; Sentry Session Replay and the PostHog SDK are bundled eagerly even though they initialize later or never.
3. **A request storm in the first second.** The closed takeover menu is `fixed inset-0 opacity-0` and still laid out, so Next prefetches every one of its links: 80 RSC segment fetches (about 20 routes) fire at 600 to 850 ms, alongside 10 poster fetches, 30 script fetches, Sentry envelopes and an admin-bar auth call.

Everything else in this document is secondary, but several items compound the above: the LCP element on video-hero pages is the `<video>` itself with no priority hint, `priority` images no longer get `fetchpriority="high"` under Next 16, the default `sizes` string is invalid and falls back to `100vw`, every image is requested at quality 100, and 30 full media documents are serialized into the RSC flight payload.

A data caveat: the site is still `noindex` on a Vercel domain and `www.suits-sandals.com` is still Webflow, so the 356 desktop samples behind the score are team, client and admin traffic. Admin live-preview loads render in draft mode (dynamic, uncached, depth-4 queries) inside an iframe and report to Speed Insights like any other visit. That does not change the findings, but it means the P75 mixes cold real-user loads with unusually heavy internal loads. Section 7 covers measurement hygiene.

Lab confirmation (Lighthouse 12, desktop preset, fast machine, cold cache): performance 88, FCP 0.6s, LCP 2.1s with 67% of LCP time spent in render delay on the hero video, 23.5 MB transferred, 168 requests.

## 2. What was measured in the original audit

| Source | What it gave |
|---|---|
| Vercel Speed Insights (screenshot, desktop, production, 7 days) | RES 65 for `/works/[slug]` over 356 samples; FCP 4.65s, LCP 4.86s, INP 56ms, CLS 0.01, TTFB 0.45s at P75 |
| Production HTML for five work pages, fetched with gzip | HTML size, script and stylesheet lists, image and video markup, preload hints, flight payload size |
| Every JS and CSS chunk referenced by the Vault page, downloaded and sized | Raw and gzip bytes, library signatures per chunk |
| R2 media HEAD and ranged GETs | Poster and video byte sizes, cache status, MP4 atom order, codec and bitrate via ffmpeg |
| Lighthouse 12 desktop run against the Vault page | Metrics, LCP element and phase breakdown, request breakdown by type, forced reflow, unused JS |
| Source reading | Route, layout, providers, header and footer, `Media`, blocks, reveal shells, WebGL lib, analytics, Payload config |

### Page anatomy, Vault case study (`/works/vault-workforce-screening`)

| Asset class | Count | Bytes (transfer) | Notes |
|---|---|---|---|
| HTML document | 1 | 35 KB gz (252 KB raw) | 142 KB of the raw HTML is the inline RSC flight payload |
| Stylesheets | 4 | 49 KB gz (302 KB raw) | one file is 296 KB raw, 232 KB of it Tailwind utilities |
| Fonts | 2 | 142 KB | Geist and Geist Mono variable, preloaded, `font-display: swap` |
| Scripts on initial load | 30 (+1 `noModule` polyfill) | 990 KB gz (3.39 MB raw) | all `async`, none render blocking |
| Scripts by end of load | 47 | 1.21 MB | includes Sentry replay worker and the Speed Insights script |
| Video posters | 10 | 754 KB | raw JPEG from R2, not through `next/image` |
| Videos | 10 | 21.6 MB | H.264 1080p, 2.2 to 3.3 Mbps, 4 to 12 s loops, all autoplay |
| Optimized images | 10 | ~100 KB visible at load | lazy, below the fold |
| RSC prefetches | 80 | 269 KB | every link inside the closed takeover menu |
| Total | 168 requests | 24.1 MB | |

### Same shape on the other work pages

| Page | HTML raw | Images | Videos | Video bytes | Hero type | Hero preload |
|---|---|---|---|---|---|---|
| vault-workforce-screening | 252 KB | 10 | 10 | 21.6 MB | video | none |
| arturo | 191 KB | 6 | 9 | 12.4 MB | video | none |
| interchecks | 176 KB | 6 | 6 | 4.0 MB | image | `<link rel=preload as=image>` |
| adacore | 176 KB | 8 | 2 | 3.4 MB | image | `<link rel=preload as=image>` |
| gentlebeast | 179 KB | 9 | 1 | 1.7 MB | image | `<link rel=preload as=image>` |

For comparison, `/works` (RES 99) ships the same JavaScript but has 2 videos and 3 images. The JavaScript is a site-wide tax; the media is what separates the work pages from the rest of the site.

### Lighthouse desktop, Vault page

| Metric | Lab value | Field P75 |
|---|---|---|
| FCP | 0.6 s | 4.65 s |
| LCP | 2.1 s | 4.86 s |
| LCP element | hero `<video>` (poster `Vault Hero-poster.jpg`) | not attributed |
| LCP breakdown | TTFB 10%, load delay 12%, load time 12%, render delay 67% | |
| Total blocking time | 0 ms (M-series CPU) | |
| Main thread | 0.7 s (script evaluation 318 ms) | |
| Unused JavaScript | 476 KB | |
| Forced reflow | 43 ms, attributed to the hydration commit | |
| DOM size | 482 elements | |

The lab machine has a fast CPU and an unthrottled connection to the origin, which is why lab FCP is 0.6s. The field distribution is dominated by the same assets on ordinary networks and laptops, where 24 MB and 1 MB of script do not fit inside the first two seconds.

## 3. How a work page loaded in the original audit

1. The HTML is a static prerender (`x-nextjs-prerender: 1`, CDN `HIT`), 35 KB gzipped. TTFB is fine. Chrome users pay one extra navigation round trip on their first visit because Payload's `withPayload` injects `Critical-CH: Sec-CH-Prefers-Color-Scheme` on every route (see finding 8).
2. The head declares two font preloads, four stylesheets, one low-priority script preload and 30 async scripts. Stylesheets are the only render-blocking resources. The inline theme bootstrap sits after the stylesheets and sets `data-theme` before the body parses, which releases the `html { opacity: 0 }` rule (finding 9).
3. While the body parses, 10 `<video poster>` images are requested at about 150 ms (Medium and Low priority, cross-origin, no preconnect). The 10 `<video autoplay>` elements start their media fetches at about 340 ms. There is no gating: a video eight screens down loads at the same time as the hero.
4. Hydration begins once the script graph lands. Dozens of client components mount, including Lenis on the tempus clock, the custom cursor, the consent manager, Sentry with Replay, the PostHog provider, the takeover menu with its Ask composer, and about 25 reveal shells with 70 `data-reveal` targets. The reveal shells run `getBoundingClientRect` per target inside layout effects, which is the forced reflow Lighthouse attributes to the commit.
5. At 600 to 850 ms the router prefetches every link in the still-hidden menu: 80 fetches. Sentry posts its session and pageload envelopes; the admin bar calls `/api/users/me`.
6. The hero video paints its first frame once enough of its 1.78 MB has arrived through a pipe shared with nine other videos, ten posters and a megabyte of script. In the lab that is 2.1 s with two thirds of it render delay. In the field it is 4.9 s.

The route itself is in good shape: static params, one cached slug query shared by metadata and page, tag-based revalidation, related work resolved at build. Nothing here needs to move to the server; the problem is entirely on the client side of the wire.

## 4. Findings, ranked

Historical evidence and recommendations from the original audit, with some dated follow-up notes. These are not all outstanding tasks. In particular, video gating, default image quality/sizes/CDN handling, closed-menu prefetch, AdminBar gating, and analytics loading have newer implementations recorded in section 0.

Severity reflects impact on FCP and LCP for a first-time visitor on an ordinary connection.

### P0-1. Every video autoplays and downloads at page load

Evidence
- `src/components/Media/VideoMedia/index.tsx`: `autoPlay` defaults to `true`, `preload="metadata"`, `loop`, `muted`, `playsInline`. No IntersectionObserver, no deferred `src`.
- The only viewport-gated playback in the codebase is the Carousel (`src/blocks/Carousel/playback.ts`, `autoPlay={false}`). Full media, media content split, image pair, split offset, showcase grid, hero and featured work all take the default.
- Vault: 10 videos, 21.6 MB, all requested at ~340 ms with Low priority; the largest (`vault-worker-walking.mp4`) is 4.2 MB for a 12 s loop. Arturo: 9 videos, 12.4 MB.
- Lighthouse total byte weight 23.5 MB; the top ten payloads are all video.

Why it hurts
- `autoplay` overrides `preload="metadata"`: a muted autoplay video needs frames, so the browser fetches media data immediately for every element in the DOM, in viewport or not. Ten concurrent media streams share bandwidth with the CSS, fonts, scripts and the LCP poster. This is the single biggest reason FCP and LCP are both near five seconds.
- Ten simultaneous H.264 decodes also compete for the GPU and main thread during hydration, and on laptops on battery they throttle the frame rate the reveal animations depend on.

Recommendation
- Treat video like images: render only the poster at load, attach the video source when the element is within one to two viewports of the fold, and play or pause on visibility. The Carousel playback module already encodes the right pattern (observer-driven `play()`/`pause()`); promote it into `VideoMedia` so every block inherits it.
- Use `preload="none"` on non-hero videos so nothing is fetched until the source is attached. Keep the hero eager, but see P1-4 for how to make it the priority.
- Cap concurrency: at most one or two videos fetching at any time, in document order. A tiny queue in the shared video hook is enough.
- Encoding budget for inline loops: 720p for anything that is not the hero, target 0.8 to 1.2 Mbps, 4 to 6 s loops, and offer an AV1 or HEVC `<source>` ahead of the H.264 fallback. That alone roughly halves the Vault page even before gating. The MP4s are already faststart (`moov` before `mdat`), so first frames can paint early once bandwidth is not contended.
- Editorial budget: a page-level guideline of no more than three or four looping videos per case study, with stills elsewhere. The Vault page is a media showcase and will still feel like one with half the loops.

### P0-2. One megabyte of gzipped JavaScript on every page, most of it inert on a work page

Evidence (production chunks referenced by the Vault HTML, modern browsers, polyfill excluded)

| Chunk | Raw KB | Gz KB | Contents |
|---|---|---|---|
| 3x1lphhyai9z0 | 393 | 125 | PostHog SDK, c15t consent manager, Sentry client glue, lenis and tempus, WebGPU renderer glue, R3F Canvas, Speed Insights |
| 2-pe5ewl8kugb | 367 | 97 | three.js core (geometries, materials, GLSL) |
| 3tsqfe4og-j9v | 354 | 83 | three.js `WebGLRenderer` and shader program code |
| 3n927jq_pdzjo | 350 | 81 | zod (v4 core, 482 `_zod` references) |
| 2t2zy8n6pm7mg | 345 | 108 | `@sentry/nextjs` browser SDK with tracing |
| 2c5_84k7l57y6 | 199 | 63 | react-dom |
| 3qe-8i5yuxdf5 | 159 | 39 | AI SDK (`ai`, `@ai-sdk/react`) with 147 zod schemas |
| 2iv90_t3hl2t0 | 159 | 51 | `@react-three/fiber`, drei, zustand |
| 38w3jqsly7gi7 | 138 | 38 | Next.js app router runtime |
| 05qxh2zy6bw7h | 113 | 37 | GSAP core |
| 0k1113q3ac6oi, 1-l1ucx24wy-q | 147 | 57 | ScrollTrigger, lenis react bindings, radix, pinned shells |
| 0o1d1cj5imay0 | 55 | 19 | Sentry Replay bootstrap (plus a 100 KB compression worker loaded as a blob) |
| 17 smaller chunks | 664 | 192 | Next runtime, radix and floating-ui, tailwind-merge, tabler icons, lexical renderer, cursor and scramble text, page code |
| Total | 3,392 | 990 | |

Lighthouse reports 476 KB of that as unused on a fully loaded work page, and the biggest unused entries are the three.js, PostHog, zod, Sentry and R3F chunks.

Root causes
- `src/lib/webgl/components/global-canvas/index.tsx` exports `LazyGlobalCanvas = dynamic(() => Promise.resolve({ default: GlobalCanvas }), { ssr: false })`. The module statically imports `@react-three/fiber`, `@react-three/drei`, the renderer factory and the store, so `Promise.resolve` of an already-imported component is not a code split. The root layout mounts it on every page. The canvas only activates behind `ImmersiveShell webgl`. Today that is the `/demo/immersive` playground and the `HighImpactHero` (`src/heros/HighImpact/index.tsx`), which tunnels `WebGlBackdropScene` (the original spinning torus knot) into the persistent canvas. The CMS still has that hero type live on all five expertise pages and three of the four audience pages, which is why `/expertise/[slug]` is the worst route on the site (RES 32). On a work page the canvas renders `null` after downloading and parsing about 1 MB raw of three.js.
- `src/Footer/Closing/FooterClosing.tsx` renders `ClosingLightLeak`, which statically imports `LightLeak` from `@/features/immersive`. That file imports `@react-three/fiber` and `three` and mounts its own `<Canvas>` (a second WebGL context) when the closing band is uncovered. It is on every page that renders the closing band, which is every work page.
- `src/Header/Component.client.tsx` statically imports `TakeoverMenu`, which imports `MenuAsk`, which imports `useAskChat` (`@ai-sdk/react`, `ai`). The current footer path is `FooterClosing` → `ClosingAsk` → `useAskChat`; the earlier AskWidget reference is obsolete for that surface. The historical size estimate was about 120 KB gzipped; no current bundle size was measured in this verification.
- `src/instrumentation-client.ts` registers `consoleLoggingIntegration` eagerly, with `enableLogs`. ~~It also registered `Sentry.replayIntegration()`, the heaviest Sentry integration.~~ Replay removed 2026-09-10, see section 0.
- ~~`src/providers/Analytics/PostHog.tsx` imports `posthog-js` statically. Initialization is correctly gated on consent, but the SDK bytes are not.~~ Fixed 2026-09-10, see section 0.
- The `@c15t/nextjs` consent manager is bundled with its full UI and its global stylesheet.

Recommendation
- Make the WebGL layer a real split: keep `GlobalCanvasRoot` in the layout as a thin client shell that only subscribes to `isActivated`, and dynamically import the R3F canvas module (and drei) when activation happens. The same applies to `LightLeak` and the scroll gallery: import the effect module inside the intersection or `onComplete` callback that already gates when they mount. Target: no `three` bytes on a page that never activates a canvas.
- Split the Ask composer out of the header and footer bundles: render a static placeholder in the menu and closing card, and load the chat module on first intent (menu open, composer focus). The existing `warmMedia` intent hook on the menu button is the right trigger. This also removes zod from the page.
- ~~Lazy-load Sentry Replay after `init`.~~ Removed instead on 2026-09-10; replay lives in PostHog behind consent. Still open: drop console logging in production, and consider a lower `tracesSampleRate`. Keep error capture eager.
- Dynamically import `posthog-js` inside the consent effect, so the SDK downloads only when measurement is granted.
- After the four items above, the remaining floor is react-dom, the Next runtime, GSAP and ScrollTrigger, lenis, radix, and page code: roughly 350 to 400 KB gzipped. That is still generous for a portfolio; a later pass can look at whether GSAP core plus ScrollTrigger and Lenis are both needed on pages without pinned shells.
- Guardrail: add a bundle size check to CI (`next build` output or a size-limit action) with a per-route budget so the split does not regress.

### P0-3. Eighty route prefetches and other load-time noise inside the LCP window

Evidence
- Lighthouse recorded 84 `Fetch` requests, 80 of them `?_rsc=` prefetches: `/contact`, `/about-us`, `/insights`, `/works`, three sibling case studies, four `/who-we-help/*`, five `/expertise/*`, `/demo/immersive`, `/`, each fetched four times (segment prefetching), starting at ~600 ms.
- The closed takeover menu (`src/Header/Menu/index.tsx`, `id="site-menu"`) is `invisible fixed inset-0 opacity-0 pointer-events-none`. It is still laid out and covers the viewport, so every `next/link` inside it intersects and is prefetched. No link in the codebase sets `prefetch={false}` except an admin cell.
- Additional load-time requests: three Sentry envelopes to `/monitoring` at ~500 ms, `/api/users/me` from the Payload admin bar for every anonymous visitor, and the Speed Insights script.

Why it hurts
- 80 requests and 270 KB of RSC payload, plus the function invocations behind cache misses, land exactly when the hero video and posters need the bandwidth. On HTTP/2 the browser multiplexes all of it, so the LCP resource slows in proportion.
- Prefetching a sibling case study also pulls its flight payload with its serialized media docs (P1-6), which is the same waste multiplied.

Recommendation
- Mark menu links `prefetch={false}` while the menu is closed and prefetch on intent instead: on the menu button hover or focus (the same signal `warmMedia` uses), or when the menu opens. Router-level `prefetch()` calls on hover inside the open menu keep navigations instant without the load-time cost.
- Take the closed overlay out of layout and observation: `display: none` or `hidden` until the open animation needs it, or `content-visibility: hidden` plus `inert`. The open timeline already measures geometry when it runs, so it can re-show the overlay first.
- Render the admin bar only when a Payload session cookie is present (a server-side cookie check in the layout), so anonymous visitors never call `/api/users/me`.
- Defer Sentry's session and transaction flush to idle; it is a small win but it is inside the window.

### P1-4. The LCP element is a video with no priority, and hero images lost their priority hint

Evidence
- On video-hero pages the LCP element is the hero `<video>`; Lighthouse's LCP checklist reports "fetchpriority=high should be applied: false". The poster is fetched at High priority only because Chrome infers it, and the media host `media.suits-sandals.com` has no `preconnect`.
- On image-hero pages the hero `<img>` rendered by `Media priority` carries no `fetchpriority` attribute, and neither does the `<link rel="preload" as="image">` Next emits. In the installed Next 16, `priority` only produces the preload; `fetchPriority` is a separate prop (`node_modules/next/dist/shared/lib/get-img-props.js`).
- Hero images on the centered-media layout sit in a `lg:w-4/9` column but inherit the default `sizes` (see P1-5), so the preload and the `<img>` request the full-viewport candidate.
- The LCP phase breakdown puts 67% of LCP time in render delay: the resource arrived, the first frame did not paint until the media pipeline caught up.

Recommendation
- Add `<link rel="preconnect">` for the media host in the root layout head, and a `<link rel="preload" as="image" fetchpriority="high">` for the hero poster when the hero is a video. Consider rendering the poster through `next/image` as an absolutely positioned layer under the video so it gets the same responsive candidates and format negotiation as every other image, and make that image the LCP candidate on purpose.
- Pass `fetchPriority="high"` through `Media` for the hero on both layouts, and thread it into the preload.
- Start the hero video only after the poster has painted (a `requestIdleCallback` or the `load` event), with `preload="auto"` reserved for the hero alone. The first frame of the encode should match the poster so the swap is invisible.
- Give the hero its own `sizes` that matches the column it occupies (`(min-width: 1024px) 45vw, 100vw` for centered media, `100vw` for landscape).

### P1-5. Image pipeline: quality 100, an invalid default `sizes`, and posters that bypass optimization

Evidence
- `next.config.ts` sets `images.qualities: [100]` and `src/components/Media/ImageMedia/index.tsx` sets `quality={100}` on every image. Measured on the Vault page, the largest optimized image is a 196 KB WebP at q100 (the source is 1920 px wide, so 3840 and 1920 candidates return the same bytes).
- The default `sizes` string is built as `(max-width: 1920px) 3840w, (max-width: 1536px) 3072w, ...`. Width descriptors like `3840w` are not valid lengths in a `sizes` attribute, so browsers discard every entry and fall back to `100vw`. Production markup confirms the string ships verbatim, including into `imagesizes` on hero preloads. Blocks that pass no `size` (MediaBlock, Carousel, MediaShowcaseGrid, Testimonial, and the centered-media hero) all inherit it.
- Video posters use the raw R2 URL (`getVideoPosterUrl`), so they are served as the original JPEG. Four Vault posters weigh 143 to 185 KB each; Lighthouse estimates 365 KB of savings from modern formats on posters alone.
- `placeholder="blur"` uses one shared 1.5 KB base64 PNG. It is inlined once per image in the HTML and again in the flight payload, wrapped in an SVG blur filter that Lighthouse counts under offscreen images (13 KB).
- Every image URL goes through `/api/media/file/...`, so an optimizer cache miss invokes the Payload REST handler (a Vercel function) which streams the object from R2, then the optimizer resizes it. The `remotePatterns` already allow `media.suits-sandals.com`.

Recommendation
- Quality: 75 to 82 for photography and UI mockups, with `qualities` opened to something like `[75, 90]` so art-directed exceptions remain possible. Expect 40 to 60% smaller images at no visible cost on retina.
- Fix the default `sizes` to a valid value (`100vw`) and give every block that renders media a real `sizes` that matches its column. Cap `deviceSizes` at 2560; a 3840 candidate only exists for 4K monitors at 1x.
- Route posters through `next/image` (or generate WebP and AVIF posters in the `generateVideoPoster` hook at 1280 px, quality 70) so they are 15 to 30 KB instead of 150 KB.
- Replace the shared blur PNG with either nothing (the aspect-ratio boxes already prevent layout shift) or a per-asset placeholder derived at upload time (a 16 px WebP, a few hundred bytes). Emitting the same 1.5 KB blob twenty times per page is pure overhead.
- Let the optimizer fetch from the CDN directly: configure the storage plugin so document `url` points at the R2 custom domain, keeping the `usageStatus` gate at the document level. This removes a function hop from every optimizer miss. The trade-off is that file bytes become fetchable by anyone who knows the object key, which is already true for videos today.

### P1-6. The RSC flight payload carries 30 full media documents and site chrome data

Evidence
- 142 KB of inline `self.__next_f.push` data in a 252 KB document; 30 serialized media documents (each with seven size variants, `updatedAt`, credit, purpose, channel arrays). `Media`, `ImageMedia` and `VideoMedia` are client components that receive the whole Payload `resource`, so the server must serialize it.
- `FeaturedWorkList.client.tsx` receives `WorkEntry[]` with a full `media` document per entry; `HeaderClient` receives the header global plus `menuContent`; `FooterClosing` is a server component but the ask card and light leak are client.
- The client-navigation flight for the same page is 17.7 KB gzipped (128 KB raw), so soft navigations are fine; the cost is paid on hard loads, in HTML bytes and in hydration parse time.

Recommendation
- Make the image path a server component: `next/image` renders fine in RSC, so `ImageMedia` only needs a client wrapper when it uses `onLoad` or `onClick`. Pass a slim view model to client media (`src`, `width`, `height`, `alt`, `sizes`, `poster`), not the Payload document.
- Do the same for `WorkEntry.media` and the menu's `MenuMedia` (already slim, keep it that way).
- With the blur placeholder removed (P1-5) and media docs slimmed, the document should drop by roughly 100 KB raw and the flight by half.

### P1-7. Hydration and reveal-shell cost on the main thread

Evidence
- 166 client component files; a work page mounts about 25 `ScrollReveal` or `RevealSection` shells over 70 `data-reveal` targets, plus the pinned featured-work roll, the work intro choreography, the cursor overlay, Lenis on tempus and the takeover menu.
- `src/shared/ui/scroll-reveal/scroll-reveal.tsx` and `src/sections/WorkIntro/Section.client.tsx` run inside `useGSAP` (a layout effect). Each shell calls `gsap.set` (style writes) and `uppermostRevealTarget` (a `getBoundingClientRect` per target) in the same commit. Lighthouse attributes 43 ms of forced reflow to the hydration commit on a fast machine; on a mid-range laptop that is several hundred milliseconds of layout thrash right after the page appears.
- `HeaderClient` toggles `data-scrolled` on scroll, which changes `--header-bar-height` and therefore the page frame's `pt-(--header-height)`, so the first wheel tick relayouts the whole page while ten videos are decoding.
- `CustomCursorProvider` re-scans targets every 250 ms while engaged and writes CSS custom properties on hover; it is fine-pointer only and cheap, but it is one more client tree in the critical hydration path.

Recommendation
- Read before write: collect the geometry for all targets in a shell first, then apply the initial `gsap.set`. Better, drop the geometry sort altogether; document order is the order targets enter the viewport in every layout on the site, and `revealStaggerSlots` already works from document order.
- Gate all shells through one shared `IntersectionObserver` instance (a small subscription registry) instead of one observer per track per shell.
- Mark below-fold bands `content-visibility: auto` with a `contain-intrinsic-size` from the band spacing tokens, so the browser skips layout and paint for offscreen blocks until they approach.
- Have the header bar shrink with a transform or by animating an inner element, not by changing the variable that the page frame pads against. If the variable must change, do it after the first scroll settles, not on the first pixel.
- Defer non-critical providers (cursor overlay, PostHog, consent banner mount) to after first paint with `requestIdleCallback` or a `startTransition` on mount.

### P1-8. `Critical-CH` restart and `Vary` on every page from `withPayload`

Evidence
- `node_modules/@payloadcms/next/dist/withPayload/withPayload.js` adds `Accept-CH`, `Critical-CH: Sec-CH-Prefers-Color-Scheme` and `Vary: Sec-CH-Prefers-Color-Scheme` to `/:path*`. The production work page response carries `accept-ch` and `critical-ch`.

Why it hurts
- Chrome handles `Critical-CH` by aborting the first navigation response of a session and re-requesting with the hint, so a first visit in Chrome (and any visit after the client-hint cache is cleared) pays a second HTML round trip before anything can paint. TTFB P75 already includes it. The `Vary` also splits CDN cache entries by colour scheme for prerendered HTML.
- The frontend never uses the hint; theme is resolved client-side by `InitTheme`. Only `/admin` benefits.

Recommendation
- Override `headers()` after `withPayload` so the client-hint headers apply only to `/admin/:path*` (and the API if Payload needs it there), and drop `Vary: Sec-CH-Prefers-Color-Scheme` from frontend routes.

### P1-9. `html { opacity: 0 }` until the theme script runs

Evidence
- `src/app/(frontend)/globals.css` ends with `html { opacity: 0 }` and `html[data-theme=dark], html[data-theme=light] { opacity: initial }`. The inline `theme-script` is in the head after the stylesheets and sets the attribute synchronously, so in the normal path this costs nothing.
- The script has no `try`/`catch`. `localStorage.getItem` throws a `SecurityError` when storage is blocked (privacy modes, some embedded webviews, cookies disabled). In that path `data-theme` is only set by `ThemeProvider`'s effect after hydration, so the page is blank until a megabyte of script has downloaded, parsed and hydrated. Any future script error in that bootstrap has the same effect.

Recommendation
- Wrap the storage read, and set a fallback attribute in a `finally` so paint can never depend on the script succeeding. Longer term, avoid hiding the document at all: with the attribute set before body parse there is no flash to hide, and `color-scheme` plus token variables handle the dark and light first paint.

### P2-10. CSS: 296 KB raw in one file, mostly utilities the page never uses

Evidence
- The main stylesheet is 296 KB raw (45 KB gzipped); 232 KB of it is the Tailwind utilities layer. Tailwind v4 scans every source file by default, so classes used only in stories, demo widgets, demo kit, admin components and scripts are compiled into the production CSS. `@c15t/nextjs/styles.css` is imported globally (802 references) for a banner that is a few hundred lines of CSS.
- Lighthouse marks the stylesheet as the longest render-blocking chain (the only one), at 80 ms estimated savings.

Recommendation
- Add `@source not` rules for stories, `demo-kit`, `widgets/*-demo`, `scripts` and admin-only components, and scope the consent stylesheet to the consent components (or load it with the banner). A 45 KB gzipped stylesheet is not the main problem, but it is on the critical path and halving it is cheap.

### P2-11. Fonts

Both variable fonts are preloaded, immutable, and `swap`. Two things are worth a look: the mono preload (71 KB) competes with the LCP for a face used only on small labels, and there is no subsetting beyond what `next/font` did. Consider preloading only the sans face and letting mono load on use, and subsetting to Latin.

### P2-12. Closing band effects on every page

`ClosingLightLeak` mounts an R3F `<Canvas>` (its own WebGL context, a 15 KB fragment shader) when the closing band uncovers, and `ClosingMedia` scrubs a parallax with ScrollTrigger. On integrated GPUs, a second context while several 1080p videos are decoding is where frame drops come from at the bottom of the page. Consider skipping the leak when the page has more than a few videos, when `navigator.connection.saveData` is set, or on `isLowPower` devices (the helper already exists in `gpu-detection`).

### P2-13. Sentry and analytics at load

Sentry sends the session and the pageload transaction at ~500 ms (three `/monitoring` requests), and the Speed Insights script is a separate request. ~~Replay records at 10% of sessions in production (a second, 100 KB worker script).~~ Removed 2026-09-10. PostHog is correctly gated on consent; GA is gone. Lower the trace sample and flush on idle.

### Observations that are fine, and should stay that way

- Work pages are statically prerendered with tag revalidation; TTFB is 0.45s at P75 and the document is 35 KB gzipped.
- All scripts are `async`; there is no render-blocking JavaScript.
- Fonts are self-hosted, preloaded, `swap`.
- All media has explicit aspect ratios; CLS is 0.01.
- R2 media is edge cached (`cf-cache-status: HIT`, one-year `max-age`); MP4s are faststart.
- The takeover menu warms hover media on intent, not at load. That pattern is the model for everything above.
- The DOM is small (482 elements) and INP is 56 ms; runtime interaction is not a problem.
- The `BAILOUT_TO_CLIENT_SIDE_RENDERING` marker at the top of `<body>` is the Speed Insights component's own Suspense boundary (it reads search params); it renders nothing on the server and is harmless.

## 5. Perceived performance for a creative portfolio

September 13 scope: retain the intent of these original suggestions, but apply the source-specific loading and fallback contracts in the Streak Field plan. Editorial removal of videos, hero-type changes, and a full media-encoding project are not prerequisites for the shader feature. Measure both cold loading and warm navigation; sustained animation and repeated route changes matter beyond the Lighthouse score.

Real metrics will improve with the fixes above. These are the choices that make a heavy, media-led case study feel fast while it is still loading.

1. **Poster first, motion second.** The hero should paint a still within the first few hundred milliseconds and start moving when the video is ready. Encode each loop so its first frame equals the poster, and start playback on `canplay` with a short crossfade or none at all. The reader sees a finished screen, then it starts to breathe. Today the reader sees the poster only when bandwidth allows and the video pops in whenever it arrives.
2. **Stagger media by scroll, not by load.** With observer-driven sources, each loop starts fetching about two screens before it is reached and plays the moment it enters. Reading pace on a case study is slow enough that a 1 MB loop always arrives before the eye does, and the page never feels like it is waiting on something the reader cannot see.
3. **Keep server HTML visible before JavaScript.** The GSAP reveal shells already do this (initial state is applied only when the timeline builds). The CSS `.reveal-section` rule hides MediaBlock and Carousel blocks until hydration and intersection; on a page where one of those sits near the fold, that is the hero's neighbour blinking in late. Move that rule behind a `data-js` flag or `@starting-style` so no server-rendered content is ever hidden by CSS alone.
4. **Respect the reveal rhythm under load.** Reveals that fire while the main thread is busy hydrating look janky, and a reveal that fires before its media has loaded wipes onto a blank frame. Gate a block's media wipe on the media's `load` or `canplay` event as well as on intersection, and delay the first shell's timeline until after the LCP paint.
5. **Use the transition budget for prefetch.** On a client navigation from `/works`, the `work-open` morph takes about a second. That second is when the destination hero poster should be fetched (on hover intent the way `warmMedia` does it), and when nothing else on the destination should be fetching. Wire non-hero video loading to the `ScrollReveal` `onComplete` or the transition end so the morph runs on an idle network.
6. **Set a per-page media budget and show it to editors.** A case study should carry at most three or four loops, the hero no more than about 1.5 MB, inline loops well under 1 MB each. A small admin note on the Media collection (size, duration, bitrate after upload) makes the budget visible where the decision is made.
7. **Sequence the closing band.** The curtain effect, the parallax and the light leak are the last things on the page; they should be the last things to load. Import the leak module when the gate marker enters the extended root, not with the page bundle.
8. **Measure cold load and warm navigation separately.** Cold captures expose first-visit transfer costs. Warm route changes, menu/Ask interaction, and sustained shader activity need their own checks; the original load audit does not establish their current performance.

## 6. Execution order and expected impact

Current sequence, revised 2026-09-13. Phase numbers in older dated entries refer to the original audit sequence. The feature phases below refer to [streak-field-media-plan.md](streak-field-media-plan.md#implementation-phases).

### Delivery sequence

| Stage | Scope and dependency | Required outcome |
| --- | --- | --- |
| A. Baseline and shared contracts | Feature Phase 0. Pin source commit, content/fixtures, browser/backend, and device. Record media mode, shader poster mode, and live shader mode separately. | A baseline and a bounded runtime experiment. No open-ended dependency on another renderer project. |
| B. First paint and scene hardening | Feature Phase 1. Optimized posters, real lazy import, first-frame/error handling, pause/visibility, and production-safe shader settings. | A hardcoded live field on qualified hardware, a complete poster fallback, and unchanged loading for media mode. |
| C. Runtime ownership decision | Feature Phase 2. Compare shared rendering at the existing root with one admitted local Streak canvas. Include clipping, route lifecycle, existing effects, resource cleanup, and cold-load cost. | Choose the measured viable path. A failed shared-canvas experiment proceeds with the bounded local path where qualified; it does not trigger a whole-site graphics rewrite. |
| D. CMS pilot | Feature Phase 3. Home hero, Pages High/Medium impact heroes, the Pages menu preview, and Stacked/fullMedia block; both Work Page hero layouts and the Work Page menu preview join as the scoped-media constraint case. Integrate validation, queries, posters, and existing handoffs. | Editors can select and publish Streak Field, vary presets/seed/allowed controls, and see live qualified hero/block visuals. Menu and repeated previews may use posters. |
| E. Supported surface rollout | Feature Phase 4. Extend the same contract to remaining approved heroes, preview choices, and composition blocks. | Explicit live/poster/unsupported matrix, backward-compatible media, complete schema coverage, and passing performance/navigation checks. |
| F. Optional enhancements | Feature Phase 5 and backend experiments. Exact still generation, live settled-menu previews, compatible morphs, TSL/WebGPU or vgpu. | Each enhancement earns its own visual and performance case. None blocks stages D or E. |

Stages B and C include the WebGL portion of P0-2. Keep a lightweight registration/loading owner at the persistent root and import the heavy renderer only when eligible. Preserve the feature's consumer contract if ownership changes. Handle remaining eager imports from retained effects as focused loading/coexistence changes, not a separate redesign of those effects.

If a gate fails, record the failing device/placement, cause, remedy, and next check in the feature plan. Reduce quality or use posters for that case. If no qualified device can run the pilot, keep the feature open; declaring every surface poster-only would miss the product goal. Do not lower visual quality beyond an approved look merely to reach a frame-rate number.

### Independent performance work

These items can ship before or during the feature sequence as separate, measurable changes. They are not an all-or-nothing prerequisite. Coordinate overlapping files, especially Media and TakeoverMenu, through their existing contracts.

| Item | Keep doing | Boundary with Streak Field |
| --- | --- | --- |
| Ask composer loading | Split chat dependencies on actual intent, preserve the static shell and first keystroke. | Keep preview-window geometry, cover/resize timing, Escape/close behavior, and explicit preview-versus-chat state stable. GPU work pauses while Ask owns the slot. |
| Image pipeline | Real responsive sizes and optimized posters through the current CDN/Next Image path. | Streak posters reuse this path. Preserve actual hero priority and dimensions; do not create a second poster-delivery system. |
| Sentry and analytics | Finish production logging/sampling and field-data hygiene, preserving error capture and consent behavior. Verify any package update against the installed version at implementation time. | Keep canvas recording off. Do not reintroduce Sentry Replay from the historical checklist. Report shader failures through existing monitoring without per-frame event traffic. |
| Client hints and measurement | Scope unnecessary public hints; exclude draft/internal field traffic using the supported API. | Account for `withPayload` appending its catch-all header rule after user configuration. Verify final public/admin headers; an additional admin-only rule alone does not remove the public rule. |
| CI bundle checks | Establish budgets from comparable production output, then tighten after each measured improvement. | Record initial application bytes and deferred graphics bytes separately. Do not treat permitted live shader bytes as a regression merely because the original audit assumed an inert work page. |
| Video encoding and media payloads | Optimize retained video surfaces and excessive serialized data when measurements justify it. | Do not require re-encoding all media or removing authored loops before the shader pilot. Shader mode must avoid fetching the replaced video at all. |

Keep the benefits already recorded in section 0: CDN image resolution, video gating, hero poster loading, disabled menu auto-prefetch, draft-only AdminBar, and consent-gated analytics. Revalidate them; do not count them again as future savings.

### Performance gates and scope limits

The numeric gates and device policies live once in the feature plan's [acceptance section](streak-field-media-plan.md#acceptance-and-measurement) and [runtime budgets](streak-field-media-plan.md#budgets-and-preparation). This roadmap schedules those checks rather than creating a competing set of thresholds.

- First paint and navigation must work from the poster without waiting for GPU initialization. Qualified live visuals must still become visible after their intro/transition settles; hiding them indefinitely is not an optimization.
- No Streak runtime fetch on ineligible/poster-only paths. No Three chunk on a route that never activates any canvas remains the loading-boundary target. A qualified shader page may load a measured deferred graphics bundle; report both initial and total-session bytes.
- One live Streak Field is the initial ceiling. Count retained lenses, light leaks, galleries, canvases, and simulation passes in the same report. Hidden, offscreen, paused, and occluded fields perform no draws or simulation.
- Match preset, seed, slot dimensions, density, DPR, and complexity when comparing renderers. Compare appearance as well as frame behavior. Attribute gains from swapping a video to a shader separately from renderer optimization.
- Keep original media and navigation behavior. Defaulting every visitor to a still, retiring effects, changing hero layouts, or removing imagery to improve a score is not feature completion.
- Shared ownership is preferred only where proven. A mandatory TSL port, generic shader registry, new router, universal FBO transition system, and migration of every existing effect are outside the delivery prerequisite.

The old forecasts of 600 KB savings, 350–400 KB total script, fixed effort, and guaranteed RES improvement are historical estimates, not release promises. Measure the post-change result, preserve the qualified live feature, and investigate feature-attributable regressions against the agreed baseline.

## 7. Verification

Use [performance-measurement.md](performance-measurement.md), including its Streak Field procedure. The feature plan is authoritative for acceptance thresholds. Store results under `docs/perf/<label>/` and record the source/content/backend configuration with every run. This revision contains no new benchmark results.

For each stage:

1. Run comparable production-build preview captures on Home, Vault, and Interchecks (the image-hero control since 2026-09-16; Adacore is a draft). Keep the existing media configuration as a control and add separately labeled shader fixtures/configurations. Run cold-cache Lighthouse desktop/mobile medians for load cost; do not use a score alone to judge GPU quality.
2. Inspect first-paint poster requests and sizing, replaced-video requests, initial versus deferred chunks, first live frame, and actual GPU admission. A software-renderer run passing through posters proves fallback, not live performance.
3. Run real-hardware animation and lifecycle checks from the feature plan, including hidden tab, menu/Ask occlusion, pause, repeated navigation, context loss, and resource plateaus. Record the selected backend and visual quality tier.
4. Verify current Media tests, Storybook fixtures, reduced motion, both hero layouts, nested Stacked blocks, and cold-cache menu/IndustryWork handoffs. Preserve existing motion constants unless a specific bug requires a reviewed change.
5. On a production rollout, compare public field data after a sufficient collection window on the same domain. Exclude draft/internal traffic. Observe the actual LCP element; a shader poster can be a valid replacement for the earlier video candidate.

A live pilot passes both halves: editors can author the intended feature and the qualified render path meets its performance/behavior gates. Poster-only mode can pass fallback checks and safely precede live rollout, but cannot close the live milestone. Unrelated performance debt gets a separate follow-up; defects in first paint, navigation, resource safety, or the feature's own budget keep the affected live rollout gated.

## 8. Scope boundaries for implementation

### Existing effects and the old spinning backdrop

The earlier source review found `WebGlBackdropScene` in HighImpact heroes and the demo, with LightLeak and several other effects owning separate canvases. That ownership evidence is useful when testing coexistence. The historical CMS counts are not a current content inventory.

Do not switch published hero types or remove the spinning backdrop as a performance-only prerequisite. A real loading boundary can defer the renderer even when some routes still legitimately activate it. If a page adopts Streak Field, replace its visual deliberately through the supported CMS choice and retain the existing media fallback data. Changes to other authored visuals need their own product rationale.

Retain current effects unless the selected Streak runtime requires a focused compatibility, loading, pause, or disposal change. Preserve the demo's ability to exercise those effects and avoid dead imports from retired integrations. No blanket prohibition prevents necessary work in `src/lib/webgl`, `src/features/immersive`, or the tunnel within this feature sequence.

### Preserve interaction contracts

- Keep HeroBand intro gating, measurable media/poster targets, real DOM poster sources for cloning, and current menu/hero handoff cleanup.
- Keep Ask's preview geometry, cover and resize sequence, keyboard behavior, and first-input handling. Shader admission follows explicit state and settlement, not an arbitrary timeout.
- Keep Section/RevealSection, BlockGrid, `bare`, and current pinned/reveal masks. Test a live placement before adding it to the support matrix; posters are appropriate during transformed transitions.
- Preserve the normal video source/playback contracts and original uploads when a visual switches modes.
- Do not warm every graphics module on idle. Prepare only eligible near-visible content or one likely destination, according to the feature's bounded preparation policy.

### Work that stays separate

Header geometry redesign, wholesale reveal/scroll replacement, CSS pruning, blanket image-quality reductions, and an editorial reduction of case-study media remain separate work. They can proceed when independently justified, but do not enter the Streak critical path merely because an old audit listed them.

Schema implementation follows the feature plan and repository migration rules. This roadmap revision changes no schema and requires no migration.

## 9. Mobile score program (2026-09-16)

Goal: PageSpeed Insights mobile on `/` from 41 into the 80s, and every work page above 75, with no change to what a desktop visitor with a GPU sees and no removal of authored media. The plan is built from the [2026-09-16 review](#2026-09-16-review-fresh-psi-lab-and-field-read), a survey of 22 comparable studio sites (section 9.3), and the technique research in section 9.4. It supersedes the September 12 `perf/tier1-non-webgl` list; items from that list that are still open reappear here with the same P-numbers.

### 9.1 Why the mobile score is 41

Mobile already skips every WebGL surface (the `(any-pointer: coarse) and (hover: none)` gate in `use-device-detection`, and `PLACEMENT_LIMITS` for Streak Field). The score is decided by three loading facts and one environment fact:

1. **Lighthouse charges the hero mp4 and the script graph to LCP.** The poster paints at ~430 ms unthrottled, but Lighthouse's simulation (Lantern) estimates LCP from every request that started before that paint: 1.0 MB gz of script, the 956 KB hero mp4 (Low priority, started at 210 ms because the priority hero has `preload="auto"` and an inline `<source>`), fonts, CSS and posters. On the simulated slow 4G link that is 9 s. The same reasoning inflates Speed Index. In the field the mp4 competes with the same bytes on a real slow connection, so the direction of the fix is right even though the field LCP is the poster.
2. **The Critical-CH restart.** Chrome aborts the first navigation and re-requests with the hint; Lighthouse reports it as a same-URL redirect worth 780 ms on mobile. Every first visit in Chrome pays it.
3. **Too much starts in the LCP window.** 20 route prefetches from chrome links, the second-section Vault mp4 (1.7 MB), a 51 KB render-blocking stylesheet (Lighthouse: 300 ms to 1 s), and the Sentry init chunk.
4. **Lightrider is slower than any local run.** PSI's TBT (1,970 ms mobile, 1,210 ms desktop) does not reproduce locally at 4x CPU with either a GPU or SwiftShader (260 ms), and drops to 20 ms at PSI's documented 1.2x multiplier. The gap is Lightrider's hardware. The tasks it stretches are real and reducible (hydration commit, Sentry init, a late 270 ms task in the React chunk), but the absolute TBT number will not match locally. Do not tune to it; tune the tasks.

### 9.2 Sequence

Each item names its evidence, the expected effect on the metric that moves the score, and the experience contract it must keep. Ship in order; measure with the runbook after each pair (labels `after-m1-m2`, `after-m3`, ...).

| # | Item | Evidence | Expected effect | Contract to keep |
|---|---|---|---|---|
| M1 | **Poster as the LCP element; hero mp4 after first paint.** Render the hero poster as a real `<img>` (next/image, `fetchPriority="high"`, `sizes` per layout) under the `<video>`, set the video to `preload="none"` with no `<source>` in the server HTML, and attach the source from a client effect after the poster's `load` event and one animation frame (or `requestIdleCallback` with a short timeout). Keep `autoplay muted loop playsinline` on the element so playback starts as soon as the source lands; the first frame of each encode already matches its poster. | Chromium: a video's LCP time is its poster paint or first presented frame, whichever is earlier; DebugBear and the aarontgrogg e-commerce write-up measured 1.55 → 1.2 s and 3.7 → 1.9 s with poster + high-priority preload (section 9.4, V1, V2). Our own run: observed LCP 430 ms vs 9.1 s simulated because the mp4 starts before the paint. | Lab mobile LCP 9 s → 2.5 to 3.5 s on `/` and Vault (the rest is script, M3). Speed Index down. Field: unchanged LCP element, less bandwidth contention on slow links. | The takeover menu clones `[data-hero-media] video` and reads `currentTime`; the clone must still find a `<video>` (it will, the element is always present; the source is what moves). HeroBand intro gating and the poster preload stay. Storybook `Components/Media` priority story asserts poster-first. |
| M2 | **Scope `Critical-CH`/`Accept-CH`/`Vary: Sec-CH-Prefers-Color-Scheme` to `/admin/:path*`** (P1-8). Wrap the composed config: call `withPayload`, then replace its `headers()` with one that maps the appended `/:path*` rule to `/admin/:path*` and drops the color-scheme `Vary` on public routes. Verify with `curl -sI` on `/` and `/admin`. | `withPayload.js` appends the catch-all after user headers; Lighthouse `redirects` 780 ms mobile; PSI "Had redirects". | FCP, LCP and Speed Index each drop by one mobile round trip (0.5 to 0.8 s) on first visits. Applies to every route. | Admin keeps the hint (it is the only consumer). Nothing else changes. |
| M3 | **Initial script diet**, target ≤ 500 KB gz on every public route, then ≤ 350 KB. Sub-items: **(a)** Ask composer split (P0-2): static shell in `TakeoverMenu` and `FooterClosing`, the chat module (`useAskChat`, `ai`, `@ai-sdk/react`, zod, 122 KB gz) behind `next/dynamic` on the menu button's `warmMedia` intent and on closing-input focus. **(b)** Per-effect import boundaries: `HeroBackground`, `ClosingLightLeak`, `IndustryWork`, `ScrollGallery`, `HighImpactHero` and `Menu/LiveVisual` import their effect through `next/dynamic` (or `lazy`) from the effect file, never the barrel, and only after the capability gate says the canvas is wanted, so a coarse-pointer device never requests three.js at all; stop re-exporting the demo `StreakField` from `@/features/immersive` (the demo imports `ui/streak-field` directly). Target: zero `three` bytes in the initial HTML of any route on mobile, and on desktop only once a lens is admitted. **(c)** Sentry for public traffic: drop `consoleLoggingIntegration` and `enableLogs` outside development, drop `browserTracingIntegration` (the tracing half of the 69 KB chunk) or set `tracesSampleRate` to 0.05, and initialise on idle after first paint (error capture before init is buffered by the SDK's `onerror` hook only if `Sentry.init` runs early; keep a tiny eager error listener if idle init is chosen). **(d)** Load the c15t banner UI (28 KB) after idle; the consent state read stays synchronous. **(e)** CI budget: fail the build when any route's initial gzipped script exceeds the budget from `next build` output (P0-2 guardrail). | Chunk inventory 2026-09-16: 955 KB gz initial on `/`; darkroom.engineering (same Lenis + GSAP + Next stack) ships 246 KB with no three.js in the initial graph; the fastest studio sites ship 6 to 58 KB to phones (section 9.3). Lantern includes every script started before LCP in the LCP estimate. | Lab mobile LCP another 1.5 to 3 s; TBT down in proportion to hydration and init work; unused-JS insight from 386 KB to under 100 KB. | Menu open and closing-input focus still land the first keystroke without a visible stall (dynamic import on intent, ~100 ms budget). Lens, leak and gallery appear exactly as today on GPUs; the only change is that their code downloads when admitted. Streak Field's own lazy runtime is unchanged. |
| M4 | **No non-hero video source before `load`.** `useViewportGate` starts observing after the window `load` event (or after the hero's first paint when M1 lands), keeps the two-screen `rootMargin` afterwards. On phones, the pinned Featured Work roll shows posters until the hero has played its first loop or the roll is reached, whichever first. | Home now fetches the 1.7 MB Vault mp4 at load on both form factors (`mediaKb` 796 → 2,695 mobile since 09-09); Mux and web.dev guidance: attach sources on intersection, skip on Data Saver (V3, V4). | Enormous-payload insight drops by 1.7 MB on `/`; no LCP contention from a video the reader has not reached. | Loops still start two screens ahead once the page has loaded; the roll's handoff reads the DOM video as today. |
| M5 | **Posters through the image pipeline** (P1-5): `VideoMedia` renders its poster through `next/image` (same `getCdnMediaUrl` source, one-year optimizer cache, AVIF/WebP) with real `sizes` per block; keep the raw `poster` attribute only as the fallback for the menu clone. Add real `sizes` on MediaBlock, Carousel, showcase grid, Testimonial and the centered-media hero. Remove the shared 1.5 KB blur SVG (aspect boxes already prevent shift). | PSI image-delivery insight: 113 KiB on `/` from two raw JPEG posters (90 KB and 32 KB); cred.club serves a 14.6 KB poster. | Image bytes on mobile down 100 to 300 KB per page; LCP resource smaller once M1 makes the poster the LCP. | Poster and first frame keep matching; menu clone keeps a real `<img>`/`poster` to copy. |
| M6 | **Render-blocking CSS.** Try `experimental.inlineCss` (Next 16, built for atomic CSS) on the frontend group and measure; if the RSC duplication costs more than it saves, fall back to Tailwind `@source not` for stories, demo-kit, widgets and admin components, and scope `@c15t/nextjs/styles.css` to the consent components (P2-10). | Lighthouse render-blocking insight: 51 KB stylesheet, 300 ms (local) to 1,010 ms (PSI mobile); the Color Tiles case used `inlineCss` as its last step to reach 97 (V5). | FCP and LCP 0.3 to 1 s on mobile. | No visual change. Returning visitors lose the cached stylesheet under `inlineCss`; decide on the measured trade. |
| M7 | **Prefetch on intent for chrome links** (P0-3 remainder): `prefetch={false}` on header, footer, index and legal links, `router.prefetch` on `pointerenter`/`focus`/`touchstart`, and one Speculation Rules `prerender` with `eagerness: moderate` for the primary CTA once measured. | 20 `?_rsc=` fetches at 470 to 660 ms on `/`; Next's prefetch guide recommends intent-based prefetch for footers and long lists (V6). | Fewer requests in the LCP window; small Speed Index gain; instant navigation kept. | Navigation must still feel instant: measure hover-to-click on desktop and tap latency on mobile before and after. |
| M8 | **Main-thread trims.** `content-visibility: auto` with `contain-intrinsic-size` from the band spacing tokens on below-fold Sections that are not pinned and hold no ScrollTrigger (P1-7); read-before-write in the reveal shells (collect geometry, then `gsap.set`); `scheduler.yield()` between the post-hydration init steps (cursor, consent, analytics); fix the 9 non-composited animations Lighthouse lists (testimonial `snap-recede`, `intro-copy` filter, `--scroll-fade-*` custom properties) by moving them to transform/opacity. | The CPU profile puts 65 to 80 percent of the largest hydration task (434 ms home, 262 ms interchecks at 4x) inside one GSAP core function called from React's commit via the reveal shells, beside Lenis scroll reads: the layout thrash P1-7 described, now measured; vercel.com uses `content-visibility` on five below-fold sections; web.dev measured 7x render savings (V7). | TBT down on Lightrider by the largest single share available; Speed Index down. | No pinned band or ScrollTrigger target inside a `content-visibility` subtree (measurements go wrong). Reveal timings unchanged. |
| M9 | **Mobile hero encode.** A portrait or cropped 720p rendition per hero at ≤ 400 KB (AV1 or VP9 WebM with H.264 fallback), chosen in the client effect from M1 by viewport width, not by a `<source media>` attribute (Chrome ignores `media` on video sources). Editors upload one file; a Media hook or the R2 pipeline derives the mobile rendition. | cred.club serves a 190 KB mobile hero; Mux's 720p cap and 400 to 800 KB mobile budget (V4); our hero is 956 KB and Vault's 1.7 MB on every phone. | Field LCP contention and total bytes on phones; lab Speed Index after M1. | Same first frame as the poster; desktop rendition untouched. |
| M10 | **Speed Insights hygiene** (section 7, unchanged): no `SpeedInsights` in draft mode; `beforeSend` drops team and admin traffic using the PostHog internal-traffic signal. Then read the field seven days after M1 to M3 land. | Field P75 currently mixes admin live-preview loads. | Clean field baseline. | None. |
| M11 | **Measurement policy.** Never branch on Lighthouse identity (user agent, `Chrome-Lighthouse`, Lightrider platform strings); Google treats it as cloaking and it hides nothing from real users. Branch on capability only (software renderer, coarse pointer, `saveData`, reduced motion). Reproduce PSI with the runbook's software-GL recipe and expect TBT to stay higher on Lightrider. | Lighthouse issues #15829 and #14917, Google Search Central statements (V8). | Honest numbers. | Already the repo's stance; recorded so it stays that way. |

Expected outcome after M1 to M4: lab mobile LCP on `/` from 9 s to about 3 s, Speed Index from 6.6 s to about 3 s, initial script under 500 KB, mobile score in the 75 to 85 range with TBT the remaining variable on Lightrider. M5 to M8 take it to the high 80s. Desktop stays at 90+ locally; PSI desktop follows the same TBT trims.

What this program does not do: change hero layouts, retire the lens, the light leak or the galleries, cut authored loops from case studies, or default anyone to a still. Every visitor with a GPU and a fine pointer sees the same effects; they just arrive after the poster instead of with the HTML.

### 9.3 What comparable sites ship to phones (survey, 2026-09-16)

Home page, mobile Chrome user agent, first-party script bytes on the wire, from a 22-site survey (raw data was captured in the session scratchpad, not committed). Published Lighthouse numbers for studio sites do not exist: Awwwards removed its mobile report and no studio blog prints one.

| Site | Stack | Initial JS (gz) | three.js in initial JS | Hero video on mobile |
|---|---|---|---|---|
| suits-sandals.com | Next 16 + R3F | 964 KB | yes | `preload="auto"`, inline source, 956 KB mp4, 35 KB JPEG poster |
| basement.studio | Next + R3F | 907 KB | yes | none in HTML |
| 14islands.com | Next + R3F | 789 KB | yes | 11.4 MB mp4, no poster |
| phantom.land | Next + R3F | 554 KB | yes | none |
| darkroom.engineering (Lenis authors) | Next + Lenis + GSAP | 246 KB | **no** | `preload="none"`, poster, no `autoplay` attribute, 145 to 720 KB files |
| immersive-g.com | Nuxt + three | 518 KB | yes | 40 videos with `data-src`, attached by JS |
| cred.club | Next + GSAP | 302 KB | no | mobile-specific 190 KB WebM, 14.6 KB poster, preloaded |
| obys.agency / zajno.com / aristidebenoist.com | custom | 6 to 58 KB on phones | **no on mobile** (UA + `maxTouchPoints` switch loads `m.js`) | none |
| lusion.co | Astro + three | 316 KB | yes | none; cloth data 983 KB desktop vs 246 KB mobile |
| vercel.com | Next | 598 KB | no | none; `content-visibility` on five below-fold sections |
| stripe.com | Next | ~100 KB in first 40 chunks | no | `<picture>` hero with `fetchpriority="high"` per breakpoint |

Patterns worth copying, by name: darkroom's poster + `preload="none"` + JS-triggered play; immersive-g's `data-src` sources; cred's mobile encode and tiny poster; stripe's `fetchpriority` hero image; vercel's `content-visibility`; the obys/zajno rule that phones never download a WebGL bundle (we get the same result with the coarse-pointer gate once M3b moves the import behind it). Our third-party weight (zero script tags) is already better than most of the field.

### 9.4 Technique sources

Verified by reading the page during the 2026-09-16 research pass:

- V1. Chromium LCP changelog, Chrome 116: video first frame as LCP candidate; DebugBear "Optimize video LCP": poster or first frame, whichever is earlier; poster + `fetchpriority="high"` preload 1.55 → 1.2 s. https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/speed/metrics_changelog/2023_08_lcp.md , https://www.debugbear.com/blog/optimize-video-lcp
- V2. Aaron T. Grogg, "Improving LCP for video hero components" (2026-01): `<picture>` under `<video>`, `fetchpriority="high"`, LCP 3.7 → 1.9 s, CLS to 0. https://aarontgrogg.com/blog/2026/01/06/improving-lcp-for-video-hero-components/
- V3. web.dev "Lazy loading video": `preload="none"` + poster, attach on intersection. https://web.dev/articles/lazy-loading-video
- V4. Mux, background video guidance: 720p cap, 400 to 800 KB mobile renditions, skip on Data Saver. https://www.mux.com/articles/add-background-video-website-hls-performance
- V5. "From the 40s to 97: optimizing a Next.js WebGL game": WebGL behind a dynamic import on interaction, `preload="none"` video, `inlineCss` last; mobile 59 → 97, LCP 11.4 → 2.3 s. https://dev.to/scott_winter_77ced0700c92/from-the-40s-to-97-optimizing-a-nextjs-webgl-game-b01 ; Next.js `inlineCss` reference https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss
- V6. Next.js prefetching guide: intent-based prefetch, `prefetch={false}` on footers and long lists. https://nextjs.org/docs/app/guides/prefetching
- V7. web.dev `content-visibility` (7x render savings), `optimize-long-tasks` (`scheduler.yield`, do not use `isInputPending`). https://web.dev/articles/content-visibility , https://web.dev/articles/optimize-long-tasks
- V8. Lighthouse maintainers on Lightrider (software WebGL, issues #10334, #8557), on user-agent detection (#15829, #14917) and Google's cloaking stance. https://github.com/GoogleChrome/lighthouse/issues/15829 , https://www.searchenginejournal.com/googles-not-fooled-by-fake-lighthouse-scores/417593/ ; PSI throttling change (1.2x) https://www.debugbear.com/blog/cpu-throttling-in-chrome-devtools-and-lighthouse
- V9. Codrops case studies used for the WebGL contract: Stefan Vitasović 2025 (no WebGL layer on mobile, native video instead), "Building efficient three.js scenes" (DPR cap 1.5, context flags, pause when hidden), ZERO 2026 (idle-time GPU uploads, adaptive tiers), Adrián Gubrica (ogl for 2D effects). https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/ , https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/ , https://tympanus.net/codrops/2026/07/17/zero-the-engineering-behind-a-defiant-interactive-narrative/ , https://tympanus.net/codrops/2025/12/05/from-illusions-to-optimization-the-creative-webgl-worlds-of-adrian-gubrica/
- V10. R3F scaling guide (`frameloop="demand"`, `performance.regress`), R3F issue #3073 (shader compile 75 ms on the main thread, `compileAsync`), react-three-next single-canvas pattern. https://r3f.docs.pmnd.rs/advanced/scaling-performance , https://github.com/pmndrs/react-three-fiber/issues/3073 , https://github.com/pmndrs/react-three-next
- V11. Lenis maintainers: touch scroll stays native unless `syncTouch`; keep it off on phones. https://github.com/darkroomengineering/lenis/discussions/322
- V12. Lighthouse 13 release notes (insight audits replace the old opportunities; no scoring change) and Chrome 146 LCP candidate change. https://developer.chrome.com/blog/lighthouse-13-0 , https://developer.chrome.com/release-notes/146

Seen in search results only, to verify before relying on them: SwiftShader fallback removal on desktop Chrome 137 (every canvas mount needs a null-context path), `@react-three/offscreen` limits (no Safari), soft-navigation LCP entries in Chrome 151.

## Appendix A. Files referenced

| Area | Files |
|---|---|
| Route | `src/app/(frontend)/works/[slug]/page.tsx`, `src/utilities/slugRoute.ts`, `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/template.tsx` |
| Media | `src/components/Media/index.tsx`, `src/components/Media/ImageMedia/index.tsx`, `src/components/Media/VideoMedia/index.tsx`, `src/collections/Media.ts`, `src/utilities/getMediaUrl.ts`, `next.config.ts` (`images`) |
| Heroes and blocks | `src/heros/CaseStudyHeroCenteredMedia.tsx`, `src/heros/CaseStudyHeroLandscape.tsx`, `src/blocks/case-study/RenderCaseStudyBlocks.tsx`, `src/blocks/case-study/RevealSection.client.tsx`, `src/blocks/full-media/FullMedia.tsx`, `src/blocks/MediaBlock/Component.tsx`, `src/blocks/shared/media-showcase-grid.tsx`, `src/blocks/Carousel/playback.ts`, `src/blocks/featured-work/FeaturedWorkList.client.tsx` |
| Reveal and motion | `src/shared/ui/scroll-reveal/scroll-reveal.tsx`, `src/shared/ui/reveal-section/RevealSection.tsx`, `src/sections/WorkIntro/Section.client.tsx`, `src/app/(frontend)/globals.css` (`.reveal-section`, `html { opacity: 0 }`) |
| Chrome | `src/Header/Component.client.tsx`, `src/Header/Menu/index.tsx`, `src/Header/getMenuContent.ts`, `src/Footer/Closing/FooterClosing.tsx`, `src/Footer/Closing/ClosingLightLeak.tsx`, `src/Footer/Closing/ClosingMedia.tsx`, `src/components/SiteChrome/index.tsx`, `src/components/AdminBar/index.tsx` |
| WebGL and immersive | `src/components/GlobalCanvasRoot/index.tsx`, `src/lib/webgl/components/global-canvas/index.tsx`, `src/lib/webgl/utils/create-renderer.ts`, `src/features/immersive/ui/light-leak.tsx`, `src/features/immersive/ui/scroll-gallery.tsx` |
| Ask | `src/features/ask/MenuAsk.tsx`, `src/Footer/Closing/ClosingAsk.tsx`, `src/features/ask/AskWidget.tsx` (separate reusable surface), `src/features/ask/useAskChat.ts` |
| Providers and analytics | `src/providers/index.tsx`, `src/providers/SmoothScrollProvider.tsx`, `src/providers/Theme/InitTheme/index.tsx`, `src/providers/Analytics/PostHog.tsx`, `src/providers/Consent/index.tsx`, `src/features/cursor/CustomCursorProvider.tsx`, `src/instrumentation-client.ts`, `sentry.shared.ts` |
| Headers | `node_modules/@payloadcms/next/dist/withPayload/withPayload.js` (`Accept-CH`, `Critical-CH`, `Vary`) |

## Appendix B. Raw measurements

Production chunk inventory, R2 media sizes, Lighthouse JSON and the fetched HTML for five work pages were captured on 2026-09-03 against deployment `57f6f47`. Lighthouse ran with the desktop preset (simulated 10 Mbps, 40 ms RTT, no CPU slowdown). Video probes used the repo's `ffmpeg-static` binary; MP4 atom order was read with ranged requests. HEAD requests to R2 bypass the Cloudflare cache rule and show `DYNAMIC`; GET requests show `HIT` with `max-age=31536000`, so the earlier `DYNAMIC` reading is a HEAD artefact, not a caching gap.
