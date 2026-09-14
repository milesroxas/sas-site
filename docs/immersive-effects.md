# Immersive effects

How the WebGL/shader effects are organized, tuned, and reused across the site — and the single-source-of-truth contract that keeps them DRY.

For shader *technique* (GLSL, raymarching, dispersion, motion physics), use the `creative-webgl-shaders` skill (`.agents/skills/creative-webgl-shaders`). This document covers the *project architecture* around those techniques.

For the Streak Field as CMS media (hero, preview and block slots), see the [Streak Field guide](streak-field.md) (every control, the shipped looks, editor fields, posters, best practices), the [implementation plan](streak-field-media-plan.md) and the [visual contract](#the-visual-contract-streak-field-as-media) below. Its CMS fields, resolver, poster-first slot and bounded local runtime are implemented; the shared-canvas prototype and hardware measurements remain open gates recorded in the plan.

## Where things live

| Layer | Path | Role |
|-------|------|------|
| Effect components | `src/features/immersive/ui/` | One file per effect. The only place effect code exists. |
| Public barrel | `src/features/immersive/index.ts` | The only import path consumers use: `@/features/immersive`. |
| Named presets | `src/features/immersive/presets.ts` | Shipped, named looks (e.g. `HERO_LENS`). |
| Scramble text | `src/shared/ui/scramble-text/` | DOM-only scramble effect; same defaults contract. |
| Visual contract (light) | `src/features/immersive/visual/` | Look ids, descriptors, resolvers, posters, placement policy, admission, the `StreakVisual` slot. Imported as `@/features/immersive/visual`; no Three. |
| Demo playgrounds | `src/widgets/immersive-demo/ui/` | Leva-driven demos at `/demo/immersive` ("Micro interactions"). Demo-only, never shipped UI. The `TextLoadIn*` playgrounds live in `src/widgets/transition-demo/ui/` on `/demo/transitions`. |
| Demo scaffolding | `src/shared/ui/demo-kit/` | `useDemoControls`, `useDemoSnippet`, paste guide, settings. |
| WebGL infrastructure | `src/lib/webgl/`, `src/lib/interactions/` | Canvas, tunnel, RAF, smooth scroll, `ImmersiveShell`. |

Current effects: `TextLoadIn`, `TextLoadInRaymarched`, `ChromaSplitText`, `DispersionMedia`, `RefractionMedia`, `FloatingCards`, `LightLeak`, `StreakField`, `ScrollGallery` (shipped by the `scrollGallery` block on work and lab pages), `WebGlBackdropScene`, plus `ScrambleText` in shared UI.

## The single-source-of-truth contract

Every tunable number exists in exactly one place. Three mechanisms enforce this:

### 1. `*_DEFAULTS` — one exported defaults object per effect

Each effect component exports its tunable defaults next to its props type:

```ts
export const TEXT_LOAD_IN_DEFAULTS = {
  threshold: 0.4,
  scrambleDuration: 1.1,
  // …every defaulted tunable prop
} as const satisfies Partial<TextLoadInProps>
```

- The component's destructured defaults read from it (`threshold = TEXT_LOAD_IN_DEFAULTS.threshold`).
- The playground's leva `value:`s read from it — a default change updates the demo automatically.
- Internal shader layers own their numbers: `RayMarchedHeading` and `RaymarchedSdfHeading` export their own `*_DEFAULTS`, and the wrapper components (`TextLoadIn`, `TextLoadInRaymarched`) reference those instead of restating them.

Control-flow props (`replayKey`, `visible`, `active`) and demo-only leva metadata (`min`/`max`/`step`/`label`) are **not** part of the contract — ranges are demo curation and stay in the playground.

### 2. `presets.ts` — named shipped looks, delta-only

A preset holds **only the props that differ from the component defaults**, never a full restatement:

```ts
export const HERO_LENS = {
  spread: 0.6,
  refraction: 0.5,
  // …only the delta from REFRACTION_MEDIA_DEFAULTS
} as const satisfies Partial<RefractionMediaProps>
```

Consumers spread it: `<RefractionMedia src={src} {...HERO_LENS} />`. Everything the preset doesn't set falls through to the component defaults, so there is nothing to keep "in lockstep".

### 3. The rule of two

- A tuning used in **one** place → inline props at the call site. Fine.
- The same tuning needed in a **second** place → promote it to a named preset in `presets.ts` and import it from both. Never copy a prop bag between files.

## Using an effect on a page

1. Dial in the look at [`/demo/immersive`](/demo/immersive) (text load-ins: [`/demo/transitions`](/demo/transitions)) — every parameter is wired to the GUI.
2. Copy the snippet (the copy button emits props in component units; the paste guide explains placement).
3. Import from the barrel and pass the props:

   ```tsx
   import { TextLoadIn } from '@/features/immersive'
   ```

4. Content (copy, media `src`, card layouts) always comes from the consumer — effects never own content.
5. If the tuning will ship, or a second usage appears: move the prop bag into `presets.ts` as a named preset (see rule of two).

**Never deep-import** `@/features/immersive/ui/…` from outside the feature. Two entries are public: `@/features/immersive` (the effects, heavy) and `@/features/immersive/visual` (the Streak Field visual contract, light). Payload config, server resolvers and validation import only the light one.

Effects handle their own fallbacks (`prefers-reduced-motion`, missing GPU, lost contexts render static/DOM fallbacks); consumers gate only on their own concerns (e.g. `useDeviceDetection().hasGPU` before mounting a heavy canvas, as `HeroBackground` does).

## Adding a new effect — checklist

1. Component in `src/features/immersive/ui/<name>.tsx`: props type, then `export const <NAME>_DEFAULTS … as const satisfies Partial<Props>`, destructure defaults from it.
2. If the effect wraps an internal shader layer, the layer exports its own `*_DEFAULTS` and the wrapper references them (see `text-load-in.tsx` ↔ `ray-marched-heading.tsx`).
3. Export component + props type + `*_DEFAULTS` from `src/features/immersive/index.ts`.
4. Playground in `src/widgets/immersive-demo/ui/<name>-playground.tsx`: leva `value:`s from the `*_DEFAULTS` import; ranges/labels chosen for the demo; `useDemoSnippet` emitting props in component units. Deliberate demo deviations from defaults stay literal with a `// demo-curated` comment.
5. Register the playground in `immersive-demo-page.tsx`.
6. Shader-technique review: follow the `creative-webgl-shaders` skill (memoized uniforms updated in `useFrame`, capped DPR, demand frameloop where possible, `prefers-reduced-motion` fallback).

## What not to do

- Don't restate a component default anywhere — not in a preset, not in a consumer, not in a playground.
- Don't build registries, config providers, HOCs, or theme systems around effect tuning. Props + exported objects are the whole mechanism.
- Don't merge effects with different techniques because they look related (`TextLoadIn`'s mip-blur smear vs `TextLoadInRaymarched`'s true SDF raymarch are intentionally separate).
- Don't put content (copy, media, layouts) inside effect components or presets.

## The visual contract: Streak Field as media

The Streak Field can stand in for a media upload on heroes (the post hero's portrait frame included), the index pages' ground, menu previews and the media blocks. The contract keeps art direction in Payload and everything else in code; the same three mechanisms above still hold.

- **Looks, not tuning.** Editors store a versioned look id (`signal-v1`, `backdrop-v1`, `topography-v1`, `depth-map-v1`) in a text field with a custom picker (`src/components/StreakLookSelect`). Each look maps to a delta-only preset in `presets.ts` (`STREAK_LOOKS` in `visual/looks.ts`). Adding a look is a new preset plus a table entry plus two posters; no enum, no migration.
- **Bounded per-entry adjustments.** `seed` (integer, persisted on save or derived from the document/block id), `speed` (0 to 1) and `intensity` (0.5 to 1.25) multiply the look, `pointerInteraction` toggles pointer terms, and an approved image upload can replace the look's poster. Ranges live in `visual/descriptor.ts` and are validated on the server (`src/fields/visual-validate.ts`).
- **One resolution.** `resolveVisual(slot)` turns `{ media, visualType, shader }` into a `Visual` union (`media` or `streakField`) at the server boundary. `composeStreakTuning` then folds defaults → look deltas → `STREAK_FIELD_PAPER` on a light ground → multipliers → placement ceilings (`visual/placement.ts`). Nothing restates a default.
- **Poster first.** `StreakVisual` renders a real `<img>` poster in the server HTML (`public/images/streak-field/<look>-<surface>.webp`, regenerated by `scripts/streak-field-posters.ts`) and imports `ui/streak-field-runtime.tsx` only once the slot is hydrated, near the viewport, visible, uncovered, allowed by policy, probed as hardware WebGL2 and admitted under the document ceiling (one live field). Failures (context, shader, context loss, unsupported flow target, sustained slow frames after one step down, chunk load) restore the poster and never retry.
- **Defaults still live beside the effect.** `STREAK_FIELD_DEFAULTS` and the props type moved to `ui/streak-field-tuning.ts` so the light entry can read them without Three; `ui/streak-field.tsx` re-exports them and the barrel is unchanged.
