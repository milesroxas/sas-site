import { CMSLink } from '@/components/Link'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Clock } from './Clock'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  return (
    <footer
      data-site-footer
      // Fixed to the viewport bottom; while the takeover menu is open the
      // transformed page frame becomes its containing block, so the footer
      // docks to the bottom of the scaled-down card instead.
      className="fixed inset-x-0 bottom-0 z-30 grid h-(--footer-height) grid-cols-[1fr_auto_1fr] items-center bg-background px-5 md:px-20"
      // Keep the footer static during page transitions.
      style={{ viewTransitionName: 'site-footer' }}
    >
      <p className="hidden font-mono text-xs uppercase text-foreground md:block">
        {footerData?.location}
      </p>
      <CMSLink
        {...footerData?.getInTouch}
        appearance="inline"
        // Negative margin cancels the trailing letter-space so the label
        // visually centers on its glyphs.
        className="col-start-2 mr-[-0.58em] text-sm font-black uppercase tracking-[0.58em] text-foreground transition-colors hover:text-primary"
      />
      <Clock className="col-start-3 justify-self-end" />
    </footer>
  )
}
