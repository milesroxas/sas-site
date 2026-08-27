/**
 * Editor-selectable media crops, shared by every block whose config exposes an
 * `aspectRatio` select. `responsive` steps a squarer small-screen crop up to a
 * cinematic one from `md`; the rest hold one ratio at every width.
 *
 * Keep the keys in sync with the `aspectRatio` options each block declares.
 */
export const ASPECT_RATIO_CLASS = {
  responsive: 'aspect-3/2 md:aspect-21/9',
  '16-9': 'aspect-16/9',
  '3-2': 'aspect-3/2',
  '21-9': 'aspect-21/9',
} as const

export type AspectRatioValue = keyof typeof ASPECT_RATIO_CLASS
