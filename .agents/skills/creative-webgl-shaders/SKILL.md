---
name: creative-webgl-shaders
description: >
  Build real-time 3D graphics, custom shaders, and post-processing effects for
  the web using React Three Fiber, Three.js, GLSL, and TSL/WebGPU — plus
  physics-based UI motion (springs, damping, easing) applicable to CSS
  animations, GSAP, or Motion. Use when the task involves writing
  vertex/fragment shaders, raymarching or SDFs, volumetric rendering,
  refraction/dispersion glass materials, dithering/retro/CRT or other
  post-processing filters, GPU particles, porting shaders to WebGPU/TSL, or
  designing spring/easing animations in any animation library or plain CSS.
  Techniques distilled from Maxime Heckel's blog.
---

# Creative WebGL, Shaders & Web Motion

## Overview

This skill covers a battle-tested workflow for creative coding on the web,
organized around two pillars:

1. **Real-time 3D & shaders** — GLSL/TSL running on the GPU via React Three
   Fiber (R3F) and Three.js, including raymarching, volumetric rendering,
   light effects, and post-processing.
2. **Physics-based UI motion** — the principles behind spring and easing
   animations, expressed in a library-agnostic way (works with CSS, GSAP,
   Motion, or a hand-rolled loop).

Guiding principle from the source material: **learn a small set of reusable
building blocks, then combine them.** Almost every advanced effect below is a
recombination of a few primitives (UV remapping, noise, SDFs, luma, lighting
dot-products, framebuffer passes). When building something new, decompose it
into these primitives first.

## When to use which section

- Starting a shader / need the mental model → **Shader Fundamentals**
- Painting 3D scenes with math, no meshes → **Raymarching & SDFs**
- Clouds, smoke, fog → **Volumetric Rendering**
- Glass, refraction, chromatic dispersion, lighting → **Light Effects**
- Image filters over a rendered scene (retro, ASCII, halftone, glass, CRT) →
  **Post-Processing**
- Targeting WebGPU / modern API / compute → **TSL & WebGPU**
- Spring, damping, easing, timing curves in any library or CSS → **Web Motion**

---

## Shader Fundamentals

**Core identity:** `Mesh = Geometry + Material`. A custom material is a pair of
GPU programs written in GLSL:

- **Vertex shader** — positions each vertex; sets `gl_Position`. Use it to
  displace/move geometry.
- **Fragment shader** — sets the color of each visible pixel via
  `gl_FragColor` (RGBA, each channel `0.0–1.0`). "Painting with code."

In R3F, attach them with `<shaderMaterial vertexShader fragmentShader uniforms />`.

**Passing data (know these three):**
- **Uniform** — JS → shader; read-only, same for every vertex/pixel (time,
  mouse, colors, resolution). Prefix convention: `u_time`, `u_mouse`.
- **Attribute** — per-vertex data (vertex shader only). `position`, `uv` are
  built in.
- **Varying** — vertex shader → fragment shader. Prefix `v`. Most common use:
  pass `uv` as `vUv` to normalize the fragment coordinate system.

**Dynamic uniforms:** update `mesh.current.material.uniforms.u_time.value`
inside R3F's `useFrame`. **Always `useMemo` the uniforms object** — a re-render
otherwise creates a new object and the shader appears frozen.

**Debugging reality:** GLSL can't `console.log`; a non-compiling shader renders
nothing (blank screen). Iterate in small steps.

**Organic randomness = noise.** Don't use `Math.random()` per pixel. Use Perlin
or Simplex noise (import via `glsl-noise`/`glslify`), and **Fractal Brownian
Motion (FBM)** — sum noise "octaves," each with lower amplitude and higher
frequency — for detail (clouds, terrain, gradients).

**Composable materials:** for physically-lit custom shaders without
reimplementing everything, stack layers with **Lamina** (`LayerMaterial` +
custom `Abstract` layers; uniforms become props).

**Canonical references:** The Book of Shaders; ShaderToy (for fragment-only
inspiration); Inigo Quilez's articles.

---

## Raymarching & SDFs

An alternative to rasterization: no geometry/meshes — one fragment shader on a
fullscreen plane paints an entire 3D world.

**Loop:** cast a ray per pixel from a `rayOrigin` along `rayDirection`; each
step, query a **Signed Distance Field (SDF)** for the distance to the nearest
surface and march that far. Stop when distance `< SURFACE_DIST` (hit) or steps
exceed `MAX_STEPS` / `MAX_DIST` (miss → background).

```glsl
float sdSphere(vec3 p, float r){ return length(p) - r; }

float raymarch(vec3 ro, vec3 rd){
  float d = 0.0;
  for(int i=0;i<MAX_STEPS;i++){
    vec3 p = ro + rd*d;
    float ds = scene(p);
    d += ds;
    if(d>MAX_DIST || ds<SURFACE_DIST) break;
  }
  return d;
}
```

**Setup essentials:** fullscreen `planeGeometry`, pass `uResolution` & `uTime`;
normalize + center UVs and correct for aspect ratio; keep DPR low (~1) —
raymarching is expensive.

**Normals** (no built-in): sample the SDF around the point.
```glsl
vec3 getNormal(vec3 p){
  vec2 e = vec2(.01,0);
  return normalize(scene(p) - vec3(scene(p-e.xyy),scene(p-e.yxy),scene(p-e.yyx)));
}
```

**Lighting:** diffuse = `max(dot(normal, lightDir), 0.0)`. Add Inigo Quilez's
`softshadow` (a second SDF loop) for depth.

**Combining shapes (CSG):** `min(a,b)` = union, `max(a,b)` = intersection.
Use `smoothmin` for organic/liquid blends:
```glsl
float smoothmin(float a,float b,float k){
  float h = clamp(0.5+0.5*(b-a)/k,0.0,1.0);
  return mix(b,a,h) - k*h*(1.0-h);
}
```

**Transforms operate on the sampling point, inverted:** translate → subtract
offset from `p`; rotate → multiply `p` by a rotation matrix; scale → multiply
`p` by factor and divide the returned distance by the same factor.

**Infinite scenes / fractals:** `mod(p,c)-0.5*c` tiles one SDF infinitely;
iterating box∩cross with scaling builds Menger fractals.

**Landscapes:** apply FBM to a plane's SDF; prefer **noise derivatives** (sample
a grayscale noise texture, accumulate derivatives) for realistic, less
repetitive terrain at fewer octaves. Add fog via Beer's law
`I = I0 * exp(-α·d)`; the sky is simply whatever the ray missed.

---

## Volumetric Rendering (clouds, smoke, fog)

Raymarching with a twist — reframe the SDF as **density** rather than distance:

- March with a **constant `MARCH_SIZE`** (not the SDF distance).
- Keep sampling **inside** the volume; density > 0 inside, 0 outside.
- **Accumulate** color/alpha layer by layer as you march through.

```glsl
for(int i=0;i<MAX_STEPS;i++){
  float density = scene(p);          // positive inside
  if(density > 0.0){
    vec4 c = vec4(mix(vec3(1.0),vec3(0.0),density), density);
    c.rgb *= c.a;
    res += c*(1.0-res.a);            // front-to-back accumulation
  }
  depth += MARCH_SIZE;
  p = ro + depth*rd;
}
```

**Clouds:** drive density with noise + FBM (or a 3D/texture noise). Light using
Beer's law along the light direction. **Banding/layering** from the coarse
constant step is removed with **blue-noise dithering** on the start offset.
Performance is the main constraint — tune step size, steps, and resolution.

---

## Light Effects (glass, refraction, dispersion)

**Transparency via Frame Buffer Object (FBO):** each frame, hide the mesh →
render scene into an FBO → feed that texture back to the mesh's shader → show
mesh. Sample it with `texture2D(uTexture, gl_FragCoord.xy / winResolution)`.
Multiply resolution by `devicePixelRatio` but **cap DPR at 2**.

**Refraction:** GLSL `refract(eyeVector, normal, iorRatio)` gives a vector to
offset the sampled UV. Compute `eyeVector = normalize(worldPos - cameraPosition)`
and transform the normal by `normalMatrix` in the vertex shader; pass via
varyings. Higher IOR = more bending (water 1.333, diamond 2.42).

**Chromatic dispersion:** apply a *different* IOR per channel (R/G/B), sample
each channel with its own refraction vector. Smooth it by looping over
**samples** with an incremental slide (perf-sensitive). Optionally expand to 6
channels (rygcbv) via Fourier interpolation for richer color.

**Saturation:** `mix(grayscale, rgb, intensity)` where
`grayscale = dot(rgb, vec3(0.2125,0.7154,0.0721))`.

**Lighting (Blinn-Phong):** `halfVector = normalize(eye + light)`;
diffuse = `max(dot(N,L),0)`; specular = `pow(dot(N,H)², shininess)`.

**Fresnel** (edge glow / view-dependent reflection):
`pow(1.0 - abs(dot(eye, normal)), power)`.

**Backside trick:** render backside (`THREE.BackSide`) into one FBO and
frontside into another with the same material — the front refracts the back's
light effects for convincing multi-side glass.

---

## Post-Processing (image filters over a rendered scene)

Create a custom effect with pmndrs `postprocessing`: extend `Effect`, provide a
fragment shader with a `mainImage(inputColor, uv, outputColor)` entry
(and optional `mainUv` to distort UVs), wrap with `wrapEffect`, drop inside
`<EffectComposer>`. Built-ins available: `inputBuffer`, `time`, `resolution`.
Prefer **Effects** (merged into one pass) over stacked **Passes** for perf.

**Two pillars of nearly every effect:**
1. **Remap/distort UVs.**
2. **Shape each "cell" individually.**

**Pixelation (the workhorse):**
```glsl
vec2 nSize = pixelSize / resolution;      // keep pixelSize a power of 2
vec2 uvPixel = nSize * floor(uv / nSize); // snap to grid
vec4 color = texture2D(inputBuffer, uvPixel);
```
`vec2 cellUV = fract(uv / nSize);` gives the position **inside** a cell — the
"magic line" for sculpting patterns.

**Pattern recipes** (branch on **luma** = `dot(vec3(0.2126,0.7152,0.0722),rgb)`):
- **Receipt bars / halftone dots** — draw longer bar / bigger circle for darker
  luma.
- **ASCII** — bake glyphs to a `CanvasTexture`, map luma → char index → sample.
- **SDF patterns** — reuse 2D SDFs (`circleSDF`, `crossSDF`) inside each cell.
- **Threshold matrices** — Bayer/custom matrices decide pixel on/off (stripes,
  weave).
- **Staggered LED panel** — offset odd columns / sub-pixels; add borders.
- **Crochet** — offset `cellUV`, draw rotated ellipses + noise/hue shift.
- **Lego** — draw a shaded stud (Blinn-Phong) per cell + color quantization.
- **Fluted/frosted glass** — distort UVs by the derivative of a sine profile;
  derive a normal for lighting; add blur + noise + slight dispersion. *(No
  pixelation.)*

**Retro / CRT stack:**
- **Dithering** — compare luma to a threshold: white-noise (messy),
  **ordered/Bayer** (best, larger matrix = finer), or **blue-noise** (texture,
  balanced). Floyd–Steinberg isn't fragment-shader friendly (sequential).
- **Color quantization** — `floor(c*(n-1)+0.5)/(n-1)` per channel; or sample a
  palette texture using the quantized grayscale value.
- **RGB cell shadow mask, screen curvature, scanlines, chromatic aberration,
  Bloom** — layer these for an authentic CRT look.

**Dynamic post-processing:** drive `pixelSize`/distortion from `time`, a
`progress` uniform (e.g. progressive depixelation), or a **mouse-trail texture**
rendered into its own FBO via `createPortal` + ping-pong rendering.

---

## TSL & WebGPU

**Terminology:** *WebGPU* is the low-level API (compute shaders, near-native
perf). *TSL* (Three.js Shading Language) is a JS-like functional shading
language that compiles to **both** WebGL and WebGPU — future-proofing shaders.
You can't hand-write raw WebGPU shaders in Three.js; it's abstracted by TSL
(though `glslFn`/`wgslFn` let you embed native code).

**Renderer setup (R3F v9, async `gl`):**
```js
import * as THREE from 'three/webgpu';
<Canvas gl={async (props) => {
  const r = new THREE.WebGPURenderer(props); // add forceWebGL:true to test WebGL
  await r.init();
  return r;
}} />
```
`WebGPURenderer` falls back to WebGL automatically.

**Node System (the killer feature):** every stock material has a `*NodeMaterial`
equivalent with hooks — `colorNode`, `positionNode`, `normalNode`, etc. Modify
materials by assigning TSL functions to these nodes instead of the old
`onBeforeCompile` string surgery.

**Patterns & gotchas:**
- Organize with `useMemo` returning `{ nodes, uniforms }`; write functions with
  `Fn(...)`; use the **transpiler** to convert existing GLSL → TSL/WGSL.
- **Uniforms:** declare with `uniform(value)`, update via `.value` in
  `useFrame` (only primitive/vector/matrix types).
- **Varyings:** use the `varying()` function.
- **Textures:** use `texture(tex, uv)` to sample in TSL, or `texture(tex)` +
  `sampler(...)` to pass into WGSL. WGSL sampling needs the extra sampler arg:
  `textureSample(tex, sampler, uv)`.
- Recompute displaced normals in `positionNode`, pass through a varying, return
  in `normalNode`.
- **Compute shaders** unlock instanced meshes, GPU particles, and
  post-processing on WebGPU.

---

## Web Motion (library-agnostic principles)

The physics and timing below are independent of any framework. Once you
understand them, they translate directly to CSS `@keyframes`/transitions, GSAP,
Motion (Framer Motion), or a raw `requestAnimationFrame` loop — the concepts are
the same; only the API differs.

### Springs are harmonic oscillators

A spring animation follows Hooke's law. Understand the three knobs *physically*
so you can reason about any spring API (or hand-roll one):

- **stiffness (k)** — restoring force `F = -k·x`; higher = snappier/faster.
- **mass (m)** — inertia via `a = F/m`; higher = slower, more overshoot.
- **damping (d)** — friction `F = -d·v` that dissipates energy so motion
  settles; higher = stops sooner with less oscillation, lower = bouncier.

Integrate per frame (~1/60s) — this is the entire spring, framework-free:
```js
// x = position, v = velocity, rest = target
const a = (-k * (x - rest) - d * v) / m;
v += a * dt;   // dt ≈ 1/60
x += v * dt;
```
This same loop underlies every spring implementation. A common sensible default
is roughly stiffness 100, damping 10, mass 1; other tunables you may encounter
are initial `velocity`, `restSpeed`, and `restDelta` (thresholds for when to
consider the spring "settled").

### Easing is a timing curve

Non-spring animations interpolate from start to end over a fixed `duration`,
with an **easing function** shaping the progress `t` (0→1). Most are **cubic
Bézier** curves: `ease`, `ease-in-out`, or custom
`cubic-bezier(x1, y1, x2, y2)`. The curve — not the library — determines the
feel (slow-in, fast-out, etc.).

### Mapping the same concepts to each tool

The intent ("bouncy scale on tap", "ease a card into place") is expressed
differently but rests on identical principles:

**Plain CSS** — easing via transitions/keyframes; springs are approximated with
a tuned Bézier or multi-stop keyframes (CSS has no true physics spring):
```css
.btn { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.btn:active { transform: scale(1.3); }
```

**GSAP** — explicit easing, or true springs via helpers/plugins:
```js
gsap.to(el, { scale: 1.3, duration: 0.3, ease: 'power2.out' });
// spring feel: ease: 'elastic.out(1, 0.3)'  (amplitude, period ↔ stiffness/damping)
```

**Motion / Framer Motion** — physics springs described with the same k/m/d:
```js
// declarative (React): transition={{ type:'spring', stiffness:100, damping:10, mass:1 }}
// imperative (vanilla Motion):
animate(el, { scale: 1.3 }, { type: 'spring', stiffness: 100, damping: 10 });
```

### Choosing spring vs. easing

- Use **springs** for interruptible, interactive, natural motion (drags, taps,
  gestures) where velocity should carry through.
- Use **easing/duration** for deterministic, orchestrated sequences (page/enter
  transitions, timelines) where exact timing matters.

Higher-level orchestration (staggering, enter/exit, layout/FLIP transitions,
gesture handling) exists in GSAP timelines and Motion's variants/`AnimatePresence`
/`layout`; CSS covers simpler cases with `animation-delay` and transitions. Pick
the tool for the job, but reason about the motion with the physics above.

---

## Cross-cutting best practices

- **Decompose new effects into primitives** (UV remap, noise/FBM, SDF, luma,
  dot-product lighting, FBO pass) and recombine.
- **Watch performance:** cap DPR, minimize shader loops/octaves, prefer merged
  post-processing Effects, and profile on weaker devices.
- **`useMemo` uniforms; update in `useFrame`.**
- **Attribute your sources / respect licenses** for models, textures, and
  reference shaders.
- **Prototype in 2D** (fullscreen-plane fragment shaders / post-processing) —
  it's the fastest way to iterate on an idea before committing to a full 3D
  scene.
- When porting to WebGPU, start with TSL's node hooks and the transpiler rather
  than rewriting from scratch.
- **Reason about motion physics-first, then reach for a library.** Prefer CSS
  for simple, cheap transitions; GSAP for complex timelines; a spring-capable
  library for interruptible, gesture-driven motion. Respect
  `prefers-reduced-motion`.

## Reference index (source articles)

Shaders w/ R3F · Raymarching (SDFs) · Volumetric Cloudscapes · Refraction &
Dispersion · WebGL Render Targets · Particles w/ R3F · Caustics · Moebius /
Painterly / Post-Processing / Dithering & Retro · TSL & WebGPU Field Guide · On
Shaping Light / Rendering the Sky · Spring physics · Cubic Bézier · Animation
patterns (applicable to CSS, GSAP, and Motion).
