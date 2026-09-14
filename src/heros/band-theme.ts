import type { Theme } from '@/providers/Theme/types'

/**
 * The palette a hero band paints unless a hero asks for the other one
 * (`HeroBand`'s `theme` default). Server code that has to know the ground a
 * hero's visual sits on (the takeover menu previewing a Streak Field poster,
 * `src/Header/getMenuContent.ts`) reads the same constant, so the band and
 * its preview can never disagree. Plain module: `HeroBand` is a client
 * component, and its exports would reach the server as client references.
 */
export const HERO_BAND_THEME: Theme = 'dark'
