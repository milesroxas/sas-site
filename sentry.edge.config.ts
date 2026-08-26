// Sentry Edge runtime config (middleware, edge routes), loaded via
// src/instrumentation.ts. Gating and sampling live in ./sentry.shared.
import * as Sentry from '@sentry/nextjs'
import { sentryBaseOptions } from './sentry.shared'

Sentry.init(sentryBaseOptions(process.env.VERCEL_ENV))
