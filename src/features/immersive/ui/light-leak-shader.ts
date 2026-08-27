/**
 * Shaders for the film light-leak overlay (see `./light-leak.tsx`).
 *
 * Technique adapted from Maxime Heckel, "Refraction, dispersion, and other
 * shader light effects":
 *
 *   1. Multi-sample dispersion loop — LOOP samples with a growing offset per
 *      sample and a different multiplier per channel, so the fringing reads as
 *      a smooth gradient instead of three hard ghost copies.
 *   2. rygcbv 6-channel colour space (Sundararaman's Fourier interpolation) —
 *      the light field is sampled at 6 wavelength-dependent offsets and RGB is
 *      reconstructed from them, producing the full rainbow banding of a real
 *      film leak rather than just red/blue fringes.
 *   3. Luminance-based saturation — mix(grayscale, rgb, intensity) to push
 *      colour back into the pale averaged result of the sample loop.
 *
 * There is no mesh to refract here, so the offset math is applied to a
 * procedural "leak field" instead: anisotropic gaussian blooms, a Lorentzian
 * seam streak and sine slats (light through blinds), domain-warped by fbm so
 * nothing reads as geometric.
 *
 * ## Where the numbers live
 *
 * The shader receives **resolved** values, never response curves. Everything
 * that mixes scroll energy or hover excitement into a parameter — dispersion
 * width, gain, saturation, slat frequency, morph strength, hover bloom — is
 * folded on the CPU in `light-leak.tsx` and uploaded as one uniform. That
 * keeps the response math readable in one place and drops both the uniform
 * count and the per-pixel ALU work.
 */

export const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

// Fullscreen quad: bypass camera transforms entirely.
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

const FRAGMENT_BODY = /* glsl */ `
precision highp float;

uniform float uT;          // field time: elapsed * timeScale + scroll phase
uniform float uPhase;      // scroll-accumulated drift, drives the morph warp
uniform float uGrainSeed;  // raw elapsed time, so grain animates even when frozen
uniform vec2  uResolution;
uniform vec2  uPointer;    // pointer in 0..1, y-up, relative to this overlay

uniform float uWarpAmount;
uniform float uWarpScale;
uniform float uMorphAmt;   // morph * scroll energy, resolved on the CPU
uniform float uMorphScale;
uniform float uDispAmt;    // base + energy + excite, resolved on the CPU
uniform vec2  uDispDir;    // pre-normalized on the CPU
uniform float uGainTotal;  // gain + energy + excite, resolved on the CPU
uniform float uSatTotal;   // saturation + excite, resolved on the CPU
uniform float uGrain;
uniform float uGrainLum;
uniform float uVignette;
uniform float uAbsorb;     // 0 = emissive (screen-like blend), 1 = absorptive (multiply)
uniform float uInkChroma;  // absorptive only: how hard the stain takes the leak's hue
uniform float uInkDensity; // absorptive only: neutral darkening under the leak
uniform vec3  uCoolTint;
uniform vec3  uWarmTint;
uniform vec3  uAmber;
uniform float uBlobWarm;
uniform float uBlobStreak;
uniform float uStreakAngle;
uniform float uStreakSpread;
uniform float uBlobCool;
uniform float uSlats;
uniform float uSlatAngle;
uniform float uSlatTopSpread;
uniform float uSlatBottomSpread;
uniform float uSlatRefSpread; // 0.5 * (top + bottom), folded on the CPU
uniform float uSlatFreq;   // slat freq + excite, resolved on the CPU
uniform float uSlatSharp;
uniform float uHoverAmt;   // excite * hover bloom, resolved on the CPU

varying vec2 vUv;

// Reciprocal radii and lengths, so the 36 field evaluations per pixel multiply
// instead of divide. Blob rotations are fixed art direction, so their sin/cos
// are folded to literals here (GLSL forbids sin() in a const initializer).
const vec2 WARM_INV_R  = vec2(1.0 / 0.34, 1.0 / 0.22);
const vec2 COOL_INV_R  = vec2(1.0 / 0.22, 1.0 / 0.16);
const vec2 HOVER_INV_R = vec2(1.0 / 0.42, 1.0 / 0.30);
const mat2 WARM_ROT  = mat2(0.8253356, -0.5646425, 0.5646425, 0.8253356); // 0.6 rad
const mat2 COOL_ROT  = mat2(0.9553365,  0.2955202, -0.2955202, 0.9553365); // -0.3 rad
const mat2 HOVER_ROT = mat2(0.9393727, -0.3428978, 0.3428978, 0.9393727); // 0.35 rad
const float STREAK_INV_LEN = 1.0 / 1.05;
const float SLAT_INV_LEN = 1.0 / 0.95;
const float SLAT_FAN_INV = 1.0 / 1.9;

// Per-pixel invariants, hoisted out of the sample loop. The field is evaluated
// LOOP * 6 times per pixel; without this every evaluation would recompute the
// same three sin/cos pairs and the same animated blob centers.
vec2 gWarp;
vec2 gPointer;
vec2 gWarmC;
vec2 gStreakO;
vec2 gCoolC;
vec2 gSlatO;
mat2 gStreakRot;
mat2 gSlatRot;
float gStreakSpread2;

// ---------------------------------------------------------------------------
// Noise (value noise + 3-octave fbm), used ONCE per pixel for domain warping.
// Keeping it out of the sample loop is what makes the loop affordable.
// ---------------------------------------------------------------------------

// Hash without Sine (David Hoskins). A fract(p.x * p.y) hash collapses along
// the cell axes and reads as a pixel grid.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Interleaved gradient noise — spatial dither that breaks 8-bit banding
// without a visible grain texture.
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(4.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// ---------------------------------------------------------------------------
// Leak field primitives. Each takes a pre-built rotation and reciprocal radii.
// ---------------------------------------------------------------------------

// Anisotropic gaussian bloom — the big soft washes of light.
float blobRot(vec2 p, vec2 center, vec2 invRadius, mat2 rot) {
  vec2 d = (rot * (p - center)) * invRadius;
  return exp(-dot(d, d));
}

// Seam / anamorphic leak: Lorentzian across (tight core, long wings) and a
// quartic along the length so brightness stays even — no mid-beam bulge.
// The quartic is x2*x2 rather than pow(x, 4.0): same curve, no pow in a loop
// that runs 36 times per pixel.
float streakRot(vec2 p, vec2 origin, mat2 rot, float spread2) {
  vec2 r = rot * (p - origin);
  float across = spread2 / (r.y * r.y + spread2);
  float a = abs(r.x) * STREAK_INV_LEN;
  float a2 = a * a;
  return across / (1.0 + a2 * a2);
}

// A fan of light bars (blinds / stained glass). The cluster width is
// interpolated along the bar from bottomSpread to topSpread, so the rays
// splay instead of running parallel; fanX rescales the bar coordinate by the
// same ratio, keeping the bar *count* constant as the fan widens — without it
// the bars would bunch up at the narrow end.
//
// spread varies per pixel, so its reciprocal can't be hoisted like the
// rotation — but one reciprocal serves both the fan and the falloff, and the
// along-bar quartic stays a pair of multiplies rather than a pow.
float slatsRot(
  vec2 p,
  vec2 origin,
  mat2 rot,
  float freq,
  float sharp,
  float topSpread,
  float bottomSpread,
  float refSpread
) {
  vec2 r = rot * (p - origin);
  float alongPosition = clamp(r.y * SLAT_FAN_INV + 0.5, 0.0, 1.0);
  float invSpread = 1.0 / max(mix(bottomSpread, topSpread, alongPosition), 1e-4);
  float fanX = r.x * refSpread * invSpread;
  float bars = pow(0.5 + 0.5 * sin(fanX * freq), sharp);
  float across = exp(-(r.x * r.x) * invSpread * invSpread);
  float a = abs(r.y) * SLAT_INV_LEN;
  float a2 = a * a;
  return bars * across / (1.0 + a2 * a2);
}

// The scalar light field — the "texture" the dispersion loop samples.
float leakField(vec2 p) {
  p += gWarp;

  float f = 0.0;
  f += uBlobWarm * blobRot(p, gWarmC, WARM_INV_R, WARM_ROT);
  f += uBlobStreak * streakRot(p, gStreakO, gStreakRot, gStreakSpread2);
  f += uBlobCool * blobRot(p, gCoolC, COOL_INV_R, COOL_ROT);
  f += uSlats
    * slatsRot(
      p, gSlatO, gSlatRot, uSlatFreq, uSlatSharp,
      uSlatTopSpread, uSlatBottomSpread, uSlatRefSpread
    );

  // Uniform-driven branch: fully coherent across the draw, so the hover bloom
  // costs nothing on the frames where nobody is hovering.
  if (uHoverAmt > 0.0001) {
    f += uHoverAmt * blobRot(p, gPointer, HOVER_INV_R, HOVER_ROT);
  }

  return f;
}

// Saturation via luminance (from the article).
vec3 sat(vec3 rgb, float intensity) {
  vec3 L = vec3(0.2125, 0.7154, 0.0721);
  return mix(vec3(dot(rgb, L)), rgb, intensity);
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  gPointer = vec2(uPointer.x * aspect, uPointer.y);

  float t = uT;

  // One fbm-based domain warp per pixel — melts geometric shapes into organic
  // film-like light.
  gWarp = (vec2(
    fbm(p * uWarpScale + t * 0.15),
    fbm(p * uWarpScale - t * 0.12 + 7.0)
  ) - 0.5) * uWarpAmount;

  // Scroll morph: a second, tighter warp octave that only exists while there
  // is scroll energy, so the field kneads into a different shape as the page
  // moves and relaxes back to its resting form when it stops. Purely a domain
  // warp — the field is never rotated or translated as a whole, so nothing
  // spins. Skipped outright when the page is still (coherent branch).
  if (uMorphAmt > 0.0001) {
    gWarp += (vec2(
      fbm(p * uMorphScale + uPhase * 1.6 + 17.0),
      fbm(p * uMorphScale - uPhase * 1.3 + 41.0)
    ) - 0.5) * uMorphAmt;
  }

  // Animated centers and rotations: identical for all 36 field evaluations, so
  // they are built exactly once here.
  //
  // The x of every origin is a *fraction of the width*, scaled by aspect on
  // the way into p-space. Without that scale a 0..1 x lands at that fraction
  // of the HEIGHT, so on any wide box the whole field slides left — the slats,
  // authored at 0.88, sit near a third of the way across a 3:1 band. Radii and
  // spreads stay in p-units, so the shapes keep their proportions.
  gWarmC = vec2((0.12 + 0.06 * sin(t * 0.7)) * aspect, 0.16 + 0.05 * cos(t * 0.5));
  gStreakO = vec2((0.55 + 0.08 * sin(t * 0.4)) * aspect, 0.55);
  gCoolC = vec2((0.95 - 0.05 * cos(t * 0.6)) * aspect, 0.80);
  gSlatO = vec2(0.88 * aspect, 0.35);

  float streakS = sin(uStreakAngle);
  float streakC = cos(uStreakAngle);
  gStreakRot = mat2(streakC, -streakS, streakS, streakC);

  float slatS = sin(uSlatAngle);
  float slatC = cos(uSlatAngle);
  gSlatRot = mat2(slatC, -slatS, slatS, slatC);

  gStreakSpread2 = uStreakSpread * uStreakSpread;

  // -------------------------------------------------------------------------
  // Sampled 6-channel dispersion.
  // Outer loop = the article's smoothing samples (the offset grows per
  // iteration). The 6 taps per sample = rygcbv wavelengths, each offset a
  // little further along dispDir (violet bends most, red least — like a real
  // prism). The taps advance by a running delta instead of six separate
  // multiplies of the base offset.
  // -------------------------------------------------------------------------
  vec2 base = uDispDir * uDispAmt;

  float r = 0.0, y = 0.0, g = 0.0, c = 0.0, b = 0.0, v = 0.0;

  for (int i = 0; i < LOOP; i++) {
    vec2 offset = base * (0.5 + float(i) * INV_LOOP);
    vec2 tap = offset * 0.4;
    vec2 q = p + offset;

    r += leakField(q); q += tap;
    y += leakField(q); q += tap;
    g += leakField(q); q += tap;
    c += leakField(q); q += tap;
    b += leakField(q); q += tap;
    v += leakField(q);
  }

  // Normalize by sample count, halve per the rygcbv definitions (r = R/2 etc.)
  // so equal channels reconstruct to the plain field.
  const float n = 0.5 * INV_LOOP;
  r *= n; y *= n; g *= n; c *= n; b *= n; v *= n;

  // rygcbv -> RGB reconstruction (Sundararaman, via the article).
  vec3 color;
  color.r = r + (2.0 * v + 2.0 * y - c) / 3.0;
  color.g = g + (2.0 * y + 2.0 * c - v) / 3.0;
  color.b = b + (2.0 * c + 2.0 * v - y) / 3.0;
  color = max(color, 0.0);

  // Film warmth: bias the leak toward amber highs and teal lows, the way light
  // fogs colour negative stock, then push saturation back up.
  float lum = dot(color, vec3(0.2125, 0.7154, 0.0721));
  color *= mix(uCoolTint, uWarmTint, smoothstep(0.1, 0.9, lum));
  color += lum * lum * lum * uAmber; // hot amber core
  color = sat(color, uSatTotal);

  color *= uGainTotal;

  // Film grain — signed, animated, only where there is leak. A screen blend
  // would otherwise lift grain in the blacks into full-frame static.
  float grain = hash(gl_FragCoord.xy + fract(uGrainSeed) * 61.7) - 0.5;
  color += grain * (uGrain + lum * uGrainLum) * smoothstep(0.0, 0.08, lum);

  // Gentle vignette keeps the frame edges dense.
  vec2 q = vUv - 0.5;
  color *= 1.0 - dot(q, q) * uVignette;

  color = max(color, 0.0);

  // -------------------------------------------------------------------------
  // Composite polarity. Over a dark ground the frame is *emissive*: the canvas
  // screen-blends, so black drops out and only the lit field survives. Over a
  // pale ground that same frame is invisible — light added to white is still
  // white — so the leak flips to *absorptive* and the canvas multiplies. The
  // frame becomes a dye layer: 1.0 wherever no light struck (multiply's
  // identity, so the paper is untouched) and a transmission below it wherever
  // the field is lit.
  //
  // Beer–Lambert, split in two so the stain keeps the leak's own hue instead
  // of printing its complement. The chroma term absorbs only the channels the
  // leak is *missing* — a gold field eats blue, so it stains gold — and the
  // density term is a neutral filter that darkens with the field's peak. Both
  // live in the exponent, so the paper approaches the tint asymptotically and
  // never reaches black: copy under the leak keeps its contrast.
  //
  // Uniform-driven branch: coherent across the draw, so the ground the leak is
  // *not* running on costs nothing.
  if (uAbsorb > 0.5) {
    float peak = max(color.r, max(color.g, color.b));
    color = exp(-(vec3(peak) - color) * uInkChroma - peak * uInkDensity);
  }

  // 1-LSB dither: hides 8-bit gradient banding, stays below visible static.
  color += (ign(gl_FragCoord.xy) - 0.5) / 255.0;

  // Emissive frames composite with a screen-like blend, where black is
  // effectively transparent; absorptive frames multiply, where white is. Either
  // way the shader writes an opaque frame — no alpha juggling needed.
  gl_FragColor = vec4(max(color, 0.0), 1.0);
}
`

/**
 * The fragment shader with its dispersion sample count baked in. `samples` is
 * the outer smoothing loop: the field is evaluated `samples * 6` times per
 * pixel, so it is the single biggest lever on fragment cost. It has to be a
 * compile-time constant (GLSL ES 1.0 requires a constant loop bound), which is
 * why this is a builder rather than another uniform — callers memoize on
 * `samples` and only pay a recompile when the tier actually changes.
 */
export function createFragmentShader(samples: number): string {
  const loop = Math.max(1, Math.round(samples))
  return `#define LOOP ${loop}\n#define INV_LOOP ${(1 / loop).toFixed(8)}\n${FRAGMENT_BODY}`
}
