import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { renderEmail } from '@/shared/email/lib/render'
import { buildNewsletterEmail } from '@/shared/email/newsletter/build'
import { getServerSideURL } from '@/utilities/getURL'

// Always render the freshest draft — this page backs the admin live preview.
export const dynamic = 'force-dynamic'

/**
 * Admin-only rendering of a newsletter as the actual email HTML, isolated in an iframe so email
 * CSS never collides with the site. Wired to `newsletters.admin.livePreview`: the admin panel
 * autosaves drafts and `LivePreviewListener` refreshes this route on every save, so the team
 * sees the real email while typing. Auth uses the same Payload cookie as the admin panel.
 */
export default async function NewsletterPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) notFound()

  const newsletter = await payload
    .findByID({ collection: 'newsletters', id, draft: true, depth: 2 })
    .catch(() => null)
  if (!newsletter) notFound()

  const { html } = await renderEmail(
    buildNewsletterEmail({
      newsletter,
      baseUrl: getServerSideURL(),
      unsubscribeToken: 'preview',
    }),
  )

  return (
    <>
      <LivePreviewListener />
      <iframe
        srcDoc={html}
        title={`Preview of ${newsletter.subject}`}
        style={{ display: 'block', width: '100%', height: '100dvh', border: 0, background: '#fff' }}
      />
    </>
  )
}
