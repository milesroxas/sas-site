'use client'

import {
  IconAppWindow,
  IconArrowsMinimize,
  IconBox,
  IconEye,
  IconInfoCircle,
  IconPhoto,
  IconTypography,
} from '@tabler/icons-react'
import { DemoShell, type DemoShellSection } from '@/shared/ui/demo-kit'
import { HeroLandingPlayground } from './hero-landing-playground'
import { TransitionsOverview } from './overview'
import { ScrollRevealIntroPlayground } from './scroll-reveal-intro-playground'
import { ScrollRevealUnderMediaPlayground } from './scroll-reveal-under-media-playground'
import { TextLoadInPlayground } from './text-load-in-playground'
import { TextLoadInRaymarchedPlayground } from './text-load-in-raymarched-playground'
import { TransitionSimulator } from './transition-simulator'

/** Single source of truth for the route: sidebar entries, stage, and controls. */
const SECTIONS: DemoShellSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    title: 'Page transitions',
    description:
      "The site's real navigation motion, live and tunable — with the network and server conditions a visitor actually brings. Throttle the fetch, feel the dead time, tune the timing variables, copy them back.",
    icon: IconInfoCircle,
    content: TransitionsOverview,
  },
  {
    id: 'simulator',
    label: 'Route simulator',
    title: 'Route transition simulator',
    description:
      'A miniature of the site in a browser frame: cards tag nav-forward, menu links tag nav-lateral, pagination tags by direction, post images morph into their hero, the home hero recedes on its own track — and card bodies reproduce the untagged hard cut. Set the network conditions in the GUI, then navigate.',
    icon: IconAppWindow,
    paste: {
      file: 'src/shared/ui/view-transition/view-transition.css',
      symbol: ':root',
      format: 'css-vars',
      note: 'Site-wide transition timing. Every tagged navigation reads these variables.',
    },
    content: TransitionSimulator,
  },
  {
    id: 'hero-landing',
    label: 'Hero landing',
    title: 'Hero landing — the end of a takeover',
    description:
      "How every full-screen media takeover ends, owned once: the media is holding the whole screen, then the mask closes one axis at a time (horizontal, then vertical — never diagonally) onto the destination's own media, uncovering the page around it, and the destination's copy dissolves in over the crop delta. The takeover menu's hero handoff and the work-open transition out of Industry work both play this, so tuning here moves both. Pick a destination shape to watch an axis with no travel drop out of the plan.",
    icon: IconArrowsMinimize,
    paste: {
      file: 'src/shared/ui/hero-landing/hero-landing.ts',
      symbol: 'HERO_LANDING',
      format: 'object',
      note: 'The whole landing. Every takeover that lands on a destination reads these.',
    },
    content: HeroLandingPlayground,
  },
  {
    id: 'text-load-in',
    label: 'Text load-in',
    title: 'Text load-in',
    description:
      'A scroll-triggered reveal: the eyebrow decodes via scramble, the headline resolves through a smear shader that bleeds characters into each other, then the supporting line rises in. Edit the copy and replay it from the GUI.',
    icon: IconTypography,
    paste: {
      file: 'src/features/immersive/ui/text-load-in.tsx',
      symbol: 'TextLoadIn',
      format: 'props',
      note: 'Reveal timing and smear settings. The copy stays at the call site.',
    },
    content: TextLoadInPlayground,
  },
  {
    id: 'text-load-in-raymarched',
    label: 'Raymarched load-in',
    title: 'Text load-in v2 — true raymarching',
    description:
      'The same reveal built on a real signed distance field: the headline is extruded and raymarched in 3D, a smooth-min front sweeps it into existence with metaball droplets lit by SDF-gradient normals, then hands off to the crisp DOM heading. Tune the SDF scene from the GUI.',
    icon: IconBox,
    paste: {
      file: 'src/features/immersive/ui/text-load-in-raymarched.tsx',
      symbol: 'TextLoadInRaymarched',
      format: 'props',
      note: 'SDF, droplet and timing settings. The copy stays at the call site.',
    },
    content: TextLoadInRaymarchedPlayground,
  },
  {
    id: 'reveal-intro',
    label: 'Reveal — intro',
    title: 'Reveal — intro / text only',
    description:
      'The complete reveal for introduction and text-only blocks: descendants marked data-reveal rise into place with a blur settle, staggered in document order, and reverse out when the section leaves the viewport. This reveal is owned whole — tuning it never touches the media + text reveal. The timeline below plots exactly when each line starts.',
    icon: IconEye,
    paste: {
      file: 'src/shared/ui/scroll-reveal/scroll-reveal.tsx',
      symbol: 'SCROLL_REVEAL_INTRO',
      format: 'object',
      note: 'The whole intro reveal. Every block tagged variant="intro" reads these.',
    },
    content: ScrollRevealIntroPlayground,
  },
  {
    id: 'reveal-media',
    label: 'Reveal — media + text',
    title: 'Reveal — media + text',
    description:
      'The complete reveal for copy paired with media: the container is a clipped window — the mask wipes open from the top while the content settles down from a zoom behind it (no fade or blur, expensive to composite on large media) — and the text runs on its own track with its own stagger. The sync offset decides whether the tracks overlap or run sequentially. Preview it stacked or beside the copy (image left / right), with your own image or video like the immersive demos. The timeline below plots both tracks.',
    icon: IconPhoto,
    paste: {
      file: 'src/shared/ui/scroll-reveal/scroll-reveal.tsx',
      symbol: 'SCROLL_REVEAL_UNDER_MEDIA',
      format: 'object',
      note: 'The whole under-media reveal. Every block tagged variant="underMedia" reads these.',
    },
    content: ScrollRevealUnderMediaPlayground,
  },
]

/**
 * The route's transitions playground: the production `<ViewTransition>`
 * recipes and reveal systems, one section at a time inside the DemoShell
 * sidebar layout.
 */
export function TransitionDemoPage() {
  return <DemoShell title="Page transitions" sections={SECTIONS} />
}
