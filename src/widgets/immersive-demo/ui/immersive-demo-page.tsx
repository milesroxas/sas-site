'use client'

import {
  IconAbc,
  IconBuildingFactory2,
  IconCards,
  IconDiamond,
  IconInfoCircle,
  IconPrism,
} from '@tabler/icons-react'
import { ImmersiveShell } from '@/features/immersive'
import { DemoShell, type DemoShellSection } from '@/shared/ui/demo-kit'
import { DispersionPlayground } from './dispersion-playground'
import { FloatingCardsPlayground } from './floating-cards-playground'
import { IndustryWorkPlayground } from './industry-work-playground'
import { ImmersiveOverview } from './overview'
import { RefractionPlayground } from './refraction-playground'
import { ScramblePlayground } from './scramble-playground'

/** Single source of truth for the route: sidebar entries, stage, and controls. */
const SECTIONS: DemoShellSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    title: 'Micro interactions',
    description:
      'Every immersive effect in the codebase, live and tunable. Pick a section from the sidebar, dial it in from the controls panel, then copy the values into the component that ships it.',
    icon: IconInfoCircle,
    content: ImmersiveOverview,
  },
  {
    id: 'scramble',
    label: 'Text scramble',
    title: 'Text scramble',
    description:
      'Two sentences trade places character by character, with a chroma-split shader panel mirroring the text mid-transition. Set the phrases, timing and character set in the GUI.',
    icon: IconAbc,
    paste: {
      file: 'src/shared/ui/scramble-text/ScrambleText.tsx',
      symbol: 'ScrambleText',
      format: 'props',
      note: 'Scramble timing and character set. Phrases stay at the call site.',
    },
    content: ScramblePlayground,
  },
  {
    id: 'refraction',
    label: 'Refraction hover',
    title: 'Refraction hover',
    description:
      'Two layers track the cursor over an image or video: a screen-space warp (refraction, chromatic dispersion, noise, velocity smear) and a flattened glass mesh refracting the warped result through six spectral bands. Drop the glass out with the lens visibility control; upload your own media (10 MB max) from the GUI.',
    icon: IconPrism,
    paste: {
      file: 'src/Home/hero/HeroBackground.tsx',
      symbol: 'LENS',
      format: 'object',
      note: 'The home hero reads these. Media stays bound in the component.',
    },
    content: RefractionPlayground,
  },
  {
    id: 'dispersion',
    label: 'Dispersion mesh',
    title: 'Dispersion mesh',
    description:
      "A glass mesh tumbles after the cursor over image or video media, refracting it through six spectral bands sampled from an FBO snapshot, and glides back to center on leave. Defaults to the home hero's gradient video.",
    icon: IconDiamond,
    paste: {
      file: 'src/features/immersive/ui/dispersion-media.tsx',
      symbol: 'DispersionMedia',
      format: 'props',
      note: 'Mesh, dispersion and IOR settings. The media source stays at the call site.',
    },
    content: DispersionPlayground,
  },
  {
    id: 'industry-work',
    label: 'Industry work',
    title: 'Industry work media',
    description:
      "The IndustryWork block's main-media hover effect on a standalone stage: a soft refraction lens trails the cursor, the plane tilts on Y toward it, and the media's edges melt past its bounding box into the surrounding bleed. Media and title are configurable here; tune, then copy the values into the preset the block reads.",
    icon: IconBuildingFactory2,
    paste: {
      file: 'src/features/immersive/presets.ts',
      symbol: 'INDUSTRY_WORK_MEDIA',
      format: 'object',
      note: 'The IndustryWork block media reads this preset. Panels and media stay CMS-driven.',
    },
    content: IndustryWorkPlayground,
  },
  {
    id: 'floating-cards',
    label: 'Floating cards',
    title: 'Floating cards',
    description:
      'Screenshot cards tilt on Y and drift in a slow loop. Hover or focus a featured-work item to stagger them in; leave to animate them back out.',
    icon: IconCards,
    paste: {
      file: 'src/features/immersive/ui/floating-cards.tsx',
      symbol: 'FloatingCards',
      format: 'props',
      note: 'Tilt, drift and entrance timing. Card layout and images stay at the call site.',
    },
    content: FloatingCardsPlayground,
  },
]

/**
 * The route's immersive playground inside the DemoShell sidebar layout.
 * ImmersiveShell activates the GlobalCanvas for the subtree — the active
 * demo tunnels its WebGL scene into it.
 */
export function ImmersiveDemoPage() {
  return (
    <ImmersiveShell webgl>
      <DemoShell title="Micro interactions" sections={SECTIONS} />
    </ImmersiveShell>
  )
}
