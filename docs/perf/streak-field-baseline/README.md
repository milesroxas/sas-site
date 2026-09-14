# Streak Field baseline (Phase 0 and Phase 2 record)

Status: partial. Recorded 2026-09-13 with the implementation of `docs/streak-field-media-plan.md`. Everything below that is a number was produced on the implementing machine's tooling, not on the hardware matrix the plan asks for; the hardware, production-preview and 30-second trace measurements remain open.

## Ownership decision

The Streak Field renders through **one admitted local classic WebGL2 canvas per document**, owned by the `StreakVisual` slot, with a module-level admission registry (`src/features/immersive/visual/admission.ts`, ceiling `STREAK_LIVE_CEILING = 1`). The shared-canvas prototype at the persistent root was **not** attempted: the plan makes it a measured comparison against this baseline, and no equal-appearance measurement exists yet. The consumer contract (`Visual`, `StreakVisual`, the descriptor) is the same either way, so a later shared implementation replaces the runtime module, not the CMS or the slots.

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
| Live lifecycle | Storybook `ForcedLifecycle` story (`admission="force"`, stories only) in headed Chrome on the implementing Mac's GPU, driven by Playwright | `poster → preparing → live`; the runtime chunk loads only then; the pause control moves the slot to `suspended` and back; a hidden document suspends it. |
| Poster twins | Storybook stories under both toolbar themes and on a dark hero band | Only the matching ground's still has a box; the hidden twin stays unloaded until the theme reveals it. |

## Not measured (open gates)

- Cold and warm load on the production preview with `/`, Vault and Adacore as controls (`docs/performance-measurement.md`).
- Real-hardware 30-second traces: p50/p95 frame intervals, dropped frames, draw and simulation counts, GPU timings.
- Context, backing-buffer and resource plateau across 20 route/menu/Ask cycles.
- The shared-canvas prototype's four placements and its cost against this baseline.

Until those land, the live tier is admitted only on desktop hardware WebGL2 with a fine pointer, at the placement ceilings in `src/features/immersive/visual/placement.ts`, with the frame watchdog stepping to the degraded tier and then to the poster.
