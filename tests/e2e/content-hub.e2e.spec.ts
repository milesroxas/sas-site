import { execFileSync } from 'node:child_process'
import { expect, type Locator, test } from '@playwright/test'

/**
 * Work Page copy below the hero enters on a scroll reveal, which holds it
 * `visibility: hidden` until its gate fires. Scrolling to it first is what an
 * actual reader does, so the assertion still proves the content rendered and
 * became visible rather than skipping the reveal.
 */
const revealed = async (locator: Locator) => {
  // The gate fires once the target has risen past 25% of the viewport
  // (`SCROLL_REVEAL_TRIGGER_DEFAULTS.enterOffset`), so centering it is what
  // opens the reveal; `scrollIntoViewIfNeeded` can stop short at the bottom
  // edge and leave the entrance parked.
  await locator.evaluate((el) => {
    el.scrollIntoView({ block: 'center' })
  })
  await expect(locator).toBeVisible()
}

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
      await revealed(page.getByText('Canonical hero summary'))
      await revealed(page.getByText('Canonical story challenge'))
      await revealed(page.getByText('Website-only transition'))
      await revealed(page.getByText('Approved metric'))
      await expect(page.getByText('Hidden metric')).toHaveCount(0)
    })

    test('renders website presentation overrides', async ({ page }) => {
      await page.goto(`http://localhost:3001/works/${overrideSlug}`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Website override title')
      // The override replaces the canonical Content Hub title outright.
      await expect(page.getByText('Original title')).toHaveCount(0)
      // A Work Page hero carries no summary by design, so the stored summary
      // override never reaches the page (see CaseStudyHeroCenteredMedia and
      // CaseStudyHeroLandscape); the intro band below it is what speaks.
      await expect(page.getByText('Website override summary')).toHaveCount(0)
      await revealed(page.getByText('Override intro title'))
      await revealed(page.getByText('Override page'))
    })

    test('returns not found for a missing Work Page', async ({ page }) => {
      const response = await page.goto(`http://localhost:3001/works/missing-${suffix}`)
      expect(response?.status()).toBe(404)
    })
  })
