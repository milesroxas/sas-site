import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { CONTACT_INDEX_SLUG } from '@/collections/ContactPages/constants'
import { ContactPageTemplate } from '@/collections/ContactPages/ui/ContactTemplate'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { generateMeta } from '@/utilities/generateMeta'
import { queryContactPageBySlug } from './[slug]/page'

/**
 * The studio's front door. One contact page renders here rather than under the
 * prefix, so `/contact` is a real page and not a redirect; the rest of the
 * collection lives at `/contact/[slug]`. The canonical is this route's own
 * path: the slug helper would print `/contact/contact`, the copy that
 * redirects here.
 */
export const generateMetadata = async () =>
  generateMeta({ doc: await queryContactPageBySlug(CONTACT_INDEX_SLUG), pathname: '/contact' })

export default async function ContactIndexRoute() {
  const { isEnabled: draft } = await draftMode()
  const page = await queryContactPageBySlug(CONTACT_INDEX_SLUG)
  if (!page) notFound()

  return (
    <article className={`${FOOTER_CLOSING_ARTICLE_CLASS} pt-16 pb-24`}>
      {draft && <LivePreviewListener />}
      <ContactPageTemplate page={page} />
    </article>
  )
}
