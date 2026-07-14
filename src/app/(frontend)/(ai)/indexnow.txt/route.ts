/**
 * IndexNow key file (spec: indexnow.org). Hosted at a fixed path and declared
 * via the `keyLocation` submission parameter, so rotating the key is a pure
 * env change (INDEXNOW_KEY) with no code commit.
 */
export async function GET() {
  const key = process.env.INDEXNOW_KEY

  if (!key) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  })
}
