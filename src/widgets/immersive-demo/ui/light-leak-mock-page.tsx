'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { leakExcite } from '@/features/immersive'

/**
 * Scrollable page content for the light-leak window. Two jobs:
 *
 *  1. **Length.** The effect is driven by scroll *velocity*, which needs room
 *     to build — a page shorter than a few window-heights never leaves the
 *     low end of the response curve, so the leak looks inert no matter how the
 *     GUI is set. This runs to roughly eight window-heights.
 *  2. **Variety.** Wide dark plates, dense card grids, list rows and long
 *     copy each show the leak differently: the wash reads on the plates, the
 *     spectral fringing reads against card edges, the grain reads in the copy.
 *
 * Everything hoverable spreads `leakExcite()` — the effect's delegated hover
 * contract — and carries a visible hover state of its own, so the flare can be
 * told apart from ordinary CSS. Built from the site's own UI primitives so the
 * leak is judged over surfaces it will actually ship over.
 *
 * Demo-only — not shipped UI.
 */

const FRAMES = [
  {
    id: '01',
    title: 'Half-open blinds',
    stock: 'Portra 400',
    note: 'Late sun through the slats, camera back cracked open. Scroll hard and the slat cluster tightens as the field kneads.',
  },
  {
    id: '02',
    title: 'Stained glass, nave',
    stock: 'Ektachrome E100',
    note: 'The last frame on the roll always catches the leak. Hover this card and the spectrum splits wider.',
  },
  {
    id: '03',
    title: 'Prism on the desk',
    stock: 'Cinestill 800T',
    note: 'Dispersion across the wall around 6pm — six wavelengths sampled per pass, reconstructed back to RGB.',
  },
  {
    id: '04',
    title: 'Doorframe, winter',
    stock: 'Kodak Gold 200',
    note: 'A seam of amber where the felt seal wore through. The seam is a Lorentzian streak, angled from the GUI.',
  },
  {
    id: '05',
    title: 'Bus window, 4pm',
    stock: 'Fuji Superia 400',
    note: 'Scroll speed maps onto a 0–1 signal. Below a full-strength flick the leak barely stirs.',
  },
  {
    id: '06',
    title: 'End of the roll',
    stock: 'Tri-X 400',
    note: 'Drop the response curve below 1 and the faintest wheel tick lights the whole frame.',
  },
]

const READINGS = [
  { label: 'Field evals / px', value: 'samples × 6' },
  { label: 'Draw calls', value: '1' },
  { label: 'Passes', value: 'single' },
  { label: 'Blend', value: 'plus-lighter' },
]

const INDEX_ROWS = [
  { n: '001', title: 'Warm bloom, lower left', meta: 'anisotropic gaussian' },
  { n: '002', title: 'Seam streak', meta: 'lorentzian × quartic' },
  { n: '003', title: 'Cool bloom, upper right', meta: 'anisotropic gaussian' },
  { n: '004', title: 'Slat fan', meta: 'sine bars, splayed' },
  { n: '005', title: 'Hover wash', meta: 'pointer-tracked bloom' },
  { n: '006', title: 'Domain warp', meta: '3-octave fbm' },
]

const EXPOSURES = [
  { f: 'f/1.4', t: '1/60', note: 'Wide open, hand-held.' },
  { f: 'f/2.8', t: '1/125', note: 'Stopped down a stop.' },
  { f: 'f/5.6', t: '1/250', note: 'The negative holds.' },
  { f: 'f/8', t: '1/500', note: 'Deep field, flat light.' },
  { f: 'f/11', t: '1/1000', note: 'Everything sharp, nothing alive.' },
  { f: 'f/16', t: '1/2000', note: 'Diffraction takes over.' },
]

type LightLeakMockPageProps = {
  /**
   * Which ground to judge the leak against. The effect has two composites —
   * emissive over a dense surface, absorptive over a pale one — and each is
   * only tunable over the ground it ships on, so the GUI drives this.
   */
  surface?: 'dark' | 'light'
}

export function LightLeakMockPage({ surface = 'dark' }: LightLeakMockPageProps) {
  return (
    // Every surface below is a semantic token, so the whole page follows this
    // attribute rather than pinning one palette.
    <div data-theme={surface} className="bg-background text-foreground">
      {/* 1 — Hero */}
      <section className="flex min-h-[78vh] flex-col justify-center gap-5 px-8 py-20">
        <Badge variant="secondary" className="w-fit font-mono text-[0.625rem] tracking-widest">
          ROLL 12 — LIGHT STRUCK
        </Badge>
        <h2 className="max-w-2xl text-balance text-heading-2">
          Every leak is the camera failing beautifully.
        </h2>
        <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
          Scroll this window to agitate the emulsion — velocity drives brightness, spectral split
          and a domain-warp morph, and slides the field along with you. Hover anything that
          highlights to flash it. The overlay is one GLSL pass composited over this page.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" {...leakExcite()}>
            Contact sheet
          </Button>
          <Button size="sm" variant="outline" {...leakExcite()}>
            Technical notes
          </Button>
        </div>
        <p className="pt-6 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-muted-foreground/70">
          ↓ keep scrolling — the response needs room to build
        </p>
      </section>

      <Separator className="bg-border" />

      {/* 2 — Readings */}
      <section className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {READINGS.map((reading) => (
          <div key={reading.label} className="bg-background px-6 py-8">
            <p className="font-mono text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              {reading.label}
            </p>
            <p className="mt-2 font-mono text-lg text-foreground">{reading.value}</p>
          </div>
        ))}
      </section>

      {/* 3 — Contact sheet */}
      <section className="space-y-6 px-8 py-20">
        <SectionHeading>Contact sheet</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          {FRAMES.map((frame) => (
            <Card
              key={frame.id}
              {...leakExcite()}
              className="border-border bg-card/60 transition-colors duration-500 hover:border-foreground/25 hover:bg-card"
            >
              <CardHeader>
                <p className="font-mono text-[0.625rem] tracking-widest text-muted-foreground">
                  {frame.id} · {frame.stock}
                </p>
                <CardTitle className="text-lg font-normal">{frame.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{frame.note}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-28 rounded-md bg-linear-to-br from-muted via-card to-background" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4 — Plate: a wide, near-empty ground where the wash reads cleanly */}
      <section
        {...leakExcite()}
        className="flex min-h-[70vh] items-center justify-center border-y border-border bg-linear-to-b from-muted via-background to-secondary px-8 py-24 transition-colors duration-700 hover:from-accent"
      >
        <blockquote className="max-w-xl text-balance text-center text-heading-3 font-normal text-foreground/80">
          “The last frame on the roll always catches the leak.”
        </blockquote>
      </section>

      {/* 5 — Index: dense rows, so the fringing has hard edges to sit against */}
      <section className="space-y-6 px-8 py-20">
        <SectionHeading>What the field is made of</SectionHeading>
        <div className="divide-y divide-border border-y border-border">
          {INDEX_ROWS.map((row) => (
            <div
              key={row.n}
              {...leakExcite()}
              className="flex items-baseline gap-4 py-4 transition-colors duration-300 hover:bg-card/70"
            >
              <span className="font-mono text-[0.625rem] tracking-widest text-muted-foreground/70">
                {row.n}
              </span>
              <span className="flex-1 text-sm text-foreground">{row.title}</span>
              <span className="font-mono text-[0.625rem] uppercase tracking-widest text-muted-foreground">
                {row.meta}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6 — Notes: long copy, where the grain reads */}
      <section className="grid gap-10 px-8 py-20 sm:grid-cols-2">
        <div className="space-y-4">
          <SectionHeading>What scrolling drives</SectionHeading>
          <ul className="list-disc space-y-2 pl-5 text-pretty text-sm/relaxed text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Energy</strong> — smoothed |velocity|,
              feeding brightness, spectral split and the morph warp.
            </li>
            <li>
              <strong className="font-medium text-foreground">Phase</strong> — the signed integral
              of velocity, so the field physically slides in the direction you scroll and never
              returns to exactly where it was.
            </li>
            <li>
              <strong className="font-medium text-foreground">Morph</strong> — a second, tighter
              warp octave that exists only while there is energy, relaxing back to the resting shape
              when you stop.
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <SectionHeading>Reading the controls</SectionHeading>
          <p className="text-pretty text-sm/relaxed text-muted-foreground">
            Speed sets the px/s that counts as a full-strength flick; curve shapes everything below
            it. Decay is how fast velocity dies once you stop, smooth is how lazily the leak eases
            toward that reading. Drift is the only one that accumulates — it never unwinds.
          </p>
          <p className="text-pretty text-sm/relaxed text-muted-foreground">
            Lenis&apos;s own feel — how quickly the page catches up to the wheel — is site-wide and
            set in the smooth-scroll provider, so it is deliberately not tunable here.
          </p>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* 7 — Exposures: a tighter grid, more edges per screen */}
      <section className="space-y-6 px-8 py-20">
        <SectionHeading>Exposures</SectionHeading>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXPOSURES.map((exposure) => (
            <div
              key={exposure.f}
              {...leakExcite()}
              className="rounded-md border border-border bg-card/40 p-5 transition-colors duration-500 hover:border-foreground/25 hover:bg-card"
            >
              <p className="font-mono text-sm text-foreground">
                {exposure.f} · {exposure.t}
              </p>
              <p className="mt-2 text-xs/relaxed text-muted-foreground">{exposure.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8 — Closing */}
      <footer className="border-t border-border px-8 py-28 text-center">
        <span
          {...leakExcite()}
          className="inline-block px-8 py-4 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-500 hover:text-foreground"
        >
          — end of roll —
        </span>
      </footer>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  )
}
