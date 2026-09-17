# Streak Field guide

The Streak Field is the site's signature WebGL effect and its only shader that doubles as **CMS media**: an editor can pick it instead of an image or video on a hero, an index page, or a media block.

This is the practical guide: what every control does to the picture, how the pieces fit together, and the rules that keep it fast and legible.

- Roadmap, phase gates, measurement acceptance and the migration answer sheet live in [streak-field-media-plan.md](streak-field-media-plan.md). That plan governs the work; this guide describes what shipped.
- The defaults/presets contract that all immersive effects share is in [immersive-effects.md](immersive-effects.md).
- Shader technique (GLSL, noise, flow fields) is the `creative-webgl-shaders` skill.

## Contents

- [The two faces](#the-two-faces)
- [Quick start](#quick-start)
- [Control reference](#control-reference)
- [Shipped looks](#shipped-looks)
- [Editor controls (Payload)](#editor-controls-payload)
- [How a visual resolves](#how-a-visual-resolves)
- [Placement policy and admission](#placement-policy-and-admission)
- [Lifecycle: poster, live, failure](#lifecycle-poster-live-failure)
- [Posters](#posters)
- [Best practices](#best-practices)
- [Tuning workflow](#tuning-workflow)
- [Adding a look](#adding-a-look)
- [Troubleshooting](#troubleshooting)

## The two faces

| Face | Entry | Who uses it |
|------|-------|-------------|
| **Effect component** | `StreakField` from `@/features/immersive` | Demos, stories, one-off page art. Owns its own canvas, takes the full props bag. |
| **CMS visual** | `StreakVisual` / `Visual` from `@/features/immersive/visual` and `@/components/Visual` | Shipped pages. Poster first, look ids only, code-owned ceilings. |

The light entry (`@/features/immersive/visual`) imports no Three, so Payload config, server resolvers, validation hooks and the menu resolver can read it. Only `StreakVisual` reaches the runtime chunk, and only after every gate passes.

| Layer | File |
|-------|------|
| Props, defaults, `resolveStreakTuning` | `src/features/immersive/ui/streak-field-tuning.ts` |
| GLSL | `src/features/immersive/ui/streak-field-shader.ts` |
| Shared scene (`FieldScene`) | `src/features/immersive/ui/streak-field-scene.tsx` |
| Demo/story owner (own canvas) | `src/features/immersive/ui/streak-field.tsx` |
| Production owner (gated canvas) | `src/features/immersive/ui/streak-field-runtime.tsx` |
| Looks, descriptor, compose, placement, admission, capability, posters | `src/features/immersive/visual/` |
| Payload field factory | `src/fields/visual.ts`, `src/fields/visual-validate.ts` |
| Admin look picker | `src/components/StreakLookSelect/` |
| Poster capture script | `scripts/streak-field-posters.ts` |
| Playground and its look formatter | `src/widgets/immersive-demo/ui/streak-field-playground.tsx`, `streak-look-snippet.ts` at `/demo/immersive` |

## Quick start

**Editor.** On a hero or a supported block, set **Visual** to `Streak Field`, pick a **Look**, save. A seed is assigned on save. Optionally set speed, intensity, pointer response, or an approved poster image. The media upload can stay in place: it is kept but neither fetched nor shown.

**Developer, shipped page.** Resolve at the server boundary, render through `Visual`:

```tsx
import { resolveVisual } from '@/features/immersive/visual'
import { Visual } from '@/components/Visual'

const visual = resolveVisual(hero, { seedKey: doc.id })
// …
{visual && <Visual visual={visual} placement="hero" priority fill sizes="100vw" />}
```

**Developer, one-off art or a story.** Use the effect directly, deltas only:

```tsx
import { StreakField, STREAK_FIELD_BACKDROP } from '@/features/immersive'

<StreakField {...STREAK_FIELD_BACKDROP} surface="dark" />
```

## Control reference

Every knob is defaulted in `STREAK_FIELD_DEFAULTS` and documented on `StreakFieldProps`. Pass deltas only; anything you do not pass falls through. The tables below say what each control changes about the picture and what it interacts with.

### Canvas

| Control | Default | What it does |
|---------|---------|--------------|
| `count` | 20000 | Streaks alive in the buffer. One draw call regardless, so this is density and fill rate, not CPU. On `grid` it caps how many cells fill; the scene widens both pitches (`coveragePitch`) so the frame stays covered instead of rows truncating at the bottom. |
| `dpr` | 2 | Device-pixel-ratio cap. Streaks are a pixel or two thick, so 2 keeps them crisp and 1 makes them mushy. The single biggest fill-rate lever after `count`. |
| `seed` | 694 | Seeds the per-streak hashes. Same seed, same composition, every load. |
| `segments` | 1 | Quads per streak. 1 is a rigid dash. Raise it only when a streak must visibly bend along the flow; it costs vertices, not draw calls. |
| `surface` | `dark` | The ground. Over `dark` the streaks add light (`ink`); over `light` they are ink (`paperInk`). |
| `surfaceEase` | 15.5 | Crossfade rate per second when `surface` flips. The DOM ground usually snaps, so keep this short. |

### Layout

| Control | Default | What it does |
|---------|---------|--------------|
| `layout` | `rows` | `rows` scatters streaks along their rows at random phases (the tape look). `grid` pins instance `i` to cell `i` of a row and column grid (the tick-plot look). |
| `shape` | `dash` | `dash` is a streak `thickness` high and `minLength`..`maxLength` long that bends with the field. `dot` is a disc: the length knobs become its diameter, `thickness` is unused, `cap` softens the rim, and it stays rigid. |
| `columnPitch` | 4 | Horizontal cell spacing in CSS px. `grid` only. |
| `rowPitch` | 4 | Vertical row spacing in CSS px. Together with `count` this sets apparent density. |
| `rowJitter` | 0 | How far a streak may sit off its row, as a fraction of the pitch. 0 is a strict grid, above 0 loosens it toward a scatter. |
| `thickness` | 2.8 | Streak height in CSS px. |
| `minLength` / `maxLength` | 4 / 7 | Length range in CSS px. Equal values give a uniform tick field where orientation, not length, carries the shape. |
| `lengthBias` | 6 | Length distribution. 1 is uniform; higher skews the population toward short ticks with a few long ones. |

### Motion

| Control | Default | What it does |
|---------|---------|--------------|
| `motion` | `drift` | `drift` slides streaks along their rows while the field morphs under them: stateless, deterministic, no simulation pass. `flow` advects particles through the field on the GPU, so ticks stream out along the flow and respawn at their layout position when their life ends. `flow` allocates render targets and needs a renderable float target. |
| `flowSpeed` | 40 | `flow` only. Speed along the field direction in CSS px/s. |
| `drift` | 4 | Speed along the rows in CSS px/s. Negative creeps left, 0 holds still. Under `flow` it acts as a wind on top of the advection. |
| `driftSpread` | 0 | Per-streak speed variance, 0..1. Above 0 the field stops moving as one sheet. |
| `timeScale` | 1.2 | Playback rate for everything time-driven, advection included. 0 freezes the field; with no pointer terms the runtime then draws on demand and stops. |

### Flow field

The noise both displaces the field and supplies the height the relief reads. That second job runs even when `noiseStrength` is 0, which is exactly what the default look does: no displacement, but a slow fbm height map lighting the rows.

| Control | Default | What it does |
|---------|---------|--------------|
| `noise` | `fbm` | Formula. `none` keeps streaks on their rows (no displacement, no relief, no orientation). `value` is a boxy lattice drift, `simplex` a smooth isotropic one, `fbm` adds octaves of detail, `ridged` creases the field into seams, `curl` takes the curl of an fbm potential (a divergence-free swirl that runs along contours), `gradient` its slope (straight up the hill). |
| `noiseScale` | 1080 | Size of one feature in CSS px. Larger is a broader, slower swell; smaller is busier chop. |
| `noiseStrength` | 0 | How far the field may push a point, in CSS px. 0 means the noise only shades and orients, never displaces. |
| `noiseSpeed` | 0.08 | How fast the field evolves, in noise units per second. 0 freezes its shape (streaks may still drift through it). |
| `noiseOctaves` | 3 | Detail octaves for `fbm`, `ridged`, `curl`, 1..6. More is finer and costlier. |
| `noiseGain` | 0.5 | Amplitude ratio between octaves, 0..1. Higher is rougher. |
| `noiseAxis` | 0.5 | Which way the displacement acts, 0..1. 0 bends rows up and down only, 1 bunches streaks along their rows only, 0.5 does both. |
| `orient` | 0 | How far each dash turns to face the field direction at its centre, 0..1. 0 stays on the row, 1 is a full tick plot. With `curl` the ticks follow contours; with `gradient` they climb. Values between read as a lean, so the rows are still legible. |

### Relief

Relief is what makes the field read as lit terrain rather than noise. It reads the noise potential as height.

| Control | Default | What it does |
|---------|---------|--------------|
| `relief` | 0.73 | How much height shades brightness, 0..1. 0 ignores height entirely. |
| `reliefFloor` | 0.42 | Height below which ground goes dark, 0..1. Raise it and only the crests survive out of black. |
| `reliefContrast` | 1.65 | Exponent on the shade. 1 is linear; higher pushes light onto the peaks and empties the mid-slopes. |
| `reliefLength` | 0.82 | How much height scales length, 0..1. Low ground shrinks to a dot, so altitude reads as size as well as brightness. |

### Pointer

Pointer terms only run where the placement allows them and the editor enabled them. `pointerRadius: 0` turns every term off and lets the scene skip its listeners.

| Control | Default | What it does |
|---------|---------|--------------|
| `pointerRadius` | 420 | Reach of the influence in CSS px. 0 is off. |
| `pointerPush` | 0 | Radial displacement in CSS px. Negative pulls the field inward. |
| `pointerSwirl` | 0 | Tangential displacement: a vortex around the cursor. |
| `pointerWake` | 0.19 | Displacement along the pointer's own motion, in seconds of its velocity (0.04 moves the field 40 px at 1000 px/s). Capped at the radius. This is what makes a flick read as a shove. |
| `pointerAgitate` | 4.2 | Extra flow amplitude under the pointer, as a multiple of `noiseStrength`. Does nothing when `noiseStrength` is 0. |
| `pointerGlow` | 2.15 | Extra brightness under the pointer, as a multiple of the streak's own. |
| `pointerLift` | 0.25 | Height added to the relief under the pointer, -1..1. Negative digs a hollow. |
| `pointerEase` | 3 | How fast the field's pointer follows the real one, per second. Lower is lazier and heavier. |

### Life

| Control | Default | What it does |
|---------|---------|--------------|
| `lifetime` | 11.4 | Seconds a streak lives before fading and being reborn elsewhere on its row (in its cell, under `flow`). |
| `lifeSpread` | 0.62 | Per-streak lifetime variance, 0..1. Keeps the field from breathing in unison. Push it up whenever the whole field visibly pulses. |
| `fadeIn` / `fadeOut` | 0.05 / 0.09 | Fraction of the life spent fading in and out. |

### Look

| Control | Default | What it does |
|---------|---------|--------------|
| `ink` | `[0.518, 0.655, 1]` | Streak colour over a dark ground. Emissive: it only ever adds light. |
| `paperInk` | `[0.31, 0.361, 0.502]` | Streak colour over a light ground. |
| `brightness` | 1.18 | Overall intensity. Over dark it is brightness; over light it is coverage. |
| `brightnessSpread` | 0.51 | Per-streak brightness range, 0..1. 0 is a flat field; 1 lets streaks go fully dim, which is what gives depth. |
| `flicker` | 0.31 | Depth of the per-streak shimmer, 0..1. Reads as signal over dark and as print noise over light, so paper looks run it lower. |
| `flickerRate` | 0.7 | Shimmer rate in Hz. |
| `tail` | 0.42 | How much a streak fades head to tail. 0 is a flat dash. |
| `cap` | 2 | Softening at each end, in CSS px. On `dot` it softens the rim. |

### Control-flow props (not tuning)

`force` (mount despite low-power or reduced-motion flags, demos and stories only) and `className` are not part of the defaults contract. Neither are leva ranges: min/max/step are demo curation and stay in the playground.

## Shipped looks

Looks are stable versioned ids stored as text (`src/features/immersive/visual/looks.ts`). Each maps to a delta-only preset in `src/features/immersive/presets.ts`. Adding one is a preset plus a table entry plus two posters. No enum, no migration.

| Id | Label | Motion | What it is |
|----|-------|--------|-----------|
| `signal-v1` | Signal | drift | The defaults as shipped: a fine tick grid lit by a slow fbm relief, creeping right. No displacement, no orientation, all shape from relief. |
| `backdrop-v1` | Quiet backdrop | drift | `STREAK_FIELD_BACKDROP`: 900 streaks, 18 px rows, a slow leftward creep, shimmer down. Built for copy to sit on. |
| `topography-v1` | Topography | flow | `STREAK_FIELD_TOPOGRAPHY`: a 12000-tick grid streaming along `curl` contours, full `orient`, relief at 1 with a low floor. Ridges read as lit relief, valleys fall into black. |
| `depth-map-v1` | Depth map | flow | `STREAK_FIELD_DEPTH_MAP`: the same grid leaning up the slope (`gradient`, `orient` 0.6), broader noise, high floor, so only crests surface as one soft form. |
| `technical-lines-v1` | Technical Lines | drift | `STREAK_FIELD_TECHNICAL_LINES`: thin, long strokes in a cooler blue. A sparse schematic overlay, not a tick grid. |
| `technical-b2b-v1` | Technical B2B | flow | `STREAK_FIELD_TECHNICAL_B2B`: a sparse grid of bent dashes streaming along a simplex field, fully oriented, cyan on dark. |

`STREAK_FIELD_PAPER` is not a look. It is the light-ground delta (denser stroke, less shimmer) that `composeStreakTuning` folds in automatically whenever the ground is light.

`STREAK_LOOK_REVISION` versions rendered derivatives. Bump it when a shared default or a shipped look changes, then regenerate posters: Payload revisions version content, not deployed TypeScript.

## Editor controls (Payload)

`visualSlotFields(upload)` wraps an existing upload into a slot. Field names are identical on every parent, so one resolver reads them all, and the upload keeps its name and relation.

Where it is used: mostly on pages without media of their own, so Pages (High and Medium impact, Segment), Home, Lab Pages, Posts, the Works and Insights index globals, the Expertise, Who We Help and Contact menu previews, the Stacked, Split narrow and Media split blocks on those pages, and every tab of the Tabs and Audience tabs blocks (each tab row is its own slot, resolved per row by `resolveRowVisuals`, `src/blocks/shared/row-visuals.ts`; only the active tab's field is live). Work Pages carry the same slot but rarely use it: a case study normally keeps its uploaded client media. Work-only rules below are edge-case guards.

| Field | Type | Rules |
|-------|------|-------|
| `visualType` | select: `media` / `streakField` | Empty keeps legacy media behavior. `streakField` wins over a retained upload; that upload is hidden, not deleted, and never fetched or mounted. |
| `shader.preset` | text with `StreakLookSelect` | Must be a shipped look id. Required once the shader is chosen. An unknown stored id degrades to `signal-v1` **poster only**: rendering never guesses a live look. |
| `shader.seed` | integer 0..2147483647 | Assigned on save when empty. Same seed, same composition. Never derived from array order. |
| `shader.speed` | 0..1 | Multiplies the look's `timeScale`. 0 freezes the field. Empty is the look as shipped. |
| `shader.intensity` | 0.5..1.25 | Multiplies the look's `brightness`. Empty is the look as shipped. |
| `shader.pointerInteraction` | checkbox | Honored only where the placement allows pointer terms and the field runs live. |
| `shader.posterMedia` | upload, images only | Replaces the built-in poster. Video uploads are refused server side. Picker is the site media library; on Work Pages only, it is scoped to the case study's libraries. |

Menu previews use a parallel slot: `menuPreviewType` (`automatic` / `media` / `streakField`) plus `menuPreviewShader`, beside the existing `menuPreview` upload. Missing type is legacy resolution; explicit `automatic` inherits the destination's own visual even when an old upload is still stored.

Ranges and membership are validated on the server (`src/fields/visual-validate.ts`), not only hidden by `admin.condition`. A `required` upload becomes required-unless-shader, because hiding a field does not relax `required`.

Code owns what editors never see: particle counts, DPR, segments, noise complexity, simulation, backend, transitions. Raw shader code, arbitrary props and `force` are never accepted from CMS data.

## How a visual resolves

Server boundary, once:

```
resolveVisual(slot) -> Visual = { kind: 'media', media } | { kind: 'streakField', descriptor }
```

Then, in the client slot:

```
STREAK_FIELD_DEFAULTS
  -> look deltas (STREAK_LOOKS[id].tuning)
  -> STREAK_FIELD_PAPER          (only when the ground is light)
  -> editor multipliers          (timeScale * speed, brightness * intensity, pointerRadius or 0)
  -> placement ceilings          (count capped, dpr capped, pointer and flow allowed or not)
```

That is `composeStreakTuning`. Nothing along the chain restates a default, and ceilings only ever lower a look, never raise it.

The ground polarity is read from the DOM: the nearest `[data-theme]` or `.band-dark` ancestor, falling back to the site theme (`useGroundSurface`). A Section band can therefore pin a dark field on a light page.

Precedence per consumer is deliberately not flattened: the menu uses `menuPreview` then hero then cover, work entries use cover then hero, Industry Work overrides with `menuPreview`.

## Placement policy and admission

`PLACEMENT_LIMITS` (`visual/placement.ts`) is the code-owned budget. These are calibrated starting values from the plan, not measured capacity.

| Placement | Live | DPR cap | Count cap | Flow | Pointer |
|-----------|------|---------|-----------|------|---------|
| `hero` | yes | 1.5 | 8000 | yes | yes |
| `block` | yes | 1 | 4000 | yes | yes |
| `menu` | yes (the docked window at rest) | 2 | 1000 | yes | no |
| `card` | no | 1 | 0 | no | no |

- **One live field per document** (`STREAK_LIVE_CEILING`), inside the document GPU budget shared with every other canvas (`src/lib/webgl/gpu-budget.ts`: `GPU_LIVE_CEILING` contexts in total across Streak Fields, lenses, the footer leak, galleries and the global backdrop). Slots hold a reference-counted `streak` lease (`useStreakLease`) ranked hero > block > menu > card on the shared `GPU_PRIORITY` scale; a hero field outranks a work lens, a block field ties with one and yields to an earlier arrival, and both outrank the leak. Release is idempotent, so a stale cleanup can never switch another slot off. `<html data-gpu-leases data-gpu-admitted data-gpu-contexts>` shows the live numbers.
- **One step down, then the poster.** A frame watchdog (two consecutive slow 90-frame windows averaging worse than 40 fps) drops to `degradedLimits`: half the particles at DPR 1. A second trip fails to the poster. There is no step back up.
- **Grid coverage is preserved when count is capped.** `coveragePitch` widens both pitches rather than truncating rows.
- `NEXT_PUBLIC_STREAK_LIVE=off` turns live rendering off for a deployment. Posters still render; nothing falls back to a retained upload.

### Support matrix

| Surface | Live | Poster |
|---------|------|--------|
| Pages High/Medium impact, Segment hero, Home hero, Lab hero, Post hero | yes (`hero`) | yes |
| Work Page heroes, both layouts (occasional; case studies usually keep client media) | yes (`hero`) | yes |
| Works and Insights index pages (`IndexBackground`, one-screen sticky frame behind the listing) | yes (`hero`) | yes |
| Stacked (`fullMedia`), Split narrow, Media split, top level or inside a Section | yes (`block`) | yes |
| Takeover menu docked window, resting on a page whose hero is a Streak Field (`Menu/LiveVisual`) | yes (`menu`) | yes |
| Takeover menu hover previews and the handoff traveler | no | yes |
| Work entries, Industry Work panels, Works browse rows, featured work | no | yes |
| Carousels, galleries, media showcase | not offered | uploads only |
| Reduced motion, coarse pointer, software renderer, no WebGL2, live switch off | no | yes |

## Lifecycle: poster, live, failure

`StreakVisual` exposes its state as `data-visual-status`, which is also what stories and tests assert on.

```
poster -> preparing -> live -> suspended -> poster
                  \-> failed (never retries)
```

A live field is admitted only when **all** of these hold: hydrated, placement allows live, descriptor not degraded, no `prefers-reduced-motion`, not paused, not a coarse-pointer device, WebGL2 probe passed without a software renderer, a renderable float target for `flow` looks, near the viewport, document visible, page not covered by the menu (the menu's own window skips this gate), the owner's `active` (hero intros hold it; the menu holds its window until the dock has settled and nothing is over it), and a lease under the ceiling.

- The server HTML always contains a real `<img>` poster in a stable frame. That is what the takeover menu clones and what the hero handoff lands on. A canvas `cloneNode` copies no pixels, so the poster is load bearing, not decoration.
- Reveal happens on the **first drawn frame of the current generation**. A late callback from a previous seed, route or lost context cannot reveal a blank buffer.
- Suspension parks the canvas at `frameloop="never"` and releases the lease. After 8s the poster fades back and the canvas unmounts.
- Failures (`context`, `shader`, `context-lost`, `flow-unsupported`, `performance`, `chunk`) restore the poster and stop. No retry loops, ever.
- `context-lost` means the browser took the context from a running field. R3F tears every unmounted canvas down with `forceContextLoss()` about 500ms later, which logs `THREE.WebGLRenderer: Context Lost.` in the console; the runtime's `ContextGuard` (shared with every other effect, `src/lib/webgl/components/context-guard`) is removed with the tree at unmount, so a release or a route change is never reported as a failure. That log line on its own is teardown, not a GPU reset. The other effects fall back the same way on a real loss: see [immersive-effects.md](immersive-effects.md#contexts-the-document-budget-and-real-loss).
- `VisualMotionToggle` is the document-wide pause (WCAG 2.2.2). It stops work and releases leases; it does not set speed to zero. It is kept for the session and hidden under reduced motion.

## Posters

- Files: `public/images/streak-field/<look>-<surface>.webp` at 1600x900, one per look and ground polarity.
- **They carry alpha.** The CSS ground beneath (a Section band, the hero's `bg-background`) supplies the colour, so the still composites exactly as the live field does. A menu preview paints `MENU_MEDIA_GROUND` under it for the same reason.
- Both twins ship. `globals.css` ("Visual posters") shows one based on the nearest `[data-theme]` or `.band-dark`, so the server HTML already carries the right still and the menu finds one visible image.
- Regenerate after changing a look, a shared default, or the poster size, then bump `STREAK_LOOK_REVISION` (the `?v=` query keys the optimizer cache):

```bash
pnpm storybook -p 6106                                            # another terminal
pnpm exec tsx scripts/streak-field-posters.ts --base http://localhost:6106
```

Headless Chromium renders through SwiftShader. Slow, but it runs the same program.

- A preset poster represents the **look**, not any one entry's seed. When an editor needs exact artwork, they upload one to `shader.posterMedia`.

## Best practices

**Tuning**

- Never restate a default. Not in a preset, not at a call site, not in the playground.
- One usage, inline props. A second usage, promote it to a named preset in `presets.ts` and import it from both. That is the rule of two.
- Deltas only in `STREAK_LOOKS[...].tuning`, and remember that changing a shared default changes every shipped look. Review them all, regenerate posters, bump the revision.

**Performance**

- Reach for `count` and `dpr` first; they dominate. `segments` above 1 and `noiseOctaves` above 3 are the next costs.
- `flow` adds a simulation pass and render targets. Use it only where the look needs particles to leave their cells, and expect it to degrade to a poster on contexts with no renderable float target.
- Do not raise a placement ceiling to make a look work. Re-tune the look.
- Frozen fields (`timeScale` 0, no pointer terms) should stay frozen: the runtime already runs them on demand and stops after the eases settle.

**Composition and legibility**

- Copy sits over the field, so check contrast at the busiest frame, not at rest. `backdrop-v1` exists for exactly this.
- Pair the ground, do not fight it: let a Section band pin polarity, and let `composeStreakTuning` fold in `STREAK_FIELD_PAPER` rather than hand-tuning a second light look.
- Equal `minLength` and `maxLength` when orientation is the subject; a wide range plus high `lengthBias` when texture is.
- Raise `lifeSpread` whenever the field visibly breathes in unison.

**Integration**

- Resolve once, on the server, with `resolveVisual`. Never re-resolve in a client component.
- Always pass a stable `seedKey` (document or block id). Never an array index: reordering must not reshuffle the field.
- The poster `<img>` must stay inside `[data-hero-media]` for the menu clone and hero handoff. Do not replace it with the canvas.
- The slot root carries `data-visual-descriptor` (`serializeStreakDescriptor`). The takeover menu reads it off the cloned hero to run the same field in its docked window; keep it on the root of anything that renders a Streak Field as hero media.
- Blocks keep the [Section spacing contract](blocks-reorg-roadmap.md): a shader source does not create a full-viewport section and never writes its own `py-*`.
- New media references need `collectVisualMediaRefs` coverage (`src/fields/visual-refs.ts`) so publish checks and revalidation see `shader.posterMedia`.
- Every new visual UI ships a Storybook story, including the poster, failure and light/dark cases.
- `force` is stories and demos only. The `Visual` adapter does not forward it, and CMS data can never reach it.

## Tuning workflow

1. Open `/demo/immersive` and dial the look in. Every parameter is wired to the GUI; the window's own light/dark button switches the ground.
2. Name it in the **Ship as look** folder (the picker label; the id `<slug>-v1` and the const `STREAK_FIELD_<SLUG>` are derived) and give it its one-line picker description.
3. Copy. The clipboard holds two blocks, each headed by the file it belongs in: a delta-only preset for `presets.ts` (only what differs from `STREAK_FIELD_DEFAULTS`; `surface` and `seed` never come along, the page ground and the CMS entry own those) and its `STREAK_LOOKS` entry for `visual/looks.ts`, with `motion` set from the panel. The paste guide lists the steps.
4. Paste both, then write the preset's comment: the art direction, not only the numbers.
5. Regenerate posters and bump `STREAK_LOOK_REVISION`. The look is now in the Look picker on every visual slot.
6. Verify against a running dev server, not only Storybook: composed Tailwind class strings and theme gates behave differently there.

The demo's `streak-look-snippet.ts` is the formatter; `formatStreakLookSnippet` is unit tested so the emitted shape tracks the `StreakLook` type.

## Adding a look

The playground's copy button emits steps 1 and 2 ready to paste (see [Tuning workflow](#tuning-workflow)).

1. Preset in `src/features/immersive/presets.ts`, deltas only, with a comment.
2. Entry in `STREAK_LOOKS` (`visual/looks.ts`): stable versioned id (`name-v1`), label, one-line description for the picker, and `motion` set to `drift` or `flow` so the runtime can gate float-target support.
3. Both posters, then bump `STREAK_LOOK_REVISION`.
4. Story coverage for the new look on dark and light grounds.
5. No migration. The id is text and the allowlist is code.

Removing a look is a **content** change: keep its id, entry and posters until every stored document has been updated.

## Troubleshooting

| Symptom | Cause and fix |
|---------|---------------|
| Poster shows, canvas never mounts | Check `data-visual-status`. `poster` means a gate is unmet: placement, reduced motion, coarse pointer, offscreen, covered by the menu, or another slot holds the only lease. |
| `THREE.WebGLRenderer: Context Lost.` in the console with no `failed` slot | Routine: R3F force-loses the context of every unmounted canvas (footer light leak scroll gate, an 8s release, a route change). Only a slot whose status is `failed` with `data-visual-failure="context-lost"` is a real loss. Read `<html data-gpu-contexts>` for the contexts that exist right now. |
| Slot stays `poster` while another canvas is live | The document budget is full (`data-gpu-admitted` equals `GPU_LIVE_CEILING`) or another Streak Field holds the one `streak` slot. A hero field outranks everything but an earlier hero lens; a block field yields to the page's media. It mounts once a slot frees. |
| `data-visual-status="failed"` | Read `data-visual-failure`: `context` (no WebGL2 or a performance caveat), `shader`, `context-lost`, `flow-unsupported` (no renderable float target for a `flow` look), `performance` (watchdog gave up), `chunk` (runtime failed to load). |
| Field runs, then drops back to a still | The frame watchdog stepped down and then failed. Lower the look's `count`, `dpr` or octaves rather than raising the ceiling. |
| Grid truncates at the bottom | Something bypassed `coveragePitch`. Grid density must widen pitch when `count` is capped, not drop rows. |
| Wrong ground, poster looks washed out or doubled | The ground is read from the nearest `[data-theme]` / `.band-dark`. Posters carry alpha, so a missing CSS ground shows as a pale or doubled image. |
| Menu preview shows a page crop instead of the still | The poster is not inside `[data-hero-media]`, or the cloned element was theme gated away. See the menu ground notes in the [plan](streak-field-media-plan.md#implementation-record-2026-09-13). |
| Menu window rests on the still, never runs the field | Check the slot inside `[data-menu-live-visual]`: no slot means the hero's `data-visual-descriptor` was missing or unparsable; status `poster` means a gate (reduced motion, coarse pointer, software renderer) or the menu holding `active` (still docking, a hover preview, the Ask transcript). Faint, sub-pixel streaks mean the host lost its counter-scale (`fitToWindow`, `trackWindowScale` in Menu/index.tsx). |
| Look changed but the site still shows the old still | Posters not regenerated, or `STREAK_LOOK_REVISION` not bumped. |
| Editor picked a look but it renders static everywhere | The stored preset is not a shipped id, so the descriptor is `degraded`: poster only by design. Fix the stored value. |

## Related

- [streak-field-media-plan.md](streak-field-media-plan.md) - the governing plan: phases, gates, support matrix, migration answer sheet.
- [immersive-effects.md](immersive-effects.md) - the defaults/presets contract shared by every effect.
- [performance-audit-work-pages.md](performance-audit-work-pages.md) and [performance-measurement.md](performance-measurement.md) - capture runbook for the open measurement gates.
- [animations.md](animations.md) - reveals and route transitions the field has to coexist with.
- `docs/perf/streak-field-baseline/README.md` - the baseline record.
