declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
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
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
