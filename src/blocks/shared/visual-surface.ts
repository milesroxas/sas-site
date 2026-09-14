import type { StreakVisualSurface } from '@/features/immersive/visual'
import type { SectionTheme } from './section'

/**
 * The ground polarity a block hands its Streak Field. A `dark` band is
 * low-luminance in both site themes; every other band follows the site
 * theme, as does a block rendered `bare` inside a Section (the Section owns
 * the band, and the slot reads the ground it lands on at runtime).
 */
export const blockSurface = (
  theme: SectionTheme | null | undefined,
  bare: boolean,
): StreakVisualSurface => (!bare && theme === 'dark' ? 'dark' : 'auto')
