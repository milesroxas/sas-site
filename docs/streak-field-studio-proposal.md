# Streak Field Studio proposal

Reviewed 2026-09-17. Proposal only: no runtime, CMS schema, or database changes.

Build Streak Field Studio inside Payload, registered through a local plugin. Give the team a visual editor, an organized look library, a Publish action, and reusable exports. Keep the existing renderer and its production admission policy. Run automatic image rendering in a separate worker.

## What the current implementation establishes

This review inspected source and repository performance guidance. It did not run a browser audit or produce new performance measurements.

| Finding | Evidence | Consequence |
| --- | --- | --- |
| The library is a deployed TypeScript registry with six looks. | `src/features/immersive/visual/looks.ts`, `src/components/StreakLookSelect/index.tsx` | A CMS record cannot introduce a new selectable look. |
| Authoring ends with copying code. | `src/widgets/immersive-demo/ui/streak-look-snippet.ts`, `docs/streak-field.md` | Publishing requires preset registration, posters, a revision bump, review, and deployment. |
| Page controls expose only look, seed, speed, intensity, pointer enablement, and poster override. | `src/fields/visual.ts`, `src/fields/visual-validate.ts` | Layout, color, relief, and motion design require the developer playground. |
| The playground and production have different budgets. | `streak-field-playground.tsx`, `visual/compose.ts`, `visual/placement.ts` | Playground settings include 20,000 particles, DPR 2, and up to 24 segments; a production hero caps particles at 8,000 and DPR at 1.5. The authored preview is not a production preview. |
| Look deltas inherit mutable shared defaults. | `visual/compose.ts`, `visual/looks.ts` | Payload history cannot restore the TypeScript defaults or renderer that originally produced a look. The global poster revision invalidates images but does not preserve historical rendering. |
| Poster capture uses a fixed wall-clock wait. | `scripts/streak-field-posters.ts`, `visual/streak-poster.stories.tsx` | The 2.5-second wait does not specify simulation time or frame count. Posters represent a generic look, not the page's seed and overrides. |
| Production already separates the poster and live runtime. | `visual/streak-visual.tsx`, `ui/streak-field-runtime.tsx` | Retain lazy imports, first-frame readiness, fallback behavior, and GPU leases. |
| Descriptors and menu handoff assume static IDs. | `visual/descriptor.ts`, `visual/streak-visual.tsx` | Replacing the picker alone would fail. Resolution, serialization, runtime identity, posters, and menu integration all need the release contract. |

The existing constraints were sensible for a code-curated library. The change is to move validated visual recipes into content while keeping resource allocation and runtime permissions in code.

## Why this shape

| Approach | Fit |
| --- | --- |
| Payload Studio plus local plugin and render worker | Recommended. Reuses team accounts, content APIs, database, asset storage, and publishing conventions. A custom editor can still provide a large canvas and focused controls. |
| Standalone editor backed by the same Payload service | Useful later if the studio needs its own product identity or serves other sites. Adds application deployment and session integration now without removing the need for the same content and release model. |
| Generic visual/shader SaaS | Requires evaluating renderer fidelity, export rights, embedding costs, and compatibility with the site's admission rules. Recreating this existing shader in another engine introduces unnecessary risk for this goal. |

Payload provides [custom views](https://payloadcms.com/docs/custom-components/custom-views), [drafts and version restoration](https://payloadcms.com/docs/versions/overview), [folders](https://payloadcms.com/docs/folders/overview), and a [jobs queue](https://payloadcms.com/docs/jobs-queue/overview). Release manifests, visual comparisons, render tasks, and usage tracking are custom work. Package the integration locally first; a distributable plugin is a later packaging decision.

## Team workflow

1. Open Assets > Streak Fields. Browse thumbnail cards or a table, search, and filter by folder, tags, author, draft/published state, and archived state. Use pagination; never animate every thumbnail.
2. Create a look from a built-in starter, duplicate an existing look, or start from the defaults. Assign a title, description, folder, tags, and a persistent composition seed.
3. Tune the look in a dedicated editor. Organize controls into composition, color, motion, relief, and interaction. Provide undo/redo, reset per group, seed randomization, pause, and restart. Autosave drafts without publishing them.
4. Switch between hero, block, menu, and poster previews, in light and dark, at representative aspect ratios. Preview one live canvas at a time. Show text overlays for checking legibility and the effective settings after production limits.
5. Click Publish. The application saves the chosen revision, validates it, generates the required images, and makes a complete release available to the team. Show progress and an actionable retry if rendering fails. The browser may close while the worker finishes.
6. In any supported page slot, choose the published look from a visual picker and publish the page through its existing workflow. Offer Create look and Edit source shortcuts that return to the originating slot.
7. Open Export to select a still, aspect ratio, pixel dimensions, light/dark treatment, and transparent or filled background. Download it or save it to Media for posters and marketing.

Publishing a look makes it reusable. It should not implicitly publish an unpublished page.

## Three data concepts

| Concept | Stores | Lifecycle |
| --- | --- | --- |
| Look (`streak-looks`) | Identity, organization, authorship, editable recipe deltas, seed, capture recipe, latest release reference | Native Payload `versions.drafts` and `_status`; autosave, duplicate, archive, restore draft, delete when unused. |
| Release (`streak-releases`) | Look ID, release number, source revision/hash, schema/defaults/renderer versions, immutable resolved recipe, poster manifest, publisher, timestamp | Created only through validated publication; immutable once promoted. Referenced releases survive draft history pruning. |
| Render task / export | Exact source hash or release ID, capture settings, requested dimensions, progress, result Media references, failure details | Retryable background work, separate from the look's draft/published state. |

Use native folders plus tags for organization. Add a Used by view that names the pages, globals, nested blocks, tabs, menu previews, and releases using an item. Maintain indexed usage references as content is saved; avoid scanning every document on each library request. Include retained page versions in deletion/retention policy so restoring a page cannot reference a deleted release.

Archive removes a look from new selections but keeps existing pages working. Allow deleting unused drafts. Block destructive deletion of referenced releases and their posters; offer replacement or archive. Duplicating makes a new identity with provenance. Restoring history opens an editable draft; publishing it creates a new release instead of rewriting history.

## Base settings and bounded editing

Keep one code-owned `STREAK_FIELD_DEFAULTS` and delta-only editable recipes. Built-in presets remain starters and a compatibility fallback. Team-created looks do not require new constants in `presets.ts`.

Introduce a shared, Three-free parameter specification used by the editor and server validator: types, valid values, finite numeric ranges, dependencies, and cost classification. Do not persist arbitrary `Partial<StreakFieldProps>` received from a client. Reject unknown keys, `force`, executable shaders, backend switches, and invalid combinations such as minimum length exceeding maximum length.

Editors can control color, layout, shape, spacing, length, relief, motion rate, seed, and pointer character within validated limits. Offer density/detail controls mapped to code-owned budgets. Motion modes and noise families can be available where their tested profile supports them. Do not expose unconstrained particle allocation, DPR, segments, octaves, or simulation settings.

The current policy caps count and DPR, but those caps alone are insufficient for arbitrary recipes. Before opening authoring to the team, define and measure an envelope for segments, noise complexity, simulation targets, and high-overdraw combinations such as dense long thick strokes. Apply final caps after every override. A watchdog remains a runtime fallback, not the only protection.

Resolve in this order:

`versioned defaults -> look deltas -> light-ground treatment -> bounded slot overrides -> runtime placement limits`

Show light mode after the existing paper treatment, which currently overrides parts of the chosen look. If independent light art direction is needed, introduce an explicit light-delta layer with the same validation; do not silently change the precedence.

A published release stores a generated resolved snapshot, including the light-ground result. This is a derived artifact for reproducibility, not another hand-maintained defaults source. Drafts retain their base version. Updating defaults must offer an explicit upgrade and comparison; it must not silently restyle published releases. This requires a deliberate update to the existing defaults/presets documentation.

Versioning numeric settings cannot freeze shader implementation. Record a renderer compatibility version and retain immutable versioned capture builds. The website supports a bounded set of runtime versions; unsupported releases show their preserved poster until explicitly upgraded. Never promise that a renderer version string alone reproduces old pixels.

## What Publish means

One user action coordinates several asynchronous steps:

1. Save the draft and capture its exact revision/hash. Check team access and validate a complete recipe.
2. Queue an idempotent task keyed by source hash, renderer version, and export profile. Rendering happens outside the database transaction.
3. Generate both light and dark web posters and a thumbnail from the same immutable recipe. Validate dimensions, successful drawing, alpha handling, file integrity, and required asset metadata. A legitimately sparse or empty artistic frame must not fail merely for being dark.
4. Upload outputs under immutable keys and verify that required assets are accessible. Honor Media's approval/channel rules. Generated staging assets should not become anonymously discoverable drafts; use private staging where confidentiality matters, then promote delivery assets.
5. In a short transaction, create/promote the complete release and publish that exact look revision. Only move the latest-release reference if the publication request is still current. A later edit remains a draft, and an older worker completion cannot overwrite a newer publish.
6. Invalidate the library cache and any consumers explicitly following the latest release. Retry cache notification failures through durable job state after commit.

Payload publish, restore, REST, GraphQL, and Local API paths must enforce the same release requirements. Replacing the Publish button without server enforcement is insufficient. Keep `_status` as the content publish state; job progress is separate operational state.

On failure, the previous release and website remain usable. Bound retries and expose retry/cancel. Record `createdBy`, `updatedBy`, and `publishedBy` explicitly for reliable authorship. Reuse `authenticated` from `src/access/authenticated.ts`, including custom endpoints and version reads. The current Users collection has no roles, so do not invent an existing admin/editor distinction. Add roles only if the product later needs separate publishing permission.

For user-scoped Local API operations, pass `user` and `overrideAccess: false`. Pass `req` through nested hook operations and use context guards. Give the worker narrowly scoped internal authorization. The existing general jobs endpoint accepts any `req.user`; do not reuse that assumption for privileged release publication or expose worker access through MCP keys.

## Website selection and updates

Default page selections to an immutable release: selecting Technical B2B v3 keeps that page on v3. Publishing v4 immediately makes v4 selectable across the team, and the slot shows Update available. Provide a CMS action to apply an update to selected pages, with an affected-page preview and existing page publishing rules.

An optional Follow latest published setting can update designated brand-wide placements automatically. This must be an explicit choice with visible impact, dependency-aware revalidation, and rollback. Implement pinned releases first. Neither choice requires GitHub for normal authoring.

Add a release relationship alongside the legacy `shader.preset` field and retain the legacy resolver during rollout. Preserve current page seeds, multipliers, pointers, and poster overrides. For new selections, inherit the look seed by default; make a slot seed override explicit so selecting a look reproduces the composition the author chose.

Batch-load required releases at the server boundary, deduplicate IDs, and cache by immutable release ID/hash. Keep pure descriptor composition after loading; avoid one database request per block or a browser request for the whole library. Resolve draft previews only for authorized users and outside public caches. Publish checks must reject unavailable releases and unapproved required assets.

Pass a small validated rendering descriptor to the existing Visual adapter. Include release identity and compact poster references in the menu handoff contract. Update serializer/parser validation and generation keys to include release hash; otherwise a same-look update can retain stale runtime readiness. Preserve the poster inside `[data-hero-media]` and the current theme/ground behavior.

## Snapshot and export design

Offer two clearly labeled outputs:

- Website poster: optimized WebP, alpha, light/dark variants, initially preserving the current 1600 x 900 profile. Allow placement/aspect variants where measured visual differences justify them.
- Artwork: PNG for transparent/lossless output, JPEG or WebP with a chosen background, common social/presentation sizes, and custom dimensions within worker limits. Save to Media with source release, seed, frame/time, renderer version, dimensions, and color/background metadata.

An exact capture recipe includes logical viewport, output scale, seed, fixed simulation timestep, frame number, surface, placement/profile, and pointer state or replay. The renderer currently integrates frame deltas and flow history, so seed plus elapsed wall time is insufficient. Add controlled stepping to the shared scene, reset simulation, advance a fixed number of frames, and capture after draw completion. Default pointer input to neutral. A capture of the currently visible interactive frame can be offered separately; replaying its pointer history at another resolution is additional work.

Separate logical canvas dimensions from output pixels. Simply resizing from 1600 x 900 to 3840 x 2160 changes this shader's CSS-pixel layout and density. Render the same logical composition at a higher output scale for faithful high-resolution artwork.

Keep all capture-only readback and encoding out of the public animation path. Retain `preserveDrawingBuffer: false` for website rendering. Reuse `FieldScene` in an isolated worker capture harness, not the deployed Storybook application. Playwright/Chromium and Sharp already provide a starting point; a container worker can run queued tasks with explicit concurrency, memory, duration, and pixel limits. Prove required export sizes on that worker before offering them in the UI.

Fixed stepping improves repeatability but does not guarantee bit-identical pixels across GPU drivers. Retain generated files as the authoritative published artifacts. Software Chromium is suitable to evaluate for export generation, not for claiming real-device frame-rate performance. High-resolution export cost is confined to the worker and never raises website rendering limits.

Generic library posters still cannot exactly match every arbitrary slot crop or override. Label them honestly. Offer Generate poster for this placement using the slot's effective release, seed, overrides, and crop, then attach it through the existing poster override flow. Invalidate that match when those inputs change.

## Performance contract and acceptance

Preserve the current placement limits without raising them:

| Placement | Particle cap | DPR cap | Behavior |
| --- | --- | --- | --- |
| Hero | 8,000 | 1.5 | Live when admitted, flow and pointer permitted |
| Block | 4,000 | 1 | Live when admitted, flow and pointer permitted |
| Settled menu window | 1,000 | 2 | Live when admitted, no pointer |
| Card / repeated preview | 0 | 1 | Poster only |

Keep one admitted Streak Field per document within the shared three-context GPU budget. Preserve reduced-motion and coarse-pointer behavior, capability/float-target gates, pause, viewport/visibility/occlusion handling, first-frame readiness, resource disposal, and the existing downgrade-then-poster watchdog. No studio controls, export code, or whole-library data enter public route bundles.

These limits are documented starting budgets, not proof every combination sustains 60 fps. Before release, use `docs/performance-measurement.md` and `docs/streak-field-media-plan.md`:

- Compare three cold-load captures and medians on the same production preview and fixtures. Investigate shader-attributable LCP regression over 100 ms or TBT over 50 ms, accounting for baseline noise.
- Capture 30-second traces on real target desktop GPUs, including representative costly allowed recipes. Target stable 60 fps and record p50/p95 intervals, dropped frames, draw/simulation counts, and actual backend.
- Verify poster HTML, no visual layout shift, no runtime fetch on poster-only paths, no retained video fetch, and no navigation wait for GPU readiness.
- Verify zero draws/simulation when hidden, covered, paused, or offscreen after settling. Repeat at least 20 route/menu/Ask cycles and confirm actual context/resource counts plateau.
- Exercise failed render jobs, concurrent edits/publishes, stale worker completion, version restore, deleted/archived references, invalid recipe inputs, authorized draft preview, and cache freshness.
- Exercise light/dark, poster-to-live matching, unsupported renderer releases, context/chunk failures, reduced motion, menu cloning, and nested tab/block consumers.

Measure the envelope when the renderer or limits change. Routine look publishing runs validation and artifact checks; it should not require an engineer to perform a full benchmark for every color adjustment. A render-worker timing or an author's local FPS reading is diagnostic, not universal device certification.

## Delivery sequence

1. Prove the two highest-risk pieces: deterministic capture through the existing scene, and validated data recipes through the current production adapter without extra public bundle cost. Establish the allowed performance envelope.
2. Build the local plugin, look collection, custom editor, organized library, drafts/history, immutable releases, background poster generation, and pinned-release picker. This is the first complete workflow: create, experiment, publish, select, version, archive, and export without developer intervention.
3. Add usage views and safe bulk replacement, placement-specific capture, expanded export profiles, and optional follow-latest updates. Add richer visual history comparisons if they prove useful.
4. Consider a standalone frontend or distributable plugin only when another site or a distinct audience needs it. Keep the same recipe and release APIs.

Import the six shipped looks as initial immutable releases, preserving legacy IDs and existing behavior. Do not mass-rewrite page selections in the first rollout. Cut over consumers incrementally, including menu and social resolution, with fixture coverage. Follow repository barrel, Section/BlockGrid, typography, and Storybook conventions where applicable; admin-only UI is exempt from the mandatory story rule, but shared renderer behavior still needs visual fixtures.

Implementation requires schema work and a one-time deployment. After that, publishing recipes and exports needs no source change or redeployment. New shader capabilities and changes to the performance envelope remain engineering work.

No schema was changed by this proposal, so no migration or create/rename prompts exist for this review. During implementation, request approval before generating a migration, regenerate types/import maps as required, and provide an answer sheet based on the actual schema diff.
