'use client'

import { DemoSection, DemoSettingsMenu, DemoSettingsProvider } from '@/shared/ui/demo-kit'
import { TransitionSimulator } from './transition-simulator'

/** Every transition technique in production, where it fires, and what tags it. */
const TECHNIQUES = [
  {
    name: 'nav-forward',
    detail:
      'Slide left + fade, going deeper. Card title links (components/Card) and pagination toward higher pages.',
  },
  {
    name: 'nav-back',
    detail: 'Slide right + fade, going shallower. Pagination toward lower pages and back links.',
  },
  {
    name: 'nav-lateral',
    detail:
      'Pure fade, no spatial depth. The CMSLink default — header logo, takeover menu links, 404.',
  },
  {
    name: 'shared-element morph',
    detail:
      'A post card image and its detail hero carry the same view-transition-name (postImageVtName), so the browser interpolates between them over the move duration.',
  },
  {
    name: 'home-hero recede',
    detail:
      'The home hero is its own group (.vt-home-hero) and dollies back over 560ms, overlapping the incoming page.',
  },
  {
    name: 'pinned chrome',
    detail:
      'site-header, site-footer and the global WebGL canvas are named groups with animation: none — they hold rock-steady through every swap.',
  },
  {
    name: 'untagged — hard cut',
    detail:
      "Browser back/forward, revalidations, and card body clicks (the useClickableCard gap) carry no type, and default: 'none' keeps them silent by design.",
  },
]

/**
 * Full-page playground for the site's route transitions: the production
 * `<ViewTransition>` recipes running inside a throttleable mock browser.
 */
export function TransitionDemoPage() {
  return (
    <DemoSettingsProvider>
      <div className="container relative max-w-4xl space-y-8 py-24">
        <header className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            FSD · widgets/transition-demo
          </p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight">Page transitions</h1>
            <DemoSettingsMenu />
          </div>
          <p className="max-w-prose text-pretty text-lg/relaxed text-muted-foreground">
            The site&apos;s real navigation motion, live and tunable — with the network and server
            conditions a visitor actually brings. Throttle the fetch, feel the dead time, tune the
            timing variables, copy them back.
          </p>
        </header>

        <section className="space-y-3 rounded-lg border border-border bg-card/80 p-6 backdrop-blur-sm">
          <h2 className="text-balance text-xl font-medium tracking-tight">How this page works</h2>
          <ul className="max-w-prose list-disc space-y-2 pl-5 text-pretty text-sm/relaxed text-muted-foreground">
            <li>
              Every run in the frame goes through the production{' '}
              <code className="font-mono text-foreground/90">DirectionalTransition</code> and the
              recipes in <code className="font-mono text-foreground/90">view-transition.css</code> —
              the GUI live-overrides only the{' '}
              <code className="font-mono text-foreground/90">:root</code> timing variables, and
              clears them when you leave.
            </li>
            <li>
              The network and server sliders insert the real dead time a navigation spends before
              anything moves: Next.js fetches the RSC payload, then the transition plays. Production
              ships no loading UI, so that stillness is the actual experience — the timeline below
              the frame plots it.
            </li>
            <li>
              A view transition freezes the whole document while it runs (browser behavior), this
              GUI included. That is also true in production.
            </li>
            <li>
              The frame scrolls through its own Lenis instance, tuned like the site&apos;s, and
              transition snapshots are clipped to the window while you are here — nothing escapes
              the mock browser.
            </li>
            <li>
              <strong className="font-medium text-foreground/90">Copy</strong> writes the{' '}
              <code className="font-mono text-foreground/90">:root</code> block for{' '}
              <code className="font-mono text-foreground/90">view-transition.css</code>.
            </li>
          </ul>
        </section>

        <DemoSection
          title="Route transition simulator"
          description="A miniature of the site in a browser frame: cards tag nav-forward, menu links tag nav-lateral, pagination tags by direction, post images morph into their hero, the home hero recedes on its own track — and card bodies reproduce the untagged hard cut. Set the network conditions in the GUI, then navigate."
          paste={{
            file: 'src/shared/ui/view-transition/view-transition.css',
            symbol: ':root',
            format: 'css-vars',
            note: 'Site-wide transition timing. Every tagged navigation reads these variables.',
          }}
        >
          <TransitionSimulator />
        </DemoSection>

        <section className="space-y-4 rounded-lg border border-border bg-card/80 p-6 backdrop-blur-sm">
          <h2 className="text-balance text-xl font-medium tracking-tight">
            Where each technique fires in production
          </h2>
          <dl className="space-y-3">
            {TECHNIQUES.map((technique) => (
              <div key={technique.name} className="space-y-1">
                <dt className="font-mono text-sm text-foreground">{technique.name}</dt>
                <dd className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
                  {technique.detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </DemoSettingsProvider>
  )
}
