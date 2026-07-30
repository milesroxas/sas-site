'use client'

import { useState } from 'react'
import {
  FLOATING_CARDS_DEFAULTS as DEFAULTS,
  FloatingCards,
  type FloatingCardsEase,
} from '@/features/immersive'
import { useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'
import { cn } from '@/utilities/ui'

/** Default lives in /public; the GUI upload swaps in a blob URL. */
const DEFAULT_IMAGE = '/images/bg-fpo-01.jpg'

const EASES: FloatingCardsEase[] = ['expo.out', 'power3.out', 'back.out', 'sine.out']

/**
 * One card layout shared by every project (screenshots are FPO): a main
 * browser window set behind, a wide strip top-right, and a phone bottom-left
 * in front — echoing the featured-work reference composition.
 */
const CARD_LAYOUT = [
  {
    position: [-0.5, -0.05, -0.6] as [number, number, number],
    size: [2.6, 1.7] as [number, number],
  },
  { position: [0.95, 0.85, 0.1] as [number, number, number], size: [1.7, 0.5] as [number, number] },
  {
    position: [-1.5, -0.75, 0.5] as [number, number, number],
    size: [0.62, 1.1] as [number, number],
  },
]

const PROJECTS = [
  {
    name: 'NextStreet',
    blurb:
      'A platform that enables organizations and municipalities to support small business growth through advising, capital access, and structured programs.',
  },
  {
    name: 'Vault',
    blurb: 'Secure document workspace for distributed finance teams.',
  },
  {
    name: 'Arturo',
    blurb: 'Property intelligence from aerial imagery and machine learning.',
  },
  {
    name: 'AdaCore',
    blurb: 'Developer tooling for safety-critical embedded software.',
  },
  {
    name: 'GentleBeast',
    blurb: 'Brand and digital studio for companies with teeth.',
  },
]

/**
 * Demo content: FloatingCards driven by a featured-work list — hovering (or
 * focusing) a project reveals its floating screenshots with a staggered
 * entrance; leaving exits back to a blank scene. Every animation parameter is
 * wired to the surrounding DemoSection's GUI. Demo-only — not shipped UI.
 */
export function FloatingCardsPlayground() {
  const [active, setActive] = useState<string | null>(null)
  // Keeps the last project's cards rendered while they animate out.
  const [displayed, setDisplayed] = useState(PROJECTS[0].name)

  const { image } = useDemoControls('Image', {
    image: { image: undefined, label: 'upload' },
  })

  const { tilt, cornerRadius } = useDemoControls('Cards', {
    tilt: { value: DEFAULTS.tilt, min: -45, max: 45, step: 1 },
    cornerRadius: { value: DEFAULTS.cornerRadius, min: 0, max: 0.25, step: 0.01, label: 'corners' },
  })

  const { floatSpeed, floatIntensity, wobble } = useDemoControls('Float', {
    floatSpeed: { value: DEFAULTS.floatSpeed, min: 0, max: 3, step: 0.05, label: 'speed' },
    floatIntensity: {
      value: DEFAULTS.floatIntensity,
      min: 0,
      max: 0.2,
      step: 0.005,
      label: 'drift',
    },
    wobble: { value: DEFAULTS.wobble, min: 0, max: 8, step: 0.25 },
  })

  const { enterDuration, exitDuration, stagger, depth, rise, ease } = useDemoControls('Entrance', {
    enterDuration: { value: DEFAULTS.enterDuration, min: 0.2, max: 3, step: 0.05, label: 'enter' },
    exitDuration: { value: DEFAULTS.exitDuration, min: 0.1, max: 2, step: 0.05, label: 'exit' },
    stagger: { value: DEFAULTS.stagger, min: 0, max: 0.5, step: 0.01 },
    depth: { value: DEFAULTS.depth, min: 0, max: 4, step: 0.1 },
    rise: { value: DEFAULTS.rise, min: 0, max: 2, step: 0.05 },
    ease: { value: DEFAULTS.ease as FloatingCardsEase, options: EASES },
  })

  const cards = CARD_LAYOUT.map((layout) => ({ ...layout, src: image ?? DEFAULT_IMAGE }))

  // Cards stay out: the consumer supplies its own layout and screenshots.
  useDemoSnippet({
    tilt,
    cornerRadius,
    floatSpeed,
    floatIntensity,
    wobble,
    enterDuration,
    exitDuration,
    stagger,
    depth,
    rise,
    ease,
  })

  const show = (name: string) => {
    setActive(name)
    setDisplayed(name)
  }

  return (
    // Below md the scene and list stack — the absolute overlay would leave the
    // canvas a sliver and paint the list over it on narrow screens.
    <div className="overflow-hidden rounded-md bg-zinc-950 md:relative md:h-105">
      <FloatingCards
        className="h-72 md:absolute md:inset-y-0 md:left-0 md:right-60 md:h-auto"
        cards={cards}
        visible={active !== null}
        contentKey={displayed}
        tilt={tilt}
        cornerRadius={cornerRadius}
        floatSpeed={floatSpeed}
        floatIntensity={floatIntensity}
        wobble={wobble}
        enterDuration={enterDuration}
        exitDuration={exitDuration}
        stagger={stagger}
        depth={depth}
        rise={rise}
        ease={ease}
      />

      <aside
        className="space-y-2 p-4 pt-2 md:absolute md:right-6 md:top-1/2 md:w-56 md:-translate-y-1/2 md:p-0"
        onMouseLeave={() => setActive(null)}
      >
        <p className="px-4 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500">
          Featured work
        </p>
        {/* Fixed-height rows; the active card expands as an overlay so the
            list never reflows under the cursor (which would mis-select). */}
        <ul className="space-y-1.5">
          {PROJECTS.map((project) => {
            const isActive = active === project.name
            return (
              <li key={project.name} className="relative h-10">
                <button
                  type="button"
                  onMouseEnter={() => show(project.name)}
                  onFocus={() => show(project.name)}
                  onBlur={() => setActive(null)}
                  className={cn(
                    'absolute inset-x-0 top-0 rounded-lg px-4 text-left transition-colors duration-200',
                    isActive
                      ? 'z-10 bg-yellow-300 py-3 text-zinc-900 shadow-lg'
                      : 'flex h-full items-center bg-white/5 text-zinc-300 hover:text-zinc-100',
                  )}
                >
                  <span className="block text-sm font-semibold">{project.name}</span>
                  {isActive ? (
                    <span className="mt-1 block text-xs leading-relaxed">{project.blurb}</span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
    </div>
  )
}
