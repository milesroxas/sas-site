import { draftMode } from 'next/headers'
import { ContactPageTemplate } from '@/collections/ContactPages/ui/ContactTemplate'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import {
  createSlugQuery,
  type SlugRouteArgs,
  slugMetadata,
  slugStaticParams,
} from '@/utilities/slugRoute'

/** Depth 2 so the linked form arrives with its fields and their relationships. */
export const queryContactPageBySlug = createSlugQuery('contact-pages', { depth: 2 })

export const generateStaticParams = slugStaticParams('contact-pages')
export const generateMetadata = slugMetadata('/contact', queryContactPageBySlug)

export default async function ContactPageRoute({ params }: SlugRouteArgs) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const url = `/contact/${decodedSlug}`
  const page = await queryContactPageBySlug(decodedSlug)
  if (!page) return <PayloadRedirects url={url} />

  return (
    <article className={`${FOOTER_CLOSING_ARTICLE_CLASS} pt-16 pb-24`}>
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <ContactPageTemplate page={page} />
    </article>
  )
}
