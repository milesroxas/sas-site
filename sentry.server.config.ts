// Sentry Node.js runtime config, loaded via src/instrumentation.ts.
// Gating and sampling live in ./sentry.shared.
import * as Sentry from '@sentry/nextjs'
import { sentryBaseOptions } from './sentry.shared'

Sentry.init({
  ...sentryBaseOptions(process.env.VERCEL_ENV),

  // Structured logs (Sentry.logger.*) alongside errors and traces.
  enableLogs: true,
})
