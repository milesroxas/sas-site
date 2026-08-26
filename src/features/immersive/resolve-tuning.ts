/**
 * Every effect here owns one `*_DEFAULTS` table — tuning lives once, call
 * sites pass deltas, shipped looks are delta-only presets (see
 * `docs/immersive-effects.md`). A scene component that restates
 * `knob = DEFAULTS.knob` once per prop writes that table a second time, which
 * is the one way the contract rots silently: a knob added to the table but
 * missed in the restatement reaches the shader as `undefined`.
 *
 * This resolves a caller's deltas against the table once, at the boundary
 * between an effect's public component and its scene, so the table stays the
 * only place a default is written. An explicitly passed `undefined` falls
 * back to the default — the way a destructuring default behaves and a plain
 * object spread does not.
 */
export function resolveTuning<T extends object>(defaults: T, deltas: Partial<T>): T {
  const overrides = Object.fromEntries(
    Object.entries(deltas).filter(([, value]) => value !== undefined),
  ) as Partial<T>
  return { ...defaults, ...overrides }
}
