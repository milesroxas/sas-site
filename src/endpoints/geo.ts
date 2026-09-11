import type { Endpoint } from 'payload'

const COUNTRY_CODE = /^[A-Z]{2}$/

/**
 * GET /api/geo: the visitor's country, from the header Vercel's edge adds to
 * every request. It exists so a client script can be limited to one country
 * without the page reading request headers itself, which would opt every
 * prerendered page out of static rendering. Returns the ISO country code only,
 * never the IP, and is never cached.
 */
export const geoEndpoint: Endpoint = {
  path: '/geo',
  method: 'get',
  handler: (req) => {
    const header = req.headers.get('x-vercel-ip-country')
    return Response.json(
      { country: header && COUNTRY_CODE.test(header) ? header : null },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  },
}
