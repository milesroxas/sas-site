import { execFileSync } from 'node:child_process'

/**
 * Seeds and removes the admin e2e user through a `tsx` subprocess, the same
 * way the content hub fixture runs. Playwright loads spec files with plain
 * Node ESM, which cannot resolve the extensionless `next/server` import the
 * Payload config reaches through its plugins, so the config is never imported
 * into the test process itself.
 */
export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

const runFixture = (operation: 'seed' | 'cleanup') => {
  execFileSync('pnpm', ['exec', 'tsx', 'tests/e2e/support/admin-user-fixture.ts', operation], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })
}

/** Seeds a test user for e2e admin tests. */
export async function seedTestUser(): Promise<void> {
  runFixture('seed')
}

/** Cleans up the test user after tests. */
export async function cleanupTestUser(): Promise<void> {
  runFixture('cleanup')
}
