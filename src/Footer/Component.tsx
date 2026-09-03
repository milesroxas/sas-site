import { Container } from '@/components/Container'
import { CMSLink } from '@/components/Link'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Clock } from './Clock'
import { FooterBar } from './FooterBar'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  return (
    <FooterBar>
      <Container className="grid h-full grid-cols-[1fr_auto_1fr] items-center">
        <p className="hidden font-mono text-xs uppercase md:block">{footerData?.location}</p>
        <CMSLink
          {...footerData?.getInTouch}
          appearance="inline"
          // Negative margin cancels the trailing letter-space so the label
          // visually centers on its glyphs.
          className="col-start-2 mr-[-0.4em] text-sm font-black uppercase tracking-[0.4em] transition-colors hover:text-primary md:mr-[-0.58em] md:tracking-[0.58em]"
        />
        {/* Time moves into the mobile takeover menu; keep it in the footer from md up. */}
        <Clock className="col-start-3 hidden justify-self-end md:flex" />
      </Container>
    </FooterBar>
  )
}
