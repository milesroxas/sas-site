import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache.js'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

const getWhoWeHelpSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    return payload.find({
      collection: 'audience-pages',
      draft: false,
      overrideAccess: false,
      limit: 1000,
      pagination: false,
      select: { slug: true, updatedAt: true },
    })
  },
  ['who-we-help-sitemap'],
  { tags: ['who-we-help-sitemap'] },
)

export async function GET() {
  const { docs } = await getWhoWeHelpSitemap()
  const base = getServerSideURL()
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${docs.map((doc) => `<url><loc>${base}/who-we-help/${encodeURIComponent(doc.slug)}</loc><lastmod>${doc.updatedAt}</lastmod></url>`).join('')}</urlset>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
