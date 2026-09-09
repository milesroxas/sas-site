/**
 * Shaders for the streak field (see `./streak-field.tsx`).
 *
 * A GPU particle system: every particle is one instance of a strip of
 * quads, and the vertex shader derives its row, position, life envelope and
 * brightness from four hashes baked into instanced attributes, a single
 * `uTime` uniform and, in `flow` motion, one texel of simulation state.
 * One draw call however many streaks are on screen.
 *
 * ## Layout
 *
 * The screen is sliced into horizontal rows `uRowPitch` CSS px apart. Each
 * particle picks a row from its hash, drifts along it at its own speed, and
 * wraps once it leaves the frame. The result reads as a field of horizontal
 * dashes: a data stream, rain seen side-on, a tape of signal. A `grid`
 * layout swaps the random phase along the row for a fixed column pitch,
 * with instance `i` on cell `i`: a tick grid rather than a tape.
 *
 * ## Flow
 *
 * A noise field acts on each streak three ways, all optional. It can
 * *displace* every vertex of the strip independently, so a streak bends to
 * follow the field rather than sliding along it as a rigid dash. It can
 * *orient* the whole dash to the field's direction at its centre, the way
 * a vector plot draws ticks. And its scalar value can shade the streak as
 * *relief*: a height map where high ground is bright and anything under a
 * floor goes dark. The formula is a uniform-driven branch (value, simplex,
 * fbm, ridged, curl of an fbm potential for contour direction, or gradient
 * of it for slope direction) so the demo can switch formulas without
 * relinking the program, and the branch is coherent across the draw so the
 * formulas not in use cost nothing.
 *
 * ## Motion
 *
 * `drift` motion is stateless: a streak's position is a function of time
 * and its hashes, so it slides along its row while the field morphs under
 * it. `flow` motion advects the particles *through* the field: a ping-pong
 * simulation pass (`SIM_FRAGMENT_SHADER`) integrates each particle's
 * position along the field's direction every frame and stores it in a
 * texture, one texel per particle, that the vertex shader fetches by
 * instance index. Particles respawn at their layout position when their
 * life ends or they leave the frame, so a grid reads as ticks streaming out
 * along the field and returning.
 *
 * The pointer perturbs the same field: a radial push, a vortex, a wake along
 * its motion and a local boost of the noise amplitude, all falling off over
 * `uPointerRadius`. In `drift` motion those are displacements of the drawn
 * dash; in `flow` motion they are also velocities the simulation integrates.
 * The pointer state is eased on the CPU; the shaders only read the settled
 * values.
 *
 * ## Polarity
 *
 * `uAbsorb` crossfades the frame between light on a dark ground (the ink,
 * additive in spirit) and ink on a pale one (dark, with brightness folded
 * into coverage). The canvas composites with premultiplied source-over in
 * both cases, so a theme toggle is a uniform sweep and never a relink.
 *
 * ## Where the numbers live
 *
 * Every knob arrives resolved: the scene folds the props into uniforms in
 * `streak-field.tsx`, and CSS-px lengths are scaled by `uDpr` here so the
 * look is the same at every device pixel ratio. Hashes are per particle;
 * uniforms are per frame.
 */

/**
 * Noise formulas the flow field can run on. The order is the shader's
 * `uNoiseMode` integer, so `STREAK_FIELD_NOISES.indexOf(noise)` is the
 * uniform value and the two can never drift apart.
 */
export const STREAK_FIELD_NOISES = [
  'none',
  'value',
  'simplex',
  'fbm',
  'ridged',
  'curl',
  'gradient',
] as const

/** Upper bound of the fbm loop; `uNoiseOctaves` stops it early. */
export const STREAK_FIELD_MAX_OCTAVES = 6

/**
 * The field, shared by the render vertex shader and the simulation pass:
 * its uniforms, the noise formulas, and the pointer's influence. Both
 * programs sample the same code so a particle is drawn against the field
 * that moved it.
 */
const FIELD_GLSL = /* glsl */ `
uniform float uTime;
uniform vec2  uResolution;     // device px
uniform float uDpr;

// Flow field
uniform int   uNoiseMode;      // index into STREAK_FIELD_NOISES; 0 is off
uniform float uNoiseScale;     // CSS px per noise feature
uniform float uNoiseStrength;  // CSS px of displacement at full amplitude
uniform float uNoiseSpeed;     // field evolution, noise units per second
uniform int   uNoiseOctaves;   // fbm / ridged / curl / gradient only
uniform float uNoiseGain;      // amplitude ratio between octaves
uniform float uNoiseAxis;      // 0 bends rows, 1 bunches along them, 0.5 both

// Pointer
uniform vec2  uPointer;        // device px, y-up
uniform vec2  uPointerVel;     // device px/s, eased
uniform float uPointerAmt;     // 0..1 presence over the surface, eased
uniform float uPointerRadius;  // CSS px
uniform float uPointerPush;    // CSS px, radial; negative pulls
uniform float uPointerSwirl;   // CSS px, tangential
uniform float uPointerWake;    // seconds of pointer velocity to displace by
uniform float uPointerAgitate; // extra noise amplitude under the pointer

const int MAX_OCTAVES = ${STREAK_FIELD_MAX_OCTAVES};

// ---------------------------------------------------------------------------
// Noise. 3D so the field evolves in time without sliding; z is time.

// Value noise on a hash lattice, smoothstepped. The cheapest formula and the
// blockiest: reads as a loose, boxy drift.
float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x),
        mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
        mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
  return n * 2.0 - 1.0;
}

// Simplex noise, Ashima Arts / Stefan Gustavson (MIT). Isotropic, no lattice
// bias, so the flow has no preferred direction.
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Fractal sum of simplex octaves, normalized so the range stays -1..1 for any
// gain. Ridged mode folds each octave about zero before summing, which turns
// the smooth hills into sharp creases: the flow gathers along seams.
float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 1.0;
  float norm = 0.0;
  for (int i = 0; i < MAX_OCTAVES; i++) {
    if (i >= uNoiseOctaves) break;
    float n = snoise(p);
    if (uNoiseMode == 4) {
      n = 1.0 - abs(n);
      n = n * n * 2.0 - 1.0;
    }
    sum += n * amp;
    norm += amp;
    amp *= uNoiseGain;
    p = p * 2.0 + 13.7;
  }
  return sum / max(norm, 1e-4);
}

// The scalar field behind every formula. Coherent branch: the whole draw
// takes the same path, so only the formula in use is evaluated.
float field(vec3 p) {
  if (uNoiseMode == 1) return vnoise(p);
  if (uNoiseMode == 2) return snoise(p);
  return fbm(p);
}

// The field at a device-px position: a direction (unit-ish, before strength)
// and the scalar height (-1..1) it was derived from.
vec2 fieldAt(vec2 px, out float height) {
  height = 1.0;
  if (uNoiseMode == 0) return vec2(0.0);
  vec3 p = vec3(px / (uNoiseScale * uDpr), uTime * uNoiseSpeed);
  float c = field(p);
  height = c;
  if (uNoiseMode >= 5) {
    // Derivatives of a scalar potential by forward differences; the potential
    // is smooth enough at this step for the tangent below to stay stable.
    // Curl is divergence-free, so the flow swirls rather than piling up, and
    // runs along the potential's contours. Gradient runs up its slopes.
    float e = 0.03;
    float dx = (field(p + vec3(e, 0.0, 0.0)) - c) / e;
    float dy = (field(p + vec3(0.0, e, 0.0)) - c) / e;
    return (uNoiseMode == 5 ? vec2(dy, -dx) : vec2(dx, dy)) * 0.25;
  }
  return vec2(c, field(p + vec3(31.7, 17.3, 5.1)));
}

// 0.5 is isotropic; either end zeroes one axis without doubling the other.
vec2 fieldAxis() {
  return vec2(min(1.0, uNoiseAxis * 2.0), min(1.0, (1.0 - uNoiseAxis) * 2.0));
}

// Displacement of the flow field at a device-px position, in device px.
vec2 flow(vec2 px) {
  if (uNoiseMode == 0 || uNoiseStrength == 0.0) return vec2(0.0);
  float height;
  vec2 d = fieldAt(px, height);
  return d * fieldAxis() * uNoiseStrength * uDpr;
}

// Pointer displacement at a device-px position, plus the proximity bump the
// agitate, glow and lift terms reuse.
vec2 pointerDisplace(vec2 px, out float prox) {
  prox = 0.0;
  if (uPointerAmt <= 0.0 || uPointerRadius <= 0.0) return vec2(0.0);
  float r = uPointerRadius * uDpr;
  vec2 to = px - uPointer;
  float d = length(to);
  float f = 1.0 - smoothstep(0.0, r, d);
  f *= f;
  prox = f * uPointerAmt;
  vec2 dir = d > 1e-3 ? to / d : vec2(0.0);
  vec2 push = dir * uPointerPush * uDpr;
  vec2 swirl = vec2(-dir.y, dir.x) * uPointerSwirl * uDpr;
  // A flick should shove the field, not teleport it: cap the wake at a radius.
  vec2 wake = uPointerVel * uPointerWake;
  float wakeLen = length(wake);
  if (wakeLen > r) wake *= r / wakeLen;
  return (push + swirl + wake) * prox;
}

// Row geometry, shared so the simulation spawns on the rows the render
// pass draws. Rows are counted in device px so the pitch is a real distance.
float rowCount(float pitchPx) {
  return max(1.0, floor(uResolution.y / pitchPx));
}
`

/**
 * The layout uniforms both passes read: where a streak spawns.
 */
const LAYOUT_GLSL = /* glsl */ `
uniform int   uLayout;         // 0 rows, 1 grid
uniform float uColumnPitch;    // CSS px between grid columns
uniform float uRowPitch;       // CSS px between rows
uniform float uRowJitter;      // fraction of pitch a streak may sit off its row

// Where instance \`id\` sits on the grid, in device px, and whether the grid
// has a cell for it at all (instances past the last cell are culled).
vec2 gridCell(float id, float jitter, out bool culled) {
  float pitchPx = uRowPitch * uDpr;
  float colPx = uColumnPitch * uDpr;
  float cols = max(1.0, floor(uResolution.x / colPx));
  float row = floor(id / cols);
  float col = id - row * cols;
  culled = row >= rowCount(pitchPx);
  return vec2((col + 0.5) * colPx, (row + 0.5 + jitter) * pitchPx);
}
`

export const VERTEX_SHADER = /* glsl */ `
// Per-instance hashes, uniform in 0..1.
//   aSeed:  row, phase along the row, length, brightness
//   aSeed2: speed, lifetime, row jitter, flicker phase
attribute vec4 aSeed;
attribute vec4 aSeed2;
// Instance index: the grid layout's cell, and the simulation texel.
attribute float aIndex;

${FIELD_GLSL}
${LAYOUT_GLSL}

uniform int   uShape;          // 0 dash, 1 dot
uniform float uThickness;      // CSS px, dash only
uniform float uMinLength;      // CSS px
uniform float uMaxLength;      // CSS px
uniform float uLengthBias;     // >1 skews the population toward short streaks

uniform float uDrift;          // CSS px/s, signed
uniform float uDriftSpread;    // 0..1 per-particle speed variance

uniform float uLifetime;       // s
uniform float uLifeSpread;     // 0..1 per-particle lifetime variance
uniform float uFadeIn;         // fraction of the life spent fading in
uniform float uFadeOut;        // fraction of the life spent fading out

uniform float uFlicker;        // 0..1 depth of the shimmer
uniform float uFlickerRate;    // Hz
uniform float uBrightnessSpread; // 0..1: 0 is a uniform field, 1 lets streaks go fully dim

uniform float uOrient;         // 0..1 how far a dash turns to face the field

// Relief: the field's scalar as a height map
uniform float uRelief;         // 0..1 how much height shades brightness
uniform float uReliefFloor;    // 0..1 height below which the ground is dark
uniform float uReliefContrast; // exponent on the shade; higher is sharper
uniform float uReliefLength;   // 0..1 how much height scales length

uniform float uPointerGlow;    // extra brightness under the pointer
uniform float uPointerLift;    // height added to the relief under the pointer

// Motion
uniform int       uMotion;     // 0 drift (stateless), 1 flow (simulated)
uniform sampler2D uState;      // flow: xy position 0..1, z life 0..1, w heading
uniform vec2      uStateSize;  // texels

varying vec2  vUv;
varying float vAlpha;
varying float vLengthPx;
varying float vHeadSign;

const float TAU = 6.28318530718;

// The streak's centreline at t (0..1 along its length): the rigid dash laid
// along its orientation, then moved by the field and the pointer.
vec2 centreline(vec2 centre, vec2 along, float lengthPx, float t, out float prox) {
  vec2 base = centre + along * (t - 0.5) * lengthPx;
  vec2 nudge = pointerDisplace(base, prox);
  return base + flow(base) * (1.0 + uPointerAgitate * prox) + nudge;
}

void main() {
  vUv = uv;

  float pitchPx = uRowPitch * uDpr;
  float jitter = (aSeed2.z - 0.5) * uRowJitter;

  // Length. pow() on a uniform hash skews toward the short end, which is
  // what the reference reads as: many ticks, a few long trails.
  float lengthPx = mix(uMinLength, uMaxLength, pow(aSeed.z, uLengthBias)) * uDpr;

  vec2 centre;
  float life;
  bool culled = false;
  // The dash's direction (before \`uOrient\`) and which end leads.
  vec2 dir;
  float headSign = uDrift < 0.0 ? -1.0 : 1.0;

  if (uMotion == 1) {
    // Flow: the simulation owns position, life and heading.
    vec2 texel = vec2(mod(aIndex, uStateSize.x), floor(aIndex / uStateSize.x));
    vec4 state = texture2D(uState, (texel + 0.5) / uStateSize);
    centre = state.xy * uResolution;
    life = state.z;
    culled = state.y > 1.5;
    dir = vec2(cos(state.w), sin(state.w));
    // The dash leads with the end it is moving toward.
    headSign = dir.x < 0.0 ? -1.0 : 1.0;
  } else {
    // Drift: position is a function of time and the hashes.
    float row;
    float cellX = 0.0;
    bool onGrid = uLayout == 1;
    if (onGrid) {
      vec2 cell = gridCell(aIndex, jitter, culled);
      cellX = cell.x;
      row = floor(aIndex / max(1.0, floor(uResolution.x / (uColumnPitch * uDpr))));
    } else {
      row = floor(aSeed.x * rowCount(pitchPx));
    }
    float yPx = (row + 0.5 + jitter) * pitchPx;

    // Life. Each streak breathes on its own period: born, held, faded, reborn
    // elsewhere along the row (the re-seat term in the position below). Grid
    // cells stay put: a re-seat would break the grid.
    float period = max(0.1, uLifetime * (1.0 + (aSeed2.y - 0.5) * 2.0 * uLifeSpread));
    float cycles = uTime / period + aSeed.w * 7.31;
    life = fract(cycles);

    // Position along the row. Each streak has its own speed around the drift
    // and wraps through a span one length wider than the frame on each side
    // so it never pops at the edge. Every new life adds a golden-ratio jump
    // so a spot never reads as one dash blinking in place.
    float speed = uDrift * uDpr * (1.0 + (aSeed2.x - 0.5) * 2.0 * uDriftSpread);
    float span = uResolution.x + lengthPx * 2.0;
    float start = onGrid ? cellX + lengthPx * 0.5 : aSeed.y * span;
    float reseat = onGrid ? 0.0 : floor(cycles) * span * 0.6180339887;
    float xPx = mod(start + uTime * speed + reseat, span) - lengthPx;
    centre = vec2(xPx + lengthPx * 0.5, yPx);

    float height;
    dir = fieldAt(centre, height);
  }

  float envelope = smoothstep(0.0, max(uFadeIn, 1e-3), life)
                 * (1.0 - smoothstep(1.0 - max(uFadeOut, 1e-3), 1.0, life));

  // Height at the centre for the relief, and the pointer's proximity there.
  // Sampled once per streak (every vertex lands on the same value) so a
  // dash shades as a whole.
  float height;
  fieldAt(centre, height);
  float proxC;
  pointerDisplace(centre, proxC);

  // Orientation. A dash is a line, not an arrow, so the direction's sign is
  // folded away before the angle is taken; \`uOrient\` scales how far it turns.
  vec2 along = vec2(1.0, 0.0);
  if (uOrient > 0.0 && uNoiseMode != 0) {
    if (dir.x < 0.0) dir = -dir;
    float angle = uOrient * atan(dir.y, dir.x);
    along = vec2(cos(angle), sin(angle));
  }

  // Relief. Height above the floor, shaped by contrast, shades the streak
  // and may shorten it; the pointer can lift the ground under it. The
  // normalized fbm sum rarely nears its -1..1 bounds, so the height is
  // stretched to put its usual peaks at the top of the range.
  float h = clamp(0.5 + 0.9 * height + uPointerLift * proxC, 0.0, 1.0);
  float reliefTerm = pow(smoothstep(uReliefFloor, 1.0, h), max(uReliefContrast, 1e-3));
  float shade = mix(1.0, reliefTerm, uRelief);
  lengthPx *= mix(1.0, reliefTerm, uReliefLength);

  // Strip. The unit plane spans -0.5..0.5 on both axes; x runs along the
  // streak, y across it.
  vec2 px;
  float prox;
  if (uShape == 1) {
    // Dot: a rigid square of side lengthPx around the displaced centre, so
    // the disc the fragment cuts out of it never warps however the field
    // bends the strip. The length is the diameter; thickness is unused.
    vec2 c = centreline(centre, along, lengthPx, 0.5, prox);
    vec2 normal = vec2(-along.y, along.x);
    px = c + (along * position.x + normal * position.y) * lengthPx;
  } else {
    // Dash: each vertex sits on the displaced centreline and is pushed
    // across it along the local normal, so a bent streak keeps its
    // thickness instead of thinning where it tilts.
    float t = position.x + 0.5;
    vec2 c0 = centreline(centre, along, lengthPx, t, prox);
    vec2 normal = vec2(-along.y, along.x);
    if ((uNoiseMode != 0 && uNoiseStrength != 0.0) || uPointerAmt > 0.0) {
      float prox1;
      vec2 c1 = centreline(centre, along, lengthPx, t + 0.05, prox1);
      vec2 tangent = c1 - c0;
      float tl = length(tangent);
      if (tl > 1e-4) normal = vec2(-tangent.y, tangent.x) / tl;
    }
    px = c0 + normal * position.y * uThickness * uDpr;
  }

  // Brightness. A per-particle level, plus a slow shimmer whose rate and
  // phase are also per particle so the field never pulses in unison, plus
  // the relief's shade and the pointer's glow.
  float level = 1.0 - uBrightnessSpread * aSeed.w;
  float shimmer = 1.0 - uFlicker * (0.5 + 0.5 * sin(uTime * uFlickerRate * TAU * (0.6 + aSeed2.x) + aSeed2.w * TAU));
  vAlpha = envelope * level * shimmer * shade * (1.0 + uPointerGlow * prox);
  vLengthPx = max(lengthPx, 1e-3);
  vHeadSign = headSign;

  vec2 ndc = px / uResolution * 2.0 - 1.0;
  // Culled instances leave clip space entirely, so they cost no fill.
  gl_Position = culled ? vec4(2.0, 2.0, 2.0, 1.0) : vec4(ndc, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec3  uInk;       // light on a dark ground, brightness folded in
uniform vec3  uPaperInk;  // ink on a pale ground
uniform float uDensity;   // absorptive only: brightness as coverage
uniform float uAbsorb;    // 0 emissive .. 1 absorptive, eased
uniform float uTail;      // 0 is a flat dash; 1 fades fully from head to tail
uniform float uCap;       // CSS px of softening at each end, or around a dot's rim
uniform float uDpr;
uniform int   uShape;     // 0 dash, 1 dot

varying vec2  vUv;
varying float vAlpha;
varying float vLengthPx;
varying float vHeadSign;  // +1 when the head (bright end) is on the right, -1 on the left

void main() {
  // Tail: brightest at the head, falling off behind it.
  float along = vHeadSign > 0.0 ? vUv.x : 1.0 - vUv.x;
  float tail = mix(1.0, along, uTail);

  float profile;
  if (uShape == 1) {
    // Disc: radius in diameters from the quad's centre, the rim softened
    // over the cap so a cap the size of the radius reads as a glow.
    float r = length(vUv - 0.5) * 2.0;
    float rim = clamp(2.0 * uCap * uDpr / vLengthPx, 0.02, 1.0);
    profile = 1.0 - smoothstep(1.0 - rim, 1.0, r);
  } else {
    // Soft caps, in uv units so they stay the same size on screen for any length.
    float capUv = clamp(uCap * uDpr / vLengthPx, 1e-3, 0.5);
    float ends = smoothstep(0.0, capUv, vUv.x) * smoothstep(0.0, capUv, 1.0 - vUv.x);

    // Vertical profile: a tent rather than a hard bar, so a 1.5 px streak
    // reads as a line of light and not an aliased rectangle, while the core
    // still reaches full brightness.
    float ridge = 1.0 - abs(vUv.y * 2.0 - 1.0);
    profile = ends * ridge;
  }

  float a = profile * tail * vAlpha;

  // Both polarities are premultiplied for source-over. Emissive: the ink is
  // light and its brightness may run past 1, so it lives in the colour.
  // Absorptive: ink can only cover, so brightness becomes coverage instead
  // and the colour stays the ink.
  vec4 lit = vec4(uInk * a, min(a, 1.0));
  float d = min(1.0, a * uDensity);
  vec4 ink = vec4(uPaperInk * d, d);
  gl_FragColor = mix(lit, ink, uAbsorb);
}
`

/** Full-screen pass over the state texture. */
export const SIM_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

/**
 * One simulation step. Each texel is one particle: xy its position in
 * 0..1 of the frame (so a resize keeps it in place), z its life progress
 * 0..1, w its heading in radians. The particle moves along the field's
 * direction at \`uFlowSpeed\`, plus the row drift as a wind and the pointer's
 * displacement as a velocity, and respawns at its layout position when its
 * life ends or it leaves the frame. Per-particle variance comes from hashes
 * of the texel index, seeded to match the render pass's composition.
 */
export const SIM_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

${FIELD_GLSL}
${LAYOUT_GLSL}

uniform sampler2D uState;
uniform vec2  uStateSize;
uniform float uInit;           // 1 on the first step: seed everything
uniform float uDt;             // field seconds this step
uniform float uSeed;

uniform float uFlowSpeed;      // CSS px/s along the field
uniform float uDrift;          // CSS px/s along rows
uniform float uDriftSpread;    // 0..1 per-particle speed variance
uniform float uLifetime;       // s
uniform float uLifeSpread;     // 0..1 per-particle lifetime variance

varying vec2 vUv;

// Dave Hoskins' float hash: cheap, and stable across drivers.
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

// Where particle \`id\` (re)spawns, in 0..1 of the frame. On the grid every
// life starts in the particle's own cell; on rows, a fresh row and phase per
// generation (\`gen\`) so a spot never reads as one dash blinking in place.
// Grid particles past the last cell park far above the frame, where the
// render pass culls them.
vec2 spawn(float id, float gen) {
  if (uLayout == 1) {
    bool culled;
    float jitter = (hash11(id + uSeed * 3.1 + 7.7) - 0.5) * uRowJitter;
    vec2 cell = gridCell(id, jitter, culled);
    return culled ? vec2(0.5, 2.0) : cell / uResolution;
  }
  float pitchPx = uRowPitch * uDpr;
  float row = floor(hash11(id + gen * 13.1 + uSeed) * rowCount(pitchPx));
  float jitter = (hash11(id * 1.7 + gen * 7.3 + uSeed + 3.1) - 0.5) * uRowJitter;
  float x = hash11(id * 2.3 + gen * 5.9 + uSeed + 9.4);
  return vec2(x, (row + 0.5 + jitter) * pitchPx / uResolution.y);
}

void main() {
  vec2 texel = floor(vUv * uStateSize);
  float id = texel.x + texel.y * uStateSize.x;

  float life = max(0.1, uLifetime * (1.0 + (hash11(id + uSeed + 11.3) - 0.5) * 2.0 * uLifeSpread));
  float speedK = 1.0 + (hash11(id + uSeed + 5.9) - 0.5) * 2.0 * uDriftSpread;

  vec4 state = uInit > 0.5
    // Staggered lives, so the field does not start in unison.
    ? vec4(spawn(id, 0.0), hash11(id + uSeed + 2.2), 0.0)
    : texture2D(uState, vUv);

  vec2 px = state.xy * uResolution;
  float height;
  vec2 d = fieldAt(px, height);
  float prox;
  vec2 nudge = pointerDisplace(px, prox);
  vec2 vel = d * fieldAxis() * uFlowSpeed * uDpr * speedK * (1.0 + uPointerAgitate * prox)
           + vec2(uDrift * uDpr * speedK, 0.0)
           + nudge;
  px += vel * uDt;

  float progress = state.z + uDt / life;
  float heading = length(vel) > 1e-3 ? atan(vel.y, vel.x) : state.w;

  vec2 p = px / uResolution;
  bool gone = p.x < -0.05 || p.x > 1.05 || p.y < -0.05 || p.y > 1.05;
  if (progress >= 1.0 || gone) {
    // A parked (culled) grid particle stays parked.
    p = state.y > 1.5 ? state.xy : spawn(id, uTime);
    progress = 0.0;
  }

  gl_FragColor = vec4(p, progress, heading);
}
`
