/** Every navigation technique in production, where it fires, and what tags it. */
const TECHNIQUES = [
  {
    name: 'nav-forward',
    detail:
      'Mask reveal from the right edge, going deeper; the old page holds still beneath. Insight cards (title links and body clicks via useClickableCard), work index rows, segment index cards, related work and post rails, and pagination toward higher pages.',
  },
  {
    name: 'nav-back',
    detail:
      'Mask reveal from the left edge, going shallower. Pagination toward lower pages and CMS links that opt into transitionDirection="back".',
  },
  {
    name: 'nav-lateral',
    detail:
      'Top-down mask reveal, no spatial depth: the scroll-reveal wipe at page scale. The CMSLink default, the header brand, the 404 link, the form block’s confirmation redirect, and the demo sidebar.',
  },
  {
    name: 'post-image morph',
    detail:
      'A post card image and its hero carry the same view-transition-name (postImageVtName) and paint into the same POST_IMAGE_FRAME, so the browser interpolates one rect into the other over the move duration, through a light blur. Type-gated to nav-forward and nav-back (postImageShare); every other pairing stays silent. Layering today: the incoming page group paints above the morph group, so the image ducks under the wipe and reappears in the hero. The simulator’s Post morph, above page toggle previews the proposed z-index fix.',
  },
  {
    name: 'work-open',
    detail:
      'The work-media takeover, from the Industry work spotlight’s "View case study" link and its media panel. The old page fades out, the media (morph-hero, workImageVtName) glides straight to vertical center, expands about its own center to full screen, then the shared hero landing closes its mask one axis at a time onto the case-study hero and dissolves the hero’s own copy in, while the new page fades in beneath. The beat split runs in WAAPI (sequenceWorkImageMorph); browsers without linear() get a single CSS glide on the same variables.',
  },
  {
    name: 'menu navigations (not view transitions)',
    detail:
      'The takeover menu owns its two navigations with GSAP and removes document.startViewTransition for the flight. A plain close holds the docked window’s media through the undock and lifts a curtain on the reveal’s own duration and ease (the lateral wipe, so a menu link lands like any lateral link); a link with hero media plays the hero handoff, whose closing half is the same hero landing the takeover plays. Tune the lift here and the landing in the Hero landing section.',
  },
  {
    name: 'pinned chrome',
    detail:
      'site-header, site-footer and the global WebGL canvas are named groups with animation: none; they hold rock-steady through every swap.',
  },
  {
    name: 'untagged: hard cut',
    detail:
      "Browser back/forward, revalidations and search-as-you-type URL sync carry no type, and default: 'none' keeps them silent by design.",
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
            <code className="font-mono text-foreground/90">DirectionalTransition</code>, the
            shared-element pairings, and the recipes in{' '}
            <code className="font-mono text-foreground/90">view-transition.css</code>. The GUI
            live-overrides only the <code className="font-mono text-foreground/90">:root</code>{' '}
            timing variables, opens on whatever the stylesheet ships, and clears them when you
            leave.
          </li>
          <li>
            The network and server sliders insert the real dead time a navigation spends before
            anything moves: Next.js fetches the RSC payload, then the transition plays. Production
            ships no loading UI, so that stillness is the actual experience. The timeline below the
            frame plots it.
          </li>
          <li>
            The work takeover measures the real viewport, so the window fills it for that run;
            restore it from the window chrome or press Esc. Every other navigation plays inside the
            frame, with its snapshots clipped to the window.
          </li>
          <li>
            A view transition freezes the whole document while it runs (browser behavior), this GUI
            included. That is also true in production.
          </li>
          <li>The frame scrolls through its own Lenis instance, tuned like the site&apos;s.</li>
          <li>
            <strong className="font-medium text-foreground/90">Copy</strong> writes the whole{' '}
            <code className="font-mono text-foreground/90">:root</code> block for{' '}
            <code className="font-mono text-foreground/90">view-transition.css</code>, every
            variable in its order, so a paste can never drop one.
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
