import config from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'
import { buildLlmsTxt } from '@/plugins/aeo/buildLlms'

const getLlmsTxt = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return buildLlmsTxt(payload)
  },
  ['llms-txt'],
  { tags: ['llms-txt', 'global_site-info'] },
)

export async function GET() {
  const body = await getLlmsTxt()

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
