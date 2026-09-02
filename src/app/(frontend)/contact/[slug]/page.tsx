import { draftMode } from 'next/headers'
import { permanentRedirect } from 'next/navigation'
import { CONTACT_INDEX_SLUG } from '@/collections/ContactPages/constants'
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

/** The index page renders at `/contact` itself, so it has no child route. */
const allContactParams = slugStaticParams('contact-pages')
export const generateStaticParams = async () =>
  (await allContactParams()).filter(({ slug }) => slug !== CONTACT_INDEX_SLUG)

export const generateMetadata = slugMetadata('/contact', queryContactPageBySlug)

export default async function ContactPageRoute({ params }: SlugRouteArgs) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  if (decodedSlug === CONTACT_INDEX_SLUG) permanentRedirect('/contact')
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
