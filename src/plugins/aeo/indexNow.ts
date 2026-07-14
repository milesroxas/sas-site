import type { Payload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/**
 * Submissions only make sense for the canonical production host: preview and
 * local URLs would fail key validation and pollute engine queues. VERCEL_ENV
 * (not NODE_ENV, which is 'production' in preview builds too) identifies real
 * production deployments.
 */
export const indexNowEnabled = (): boolean =>
  Boolean(process.env.INDEXNOW_KEY) && process.env.VERCEL_ENV === 'production'

/**
 * Push changed URLs to the shared IndexNow endpoint; participants (Bing,
 * Yandex, Naver, Seznam, Amazonbot, Internet Archive) propagate among
 * themselves. Submission is a hint, not a transaction: log failures, never
 * throw, never retry aggressively. 202 = accepted with key validation pending.
 */
export const submitToIndexNow = async (payload: Payload, urls: string[]): Promise<void> => {
  if (!indexNowEnabled() || !urls.length) return

  const siteUrl = getServerSideURL()

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(siteUrl).host,
        key: process.env.INDEXNOW_KEY,
        keyLocation: `${siteUrl}/indexnow.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (res.status === 200 || res.status === 202) {
      payload.logger.info(`IndexNow: submitted ${urls.join(', ')}`)
    } else {
      payload.logger.warn(`IndexNow: status ${res.status} submitting ${urls.join(', ')}`)
    }
  } catch (err) {
    payload.logger.warn({ msg: 'IndexNow: submission failed', err })
  }
}
