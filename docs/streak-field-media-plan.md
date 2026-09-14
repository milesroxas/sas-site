# Streak Field as website media: implementation plan

Status: implemented through Phase 4 in code on 2026-09-13 (see [Implementation record](#implementation-record-2026-09-13)); Phase 0 and Phase 2 measurement gates and the optional Phase 5 authoring work remain open. Initially reviewed 2026-09-13 against `1e7d9e6`; source claims rechecked against `de03f43` plus the current documentation edits in `sas-site` on the same date.

This supersedes the September 9 plan reviewed at `4e838d2`, including its later shared-canvas revision, for implementation in this repository. The original discussion is [Shader Transition Plan](https://chatgpt.com/c/6aa20240-af6c-83ea-89ef-d39470587a7e). This review compared the earlier plan, current source, changes since that commit, the performance roadmap, and primary framework documentation. No new browser smoke test, production benchmark, or GPU prototype was run. Historical performance results below are evidence from the repo's audit, not measurements from this review.

Verified lockfile and installed versions: Next.js 16.3.4, React 19.2.7, Payload 3.88.0, Three.js 0.182.0, R3F 9.6.1, Drei 10.7.7. Recheck resolved dependency versions when implementation begins.

Current feature status: shader selection (`visualType` plus a `StreakVisualConfig` group) exists on the Pages (High and Medium impact), Segment, Home, Lab and Post heroes, the index globals (where it runs behind the whole page), the Stacked, Split narrow and Media split blocks, the Work Page hero, and the menu-preview slot on Pages, Expertise and Who We Help pages, Contact Pages, the index globals and Work Pages; the server resolver, the `Visual` adapter, the poster-first `StreakVisual` slot, code-owned posters and the bounded local runtime are implemented. The baseline record lives in [`docs/perf/streak-field-baseline/`](perf/streak-field-baseline/README.md); its hardware measurements are still open. This source check does not verify live Payload content or the current production deployment.

Day-to-day usage (what every control does, the shipped looks, the editor fields, the poster pipeline, best practices) lives in the [Streak Field guide](streak-field.md). This plan owns scope, phase gates, the support matrix and the migration answer sheet.

## Decision

The feature still makes sense: an editor can choose **Media** or **Streak Field**, select a code-defined look, and give each page or block a stable seed and a few bounded adjustments. Store art direction in Payload; keep shader code, quality limits, resource ownership, and transition rules in code.

**Primary surfaces.** The feature is mainly for pages that have no natural photograph or video of their own: Pages (High and Medium impact heroes, the Segment hero), the Home hero, Lab Pages, Posts, the Works and Insights index globals, the Expertise, Who We Help and Contact menu previews, and the composition blocks on those pages. Work Pages are an occasional consumer: a case study normally carries real client media, so the shader is the exception there. Work-specific rules (case-study asset-library scoping, case-study publish checks) are guards for that edge case, not the model for the feature.

The earlier plan's conclusions still hold. Its implementation order needs to account for the current performance work and menu:

1. Establish loading, fallback, and renderer ownership before broad CMS adoption.
2. Prototype shared rendering using the existing persistent-root location. Do not add a second site-wide renderer service alongside it.
3. Ship posters and existing DOM transitions first. Live menu previews and continuous shader morphs are later gates.
4. Use the existing classic WebGL2 Streak Field as the comparison baseline. Choose a different backend only after equivalent-quality measurements.

One animated Streak Field is the initial ceiling across the public document. That is a starting policy, not proof that a device can sustain the default effect. Other GPU effects must also be counted and coordinated; one Streak Field plus a lens, footer light leak, and gallery is still multiple renderers and workloads.

### Coordination with the performance roadmap

[The September 13 performance direction](performance-audit-work-pages.md#0-status) aligns the WebGL work with this feature and supersedes the indefinite replacement deferral. There is no dependency on an unspecified replacement project. Use the current WebGL2 Streak Field as the baseline; decide shared versus bounded local ownership through Phase 2. Integrate loading, capability, lifecycle, and necessary coexistence changes into this sequence. Independent Ask, image, and telemetry improvements can ship without blocking it.

The feature plan owns functionality and numeric acceptance gates; the performance roadmap owns scheduling and scope boundaries; the measurement runbook owns capture procedure. Update them together when a decision changes. A poster-only pilot or a better Lighthouse score does not complete the feature: completion requires CMS-selected live Streak Field on qualified hardware in the supported hero/block placements, preset-based previews, per-entry variation, reliable existing transitions, and graceful fallback. Optional live menu previews, continuous morphs, and backend experiments cannot delay that outcome.

## What changed, and what did not

The shader and `src/lib/webgl` have no source diff between `4e838d2` and this review's commit. Most changes relevant to this feature are in media delivery, navigation, and performance requirements.

| Area | Current evidence | Effect on the plan |
| --- | --- | --- |
| Next.js integration | [Frontend layout](../src/app/(frontend)/layout.tsx) mounts `GlobalCanvasRoot`; the route template remounts and current navigation uses React View Transitions. Next is now 16.3.4. | Keep the persistent owner outside the template. Follow the installed Next guides, without reintroducing the removed experimental view-transition flag. |
| Image delivery | [ImageMedia](../src/components/Media/ImageMedia/index.tsx) uses `getCdnMediaUrl`, versioned media URLs, Next Image, quality 90, and `sizes`. | Shader posters must use this pipeline or an equivalent optimized static-image path. Do not regress to full-size Payload file URLs. |
| Video delivery | [VideoMedia](../src/components/Media/VideoMedia/index.tsx) distinguishes priority heroes, viewport-gated loops, and controller-owned videos. | Leave media mode's loading behavior intact. Shader mode must not mount the old video invisibly behind its poster. |
| Ask in the menu | [PreviewSlot](../src/Header/Menu/PreviewSlot.tsx) expands for chat; [TakeoverMenu](../src/Header/Menu/index.tsx) owns cover, resize, exit, and preview transitions. | A settled menu is not necessarily a visible media slot. Suspend any future live preview throughout Ask and both directions of its cover/resize animation. |
| Menu interaction | Current-page rows are disabled and hover media is readiness-gated with stale-intent handling. Closed links use `prefetch={false}`; open links restore Next's default. Button-intent `warmMedia` loads image previews, not routes, videos, or shaders. | New shader preparation must obey eligibility and cancellation rules. Its bounded successor policy must not copy the existing whole-preview-image warmup loop. |
| Featured work | [FeaturedWorkList](../src/blocks/featured-work/FeaturedWorkList.client.tsx) now uses pinned wipes, parallax, scale, and dimming. | Use shader posters in these frames initially. A fixed scissor view will not automatically reproduce ancestor transforms, masks, or opacity. |
| Industry work | [IndustryWorkClient](../src/blocks/IndustryWork/Component.client.tsx) arms its shared-element name at click time to avoid stale duplicate names. | Retain that behavior. Static poster transitions must not remount the live scene just to change a ViewTransition name. |
| Performance evidence | [Performance audit](performance-audit-work-pages.md#0-status) records a video-backed lens repainting about 24 times/second and software WebGL causing heavy desktop main-thread work. | Successful context creation is insufficient admission. Test software rendering and verify idle draw counts, not only `frameloop="demand"`. |
| Analytics | [PostHog](../src/providers/Analytics/PostHog.tsx) explicitly disables canvas recording. | Preserve it. Do not enable `preserveDrawingBuffer` or frame recording on public canvases for poster generation. |

## Current implementation findings

These are implementation prerequisites, not a claim that the proposed replacement is already working.

| Priority | Evidence | Required response |
| --- | --- | --- |
| High | [StreakField](../src/features/immersive/ui/streak-field.tsx) creates its own classic R3F `Canvas`; disabled rendering returns `null`; offscreen canvases remain mounted. | Separate the reusable scene from canvas ownership and render a DOM poster before any GPU work. Add first-frame and failure signals. Pausing does not release resources. |
| High | [GlobalCanvas](../src/lib/webgl/components/global-canvas/index.tsx) exports `dynamic(() => Promise.resolve(...))` from a module with static R3F/Drei imports. | This disables SSR but is not a real import boundary. The replacement must dynamically import a separate runtime module only after eligibility. Audit effect-barrel imports too. |
| High | [createRenderer](../src/lib/webgl/utils/create-renderer.ts) prefers `WebGPURenderer`; Streak Field uses GLSL `ShaderMaterial`. | Do not tunnel the current material into that renderer unchanged. Prototype one deliberately classic WebGL2 owner, or port the material before sharing the newer renderer. |
| High | [Canvas provider](../src/lib/webgl/components/canvas/index.tsx) sets a shared `isActive` boolean; any provider cleanup sets it false. | Replace boolean ownership with idempotent registrations/leases. Unmounting one slot must not deactivate another. Persistent renderer ownership alone does not preserve route-owned scenes. |
| High | [Global canvas CSS](../src/lib/webgl/components/global-canvas/global-canvas.module.css) and [transition CSS](../src/shared/ui/view-transition/view-transition.css) place the canvas behind the page. | Prove DOM stacking and clipping before claiming this canvas can replace arbitrary inline media or render above the menu. Raising its global z-index is not a sufficient integration. |
| High | [GPU detection](../src/lib/webgl/utils/gpu-detection.ts) accepts WebGL1 or `navigator.gpu` presence, and classifies touch/no-hover devices as low power. | Gate the classic renderer on actual WebGL2 initialization. Distinguish graphics support, device policy, and reduced motion. Treat known software renderers conservatively and retain a runtime performance fallback. |
| Medium | Streak defaults are 20,000 instances at DPR 2; topography uses 12,000 grid instances and flow. | Calibrate production quality by placement and device. Preserve full-grid coverage when lowering count. These defaults are not an established performance budget. |
| Medium | `FieldScene` creates two FBO objects and a simulation scene for drift as well as flow; flow resets the target to `null`. | Isolate optional flow resources. Verify floating-point renderability and restore prior render target, viewport, scissor, and other modified state when sharing a renderer. Resource-object creation does not itself prove GPU storage was allocated. |
| Medium | [Streak shader](../src/features/immersive/ui/streak-field-shader.ts) repeats center-field evaluation for direction and height in the drift path. | Reuse calculations where equivalent and profile complex noise separately. The effect has vertex and simulation costs as well as fill-rate cost. |
| Medium | The Streak loop starts eligible for visibility, lacks explicit document/menu occlusion gates, and continues at `timeScale: 0`. Pointer bounds refresh only after pointer movement. | Admit after visibility is known. Stop simulation and draws when hidden, paused, or covered. Update bounds after scrolling/resizing even with a stationary pointer. |
| Medium | [Preload](../src/lib/webgl/components/preload/index.tsx) is keyed to renderer/camera/scene identity and globally pauses RAF while compiling. | New slot programs require explicit preparation; adding scene children does not necessarily rerun that effect. Bound preparation, handle rejection, and prevent stale work from blocking the current scene. |

Keep the current instancing, memoized buffers/uniforms, ref-based input, integrated time, and defaults plus delta-only presets. Keep `frustumCulled={false}` until there are correct bounds for the shader's clip-space output.

## Content contract

Add a reusable field factory around existing visual uploads. Preserve existing field names and relations: `hero.media`, `coverAsset`, `menuPreview`, `heroImage`, and block `media`. Use `visualType` for a visual choice; existing block `source` already selects canonical copy.

Illustrative stored shape, not a schema change in this review:

```ts
hero: {
  media: existingMediaRelationship,
  visualType: 'streakField',
  shader: {
    preset: 'topography-v1',
    seed: 694,
    speed: 0.75,
    intensity: 0.9,
    pointerInteraction: false,
    posterMedia: optionalApprovedImageRelationship,
  },
}
```

### Editorial rules

- Missing/null `visualType` preserves current media behavior. Explicit shader selection wins over a retained upload; that upload is not fetched or mounted merely because it remains stored.
- Use stable preset IDs in a **text** field with a small custom dropdown and server-side allowlist validation. New look IDs then do not require enum changes in every parent/version table. A native select is suitable for the rarely changing visual kinds.
- Each visual slot has distinct field names. For example, `menuPreviewType` (`automatic`, `media`, `streakField`) and `menuPreviewShader` accompany the existing `menuPreview` upload. Missing type means legacy resolution, including an existing explicit upload; explicit automatic means inherit even if an old upload remains stored.
- Editors control preset, integer seed, bounded speed/intensity multipliers, and pointer interaction. Start by visually testing speed 0–1 and intensity 0.5–1.25. These ranges are proposals, not verified art direction. Normalize null overrides to preset values.
- Code owns particle counts, DPR, segmentation, noise complexity, simulation, backend, and transitions. Never accept raw shader code, arbitrary props/import paths, or `force` from CMS data.
- Validate finite numeric inputs, ranges, preset membership, and conditional media requirements on the server. Hiding the upload with `admin.condition` does not make `required: true` conditional. Keep existing draft/publish rules.
- Persist a seed when a visual is authored, or derive it from stable document/block identity. Do not derive it from array order or randomize during rendering.
- Unsupported stored presets degrade to a known poster/background; editing reports the invalid preset. Removing a look requires a compatibility or content-update strategy.

Resolve once: defaults → named preset deltas → validated overrides → placement/device ceilings. Keep tuning in [presets.ts](../src/features/immersive/presets.ts), defaults beside the effect, and external effect imports through `@/features/immersive`. A small dependency-free ID/label/poster contract is appropriate; a general effect registry or second tuning provider would conflict with [immersive-effects.md](immersive-effects.md).

Use versioned look IDs plus an implementation revision for derivative invalidation. Changing shared defaults can change old IDs too; review all shipped looks when defaults change. Payload revisions do not version deployed TypeScript.

### Preserve the Content Hub boundary

Shader choices belong to website page/block presentation. Do not turn canonical client assets, logos, downloadable files, portraits, diagrams, or content-hub records into shaders. Keep `coverAsset` usable by existing non-website consumers.

Add an application-level discriminated visual union above `Media`; do not fabricate a Payload `Media` object containing shader data. Import document types from `@/payload-types` after generation. Keep server data resolution and poster rendering usable without the live runtime.

## Posters, loading, and failure behavior

Every shipped preset needs optimized static artwork, a stable aspect-ratio frame, and a theme-compatible CSS ground. Include light/dark variants where required by actual Section surface, not just the visitor's global theme. Code-owned poster assets let editors select a shader without uploading a photograph.

First-release preset stills represent the look; they are not exact renders of every entry's seed and overrides. An approved `posterMedia` image can override them. Reject video uploads for that field. If exact per-entry previews become necessary, add deterministic still generation in a later phase.

Use the existing optimized image/CDN path for media relationships and Next Image for static preset assets. Supply real `sizes`, dimensions or a reserved fill frame, and hero priority only for the actual first-paint visual. Preserve the current `VideoMedia` contract on media branches. Decorative shader visuals use empty alt text; meaningful adjacent content stays in the DOM.

The client slot can register eligibility without importing Three. Import the live module only when a supported slot is near/visible, admitted, motion is allowed, and its intro/transition is settled. Initial HTML and no-JavaScript rendering must contain the poster. A below-fold field cannot compete with the hero for shader compilation during cold load.

Use explicit states such as poster, preparing, live, suspended, failed. Readiness belongs to the normalized descriptor, slot generation, and renderer generation. Reveal only after a successful draw for that identity; a late callback from the previous seed, route, or lost context cannot reveal a blank buffer. Compilation alone is not first-frame readiness. Follow the useful source-keyed pattern in [useWebglMediaLayer](../src/features/immersive/use-webgl-media-layer.ts), but add failure and generation handling rather than treating its current callback as a full shader lifecycle.

| Condition | Required visible result and work |
| --- | --- |
| SSR, no JS, loading, slow initialization | Poster with stable layout; content and navigation work normally. |
| Reduced motion, explicit pause, no WebGL2, known software renderer | Poster; do not initialize the shader to render a still. A lightweight capability probe may be needed to identify the backend. |
| Unknown/masked renderer identity | Conservative policy plus measured runtime downgrade; missing renderer information is not proof of hardware acceleration. |
| Shader compile error, failed FBO, context/device loss | Restore poster, stop the failed work, dispose owned resources, suppress automatic retry loops. |
| Offscreen, hidden document, menu covering page, Ask covering preview | Zero simulation steps and zero draws for that field; release its admission. |
| Frozen time with no pointer/theme animation | Draw final updates once, then stop. |
| Missing or failed poster | CSS ground remains; no broken sizing, blank content region, or blocked route transition. |

Detect known software identifiers such as SwiftShader and llvmpipe when exposed, but do not reject all Mesa renderers: Mesa also supports hardware acceleration. Prefer actual initialization/failure signals and a bounded performance policy to renderer-name heuristics alone. The coarse-pointer check is a product fallback policy, not a battery measurement. Keep mobile poster-only initially unless real-device testing qualifies a live tier.

Provide a keyboard-accessible pause/resume control for sustained automatic motion, with reduced motion taking precedence. Runtime pause must stop work, not simply set speed to zero. Include its Storybook story. The need for a way to pause sustained automatic motion alongside other content is covered by [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

## Runtime prototype and decision gate

### Ownership

Reuse the persistent position occupied by [GlobalCanvasRoot](../src/components/GlobalCanvasRoot/index.tsx). Replace its eager import with a thin client owner and an actual dynamic import during the coordinated WebGL rework. Keep the owner outside route templates. Do not introduce another router, scroll library, or frame clock.

For the classic baseline, choose WebGL2 before renderer creation and keep that choice fixed for the document lifetime. Do not switch global backends every time a GLSL slot appears. Verify the existing `HighImpactHero`/`WebGlBackdropScene` and demo consumers against the choice. Any later backend change implements the same visual-slot contract and must justify its cost with measurements.

Separate `FieldScene` from the standalone demo wrapper. Slots register stable identity, DOM bounds, visual descriptor, visible/occluded state, and priority. Registration cleanup is idempotent and reference-counted; it cannot turn off other consumers. Scene persistence is explicit: retain only the admitted scene and any bounded prepared successor, not every visited route's scene.

Keep React for registration and coarse state changes. Frame time, pointer state, simulation, and interpolation remain refs/uniforms. A single scheduler owns advancement. If using the existing Tempus-driven `frameloop="never"` infrastructure, ensure a view renderer does not also trigger a second default pass. Paused views must skip `useFrame` simulation as well as their final draw.

### DOM placement is a pass/fail gate

Prototype the home background, a contained page hero (a Pages High-impact hero, and a Work hero as the scoped-media case), Stacked/fullMedia block inside a Section, and a settled menu-sized rectangle with hardcoded descriptors before adding CMS fields.

[Drei View](https://raw.githubusercontent.com/pmndrs/drei/master/docs/portals/view.mdx) tracks DOM rectangles and renders scissored regions in one canvas. It is a useful starting point, not a complete solution for this site's layering. Explicitly verify:

- Correct local resolution and pointer coordinates for the slot. `FieldScene` currently reads R3F size; ensure the shader receives the slot's dimensions rather than assuming canvas-wide size.
- Opaque Section backgrounds, foreground copy, sticky header/footer, menu overlays, rounded corners, nested clipping, pinned scroll frames, and aspect changes.
- The canvas's existing negative stacking position and named ViewTransition group. A shared canvas cannot automatically interleave arbitrary meshes between unrelated DOM layers.
- The field's simulation FBO pass while scissor/viewport state belongs to another view. Restore state on success and failure.
- Source/poster appearance, alpha composition, and clearing. A transparent live field over a detailed poster can double the artwork; use the CSS ground plus controlled poster/live replacement without a blank frame.

Keep animated masks, menu travelers, featured-work wipes, and Ask transitions on posters initially. Resume GPU drawing only when the corresponding frame is settled. Scissoring is rectangular; it does not reproduce arbitrary CSS clipping, rotation, filters, or border radius by itself.

Choose the shared implementation only after these cases pass and its cost is competitive with the hardened local baseline. If it fails, keep the same consumer contract with **one admitted local Streak canvas**, explicitly documenting unsupported live placements and the measured total context budget with existing effects. Do not ship a broken global layering workaround to satisfy a one-canvas slogan.

### Budgets and preparation

Starting experiment settings, to be calibrated rather than presented as measured capacity:

| Surface | Initial policy |
| --- | --- |
| Desktop hero | One active field; DPR up to 1.5; approximately 4,000–8,000 drift particles; one segment; two/three noise octaves. |
| Content block | DPR 1 where independently possible; approximately 1,000–4,000 particles scaled to area. |
| Cards, repeated entries, pinned work previews | Posters. |
| Menu | Posters in the initial release. A later settled preview trial starts around 500–1,500 particles and DPR 1. |
| Flow | Enable only after render-target support and its additional simulation pass pass the benchmark. Otherwise use its poster or an explicitly approved cheaper look. |
| Constrained/mobile/software | Poster initially. |

A shared scissor canvas has one DPR. It cannot give each view a separate backing resolution without additional offscreen rendering. Vary particle/complexity limits per placement and select the canvas-wide DPR deliberately. Grid density reductions must adjust pitch/distribution to cover the full frame, not truncate rows at the bottom.

Pause the page field while the menu covers it. Gate any retained lens/light-leak/gallery workloads where their actual visibility or transition ownership requires it. Track total contexts, backing-buffer size, and draw/simulation passes across all effects. Keep migration of unrelated effects out of this feature unless needed for the agreed runtime and budget.

Preparation is optional and bounded to one likely successor: descriptor resolution, chunk load, compile, and limited flow initialization. Use dwell/focus or committed navigation intent, deduplicate descriptors, cancel stale generations, and skip hidden/paused/Ask states. Route prefetch is not GPU preparation. Never delay navigation waiting for a shader. Preparing a second scene must not render it continuously or freeze the active one behind a global compilation counter.

Quality degradation uses hysteresis and deliberately changes DPR, geometry, simulation cadence, or admission. A 30 fps tier must throttle actual draws and simulation, not just update uniforms at half speed. Clamp resumed deltas and bound any simulation catch-up. [R3F's performance guide](https://raw.githubusercontent.com/pmndrs/react-three-fiber/master/docs/advanced/scaling-performance.mdx) distinguishes demand rendering, invalidation, and application-owned quality changes.

## Navigation, menu, and preview resolution

Retain the current navigation engine and motion constants. GPU rendering does not own route commits or scroll restoration.

1. Keep a real image/video element available to menu cloning and [heroHandoff](../src/Header/Menu/heroHandoff.ts). Shader selections provide an image poster. Canvas `cloneNode` does not copy its pixels.
2. Give the visual frame and its poster explicit, separate targeting if necessary. Some current hero wrappers use `display: contents`; choose a measurable inner frame rather than assuming `[data-hero-media]` always has useful bounds. Readiness waits on the actual poster element, with the existing timeout fallback.
3. Preserve ViewTransition naming and type gates, menu `suppressViewTransitions`, hero-landing cleanup, and [HeroBand](../src/heros/HeroBand.tsx) intro settlement. A live layer must not draw above a poster traveler or a captured source mid-transition.
4. In [getMenuContent](../src/Header/getMenuContent.ts), resolve shader selections to poster URL/MIME plus explicit handoff eligibility. An independent menu preview is hover-only. Only the destination's actual visual can claim hero handoff eligibility; index globals whose heroes are copy-only remain hover-only.
5. Preserve consumer-specific precedence. Menu work links currently use explicit `menuPreview`, then `hero.media`, then `coverAsset`. [resolveWorkEntry](../src/blocks/shared/resolve-work-entry.ts) uses cover then hero; [IndustryWork](../src/blocks/IndustryWork/Component.tsx) overrides that with `menuPreview`. Do not accidentally flatten these into one new global fallback chain.
6. Adapt `WorkEntry` with explicit preview visual metadata when needed, retaining media data for existing consumers. A shader hero alone should not silently replace a deliberately authored cover everywhere. Add independent preview selection when that rollout stage is implemented.
7. In a later live-menu phase, admission requires preview view, settled geometry, current intent, and no handoff. `chatView` changes revoke it before the Ask cover starts; returning from Ask waits for shrink/unwipe completion. Closing/aborting releases it. Preserve preview-click-to-close and Escape behavior.

Social metadata, feeds, and content exports still receive image URLs. Keep explicit SEO images first. A shader poster may be the image fallback where the existing fallback used hero imagery; never send shader descriptors to crawlers. Extend relevant query `select`, `defaultPopulate`, relationship depth, fixtures, and revalidation paths together. Draft live preview must not seed public menu/index caches.

### Optional continuous morphs

Same shader family does not imply compatible particle state. Paper inherits stateless rows and 20,000 particles; topography uses grid flow and 12,000. Seed/count/segments changes recreate attributes/geometry; flow also resets on composition changes. Noise selection is discrete.

Prototype two approved drift looks sharing seed, count, layout, segments, motion, noise algorithm, and quality tier. Allowlist continuous appearance uniforms such as color and brightness; preserve integrated time for speed changes. Do not interpolate seeds, topology, or arbitrary enum values. Lifetime, grid pitch, and phase-related controls need separate continuity work even though they are numeric.

Retarget an interrupted morph from current displayed values and ignore stale callbacks. Incompatible looks, changed seeds, back/forward without an owned scene, or failed preparation use poster transitions. Generic two-scene FBO compositing remains deferred until a specific design justifies its additional draws and memory.

## Implementation phases

Each phase ends with reviewable evidence and a recorded outcome here. A gate that fails narrows live rendering to posters or the measured fallback for the affected device/placement; it does not justify dropping first-paint or navigation requirements. If all qualified pilot devices remain poster-only, the live feature remains incomplete and the failing gate needs a concrete follow-up. Unrelated performance backlog items do not become new release prerequisites.

### Phase 0: align ownership and establish baseline

- Follow the September 13 roadmap decision: this work owns the Streak Field runtime changes. Recheck the current branch for overlapping work, then record baseline ownership and the shared-rendering experiment; do not reopen the superseded unspecified-replacement dependency.
- Use [performance-measurement.md](performance-measurement.md) for production/preview measurements, with `/`, Vault, and Adacore as controls. Add a shader fixture route/story for equal-size drift, topography, and paper comparisons.
- Record cold and warm loading, real-hardware frame behavior, context/draw counts, idle/hidden work, and software-WebGL fallback. Keep existing audit figures labeled historical.
- Fix the feature's scope and acceptance thresholds before optimization. No CMS schema is required in this phase.

**Exit:** a baseline report in `docs/perf/streak-field-baseline/`, selected ownership approach, and a documented hardware/browser matrix.

### Phase 1: visual contract and hardened scene

- Add dependency-free visual/preset metadata and a server-usable resolver; export supported feature APIs through the barrel without eagerly exporting a heavy runtime into lightweight clients.
- Add optimized preset posters and a `Visual` adapter with a lazy live slot; preserve the existing Media branch.
- Separate scene and demo canvas. Implement readiness/failure generations, initialization checks, optional flow resources, shader calculation reuse, and pause/visibility/input cleanup.
- Add stories for both media and shader choices, loading/failure/poster states, light/dark surfaces, reduced motion, and pause.

**Exit:** hardcoded shader visuals remain complete without JavaScript/GPU; failures reveal the poster; media-mode requests remain unchanged.

### Phase 2: shared-runtime prototype and backend decision

- Implement the coordinated loading boundary, registration ownership, and scheduler at the persistent root, with no second competing global runtime.
- Prove the four representative placements and renderer-state isolation described above. Measure against the hardened local baseline at equal appearance and resolution.
- Define bounded eviction/disposal, quality tiers, and total coexistence policy for existing GPU effects. Record shared-versus-local result; retain posters for unsupported placements.

**Exit:** selected implementation passes clipping, lifecycle, navigation, and performance gates. This phase can choose the bounded local delivery path without changing the CMS contract.

### Phase 3: CMS pilot and poster-compatible navigation

Pilot surfaces: Home hero, the Pages High and Medium impact heroes, the Pages menu preview, and the Stacked (`fullMedia`) composition block. Both Work Page hero layouts and the Work Page menu preview join the pilot as the constrained case (scoped asset libraries, case-study publish checks) so those guards are proven early, not because Work is the primary target. Menus and repeated previews use posters.

| Work | Existing integration points |
| --- | --- |
| Field factory and preset picker | `src/fields/`, `src/heros/config.ts`, `src/Home/hero/config.ts`, `src/fields/menuPreview.ts`, `src/blocks/full-media/config.ts`, `src/collections/WorkPages/index.ts` |
| Home | `src/Home/hero/index.tsx`, `HeroBackground.tsx`; preserve HeroBand intro gating and choose media/lens or shader explicitly. |
| Pages heroes | `src/heros/HighImpact/`, `src/heros/MediumImpact/`, `RenderHero`; the shader is the common case here, so the poster-first slot and HeroBand settlement are proven on these first. |
| Work heroes (constrained case) | `src/heros/caseStudyHeroFacts.ts`, `CaseStudyHeroLandscape.tsx`, `CaseStudyHeroCenteredMedia.tsx`; accept valid shader visuals even without a populated upload; keep the case-study media scoping. |
| Stacked block | `src/blocks/full-media/Component.tsx`, `FullMedia.tsx`, and `src/blocks/case-study/RenderCaseStudyBlocks.tsx`; update both generic and work adapters and retain `bare`/Section behavior. |
| Menu previews | `src/Header/getMenuContent.ts`, `src/Header/Menu/`; Pages first, then `src/blocks/shared/resolve-work-entry.ts` and `src/blocks/IndustryWork/Component.tsx` for the work consumers; keep precedence and transition eligibility explicit. |
| Publish checks | Shared field validation and nested Section/block traversal for every parent; `src/collections/WorkPages/hooks/validateWorkPage.ts` adds the case-study media approval and asset-library checks. |
| Freshness | Home/work/menu and dependent page/index revalidation; published-only queries, draft isolation, and media-depth/select coverage. |

The reused `fullMedia` schema is present under multiple parents and version tables. Even a narrow editor pilot can have broader schema impact. Do not generate a migration until the complete field/parent inventory is frozen.

Existing media-reference walkers will miss `shader.posterMedia` and some nested structures. Add explicit recursive collection of the new references where those blocks are supported. On the rare Work Page that uses the shader, uploaded posters must be public-approved and satisfy existing case-study asset-library rules. Built-in preset images are code assets, not a reason to waive the rest of Work Page publishing requirements. Include hidden but retained references according to the established policy rather than accidentally bypassing it.

**Exit:** old documents render as before; editors can draft/publish shader pilot surfaces; posters work through menu/hero handoffs; types/import maps and focused checks pass; the approved migration covers all added fields and versions.

### Phase 4: complete the approved surface rollout

Extend the same factory/resolver to SegmentHero, Lab Page heroes, PostHero, the Works and Insights index globals, the remaining menu-preview callers (Expertise, Who We Help, Contact Pages, the index globals), and supported composition blocks such as SplitContentNarrow and MediaContentSplit. These, with the Pages heroes from Phase 3, are where the shader is expected day to day. Copy-only hero types do not acquire a live visual implicitly.

Add explicit entry/card preview choices alongside existing cover uploads where needed. Update WorkEntry, lab/post cards, featured work, and their fixtures/query projections; keep repeated views static. Extend [LabPage validation](../src/collections/LabPages/hooks/validateLabPage.ts) and [Post media validation](../src/collections/Posts/hooks/validatePublicMedia.ts) before exposing poster uploads there. Check every additional block's generic, work, lab, and nested Section render paths.

Carousels, galleries, and the pinned featured-work presentation keep posters until their clipping and activation contracts are separately proven. Preserve Section/RevealSection, BlockGrid, typography, and `bare` composition. A shader source does not create a new full-viewport section.

**Exit:** a documented support matrix lists live, poster-only, and unsupported surfaces; all new visual UI has stories; every new schema slice has its own complete approved migration.

### Phase 5: optional authoring and motion improvements

Add one focused admin live preview, then an explicit Generate still action if exact entry artwork is needed. Generate from a fixed seed, known time/step history, aspect ratio, theme, and disabled pointer. Key derivatives by normalized config, implementation revision, and capture recipe; mark them stale after changes. Flow needs a reproducible history, not merely a seed. Do not block save/publish on GPU rendering or require a GPU in ordinary Next server rendering.

Upload through the normal authenticated media workflow. New admin endpoints use the repo's team-only `authenticated` access rule; Local API calls acting with a user set `overrideAccess: false`; nested hook calls pass `req` and loop guards. Capture from a controlled preview render, without permanently enabling drawing-buffer preservation on the public runtime.

Then evaluate settled live-menu previews, bounded successor preparation, and compatible drift morphs individually. None is a prerequisite for the CMS media alternative.

## WebGPU and vgpu decision

The existing GLSL effect is not compatible with `WebGPURenderer` simply because Three can internally fall back to WebGL2. The installed r182 renderer requires node materials/TSL for custom materials. [Three.js r182 guide](https://raw.githubusercontent.com/mrdoob/three.js/r182/manual/en/webgpurenderer.html)

If the agreed replacement uses TSL, port stateless drift first and benchmark it against optimized classic WebGL2. Verify WebGPU and the newer renderer's forced WebGL2 backend independently, with matching visual quality. Port flow only after a capability and simulation strategy is chosen; compute/storage features do not automatically have equivalent cross-backend behavior. Report the actual renderer backend rather than hiding it behind the current unchecked `WebGLRenderer` cast.

`vgpu/three` remains an optional shader-authoring experiment: its current documented adapter exposes pure WGSL functions to TSL while Three retains the renderer, resources, and loop. It is not a conversion of the existing GLSL material, and using it retains Three. A native vgpu renderer would be a separate runtime decision requiring fresh bundle, startup, fallback, and integration evidence. [vgpu Three integration](https://raw.githubusercontent.com/vercel-labs/vgpu/canary/docs/topics/threejs.docs.md)

Do not carry forward September 9 package-size/version claims as current measurements. Neither a WebGPU port nor a library swap is an established performance improvement for this site. Recheck Next/Turbopack and Storybook/Vite integration only if that experiment is selected.

## Acceptance and measurement

Use the repo's runbook on a production build deployed to the branch preview, and compare against the same baseline commit/fixtures. Dev/Storybook validates behavior and appearance, not CDN load performance. Preserve raw results and a concise verdict in `docs/perf/streak-field-<phase>/`.

| Check | Acceptance |
| --- | --- |
| First paint | HTML contains a correctly sized poster; no blank frame, no layout shift attributable to the visual, and no navigation wait for GPU readiness. |
| Bundle/network | No Streak runtime fetch on poster-only/no-motion paths. The coordinated runtime rework reaches the existing target of no Three chunk on a route that never activates any canvas; identify remaining effect import edges if it does not. No hidden legacy video request in shader mode. |
| Media controls | Existing priority hero, lazy loop, and carousel loading behavior passes current Media tests and the runbook's request checks. |
| Cold-path regression | Run three comparable captures and compare medians. Investigate shader-attributable LCP regression greater than 100 ms or TBT regression greater than 50 ms; these are proposed guardrails to calibrate against baseline variability, not claims of measurement precision. |
| Active animation | Record 30-second traces on the chosen real desktop GPU: p50/p95 frame intervals, dropped frames, main-thread work, draw/simulation counts, and actual backend. Target stable 60 fps in the normal tier; use an explicit 30 fps tier or poster when it cannot sustain the target. Record GPU timings when available separately from CPU timings. |
| Idle/occlusion | After settlement, hidden/offscreen/paused/covered field has zero simulation steps and zero draws. A stationary video lens must not keep repainting an undistorted overlay. |
| Resources | Repeat at least 20 route/menu/Ask cycles: registrations and live fields return to their expected baseline, owned resources are disposed, and renderer/resource counts plateau. Instrument actual contexts; do not infer them from visible canvas elements alone. |
| Quality | Density covers the entire grid at every tier; light/dark presets, alpha, crop, and poster-to-live changes remain acceptable. |
| Failure | Test no WebGL2, software renderer, chunk failure, shader failure, unsupported flow target, context loss, poster failure, hidden tab, and live reduced-motion changes. No loops or stuck overlays. |
| Navigation | Direct entry, normal links, modified clicks, back/forward, anchors, rapid navigation, IndustryWork takeover, menu handoff, menu close, and Ask enter/exit retain current behavior. |
| CMS | Legacy null fields, media→shader→media, invalid preset/seed/ranges, partial updates, nested blocks, unpopulated IDs, draft preview, publication approval, and cached menu/preview freshness behave correctly. |

Use frame and resource instrumentation without synchronous GPU readbacks in the animation path. Smaller backing buffers and explicit resource release are relevant principles from [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).

Implementation validation: `pnpm exec tsc --noEmit` after meaningful type/config changes; `pnpm generate:types` and `pnpm generate:importmap` after schema/admin work; focused `pnpm exec vitest run --config vitest.config.mts <affected-test-files>`; Storybook/browser checks for visual cases; production build and targeted Playwright navigation/failure checks. Add tests for resolver precedence, lifecycle ownership, validation, and existing transition regressions, not tests that merely repeat configuration literals. Do not run the local CI migration script to obtain a build.


## Implementation record (2026-09-13)

What shipped in code against this plan, phase by phase, and what each phase still owes.

### Phase 0: ownership and baseline

- Ownership: the Streak Field runs through **one admitted local classic WebGL2 canvas** per document, owned by the `StreakVisual` slot with a module-level, reference-counted admission registry (`src/features/immersive/visual/admission.ts`, ceiling 1, priority hero > block > menu > card). The shared-canvas prototype was not attempted; it stays a measured comparison against this baseline, and the consumer contract is unchanged either way.
- Root fixes shipped alongside: `GlobalCanvasRoot` is a real dynamic import boundary that mounts only once a route activates the global canvas, and the WebGL store's `isActive` boolean became a reference-counted lease (`acquireActive`).
- Baseline record: [`docs/perf/streak-field-baseline/README.md`](perf/streak-field-baseline/README.md). **Open:** production-preview captures, real-hardware traces, resource plateau across route/menu/Ask cycles.

### Phase 1: visual contract and hardened scene

- Light contract at `@/features/immersive/visual`: `STREAK_LOOKS` (`signal-v1`, `backdrop-v1`, `topography-v1`, `depth-map-v1`, each a delta-only preset), `resolveVisual` / `resolveMenuPreviewVisual` / `resolveStreakDescriptor`, `composeStreakTuning`, placement ceilings, rollout switch (`NEXT_PUBLIC_STREAK_LIVE=off` for poster-only), posters, capability probe, admission, motion preference. No Three import on that path.
- Scene split: `ui/streak-field-scene.tsx` (shared `FieldScene`), `ui/streak-field-tuning.ts` (props, defaults, `resolveStreakTuning`), `ui/streak-field.tsx` (demo and story owner, unchanged API), `ui/streak-field-runtime.tsx` (production owner: first-frame readiness per generation, `onShaderError`, `webglcontextlost`, `failIfMajorPerformanceCaveat`, flow-target check, frame watchdog with one step down then poster).
- Scene hardening: flow resources allocated only for `flow` looks and disposed; render target and scissor restored around the simulation pass; the vertex shader samples the field once per streak; grid density keeps full coverage when the count is capped (`coveragePitch`); pointer bounds refresh on scroll and resize; frozen fields run on demand and stop after their eases settle; hidden, covered, paused or offscreen slots run `frameloop="never"`, release their lease, and unmount after a short suspension.
- Posters: `public/images/streak-field/<look>-<surface>.webp` with alpha, rendered by `scripts/streak-field-posters.ts` from the `Immersive/StreakField/Posters` capture rig; both ground polarities ship and globals.css picks one by the nearest `[data-theme]` or `.band-dark`.
- Pause control: `VisualMotionToggle`, one document-wide switch kept for the session, hidden under reduced motion; placed in the hero copy layer where the field sits behind pointer-transparent chrome.
- Stories: `Immersive/StreakVisual` (hero, contained block, topography, dark band, uploaded poster, degraded preset, card placement, held by owner, editor adjusted), `Immersive/VisualMotionToggle`, plus Streak Field variants on the Stacked, Split narrow, Media split, Home hero and Case study hero stories.

### Phase 2: shared-runtime prototype and backend decision

- Decision: **bounded local delivery**, recorded above. Unsupported live placements: menu previews, cards, repeated and pinned work previews, carousels and galleries (all posters by `PLACEMENT_LIMITS`). Touch-first devices, reduced motion, software renderers and contexts without a renderable float target (for `flow` looks) stay on posters.
- **Open:** the four representative placements on a shared canvas, renderer-state isolation under scissoring, and the cost comparison. Nothing in the CMS contract changes if that experiment later wins.

### Phase 3 and Phase 4: CMS pilot and rollout

- Field factory `visualSlotFields(upload)` (`src/fields/visual.ts`): the existing upload (hidden once the shader is chosen; a previously `required` upload becomes required-unless-shader), `visualType`, and the `shader` group (`preset` text with `StreakLookSelect`, integer `seed` persisted on save when the shader is chosen, `speed` 0 to 1, `intensity` 0.5 to 1.25, `pointerInteraction`, image-only `posterMedia`). Applied to: Pages hero (High and Medium impact), Segment hero, Home hero, Lab Page hero, Post hero (`heroImage`, portrait frame, SEO image still the media fallback), the index globals' hero (shown for every hero type, upload not required: `heroField({ visualCondition, mediaRequired })`), `fullMedia`, `splitContentNarrow`, `mediaContentSplit` (every parent and version table), and the Work Page hero as the occasional case (poster picker scoped to the case study's libraries, blocks through `withCaseStudyScopedMedia`).
- Index pages: a Streak Field chosen on `works-index` or `insights-index` runs behind the whole listing through `IndexBackground` (`src/CollectionIndexes/IndexBackground.tsx`): an absolute, pointer-transparent layer whose sticky inner frame is one screen tall, so the canvas never grows with the list; placement `hero`; the pause control is fixed above the footer bar. The listing stays clickable and the field answers the window pointer. A media upload chosen there is menu-only; the index stays copy.
- Menu preview: `menuPreviewFields()` adds `menuPreviewType` (`automatic` | `media` | `streakField`) and `menuPreviewShader` beside the existing upload on Pages, Expertise and Who We Help pages, Contact Pages, the index globals and Work Pages. Missing type is legacy resolution; explicit automatic inherits even over a retained upload. Not added on Posts or Lab Pages: the menu never links them. Pages revalidation now purges the menu cache tag.
- Server resolution: `caseStudyHeroFacts`, `resolveWorkEntry` (now carries `visual`), `IndustryWork`, `WorksBrowse`, `getMenuContent` (posters only; `MenuMedia.lightUrl` carries the light-ground twin, `menuMediaUrl` picks at paint time), all through `resolveVisual`. Precedence per consumer is unchanged: menu `menuPreview` → hero → cover; work entries cover → hero; Industry work overrides with `menuPreview`. `getMenuContent` applies one rule (`previewOrOwn`) to every previewable destination: an independent preview is hover-only; the destination's own visual can hand off when the page mounts it. An index global's own visual hands off only as a Streak Field (the page mounts it as `[data-hero-media]`); `/posts` shares the Insights index's entry, so the docked window rests on the poster there instead of a page crop.
- Navigation: the poster is a real `<img>` inside `[data-hero-media]`, so the takeover menu clones it and the hero handoff lands on it. `findHeroMediaElement` prefers the first hero media element with a box (the theme hides the other poster twin) and falls back to the first match.
- Menu ground (2026-09-14): posters carry alpha, and the menu's dissolve layer has no ground, so a poster used to composite over the page crop or the media it replaced (a hover preview showed the current page's hero video through the still). `MenuMedia.ground` now names the ground a Streak poster is shown on: a hero's own visual takes its band's polarity (`HERO_BAND_THEME`, `src/heros/band-theme.ts`, the same constant `HeroBand` defaults to), and an independent preview or a hero without a band (Work Pages, the index globals) takes `site`, the visitor's theme at paint time. `menuMediaUrl` picks the twin drawn for that ground and `setMenuMediaGround` pins the element to it (`data-menu-media-ground` plus `data-theme`, so globals.css resolves `--background` from the site palette; no color is restated). The cloned hero poster (`cloneHeroSource`, now in `Menu/motion.ts`) drops its `data-visual-poster` theme gate, which hid a dark-band twin once it left the band under a light site theme (the window stayed on the page crop), and pins the polarity of the nearest `data-theme` ancestor instead.
- Publish checks: `collectVisualMediaRefs` (`src/fields/visual-refs.ts`) walks every `…media` field, `shader.posterMedia`, carousel slides and Section-nested blocks; the Lab and Work validators include hero and menu-preview shader posters; the Posts public-media gate includes `shader.posterMedia`. Retained uploads are still validated. Home revalidation now purges the menu cache tag.
- Authoring (2026-09-14): the `/demo/immersive` Streak Field copy button emits a look instead of a prop bag: a delta-only preset and its `STREAK_LOOKS` entry, named from the panel, with `surface` and `seed` excluded (`src/widgets/immersive-demo/ui/streak-look-snippet.ts`). Pasting both registers the look in the admin picker on every visual slot; posters and the revision bump remain manual.
- **Deliberately not done:** carousels, galleries, pinned featured work and cards stay posters; no admin live preview or Generate still action (Phase 5).

### Support matrix

| Surface | Live | Poster | Notes |
| --- | --- | --- | --- |
| Pages High/Medium impact, Segment hero, Home hero, Lab hero, Post hero | Yes (placement `hero`) | Yes | The everyday surfaces. Live waits for the hero intro to settle where a band plays one. |
| Work Page heroes (both layouts) | Yes (placement `hero`) | Yes | Occasional: case studies usually keep uploaded client media. Poster picker is scoped to the case study's libraries. |
| Works and Insights index pages (`IndexBackground`) | Yes (placement `hero`) | Yes | One-screen sticky frame behind the whole listing; listing stays clickable. |
| Stacked, Split narrow, Media split (top level or inside a Section) | Yes (placement `block`) | Yes | Dark bands pin the ground; Section-nested blocks read the ground at runtime. |
| Takeover menu previews and handoff traveler | No | Yes | Posters only; `hero` eligibility follows the destination's own visual. |
| Work entries, Industry work panels, Works browse rows, featured work | No | Yes | Placement `card`: no probe, no runtime chunk. |
| Carousels, galleries, media showcase | Not offered | Uploads only | Unchanged. |
| Reduced motion, coarse pointer, software renderer, no WebGL2, live switch off | No | Yes | The poster is the complete visual; nothing falls back to a retained upload. |

### Database

Migration `20260914_032613_streak_field_visuals` (regenerated 2026-09-14 after `menuPreviewType` gained `defaultValue: 'automatic'`) carries every schema change on the branch. The answer sheet below records the prompts it was generated with; regenerate it if the branch is rebased past a newer snapshot.

## Database, rollout, and rollback

The implementation adds columns only: `visual_type`, the `shader_*` group columns and `menu_preview_type` / `menu_preview_shader_*` on every parent listed above (`pages`, `posts`, `expertise_pages`, `audience_pages`, `home`, `lab_pages`, the index globals, `contact_pages` and `work_pages`), plus their `_v` version copies and the block tables under each parent. No table, block slug, `dbName` or upload column is renamed. Local development syncs through Drizzle push; a migration is required before CI can deploy and must be generated only after this branch is rebased on the newest snapshot.

During implementation, follow [AGENTS.md](../AGENTS.md) and [the database workflow](../README.md#database--migrations): dev push locally, regenerate types/import maps, request permission before `pnpm migrate:create`, and apply migrations only through CI. Never run `payload migrate` locally. Validate enum safety with `pnpm check:migrations` and snapshot ancestry with the existing drift workflow. Do not add fields after a migration without covering them in a newly reviewed snapshot/migration.

### migrate:create prompt answers

Run when regenerating (after rebasing on `main` and with approval): `pnpm migrate:create streak-field-visuals`

The design is additive, so `migrate:create` asks no create-or-rename questions: every generated column is new and every table already exists (the 2026-09-14 run asked none). If it does ask, answer as follows and investigate any prompt not listed here.

`menu_preview_type` is added with `DEFAULT 'automatic'`, which Postgres applies to every existing row. An explicit `automatic` ignores a stored upload, so the migration's hand-written backfill (kept in the same `up()`) sets rows that already carry a `menu_preview_id` to `media` on `work_pages`, `contact_pages`, `works_index`, `insights_index` and their `_v` tables: editors' existing picks keep previewing. Re-add that backfill whenever the migration is regenerated.

1. Any `visual_type` column (hero groups on `pages`, `home`, `lab_pages`, `works_index`, `insights_index`, the segment-page collections and `work_pages`; the document root on `posts` beside `hero_image_id`; the `*_full_media`, `*_split_narrow`, `*_media_split` block tables under every parent and Section; every `_v` version copy) — **create column**. New choice; the upload column beside it is untouched.
2. Any `shader_preset`, `shader_seed`, `shader_speed`, `shader_intensity`, `shader_pointer_interaction`, `shader_poster_media_id` column on the same tables — **create column**. No prior equivalent.
3. Any `menu_preview_type` column and `menu_preview_shader_*` columns on `contact_pages`, `works_index`, `insights_index`, `work_pages` and their version tables — **create column**. The existing `menu_preview_id` column stays. On `pages`, `expertise_pages` and `audience_pages` (and their `_v` tables) the whole slot is new: `menu_preview_id`, `menu_preview_type` and `menu_preview_shader_*` — **create column** each; nothing there is a rename.
4. Any `enum_*_visual_type` or `enum_*_menu_preview_type` enum — **create**. New enums; the migration must not `ALTER TYPE … ADD VALUE` an existing one.
5. Any prompt about a table being created or renamed — **investigate before answering**; this change creates no table and renames nothing. `hero.media`, `coverAsset`, `menuPreview`, `heroImage`, block slugs and `dbName` values are unchanged.

After generating: `pnpm check:migrations` and `pnpm check:migrations:drift`, review the `.ts` and `.json` together, and commit both.

Roll out behind a code-owned feature switch: poster-only mode first, then one live pilot surface, then qualified placements. Disabling live rendering must continue to display authored shader posters, not fall back to an unrelated retained video. Roll back runtime behavior without deleting schema fields or uploaded originals. Keep preset posters for stored IDs across rollback releases.

## Reference checks

Local source is the authority for integration details. The installed Next guides consulted were `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`, `02-guides/lazy-loading.md`, and `03-api-reference/03-file-conventions/layout.md`. They support the persistent-layout location and real client dynamic-import boundary used here.

Payload's [field overview](https://payloadcms.com/docs/fields/overview) supports separate validation, conditional admin display, and custom field components. The current code and repository rules determine publishing/access/migration requirements. External rendering guidance supports the techniques above; it does not establish this site's performance or replace the phase gates.
