# Studio effects

The Studio plugin (`src/plugins/streak-studio`) authors more than one effect. This is the contract that makes that possible, how a slot chooses between effects, and how to add the next one. The editorial workflow is in [streak-field-studio.md](streak-field-studio.md); it is the same for every effect.

## Where an effect lives

An effect is stated once, in parts that each have one owner:

| Part | Owner | Imports Three |
|------|-------|---------------|
| Defaults and the props type | `features/immersive/ui/<effect>-tuning.ts` | no |
| Shipped looks (delta-only) | `features/immersive/presets.ts` | no |
| Authoring contract: parameters, looks, faces, limits, slot capabilities | `features/immersive/studio/effects/<effect>.ts` | no |
| The registry: ids in editor order | `features/immersive/studio/effects/index.ts` | no |
| Capture and stage scenes | `features/immersive/studio/scenes.tsx` | yes |
| Site slot (poster first) | `features/immersive/visual/<effect>-visual.tsx` | lazily |
| Inspector copy: labels, meanings, dependencies | `plugins/streak-studio/components/copy/<effect>.ts` | no |

The contract (`EffectContract` in `studio/effect.ts`) points at the defaults and presets; it never restates a number. The recipe engine (`studio/recipe.ts`), the release parser (`studio/release.ts`), capture, the stage, the Inspector, the picker and the server validation all take a contract and know no parameter by name.

This is a closed authoring contract, not a tuning provider. [immersive-effects.md](immersive-effects.md) still holds: tuning lives once in `*_DEFAULTS`, shipped looks are delta-only presets, and nothing wraps an effect's props in a provider or a theme system.

## What a contract declares

- `parameters`: the authorable subset of the defaults, each a range, options, a colour, a vector or a toggle, in a group. Anything absent is code-owned (the Streak Field's `dpr`, the leak's `samples`). Options may name `derived` values a resolved tuning can hold and no author can choose.
- `face(tuning, surface)`: the tuning for a ground, from the tuning authored on the dark one.
- `limit(tuning, placement)`: code-owned ceilings. Idempotent, holds both ends, and runs before anything is drawn, so the release parser does not restate ceilings.
- `check`: rules that span parameters (the Streak Field's minimum and maximum length).
- `blend`: only for an effect that draws an opaque frame. The canvas and every poster are composited with it.
- `slot`: which per-entry controls a visual slot offers (`seed`, `bleed`, `media`, `hover`).
- `looks`, `fallbackLook`, `lookRevision`, `posterDirectory`: shipped looks and their stills.

A snapshot carries the contract's `renderer`, so a look is only ever read against the effect it is filed under. Streak Field snapshots are byte-identical to what they were before the contract existed, so published looks kept their identity.

## Choosing an effect in a slot

`visualType` is a select: Media upload, then the effects that slot's renderer can draw. A slot rendered through the `Visual` adapter inside a `Section` offers all of them (`blockVisualSlotFields`: split content, full media, feature tabs, media and content split). A hero drawn through the adapter offers all of them too (`heroVisualSlotFields`: page, segment, work and lab heroes), without the bleed control: a hero has no block root to wash across, so the effect stays in the hero's frame. A slot with a bespoke renderer names the ones it handles; the home hero, post hero, index grounds, audience tabs and menu previews offer the Streak Field only.

The `shader` group is shared. `shader.studio` holds a Studio look of either effect, so hydration, usage, the publish guard and the poster guard are effect-blind. The picker lists looks filed under the slot's effect, and the server refuses a published page whose slot holds a look of another effect. `shader.preset` holds a shipped look id, validated against the chosen effect's looks.

A Studio look's `effect` is chosen on the stage and is open until the look is first published, then fixed. Changing it starts the draft over.

## Light and dark faces

Every effect has two faces (`face(tuning, surface)`), and a slot draws the one for the ground it lands on. `surface="auto"` reads the nearest `[data-theme]` or `.band-dark` ancestor, else the visitor's site theme (`useGroundSurface`), and re-reads when the theme flips; the poster pair is gated the same way in CSS (globals.css, "Visual posters"), so the server HTML is already right. A hero band that pins a palette is a ground like any other: the effect follows the band, not the visitor.

`shader.surface` ("Appearance") pins one use instead: Follow the visitor's theme (`auto`, the default), Always light, Always dark. The resolver carries it as `descriptor.surface` (`Surface | null`), and it outranks the `surface` a call site passes. Who honors it:

| Where the effect sits | What a pin does |
|-----------------------|-----------------|
| A frame the slot owns (block slots, cards, menu previews) | The slot stamps `data-theme` on its frame and paints `bg-background`, so the face sits on the ground it was drawn for whatever band is around it. |
| Under a hero's copy (`resolveOpening`) | The opening returns the pin as `surface` and the band takes it: `HeroBand theme={surface ?? ...}`, or `pinnedOpening(surface, className)` on a hero with no band. Copy and fixed chrome follow through the one `theme` prop. |
| A bleeding light leak | Never pinned (`resolveLeakDescriptor` drops it, the control hides): the block's band is its ground, and the block's own theme select decides it. |
| An index ground (`IndexBackground`) | Not offered (`visualThemed: false`): the listing over it paints in the visitor's theme. The column stays so the group is one shape. |

The takeover menu previews a pinned effect on the pinned ground (`menuVisual`), and the docked window reads it off the slot's own `data-theme`.

## Light leak

Authored the same way as a Streak Field: Studio look or shipped look (Film, Amber), speed and intensity on a shipped look, pointer, poster override. It has no seed.

Five slot controls are its own:

| Field | Default | Does |
|-------|---------|------|
| `shader.bleed` | off | Off, the leak is clipped to the media frame. On, it leaves the frame and washes across the whole block, edge to edge of the browser. Not offered in a hero. |
| `shader.origin` | top right | The corner the light enters from, of the frame or, bleeding, of the block. A mirror of the authored field; no second set of numbers. |
| `shader.showMedia` | off | Off, the leak fills the frame on its own. On, the slot's media upload shows under it. |
| `shader.hoverTargets` | the look's | What a full flare answers inside the band: links and buttons, or only elements marked in code. Shown once `pointerInteraction` is on. |
| `shader.sectionHover` | the look's | 0 to 1: how far the pointer merely crossing the band flares the leak. 0 waits for a target. |

**Hover is scoped to a band.** The leak listens inside the nearest element marked `data-leak-scope`, else the positioned ancestor it was placed to fill. `VISUAL_HOST` carries the marker, so every `Section` is a band already, and `HeroBand` spreads it, so an opening answers its own hero. A link in the block above never reaches a leak in the block below, and two leaks on one page answer their own content only.

Three things can excite it, strongest first: an element marked `leakExcite()`, which is also how a subtree opts *out* (`leakExcite(false)`, or `data-leak-excite="off"`); every link and button in the band, when `exciteTargets` is `interactive` (the default, so an opening's calls to action need no wiring); and the pointer crossing the band at all, at `sectionExcite` of a full flare (0 by default). One value reaches the shader, so every flare knob — bloom, gain, colour, split, slat count — scales with it.

Touch is not hover: a tap fires `pointerover` with no `pointerout` to answer it, so touch events are ignored outright and the flare stays a mouse and pen affordance.

`pointerInteraction` is the master switch: off, the scene binds no listeners at all, and the look's hover knobs stay intact for whoever turns it back on. A placement that does not honor the pointer (`PLACEMENT_LIMITS`: menu, card) turns the whole flare off in `limit`.

**Blending.** The leak draws an opaque frame and meets its ground through `mix-blend-mode`. A blend stops at the first ancestor that fades, transforms or clips, and an opaque frame blended over nothing is a black box, so the leak always sits in a stacking context that paints a real ground. Contained, the frame paints `bg-background` and isolates. Bleeding, the layer is portaled onto the nearest block root that spreads `VISUAL_HOST` (`Section`), which becomes the layer's containing block and blend group while it holds one (globals.css, "Visual bleed"). A slot with no such root stays contained; the work-page reveal shell is one, because `ScrollReveal` owns its root.

**The paper face is derived.** The author tunes light over a dark ground. On a light ground a knob they never touched takes the shipped `LIGHT_LEAK_PAPER` value, so an untouched leak is exactly the footer's paper look. A knob they did touch carries over: art direction (tints, blooms, slats) as authored, polarity strengths (gain, dispersion, grain, hover) scaled by the ratio the paper look applies to the default and held to the parameter's range. The blend is always the paper one.

**Cost.** `samples` is the lever: the field is evaluated `samples * 6` times per pixel and the count is a compile-time constant. It is set per placement (`LEAK_PLACEMENT_LIMITS`: hero 6, block 4, menu and card 2) at DPR 1. A slot's leak holds a `leak` lease on the document GPU budget at the placement's priority, above the footer's decorative leak.

## Adding an effect

1. Split the effect's defaults and props into a three-free `ui/<effect>-tuning.ts` and export its scene with injectable input, `fixedDelta` and `onFirstFrame`. Integrate time (`t += dt * timeScale`); never multiply elapsed time by a knob an editor can drag.
2. Write `studio/effects/<effect>.ts` and add it to `EFFECTS`.
3. Add its `Capture` and `Live` scenes to `studio/scenes.tsx`.
4. Write the site slot on `useLiveVisual` and `VisualPosterStack`, add the kind to the `Visual` union, a branch in `resolveVisual`, and one in the `Visual` adapter.
5. Write its Inspector copy and add it to `EFFECT_COPY`. The record is exhaustive over the contract's parameter keys, so a missing row does not compile.
6. Render its posters: `pnpm exec tsx scripts/visual-posters.ts --effect <id>`, and add `/images/<posterDirectory>/**` to `images.localPatterns` in `next.config.ts`. Without it the optimizer answers the poster with 400 in production, and the poster is what every touch device sees.
7. Story the slot and the Studio preview. The contract tests in `studio/effects/light-leak.test.ts` run over every registered effect.
8. Ask for a migration: a new `visualType` and `effect` value is `ALTER TYPE ... ADD VALUE` on each enum, additive, and must not be used in the same `up()`.
9. Nothing to do for MCP: the recipe's tool schema (`studio/recipe-schema.ts`) reads its parameter table out of `EFFECTS`, so an agent drafting a look sees the new effect's names and ranges on the next deploy. Run `pnpm generate:types` so `payload-types.ts` carries the same text. See [mcp.md](mcp.md).
