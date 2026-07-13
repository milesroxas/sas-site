import { expect, type Page, test } from '@playwright/test'

test.describe('Frontend', () => {
  let _page: Page

  test.beforeAll(async ({ browser }, _testInfo) => {
    const context = await browser.newContext()
    _page = await context.newPage()
  })

  test('can load homepage', async ({ page }) => {
    const response = await page.goto('http://localhost:3001')
    expect(response?.ok()).toBe(true)
    await expect(page).not.toHaveTitle('')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
