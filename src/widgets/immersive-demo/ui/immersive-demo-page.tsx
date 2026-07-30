'use client'

import { ImmersiveShell, WebGLTunnel, WebGlBackdropScene } from '@/features/immersive'
import { DemoSection } from './demo-section'
import { DispersionPlayground } from './dispersion-playground'
import { FloatingCardsPlayground } from './floating-cards-playground'
import { RefractionPlayground } from './refraction-playground'
import { ScramblePlayground } from './scramble-playground'
import { TextLoadInPlayground } from './text-load-in-playground'
import { TextLoadInRaymarchedPlayground } from './text-load-in-raymarched-playground'

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
          description="Two-layer cursor lens over an image: the original screen-space warp (refraction, chromatic dispersion, noise distortion, velocity smear) plus a real flattened glass mesh riding the same pointer, refracting the warped image through six spectral bands (same FBO + dispersion technique as the dispersion mesh below). Dial the glass in or out with the visibility control. Upload your own image or video (10 MB max) via the GUI."
        >
          <RefractionPlayground />
        </DemoSection>

        <DemoSection
          title="Dispersion mesh"
          description="Maxime Heckel's refraction + dispersion technique: a glass mesh tumbles after your cursor over image or video media, refracting it through six spectral bands (RYGCBV) sampled from an FBO snapshot. It glides back to center when the cursor leaves. Defaults to the home hero's gradient video."
        >
          <DispersionPlayground />
        </DemoSection>

        <DemoSection
          title="Floating cards"
          description="R3F screenshot cards tilted on Y, drifting in a slow loop. Hover a featured-work item to stagger them in from a blank scene; leave to animate them back out."
        >
          <FloatingCardsPlayground />
        </DemoSection>

        <DemoSection
          title="Text load-in"
          description="Scroll-triggered copy reveal: the eyebrow decodes via scramble while the headline resolves through a ray-marched smear shader that blends characters into each other as they appear, then the supporting line follows. Scroll it into view to play; edit the copy and re-run it from the GUI."
        >
          <TextLoadInPlayground />
        </DemoSection>

        <DemoSection
          title="Text load-in v2 — true raymarching"
          description="Improved take on the reveal above, built from Maxime Heckel's 'Painting with Math': the headline becomes a real signed distance field, extruded and raymarched in 3D — a smooth-min goo front sweeps it into existence with metaball droplets, lit via SDF-gradient normals, then hands off to the crisp DOM heading. Scroll it into view to play; tweak the SDF scene from the GUI."
        >
          <TextLoadInRaymarchedPlayground />
        </DemoSection>

        <div className="h-24" />

        <p className="text-muted-foreground text-sm">
          End of scroll probe — Lenis should ease to a stop here.
        </p>
      </div>
    </ImmersiveShell>
  )
}
