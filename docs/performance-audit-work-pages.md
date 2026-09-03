# Work page performance audit (`/works/[slug]`)

Date: 2026-09-03. Deployment audited: `57f6f47` on the production alias `preview.suits-sandals.com` (also `sas-site-sas-team.vercel.app`). Scope: the case-study route, its shared layout, and everything a work page ships to the browser. Documentation only, no code changes were made.

## 1. Summary

The work pages are not slow because of rendering or interaction. TTFB (0.45s), INP (56ms), CLS (0.01) and FID (4ms) are all green. The pages are slow because of what they ask the browser to download in the first two seconds. Field P75 on desktop is FCP 4.65s and LCP 4.86s, and those two numbers being almost equal is the tell: first paint itself is being starved, and the hero paints as soon as anything paints.

Three root causes account for most of the gap:

1. **Media flood at load.** Every `<video>` on a work page is `autoPlay` with no viewport gating, so all of them start downloading during the LCP window. The Vault page carries 10 videos totalling 21.6 MB, Arturo 9 videos at 12.4 MB. Their posters are raw JPEGs from R2 (four of them 140 to 185 KB) that bypass image optimization.
2. **1.0 MB gzipped of JavaScript on every page** (3.4 MB raw across 30 chunks). Roughly 60% of it cannot run on a work page: three.js, React Three Fiber and drei are shipped through a `next/dynamic` call that is not actually a code split; the AI SDK and a full copy of zod ship through the header and footer Ask composers; Sentry Session Replay and the PostHog SDK are bundled eagerly even though they initialize later or never.
3. **A request storm in the first second.** The closed takeover menu is `fixed inset-0 opacity-0` and still laid out, so Next prefetches every one of its links: 80 RSC segment fetches (about 20 routes) fire at 600 to 850 ms, alongside 10 poster fetches, 30 script fetches, Sentry envelopes and an admin-bar auth call.

Everything else in this document is secondary, but several items compound the above: the LCP element on video-hero pages is the `<video>` itself with no priority hint, `priority` images no longer get `fetchpriority="high"` under Next 16, the default `sizes` string is invalid and falls back to `100vw`, every image is requested at quality 100, and 30 full media documents are serialized into the RSC flight payload.

A data caveat: the site is still `noindex` on a Vercel domain and `www.suits-sandals.com` is still Webflow, so the 356 desktop samples behind the score are team, client and admin traffic. Admin live-preview loads render in draft mode (dynamic, uncached, depth-4 queries) inside an iframe and report to Speed Insights like any other visit. That does not change the findings, but it means the P75 mixes cold real-user loads with unusually heavy internal loads. Section 7 covers measurement hygiene.

Lab confirmation (Lighthouse 12, desktop preset, fast machine, cold cache): performance 88, FCP 0.6s, LCP 2.1s with 67% of LCP time spent in render delay on the hero video, 23.5 MB transferred, 168 requests.

## 2. What was measured

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

## 3. How a work page loads today

1. The HTML is a static prerender (`x-nextjs-prerender: 1`, CDN `HIT`), 35 KB gzipped. TTFB is fine. Chrome users pay one extra navigation round trip on their first visit because Payload's `withPayload` injects `Critical-CH: Sec-CH-Prefers-Color-Scheme` on every route (see finding 8).
2. The head declares two font preloads, four stylesheets, one low-priority script preload and 30 async scripts. Stylesheets are the only render-blocking resources. The inline theme bootstrap sits after the stylesheets and sets `data-theme` before the body parses, which releases the `html { opacity: 0 }` rule (finding 9).
3. While the body parses, 10 `<video poster>` images are requested at about 150 ms (Medium and Low priority, cross-origin, no preconnect). The 10 `<video autoplay>` elements start their media fetches at about 340 ms. There is no gating: a video eight screens down loads at the same time as the hero.
4. Hydration begins once the script graph lands. Dozens of client components mount, including Lenis on the tempus clock, the custom cursor, the consent manager, Sentry with Replay, the PostHog provider, the takeover menu with its Ask composer, and about 25 reveal shells with 70 `data-reveal` targets. The reveal shells run `getBoundingClientRect` per target inside layout effects, which is the forced reflow Lighthouse attributes to the commit.
5. At 600 to 850 ms the router prefetches every link in the still-hidden menu: 80 fetches. Sentry posts its session and pageload envelopes; the admin bar calls `/api/users/me`.
6. The hero video paints its first frame once enough of its 1.78 MB has arrived through a pipe shared with nine other videos, ten posters and a megabyte of script. In the lab that is 2.1 s with two thirds of it render delay. In the field it is 4.9 s.

The route itself is in good shape: static params, one cached slug query shared by metadata and page, tag-based revalidation, related work resolved at build. Nothing here needs to move to the server; the problem is entirely on the client side of the wire.

## 4. Findings, ranked

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
- `src/Header/Component.client.tsx` statically imports the `TakeoverMenu`, which imports `MenuAsk`, which imports `useAskChat` (`@ai-sdk/react`, `ai`). `FooterClosing` does the same through `AskWidget`. The AI SDK pulls the full zod runtime. That is about 120 KB gzipped for a composer that is behind a closed menu and below the closing band.
- `src/instrumentation-client.ts` registers `Sentry.replayIntegration()` and `consoleLoggingIntegration` eagerly, with `enableLogs`. Replay is the heaviest Sentry integration and can be lazy-loaded; the SDK supports loading it after `init`.
- `src/providers/Analytics/PostHog.tsx` imports `posthog-js` statically. Initialization is correctly gated on consent, but the SDK bytes are not.
- The `@c15t/nextjs` consent manager is bundled with its full UI and its global stylesheet.

Recommendation
- Make the WebGL layer a real split: keep `GlobalCanvasRoot` in the layout as a thin client shell that only subscribes to `isActivated`, and dynamically import the R3F canvas module (and drei) when activation happens. The same applies to `LightLeak` and the scroll gallery: import the effect module inside the intersection or `onComplete` callback that already gates when they mount. Target: no `three` bytes on a page that never activates a canvas.
- Split the Ask composer out of the header and footer bundles: render a static placeholder in the menu and closing card, and load the chat module on first intent (menu open, composer focus). The existing `warmMedia` intent hook on the menu button is the right trigger. This also removes zod from the page.
- Lazy-load Sentry Replay after `init` (the SDK's `lazyLoadIntegration` or a dynamic import in an idle callback), drop console logging in production, and consider a lower `tracesSampleRate`. Keep error capture eager.
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

Sentry sends the session and the pageload transaction at ~500 ms (three `/monitoring` requests), Replay records at 10% of sessions in production (a second, 100 KB worker script), and the Speed Insights script is a separate request. PostHog and GA are correctly gated on consent. Lower the trace sample, lazy-load Replay (P0-2), and flush on idle.

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

Real metrics will improve with the fixes above. These are the choices that make a heavy, media-led case study feel fast while it is still loading.

1. **Poster first, motion second.** The hero should paint a still within the first few hundred milliseconds and start moving when the video is ready. Encode each loop so its first frame equals the poster, and start playback on `canplay` with a short crossfade or none at all. The reader sees a finished screen, then it starts to breathe. Today the reader sees the poster only when bandwidth allows and the video pops in whenever it arrives.
2. **Stagger media by scroll, not by load.** With observer-driven sources, each loop starts fetching about two screens before it is reached and plays the moment it enters. Reading pace on a case study is slow enough that a 1 MB loop always arrives before the eye does, and the page never feels like it is waiting on something the reader cannot see.
3. **Keep server HTML visible before JavaScript.** The GSAP reveal shells already do this (initial state is applied only when the timeline builds). The CSS `.reveal-section` rule hides MediaBlock and Carousel blocks until hydration and intersection; on a page where one of those sits near the fold, that is the hero's neighbour blinking in late. Move that rule behind a `data-js` flag or `@starting-style` so no server-rendered content is ever hidden by CSS alone.
4. **Respect the reveal rhythm under load.** Reveals that fire while the main thread is busy hydrating look janky, and a reveal that fires before its media has loaded wipes onto a blank frame. Gate a block's media wipe on the media's `load` or `canplay` event as well as on intersection, and delay the first shell's timeline until after the LCP paint.
5. **Use the transition budget for prefetch.** On a client navigation from `/works`, the `work-open` morph takes about a second. That second is when the destination hero poster should be fetched (on hover intent the way `warmMedia` does it), and when nothing else on the destination should be fetching. Wire non-hero video loading to the `ScrollReveal` `onComplete` or the transition end so the morph runs on an idle network.
6. **Set a per-page media budget and show it to editors.** A case study should carry at most three or four loops, the hero no more than about 1.5 MB, inline loops well under 1 MB each. A small admin note on the Media collection (size, duration, bitrate after upload) makes the budget visible where the decision is made.
7. **Sequence the closing band.** The curtain effect, the parallax and the light leak are the last things on the page; they should be the last things to load. Import the leak module when the gate marker enters the extended root, not with the page bundle.
8. **Cold cache is the only cache that matters for the score.** Most visits that produce a Speed Insights sample are first visits to a case study from a link. Everything above assumes an empty cache; warm-cache navigation is already fast.

## 6. Execution order and expected impact

| Phase | Work | Effort | Expected field effect |
|---|---|---|---|
| 1. Stop the flood | Viewport-gated video source and playback in `VideoMedia`, `preload="none"` off-hero, `fetchpriority` and preload for the hero poster, `preconnect` to the media host, `prefetch={false}` plus intent prefetch for menu links, hide the closed overlay from layout | 1 to 2 days | Largest single move. Vault page from 24 MB to roughly 4 MB at load. LCP P75 should fall from ~4.9 s toward ~2.5 s, FCP with it |
| 2. Bundle diet | Real code split for three, R3F and drei; lazy Ask composer; lazy Sentry Replay; dynamic PostHog; CI bundle budget | 2 to 3 days | About 600 KB gzipped less per page. Faster hydration, earlier reveals, RES into the 80s |
| 3. Image and payload pipeline | Quality and `qualities`, valid `sizes` everywhere, posters through `next/image`, drop the shared blur, slim media props to client components, optimizer fetching from R2 directly | 2 days | 30 to 50% fewer image bytes, ~100 KB smaller HTML, less hydration parse. RES at or above 90 |
| 4. Chrome and hygiene | `Critical-CH` scoped to admin, theme bootstrap hardened, Tailwind `@source not`, consent CSS scoped, header shrink without relayout, read-before-write in reveal shells | 1 to 2 days | Removes a first-visit round trip in Chrome, trims the render-blocking chain, reduces forced reflow during hydration |
| 5. Video encoding and editorial budget | Re-encode inline loops at 720p with AV1 or HEVC alternates, trim to 4 to 6 s, per-page media guideline in the CMS | ongoing | Halves media bytes again for the heaviest pages; keeps the score stable as content grows |

## 7. Verification

- Lab, before and after each phase: Lighthouse desktop and mobile against `preview.suits-sandals.com/works/vault-workforce-screening` (the heaviest page) and `/works/adacore` (image hero). Targets for the Vault page after phase 2: under 5 MB transferred at load, under 60 requests, under 400 KB gzipped of script, LCP under 2.0 s in the desktop preset, no forced reflow attributed to hydration.
- WebPageTest with a 4G profile and a mid-range laptop CPU profile, filmstrip on, to confirm the poster-first hero paints before 1.5 s.
- Field: Speed Insights per route after seven days of traffic on the same domain. Watch the LCP element attribution flip from `<video>` to the poster image.
- Measurement hygiene: do not render `SpeedInsights` in draft mode (live preview loads should not sample), and filter internal traffic with the component's `beforeSend`. Once `www.suits-sandals.com` cuts over from Webflow, re-baseline; the current numbers describe internal and client traffic on the Vercel alias.
- Storybook: a video-gating story for `VideoMedia` (poster only, then playing on intersection) and a reduced-motion pass on the reveal shells, per the existing visual-verify workflow.

## 8. Lowest-risk first pass

This section answers a narrower question: which of the fixes above can ship without touching the view transitions, the GSAP reveal and menu choreography, Lenis, the cursor, or any shader, and what has to stay exactly as it is for the light leak to keep working.

### 8.1 The spinning backdrop is still live, and the light leak does not depend on it

The persistent 3D object from the start of the project is `WebGlBackdropScene` (`src/features/immersive/ui/webgl-backdrop-scene.tsx`): an indigo torus knot rotating on the global orthographic canvas. It is no longer on the home page or the work pages, but it is not gone:

| Where | Status |
|---|---|
| `src/heros/HighImpact/index.tsx` | Still renders `<WebGLTunnel><WebGlBackdropScene /></WebGLTunnel>` inside `ImmersiveShell webgl`, which activates the layout-level `GlobalCanvas` and its WebGPU-first renderer |
| CMS, `hero.type = highImpact` | Live on all five published expertise pages and on three audience pages (`growth--repositioning-brands`, `healthtech-life-sciences-branding`, `technical-b2b-branding`). No `pages` documents use it |
| Production HTML | `/expertise/brand-positioning-messaging` renders the HighImpact hero markup; the canvas mounts client-side on load |
| Session behaviour | `isActivated` never resets, so once a visitor lands on an expertise page the GL context lives for the rest of the session; other routes only hide it and pause its frame loop |

Speed Insights agrees: `/expertise/[slug]` scores 32, the lowest route on the site.

What the light leak actually needs, verified in `src/features/immersive/ui/light-leak.tsx`:

- Its own small `<Canvas>` from `@react-three/fiber` with the classic WebGL renderer, a GLSL `ShaderMaterial`, `useFrame`, `useThree`.
- `useDeviceDetection` (GPU and reduced-motion gate), `CANVAS_RESIZE`, `resolveTuning`, the excite selector and its shader module.
- Nothing from the global canvas: no tunnel, no store, no WebGPU renderer, no `RAF`, no `Preload`. The file header says so explicitly (the global canvas prefers WebGPU, where raw GLSL is unsupported).

The same is true of every other shipped effect: `RefractionMedia` (home hero lens), `DispersionMedia`, `ScrollGallery`, `ChromaSplitText`, `FloatingCards` and the GL headings all mount their own canvas. The only consumers of the global canvas and tunnel are the HighImpact hero and the demo playground.

So retiring the spinning backdrop is safe for the light leak by construction, and it is the single change that lets the three.js chunks leave the layout bundle. Two ways to do it, lowest risk first:

1. **Content only.** Switch the eight documents from `highImpact` to `mediumImpact` in the admin. No code, no deploy, reversible per page. The dark hero, media and links stay; the knot goes. This is worth doing today regardless of the code path.
2. **Code.** Remove the `WebGLTunnel` block from `HighImpactHero` and drop the `webgl` flag on its `ImmersiveShell`, keeping the dark theme, media and layout. Then the only activator left is `/demo/immersive`, and `GlobalCanvasRoot` can become a real split (dynamic import of the canvas module when `isActivated` flips). Keep `WebGlBackdropScene` and the canvas infrastructure in the repo for the demo route and future backdrops; nothing about the technique is lost.

Neither step touches `view-transition.css`. The `.vt-global-canvas` rule simply matches nothing when the canvas is absent.

### 8.2 Tier 1: no visual or motion change, ship first

Each item changes bytes or request timing only. None alters DOM order, class names, timing constants, or what the reveal shells, transitions or shaders see.

| Change | Where | What it must not touch | Risk |
|---|---|---|---|
| Retire the spinning backdrop (8.1, content first) | CMS hero type, then `HighImpact/index.tsx` | Keep `ImmersiveShell`, tunnel, store and `WebGlBackdropScene` files for the demo route | Very low. The hero keeps its layout; only the knot disappears |
| Lazy-load the light leak module | `src/Footer/Closing/ClosingLightLeak.tsx` | The `open` gate, `LIGHT_LEAK_PAPER` preset, theme switching, all `LightLeak` defaults and the shader | Very low. The component already mounts only when the gate marker enters; wrapping the import in `next/dynamic` (no SSR) moves the three.js download to that same moment. Warm the chunk on idle after load so the leak is never late at the curtain |
| Lazy-load the Ask composer | `src/features/ask/MenuAsk.tsx` consumers in `Header/Menu/index.tsx` and `FooterClosing.tsx` | The composer's wipe timings (`CHAT_WIPE_*`) and the preview-slot geometry the menu measures | Low. The menu already warms hover media on button intent; load the chat module on the same signal and on composer focus in the footer card. Render the card shell statically so the closing band's layout and `data-reveal="panel"` entrance are unchanged |
| Lazy Sentry Replay, dynamic PostHog import | `src/instrumentation-client.ts`, `src/providers/Analytics/PostHog.tsx` | Error capture, consent gating, `captureRouterTransitionStart` | Very low. The installed SDK exports `lazyLoadIntegration`; PostHog init is already inside a consent effect, so the `import()` goes there |
| Video source and playback gating for non-hero videos | `src/components/Media/VideoMedia/index.tsx` | The hero: keep it eager and unchanged, because the takeover menu clones the first media inside `[data-hero-media]` and reads its `readyState` for the handoff. Carousel keeps its own controller | Low. Poster paints exactly as today; the `<video>` gets its source one to two viewports before it enters and plays on intersection. The `data-reveal="media"` clip masks wrap the container, not the source, so the wipe is unchanged. Pinned shells (featured work) stay in the viewport while pinned, so observer-driven play works there too |
| `fetchpriority="high"` on the hero media, `preconnect` to the media host, `<link rel=preload>` for the hero poster | `Media` props on both case-study heroes, root layout head | Nothing else | Very low. Attribute-only |
| Valid default `sizes`, real `sizes` on blocks that pass none | `ImageMedia` default, MediaBlock, Carousel, showcase grid, testimonial, centered-media hero | The `srcset` candidates stay; only which one the browser picks changes | Very low. Chromatic will not diff (Storybook fixtures use fixed URLs) |
| Menu links `prefetch={false}`, prefetch on menu-button intent instead | `Header/Menu/index.tsx`, `CMSLink` passthrough | The hero handoff's `router.push` (it runs after the traveler animation, which covers a fetch) and the `warmMedia` intent hook, which is the right place to add `router.prefetch` | Low. First open after a cold load may fetch on click instead of instantly; prefetching on hover of the menu button removes even that |
| Scope Payload's `Critical-CH` and `Vary` to `/admin` | `next.config.ts` `headers()` | Nothing on the frontend uses the hint | Low. Header only; verify `/admin` still renders the right theme server-side |
| Guard the theme bootstrap | `src/providers/Theme/InitTheme/index.tsx` | The stored-preference logic | Very low. `try`/`catch` around the storage read plus a fallback attribute |
| Admin bar only with a Payload cookie | `src/app/(frontend)/layout.tsx` | Draft mode and live preview | Very low. Cookie check on the server; the bar still renders for logged-in editors |

Expected effect of Tier 1 alone: the layout bundle loses three.js, drei, R3F, the AI SDK, zod, Replay and PostHog (roughly 600 KB gzipped); the Vault page stops fetching 20 MB of video at load; 80 prefetches disappear from the LCP window. That is the bulk of the field gap, with no animation code touched.

### 8.3 Tier 2: motion-adjacent, ship behind the demo pages and Chromatic

These change how or when motion code runs, not what it does. They deserve the visual-verify pass (`/demo/transitions`, reduced-motion and motion Storybook screenshots) before merging.

- Read-before-write in `ScrollReveal` and `WorkIntroSection`: gather `getBoundingClientRect` for every target first, then apply `gsap.set`. Same timelines, same tuning, fewer forced reflows.
- Share one `IntersectionObserver` across reveal shells. Same gate semantics (`enterOffset` as a root margin), one observer.
- Gate a media wipe on `load` or `canplay` as well as intersection, so a clip mask never wipes onto an empty frame. This is a perceived-quality gain that also removes pressure to load everything early.
- Warm the light leak and scroll gallery chunks on idle after LCP, so their first mount never waits on the network.

### 8.4 Tier 3: not part of the low-risk pass

Skip these for now; each interacts with geometry that the menu docking, the pinned shells or Lenis measure.

- `content-visibility: auto` on bands (changes intrinsic heights that ScrollTrigger and the curtain gate read).
- Changing how the header bar shrinks (`--header-bar-height` feeds the menu's docking geometry and the page frame padding).
- Removing the global canvas infrastructure outright (the demo route uses it, and future backdrops may).
- Tailwind `@source not` pruning (safe in principle, but it needs a Chromatic run to prove no shipped class was only discovered through a story).
- Image quality changes below 90 on the hero (safe technically, but a taste decision for a portfolio; start with inline imagery).

### 8.5 How to prove nothing broke

- `/demo/transitions` and `/demo/immersive` still run every reveal, the scramble, the lens and the light leak; the demo route still activates the global canvas.
- Storybook reduced-motion and motion passes for `FooterClosing` (light leak mounts when the curtain opens, in both themes), `VideoMedia` (poster, then playback on intersection), the takeover menu (hero handoff still completes on a cold cache), and the case-study heroes.
- Manual: open the menu on a cold load, hover a work link, click through; the handoff should be identical. Navigate `/works` to a case study and back: the `work-open` morph and the mask reveals are unaffected because nothing in `view-transition.css` or `DirectionalTransition` changes.
- Lighthouse on the Vault page: script transfer under 450 KB gzipped, media under 5 MB at load, no `three` chunk in the initial script list, LCP element still the hero.

## Appendix A. Files referenced

| Area | Files |
|---|---|
| Route | `src/app/(frontend)/works/[slug]/page.tsx`, `src/utilities/slugRoute.ts`, `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/template.tsx` |
| Media | `src/components/Media/index.tsx`, `src/components/Media/ImageMedia/index.tsx`, `src/components/Media/VideoMedia/index.tsx`, `src/cssVariables.ts`, `src/collections/Media.ts`, `src/utilities/getMediaUrl.ts`, `next.config.ts` (`images`) |
| Heroes and blocks | `src/heros/CaseStudyHeroCenteredMedia.tsx`, `src/heros/CaseStudyHeroLandscape.tsx`, `src/blocks/case-study/RenderCaseStudyBlocks.tsx`, `src/blocks/case-study/RevealSection.client.tsx`, `src/blocks/full-media/FullMedia.tsx`, `src/blocks/MediaBlock/Component.tsx`, `src/blocks/shared/media-showcase-grid.tsx`, `src/blocks/Carousel/playback.ts`, `src/blocks/featured-work/FeaturedWorkList.client.tsx` |
| Reveal and motion | `src/shared/ui/scroll-reveal/scroll-reveal.tsx`, `src/shared/ui/reveal-section/RevealSection.tsx`, `src/sections/WorkIntro/Section.client.tsx`, `src/app/(frontend)/globals.css` (`.reveal-section`, `html { opacity: 0 }`) |
| Chrome | `src/Header/Component.client.tsx`, `src/Header/Menu/index.tsx`, `src/Header/getMenuContent.ts`, `src/Footer/Closing/FooterClosing.tsx`, `src/Footer/Closing/ClosingLightLeak.tsx`, `src/Footer/Closing/ClosingMedia.tsx`, `src/components/SiteChrome/index.tsx`, `src/components/AdminBar/index.tsx` |
| WebGL and immersive | `src/components/GlobalCanvasRoot/index.tsx`, `src/lib/webgl/components/global-canvas/index.tsx`, `src/lib/webgl/utils/create-renderer.ts`, `src/features/immersive/ui/light-leak.tsx`, `src/features/immersive/ui/scroll-gallery.tsx` |
| Ask | `src/features/ask/MenuAsk.tsx`, `src/features/ask/AskWidget.tsx`, `src/features/ask/useAskChat.ts` |
| Providers and analytics | `src/providers/index.tsx`, `src/providers/SmoothScrollProvider.tsx`, `src/providers/Theme/InitTheme/index.tsx`, `src/providers/Analytics/PostHog.tsx`, `src/providers/Consent/index.tsx`, `src/features/cursor/CustomCursorProvider.tsx`, `src/instrumentation-client.ts`, `sentry.shared.ts` |
| Headers | `node_modules/@payloadcms/next/dist/withPayload/withPayload.js` (`Accept-CH`, `Critical-CH`, `Vary`) |

## Appendix B. Raw measurements

Production chunk inventory, R2 media sizes, Lighthouse JSON and the fetched HTML for five work pages were captured on 2026-09-03 against deployment `57f6f47`. Lighthouse ran with the desktop preset (simulated 10 Mbps, 40 ms RTT, no CPU slowdown). Video probes used the repo's `ffmpeg-static` binary; MP4 atom order was read with ranged requests. HEAD requests to R2 bypass the Cloudflare cache rule and show `DYNAMIC`; GET requests show `HIT` with `max-age=31536000`, so the earlier `DYNAMIC` reading is a HEAD artefact, not a caching gap.
