# Immersive effects

How the WebGL/shader effects are organized, tuned, and reused across the site — and the single-source-of-truth contract that keeps them DRY.

For shader *technique* (GLSL, raymarching, dispersion, motion physics), use the `creative-webgl-shaders` skill (`.agents/skills/creative-webgl-shaders`). This document covers the *project architecture* around those techniques.

## Where things live

| Layer | Path | Role |
|-------|------|------|
| Effect components | `src/features/immersive/ui/` | One file per effect. The only place effect code exists. |
| Public barrel | `src/features/immersive/index.ts` | The only import path consumers use: `@/features/immersive`. |
| Named presets | `src/features/immersive/presets.ts` | Shipped, named looks (e.g. `HERO_LENS`). |
| Scramble text | `src/shared/ui/scramble-text/` | DOM-only scramble effect; same defaults contract. |
| Demo playgrounds | `src/widgets/immersive-demo/ui/` | Leva-driven demos at `/demo/immersive` ("Micro interactions"). Demo-only, never shipped UI. The `TextLoadIn*` playgrounds live in `src/widgets/transition-demo/ui/` on `/demo/transitions`. |
| Demo scaffolding | `src/shared/ui/demo-kit/` | `useDemoControls`, `useDemoSnippet`, paste guide, settings. |
| WebGL infrastructure | `src/lib/webgl/`, `src/lib/interactions/` | Canvas, tunnel, RAF, smooth scroll, `ImmersiveShell`. |

Current effects: `TextLoadIn`, `TextLoadInRaymarched`, `ChromaSplitText`, `DispersionMedia`, `RefractionMedia`, `FloatingCards`, `LightLeak`, `ScrollGallery` (shipped by the `scrollGallery` block on work and lab pages), `WebGlBackdropScene`, plus `ScrambleText` in shared UI.

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

**Never deep-import** `@/features/immersive/ui/…` from outside the feature — the barrel is the public API.

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
