/**
 * Where a live Streak Field may run, and the code-owned ceilings for each
 * placement. Editors choose a look; these numbers are calibrated in code and
 * are the initial experiment settings from the plan ("Budgets and
 * preparation"), not measured capacity. Grid looks keep full coverage when
 * the count is capped: the runtime widens the pitch rather than dropping rows.
 */
export const VISUAL_PLACEMENTS = ['hero', 'block', 'menu', 'card'] as const
export type VisualPlacement = (typeof VISUAL_PLACEMENTS)[number]

export type PlacementLimits = {
  /** Whether a live field is ever admitted here. Posters otherwise. */
  live: boolean
  /** Device-pixel-ratio cap for the field's own canvas. */
  dpr: number
  /** Particle ceiling; a look's count is capped, never raised. */
  count: number
  /** Whether `flow` looks may simulate here; otherwise they degrade to the poster. */
  flow: boolean
  /** Whether pointer interaction is honored here. */
  pointer: boolean
}

export const PLACEMENT_LIMITS: Record<VisualPlacement, PlacementLimits> = {
  hero: { live: true, dpr: 1.5, count: 8000, flow: true, pointer: true },
  block: { live: true, dpr: 1, count: 4000, flow: true, pointer: true },
  // The takeover menu's docked window runs the current page's own field
  // (src/Header/Menu/LiveVisual.tsx) once the dock has settled; hover
  // previews and the handoff traveler stay posters. The window is drawn at
  // 1:1 screen pixels, a fraction of the viewport, so the hero's density
  // needs far fewer streaks and a crisp DPR costs little; the frame is
  // inert, so the pointer never reaches it.
  menu: { live: true, dpr: 2, count: 1000, flow: true, pointer: false },
  // Repeated entries and pinned work previews stay static.
  card: { live: false, dpr: 1, count: 0, flow: false, pointer: false },
}

/**
 * A lower tier the runtime steps down to when frame intervals stay long:
 * half the particles at DPR 1. One step, then the poster; no upward hysteresis.
 */
export const degradedLimits = (limits: PlacementLimits): PlacementLimits => ({
  ...limits,
  dpr: 1,
  count: Math.max(500, Math.floor(limits.count / 2)),
})

/** One animated Streak Field across the document is the starting ceiling. */
export const STREAK_LIVE_CEILING = 1
