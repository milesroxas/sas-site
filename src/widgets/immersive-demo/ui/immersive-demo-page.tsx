'use client'

import { ImmersiveShell, WebGLTunnel, WebGlBackdropScene } from '@/features/immersive'
import { DemoSection, DemoSettingsMenu, DemoSettingsProvider } from '@/shared/ui/demo-kit'
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
    <DemoSettingsProvider>
      <ImmersiveShell webgl className="relative min-h-[220vh] bg-background text-foreground">
        <WebGLTunnel>
          <WebGlBackdropScene />
        </WebGLTunnel>

        <div className="container max-w-4xl py-24 space-y-8 relative z-10">
          <header className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              FSD · widgets/immersive-demo
            </p>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight">
                Immersive stack
              </h1>
              <DemoSettingsMenu />
            </div>
            <p className="max-w-prose text-pretty text-lg/relaxed text-muted-foreground">
              Every immersive effect in the codebase, live and tunable. Open a section&apos;s GUI to
              dial it in, then copy the values into the component that ships it.
            </p>
          </header>

          <section className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6 space-y-3">
            <h2 className="text-balance text-xl font-medium tracking-tight">How this page works</h2>
            <ul className="max-w-prose list-disc space-y-2 pl-5 text-pretty text-sm/relaxed text-muted-foreground">
              <li>
                One WebGL canvas backs the whole route —{' '}
                <code className="font-mono text-foreground/90">features/immersive</code> renders
                into it through a tunnel, and Lenis drives scrolling site-wide.
              </li>
              <li>
                <strong className="font-medium text-foreground/90">Show GUI</strong>
                {' opens that section’s controls; '}
                <strong className="font-medium text-foreground/90">Copy</strong>
                {' puts the current values on your clipboard as pasteable code.'}
              </li>
              <li>
                <strong className="font-medium text-foreground/90">GUI settings</strong>
                {' (top right) controls the paste guide and whether panels start open.'}
              </li>
            </ul>
          </section>

          <DemoSection
            title="Text scramble"
            description="Two sentences trade places character by character, with a chroma-split shader panel mirroring the text mid-transition. Set the phrases, timing and character set in the GUI."
            paste={{
              file: 'src/shared/ui/scramble-text/ScrambleText.tsx',
              symbol: 'ScrambleText',
              format: 'props',
              note: 'Scramble timing and character set. Phrases stay at the call site.',
            }}
          >
            <ScramblePlayground />
          </DemoSection>

          <DemoSection
            title="Refraction hover"
            description="Two layers track the cursor over an image or video: a screen-space warp (refraction, chromatic dispersion, noise, velocity smear) and a flattened glass mesh refracting the warped result through six spectral bands. Drop the glass out with the lens visibility control; upload your own media (10 MB max) from the GUI."
            paste={{
              file: 'src/Home/hero/HeroBackground.tsx',
              symbol: 'LENS',
              format: 'object',
              note: 'The home hero reads these. Media stays bound in the component.',
            }}
          >
            <RefractionPlayground />
          </DemoSection>

          <DemoSection
            title="Dispersion mesh"
            description="A glass mesh tumbles after the cursor over image or video media, refracting it through six spectral bands sampled from an FBO snapshot, and glides back to center on leave. Defaults to the home hero's gradient video."
            paste={{
              file: 'src/features/immersive/ui/dispersion-media.tsx',
              symbol: 'DispersionMedia',
              format: 'props',
              note: 'Mesh, dispersion and IOR settings. The media source stays at the call site.',
            }}
          >
            <DispersionPlayground />
          </DemoSection>

          <DemoSection
            title="Floating cards"
            description="Screenshot cards tilt on Y and drift in a slow loop. Hover or focus a featured-work item to stagger them in; leave to animate them back out."
            paste={{
              file: 'src/features/immersive/ui/floating-cards.tsx',
              symbol: 'FloatingCards',
              format: 'props',
              note: 'Tilt, drift and entrance timing. Card layout and images stay at the call site.',
            }}
          >
            <FloatingCardsPlayground />
          </DemoSection>

          <DemoSection
            title="Text load-in"
            description="A scroll-triggered reveal: the eyebrow decodes via scramble, the headline resolves through a smear shader that bleeds characters into each other, then the supporting line rises in. Edit the copy and replay it from the GUI."
            paste={{
              file: 'src/features/immersive/ui/text-load-in.tsx',
              symbol: 'TextLoadIn',
              format: 'props',
              note: 'Reveal timing and smear settings. The copy stays at the call site.',
            }}
          >
            <TextLoadInPlayground />
          </DemoSection>

          <DemoSection
            title="Text load-in v2 — true raymarching"
            description="The same reveal built on a real signed distance field: the headline is extruded and raymarched in 3D, a smooth-min front sweeps it into existence with metaball droplets lit by SDF-gradient normals, then hands off to the crisp DOM heading. Tune the SDF scene from the GUI."
            paste={{
              file: 'src/features/immersive/ui/text-load-in-raymarched.tsx',
              symbol: 'TextLoadInRaymarched',
              format: 'props',
              note: 'SDF, droplet and timing settings. The copy stays at the call site.',
            }}
          >
            <TextLoadInRaymarchedPlayground />
          </DemoSection>

          <div className="h-24" />

          <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
            End of scroll probe — Lenis should ease to a stop here.
          </p>
        </div>
      </ImmersiveShell>
    </DemoSettingsProvider>
  )
}
