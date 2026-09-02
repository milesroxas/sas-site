import { draftMode } from 'next/headers'
import { CONTACT_INDEX_SLUG } from '@/collections/ContactPages/constants'
import { ContactPageTemplate } from '@/collections/ContactPages/ui/ContactTemplate'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { slugMetadata } from '@/utilities/slugRoute'
import { queryContactPageBySlug } from './[slug]/page'

/**
 * The studio's front door. One contact page renders here rather than under the
 * prefix, so `/contact` is a real page and not a redirect; the rest of the
 * collection lives at `/contact/[slug]`.
 */
export const generateMetadata = () =>
  slugMetadata(
    '/contact',
    queryContactPageBySlug,
  )({
    params: Promise.resolve({ slug: CONTACT_INDEX_SLUG }),
  })

export default async function ContactIndexRoute() {
  const { isEnabled: draft } = await draftMode()
  const page = await queryContactPageBySlug(CONTACT_INDEX_SLUG)
  if (!page) return <PayloadRedirects url="/contact" />

  return (
    <article className={`${FOOTER_CLOSING_ARTICLE_CLASS} pt-16 pb-24`}>
      <PayloadRedirects disableNotFound url="/contact" />
      {draft && <LivePreviewListener />}
      <ContactPageTemplate page={page} />
    </article>
  )
}
