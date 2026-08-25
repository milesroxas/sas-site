import { getCachedGlobal } from '@/utilities/getGlobals'
import { FooterClosing } from './FooterClosing'

/**
 * Server adapter: reads the same cached footer global as the footer bar and
 * renders the presentational closing band. Rendered after the page article on
 * Home, Pages and the Posts index so it sits flush above the fixed bar.
 */
export async function FooterClosingSection() {
  const footerData = await getCachedGlobal('footer', 1)()

  return <FooterClosing closing={footerData?.closing} />
}
