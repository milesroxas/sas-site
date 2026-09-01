import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    // Call history is per-test. Module-level `vi.fn()`s (router pushes, event
    // spies) are created once per file, so without this a "called once"
    // assertion counts every earlier test in the file too.
    clearMocks: true,
    // The `tests/int` specs boot Payload in `beforeAll`, and with
    // `fileParallelism: false` the first file alphabetically pays the whole
    // cold start — config load plus Drizzle push against a cold Postgres —
    // while the rest reuse the warm instance. That boot routinely outruns
    // Vitest's 10s default, so the first spec times out on nothing but being
    // first. Applies to hooks only; test bodies keep the default timeout.
    hookTimeout: 60_000,
    fileParallelism: false,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts', 'src/**/*.test.{ts,tsx}'],
  },
})
