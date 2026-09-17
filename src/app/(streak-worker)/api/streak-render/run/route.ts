import { timingSafeEqual } from 'node:crypto'
import chromium from '@sparticuz/chromium'
import { after } from 'next/server'
import { chromium as playwright } from 'playwright-core'
import { runStudioWorker } from '@/plugins/streak-studio/worker'

export const maxDuration = 300

export async function POST(request: Request) {
  const secret = process.env.STREAK_WORKER_SECRET || process.env.CRON_SECRET
  const actual = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!secret || !actual || Buffer.byteLength(secret) !== Buffer.byteLength(actual) || !timingSafeEqual(Buffer.from(secret), Buffer.from(actual))) return new Response('Unauthorized', { status: 401 })
  const baseURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin
  after(async () => {
    const browser = await playwright.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true })
    try { await runStudioWorker(browser, { baseURL, secret, limit: 1 }) } finally { await browser.close() }
  })
  return Response.json({ accepted: true }, { status: 202 })
}
