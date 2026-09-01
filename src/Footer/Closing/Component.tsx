import type { PageClosing } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { FooterClosing } from './FooterClosing'
import { resolveClosing } from './resolve'

/**
 * Server adapter: reads the Footer global, merges optional page-level
 * overrides, and renders the closing band. Omit `closing` to inherit Footer
 * with the band shown (index pages). Pass the page's `closing` group to honor
 * hide/override on Home, Pages, Posts, Work, Audience, and Expertise.
 */
export async function FooterClosingSection({ closing }: { closing?: PageClosing | null } = {}) {
  if (closing?.hidden) return null

  const footerData = await getCachedGlobal('footer', 1)()

  return <FooterClosing closing={resolveClosing(closing, footerData?.closing)} />
}
