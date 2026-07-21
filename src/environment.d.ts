declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      /** Postgres connection string — local Docker by default, Neon in Vercel envs. */
      POSTGRES_URL: string
      /** Cloudflare account that owns the R2 bucket — forms the S3 API endpoint. */
      R2_ACCOUNT_ID: string
      R2_ACCESS_KEY_ID: string
      R2_SECRET_ACCESS_KEY: string
      R2_BUCKET: string
      /** Server-side base URL of the R2 custom domain, no trailing slash. */
      R2_PUBLIC_URL: string
      /** Same value as R2_PUBLIC_URL, exposed to the browser so client media
       * components can load video straight from the CDN. */
      NEXT_PUBLIC_MEDIA_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      VERCEL_URL: string
      /** Resend API key — transactional email and newsletter sends. */
      RESEND_API_KEY: string
      /** Default transactional from-address (must be on a verified Resend domain). */
      RESEND_FROM_ADDRESS: string
      RESEND_FROM_NAME: string
      /** Svix signing secret for the Resend webhook (bounce/complaint suppression). */
      RESEND_WEBHOOK_SECRET: string
      /** Optional newsletter-specific sender, e.g. on a marketing subdomain. */
      NEWSLETTER_FROM_ADDRESS?: string
      NEWSLETTER_FROM_NAME?: string
      /** Public base URL for email logo assets (always-reachable hosting, e.g. Vercel Blob). */
      EMAIL_ASSET_BASE_URL?: string
      /** Authorizes the Vercel cron that runs queued Payload jobs. */
      CRON_SECRET: string
      /** Answer model for the /api/ask RAG endpoint (Vercel AI SDK, OpenAI provider). Optional — endpoint returns 503 when unset. */
      OPENAI_API_KEY?: string
      /** c15t consent backend URL (https://<instance>.c15t.dev from consent.io). Optional — offline mode (browser-only consent storage) when unset. */
      NEXT_PUBLIC_C15T_URL?: string
      /** Vercel system env var: 'production' | 'preview' | 'development'. Exposed to the browser; separates analytics/error streams per environment. */
      NEXT_PUBLIC_VERCEL_ENV?: 'production' | 'preview' | 'development'
      /** Sentry DSN — error monitoring, tracing, replay across client/server/edge. Optional — SDK disabled when unset. */
      NEXT_PUBLIC_SENTRY_DSN?: string
      /** Sentry org slug — build-time source map upload. */
      SENTRY_ORG?: string
      /** Sentry project slug — build-time source map upload. */
      SENTRY_PROJECT?: string
      /** Sentry auth token (org token with project:releases scope) — source map upload is skipped when unset. */
      SENTRY_AUTH_TOKEN?: string
      /** PostHog project API key (phc_...). Optional — PostHog disabled when unset. */
      NEXT_PUBLIC_POSTHOG_KEY?: string
      /** PostHog ingestion host. Optional — defaults to https://us.i.posthog.com; set https://eu.i.posthog.com for EU cloud. */
      NEXT_PUBLIC_POSTHOG_HOST?: string
      /** GA4 measurement ID (G-...). Optional — Google Analytics disabled when unset. */
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
