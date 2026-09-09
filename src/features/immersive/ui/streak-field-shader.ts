/**
 * Shaders for the streak field (see `./streak-field.tsx`).
 *
 * A GPU particle system with no CPU simulation: every particle is one
 * instance of a unit quad, and the vertex shader derives its whole state
 * (row, position along the row, life envelope, brightness) from four hashes
 * baked into instanced attributes and a single `uTime` uniform. Nothing is
 * integrated frame to frame, so the field is stateless, deterministic for a
 * given seed, and costs one draw call however many streaks are on screen.
 *
 * ## Layout
 *
 * The screen is sliced into horizontal rows `uRowPitch` CSS px apart. Each
 * particle picks a row from its hash, drifts along it at its own speed, and
 * wraps once it leaves the frame. The result reads as a field of horizontal
 * dashes: a data stream, rain seen side-on, a tape of signal.
 *
 * ## Where the numbers live
 *
 * Every knob arrives resolved: the scene folds the props into uniforms in
 * `streak-field.tsx`, and CSS-px lengths are scaled by `uDpr` here so the
 * look is the same at every device pixel ratio. Hashes are per particle;
 * uniforms are per frame.
 */

export const VERTEX_SHADER = /* glsl */ `
// Per-instance hashes, uniform in 0..1.
//   aSeed:  row, phase along the row, length, brightness
//   aSeed2: speed, lifetime, row jitter, flicker phase
attribute vec4 aSeed;
attribute vec4 aSeed2;

uniform float uTime;
uniform vec2  uResolution;     // device px
uniform float uDpr;

uniform float uRowPitch;       // CSS px between rows
uniform float uRowJitter;      // fraction of pitch a streak may sit off its row
uniform float uThickness;      // CSS px
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

varying vec2  vUv;
varying float vAlpha;
varying float vLengthPx;

const float TAU = 6.28318530718;

void main() {
  vUv = uv;

  // Row. Rows are counted in device px so the pitch is a real distance.
  float pitchPx = uRowPitch * uDpr;
  float rows = max(1.0, floor(uResolution.y / pitchPx));
  float row = floor(aSeed.x * rows);
  float jitter = (aSeed2.z - 0.5) * uRowJitter;
  float yPx = (row + 0.5 + jitter) * pitchPx;

  // Length. pow() on a uniform hash skews toward the short end, which is
  // what the reference reads as: many ticks, a few long trails.
  float lengthPx = mix(uMinLength, uMaxLength, pow(aSeed.z, uLengthBias)) * uDpr;

  // Life. Each streak breathes on its own period: born, held, faded, reborn
  // elsewhere along the row (the re-seat term in the position below).
  float period = max(0.1, uLifetime * (1.0 + (aSeed2.y - 0.5) * 2.0 * uLifeSpread));
  float cycles = uTime / period + aSeed.w * 7.31;
  float life = fract(cycles);
  float envelope = smoothstep(0.0, max(uFadeIn, 1e-3), life)
                 * (1.0 - smoothstep(1.0 - max(uFadeOut, 1e-3), 1.0, life));

  // Position along the row. Each streak has its own speed around the drift
  // and wraps through a span one length wider than the frame on each side so
  // it never pops at the edge. Every new life adds a golden-ratio jump so a
  // spot never reads as one dash blinking in place.
  float speed = uDrift * uDpr * (1.0 + (aSeed2.x - 0.5) * 2.0 * uDriftSpread);
  float span = uResolution.x + lengthPx * 2.0;
  float reseat = floor(cycles) * span * 0.6180339887;
  float xPx = mod(aSeed.y * span + uTime * speed + reseat, span) - lengthPx;

  // Brightness. A per-particle level, plus a slow shimmer whose rate and
  // phase are also per particle so the field never pulses in unison.
  float level = 1.0 - uBrightnessSpread * aSeed.w;
  float shimmer = 1.0 - uFlicker * (0.5 + 0.5 * sin(uTime * uFlickerRate * TAU * (0.6 + aSeed2.x) + aSeed2.w * TAU));
  vAlpha = envelope * level * shimmer;
  vLengthPx = lengthPx;

  // Quad. The unit plane spans -0.5..0.5 on both axes.
  vec2 px = vec2(xPx + (position.x + 0.5) * lengthPx, yPx + position.y * uThickness * uDpr);
  vec2 ndc = px / uResolution * 2.0 - 1.0;
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec3  uInk;
uniform float uTail;      // 0 is a flat dash; 1 fades fully from head to tail
uniform float uHeadSign;  // +1 when the head (bright end) is on the right, -1 on the left
uniform float uCap;       // CSS px of softening at each end
uniform float uDpr;

varying vec2  vUv;
varying float vAlpha;
varying float vLengthPx;

void main() {
  // Soft caps, in uv units so they stay the same size on screen for any length.
  float capUv = clamp(uCap * uDpr / vLengthPx, 1e-3, 0.5);
  float ends = smoothstep(0.0, capUv, vUv.x) * smoothstep(0.0, capUv, 1.0 - vUv.x);

  // Tail: brightest at the head, falling off behind it.
  float along = uHeadSign > 0.0 ? vUv.x : 1.0 - vUv.x;
  float tail = mix(1.0, along, uTail);

  // Vertical profile: a tent rather than a hard bar, so a 1.5 px streak
  // reads as a line of light and not an aliased rectangle, while the core
  // still reaches full brightness.
  float ridge = 1.0 - abs(vUv.y * 2.0 - 1.0);

  float a = ends * tail * ridge * vAlpha;
  // Premultiplied for additive blending: overlaps brighten, black stays black.
  gl_FragColor = vec4(uInk * a, a);
}
`
