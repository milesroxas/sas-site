/** Every transition technique in production, where it fires, and what tags it. */
const TECHNIQUES = [
  {
    name: 'nav-forward',
    detail:
      'Mask reveal from the right edge, going deeper. Cards (title links and body clicks via useClickableCard), work/segment index cards, and pagination toward higher pages.',
  },
  {
    name: 'nav-back',
    detail:
      'Mask reveal from the left edge, going shallower. Pagination toward lower pages and back links.',
  },
  {
    name: 'nav-lateral',
    detail:
      'Top-down mask reveal, no spatial depth — the scroll-reveal wipe at page scale. The CMSLink default — header logo, takeover menu links, 404.',
  },
  {
    name: 'shared-element morph',
    detail:
      'A post card image and its detail hero carry the same view-transition-name (postImageVtName), so the browser interpolates between them over the move duration.',
  },
  {
    name: 'pinned chrome',
    detail:
      'site-header, site-footer and the global WebGL canvas are named groups with animation: none — they hold rock-steady through every swap.',
  },
  {
    name: 'untagged — hard cut',
    detail:
      "Browser back/forward, revalidations, search-as-you-type URL sync, and the menu hero handoff's push carry no type, and default: 'none' keeps them silent by design.",
  },
]

/** Prose section: how the playground works and where each technique ships. */
export function TransitionsOverview() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-balance text-xl tracking-tight">How this page works</h2>
        <ul className="max-w-prose list-disc space-y-2 pl-5 text-pretty text-sm/relaxed text-muted-foreground">
          <li>
            Every run in the frame goes through the production{' '}
            <code className="font-mono text-foreground/90">DirectionalTransition</code> and the
            recipes in <code className="font-mono text-foreground/90">view-transition.css</code> —
            the GUI live-overrides only the{' '}
            <code className="font-mono text-foreground/90">:root</code> timing variables, and clears
            them when you leave.
          </li>
          <li>
            The network and server sliders insert the real dead time a navigation spends before
            anything moves: Next.js fetches the RSC payload, then the transition plays. Production
            ships no loading UI, so that stillness is the actual experience — the timeline below the
            frame plots it.
          </li>
          <li>
            A view transition freezes the whole document while it runs (browser behavior), this GUI
            included. That is also true in production.
          </li>
          <li>
            The frame scrolls through its own Lenis instance, tuned like the site&apos;s, and
            transition snapshots are clipped to the window while you are here — nothing escapes the
            mock browser.
          </li>
          <li>
            <strong className="font-medium text-foreground/90">Copy</strong> writes the{' '}
            <code className="font-mono text-foreground/90">:root</code> block for{' '}
            <code className="font-mono text-foreground/90">view-transition.css</code>.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-balance text-xl tracking-tight">
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
  )
}
