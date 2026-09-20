import { heroImageFixture } from '@/blocks/fixtures'
import type { IndexBannerData } from './resolve'

/** Story fixture: the lab index's way into the Playground, over a Streak Field. */
export const indexBannerFixture: IndexBannerData = {
  heading: 'Every effect on this site, live and tunable.',
  body: 'Eight interaction studies with the controls we tune them by, open for a look behind the scenes.',
  link: { href: '/demo/immersive', label: 'Open the Playground', newTab: false },
  visual: {
    kind: 'streakField',
    descriptor: {
      look: 'technical-lines-v1',
      seed: 694,
      speed: 1,
      intensity: 1,
      pointer: true,
      surface: null,
      posterMedia: null,
      degraded: false,
    },
  },
}

/** The same banner over an upload: the slab paints a scrim to hold the copy's contrast. */
export const indexBannerMediaFixture: IndexBannerData = {
  ...indexBannerFixture,
  visual: { kind: 'media', media: heroImageFixture },
}
