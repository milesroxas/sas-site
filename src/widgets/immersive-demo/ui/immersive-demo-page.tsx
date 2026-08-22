'use client'

import { ImmersiveShell, WebGLTunnel, WebGlBackdropScene } from '@/features/immersive'
import { DemoSection, DemoSettingsMenu, DemoSettingsProvider } from '@/shared/ui/demo-kit'
import { DispersionPlayground } from './dispersion-playground'
import { FloatingCardsPlayground } from './floating-cards-playground'
import { RefractionPlayground } from './refraction-playground'
import { ScramblePlayground } from './scramble-playground'

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

        <div className="container max-w-4xl py-16 md:py-24 space-y-8 relative z-10">
          <header className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              FSD · widgets/immersive-demo
            </p>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <h1 className="text-balance text-heading-2">Micro interactions</h1>
              <DemoSettingsMenu />
            </div>
            <p className="max-w-prose text-pretty text-lg/relaxed text-muted-foreground">
              Every immersive effect in the codebase, live and tunable. Open a section&apos;s GUI to
              dial it in, then copy the values into the component that ships it.
            </p>
          </header>

          <section className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-6 space-y-3">
            <h2 className="text-balance text-xl tracking-tight">How this page works</h2>
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

          <div className="h-24" />

          <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
            End of scroll probe — Lenis should ease to a stop here.
          </p>
        </div>
      </ImmersiveShell>
    </DemoSettingsProvider>
  )
}
