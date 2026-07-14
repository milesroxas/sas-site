import config from '@payload-config'
import { getPayload } from 'payload'
import { buildPostMarkdown } from '@/plugins/aeo/buildLlms'
import { getServerSideURL } from '@/utilities/getURL'

type Args = { params: Promise<{ slug: string }> }

/**
 * Markdown alternate for a post. Reached directly at /md/posts/[slug] and via
 * the rewrites in next.config.ts: /posts/[slug].md and content negotiation
 * (Accept: text/markdown) on /posts/[slug].
 */
export async function GET(_request: Request, { params }: Args) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const payload = await getPayload({ config })
  const markdown = await buildPostMarkdown(payload, decodedSlug)

  if (!markdown) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      Link: `<${getServerSideURL()}/posts/${decodedSlug}>; rel="canonical"`,
      Vary: 'Accept',
    },
  })
}
