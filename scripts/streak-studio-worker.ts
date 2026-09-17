import { chromium as installedChromium } from '@playwright/test'
import { chromium } from 'playwright-core'
import { runStudioWorker } from '../src/plugins/streak-studio/worker'

const baseURL = process.env.STREAK_STUDIO_URL
const secret = process.env.STREAK_WORKER_SECRET || process.env.CRON_SECRET
if (!baseURL || !secret) throw new Error('STREAK_STUDIO_URL and a worker secret are required.')
const browser = await chromium.launch({
  executablePath: installedChromium.executablePath(),
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
})
try {
  await runStudioWorker(browser, { baseURL, secret })
} finally {
  await browser.close()
}
