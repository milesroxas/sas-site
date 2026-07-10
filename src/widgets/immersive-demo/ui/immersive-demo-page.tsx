'use client'

import { ImmersiveShell, WebGLTunnel, WebGlBackdropScene } from '@/features/immersive'
import { DemoSection } from './demo-section'
import { FloatingCardsPlayground } from './floating-cards-playground'
import { RefractionPlayground } from './refraction-playground'
import { ScramblePlayground } from './scramble-playground'

/**
 * Full-page demo: GlobalCanvas + tunnels. Lenis runs site-wide via SmoothScrollProvider.
 */
export function ImmersiveDemoPage() {
  return (
    <ImmersiveShell webgl className="relative min-h-[220vh] bg-background text-foreground">
      <WebGLTunnel>
        <WebGlBackdropScene />
      </WebGLTunnel>

      <div className="container max-w-4xl py-24 space-y-8 relative z-10">
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">FSD · widgets/immersive-demo</p>
          <h1 className="text-4xl font-semibold tracking-tight">Immersive stack</h1>
          <p className="text-lg text-muted-foreground">
            Global WebGL (tunnel), site-wide Lenis from the root provider, and a dev renderer badge
            (bottom-right in development). Scroll to confirm smooth scrolling; the knot should
            animate continuously.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6 space-y-2">
          <h2 className="text-xl font-medium">What you&apos;re seeing</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
            <li>
              <code className="text-foreground/90">features/immersive</code> — scene + re-exports
            </li>
            <li>
              <code className="text-foreground/90">widgets/immersive-demo</code> — this composed
              page
            </li>
            <li>
              High-impact CMS heroes also wrap{' '}
              <code className="text-foreground/90">ImmersiveShell</code> with a softer media
              treatment so the GL layer reads through.
            </li>
          </ul>
        </section>

        <DemoSection
          title="Text scramble"
          description="GSAP-driven scramble between two sentences, with a chroma-split shader panel mirroring the text during transitions."
        >
          <ScramblePlayground />
        </DemoSection>

        <DemoSection
          title="Refraction hover"
          description="Cursor-driven lens shader over an image: refraction, chromatic dispersion, noise distortion, and velocity smear. Upload your own image via the GUI."
        >
          <RefractionPlayground />
        </DemoSection>

        <DemoSection
          title="Floating cards"
          description="R3F screenshot cards tilted on Y, drifting in a slow loop. Hover a featured-work item to stagger them in from a blank scene; leave to animate them back out."
        >
          <FloatingCardsPlayground />
        </DemoSection>

        <div className="h-24" />

        <p className="text-muted-foreground text-sm">
          End of scroll probe — Lenis should ease to a stop here.
        </p>
      </div>
    </ImmersiveShell>
  )
}
