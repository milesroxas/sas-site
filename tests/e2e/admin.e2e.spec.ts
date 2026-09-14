import { expect, type Page, test } from '@playwright/test'
import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }, _testInfo) => {
    // Seeding boots Payload in a subprocess, which pulls the schema before it
    // can write the user; that is well past the default 30s hook budget.
    test.setTimeout(180_000)
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    test.setTimeout(180_000)
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3001/admin')
    await expect(page).toHaveURL('http://localhost:3001/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3001/admin/collections/users')
    await expect(page).toHaveURL('http://localhost:3001/admin/collections/users')
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3001/admin/collections/pages/create')
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="title"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
