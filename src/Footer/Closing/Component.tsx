import type { PageClosing } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { formatPostalAddress } from './address'
import { FooterClosing } from './FooterClosing'
import { resolveClosing } from './resolve'

/**
 * Server adapter: reads the Footer global, merges optional page-level
 * overrides, and renders the closing band. Omit `closing` to inherit Footer
 * with the band shown (index pages). Pass the page's `closing` group to honor
 * hide/override on Home, Pages, Posts, Work, Audience, and Expertise.
 *
 * Site Info decides which panel fills the right-hand column: the ask
 * composer, or, with Ask hidden site-wide, the address panel (note from the
 * Footer, postal lines from Site Info › Address).
 */
export async function FooterClosingSection({ closing }: { closing?: PageClosing | null } = {}) {
  if (closing?.hidden) return null

  const [footerData, siteInfo] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getCachedGlobal('site-info', 1)(),
  ])

  return (
    <FooterClosing
      address={formatPostalAddress(siteInfo?.address)}
      askHidden={Boolean(siteInfo?.ask?.hidden)}
      closing={resolveClosing(closing, footerData?.closing)}
    />
  )
}
