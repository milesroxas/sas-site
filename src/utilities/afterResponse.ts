import { after } from 'next/server'

/**
 * Run best-effort work once the response has gone out.
 *
 * `after()` extends the function lifetime past the response on Vercel, so the
 * visitor never waits on it and it can never sit inside an open Payload
 * transaction. Outside a Next request scope (CLI scripts, jobs, tests) `after`
 * throws, and the work runs inline, un-awaited, instead.
 *
 * The callback must swallow its own errors: nothing is left to report them to.
 */
export function afterResponse(run: () => Promise<void>): void {
  try {
    after(run)
  } catch {
    void run()
  }
}
