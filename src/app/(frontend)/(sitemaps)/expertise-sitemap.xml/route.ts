import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

const getExpertiseSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    return payload.find({
      collection: 'expertise-pages',
      draft: false,
      overrideAccess: false,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    })
  },
  ['expertise-sitemap'],
  { tags: ['expertise-sitemap'] },
)

export async function GET() {
  const { docs } = await getExpertiseSitemap()
  const base = getServerSideURL()
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${docs.map((doc) => `<url><loc>${base}/expertise/${encodeURIComponent(doc.slug)}</loc><lastmod>${doc.updatedAt}</lastmod></url>`).join('')}</urlset>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
