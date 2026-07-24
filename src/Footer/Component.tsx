import { CMSLink } from '@/components/Link'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Clock } from './Clock'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  return (
    <footer
      data-site-footer
      // Fixed to the viewport bottom; while the takeover menu is open the
      // page frame becomes its containing block (then fades out of the
      // 16:9 preview window).
      className="fixed inset-x-0 bottom-0 z-30 grid h-(--footer-bar-height) grid-cols-[1fr_auto_1fr] items-center bg-background px-5 transition-[height] duration-300 motion-reduce:transition-none md:px-20"
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
        className="col-start-2 mr-[-0.4em] text-xs font-black uppercase tracking-[0.4em] text-foreground transition-colors hover:text-primary md:mr-[-0.58em] md:text-sm md:tracking-[0.58em]"
      />
      {/* Time moves into the mobile takeover menu; keep it in the footer from md up. */}
      <Clock className="col-start-3 hidden justify-self-end md:flex" />
    </footer>
  )
}
