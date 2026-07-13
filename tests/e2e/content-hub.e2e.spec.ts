import { execFileSync } from 'node:child_process'
import { expect, test } from '@playwright/test'

const runFixture = (operation: 'create' | 'delete', suffix: string) => {
  execFileSync(
    'pnpm',
    ['exec', 'tsx', 'tests/e2e/support/content-hub-fixture.ts', operation, suffix],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    },
  )
}

test.describe
  .serial('Work Page frontend', () => {
    const suffix = Date.now().toString()
    const canonicalSlug = `canonical-${suffix}`
    const overrideSlug = `override-${suffix}`

    test.beforeAll(async () => {
      runFixture('create', suffix)
    })

    test.afterAll(async () => {
      runFixture('delete', suffix)
    })

    test('renders canonical content through a Work Page and hides unapproved metrics', async ({
      page,
    }) => {
      await page.goto(`http://localhost:3001/works/${canonicalSlug}`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Canonical hero title')
      await expect(page.getByText('Canonical hero summary')).toBeVisible()
      await expect(page.getByText('Canonical story challenge')).toBeVisible()
      await expect(page.getByText('Website-only transition')).toBeVisible()
      await expect(page.getByText('Approved metric')).toBeVisible()
      await expect(page.getByText('Hidden metric')).toHaveCount(0)
    })

    test('renders website presentation overrides', async ({ page }) => {
      await page.goto(`http://localhost:3001/works/${overrideSlug}`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Website override title')
      await expect(page.getByText('Website override summary')).toBeVisible()
    })

    test('returns not found for a missing Work Page', async ({ page }) => {
      const response = await page.goto(`http://localhost:3001/works/missing-${suffix}`)
      expect(response?.status()).toBe(404)
    })
  })
