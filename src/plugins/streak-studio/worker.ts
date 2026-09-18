import type { Browser } from 'playwright-core'
import {
  STREAK_RENDERER_VERSION,
  type StreakSnapshot,
  validateCapture,
} from '@/features/immersive/studio/recipe'
import type { StreakRender } from '@/payload-types'

export async function runStudioWorker(
  browser: Browser,
  options: { baseURL: string; secret: string; limit?: number },
) {
  const baseURL = options.baseURL
  const secret = options.secret
  if (!baseURL || !secret)
    throw new Error('STREAK_STUDIO_URL and STREAK_WORKER_SECRET (or CRON_SECRET) are required.')
  const origin = new URL(baseURL).origin
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  }
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (bypass) headers['x-vercel-protection-bypass'] = bypass
  async function request(path: string, data = {}) {
    const response = await fetch(`${origin}/api/streak-worker/${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(180000),
    })
    if (!response.ok)
      throw new Error(`${path}: HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`)
    return response.json()
  }

  for (let iteration = 0; iteration < (options.limit ?? 5); iteration++) {
    const job = (await request('claim')) as (StreakRender & { lease: string }) | null
    if (!job) {
      console.log('No queued Streak Field renders.')
      break
    }
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1920 },
      extraHTTPHeaders: bypass ? { 'x-vercel-protection-bypass': bypass } : {},
    })
    const page = await context.newPage()
    try {
      const capture = validateCapture(job.capture)
      const snapshot = job.snapshot as unknown as StreakSnapshot
      if (snapshot.renderer !== STREAK_RENDERER_VERSION)
        throw new Error(
          'Unsupported renderer version. Keep the capture build for this version or upgrade the draft.',
        )
      await page.goto(`${origin}/streak-capture`, { waitUntil: 'domcontentloaded', timeout: 90000 })
      await page.waitForFunction(() => typeof window.streakCapture === 'function', undefined, {
        timeout: 90000,
      })
      const images: Record<string, string> = {}
      for (const surface of job.kind === 'publish'
        ? (['dark', 'light'] as const)
        : [capture.surface]) {
        await page.evaluate(
          (input) => {
            if (!window.streakCapture) throw new Error('Capture renderer unavailable')
            window.streakCapture(input)
          },
          { snapshot, capture: { ...capture, surface } },
        )
        await page.waitForFunction(
          () => Boolean(window.streakCaptureResult || window.streakCaptureError),
          undefined,
          { timeout: 180000 },
        )
        const result = await page.evaluate(() => ({
          image: window.streakCaptureResult,
          error: window.streakCaptureError,
        }))
        if (result.error || !result.image) throw new Error(result.error || 'No captured pixels.')
        images[job.kind === 'publish' ? surface : 'image'] = result.image
      }
      await request('finish', {
        id: job.id,
        lease: job.lease,
        ...images,
        build: process.env.GITHUB_SHA || process.env.STREAK_CAPTURE_BUILD || origin,
      })
      console.log(`Completed ${job.kind} render #${job.id}.`)
    } catch (error) {
      console.error(`Render #${job.id}: ${String(error)}`)
      // A cancelled or reclaimed job has no lease left to report against; the
      // queue already knows, and the next job should still run.
      await request('finish', { id: job.id, lease: job.lease, error: String(error) }).catch(
        (failure) => console.error(`Render #${job.id}: could not report: ${String(failure)}`),
      )
    } finally {
      await context.close()
    }
  }
}
