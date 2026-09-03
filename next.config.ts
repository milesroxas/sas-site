import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

import { redirects } from './redirects'
import { getServerSideURL } from './src/utilities/getURL'

const deployUrl = getServerSideURL()

// PostHog ingestion is reverse-proxied through /ingest (see rewrites) so
// events survive ad blockers. EU cloud: set NEXT_PUBLIC_POSTHOG_HOST to
// https://eu.i.posthog.com and the assets host follows.
const posthogIngestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
const posthogAssetsHost = posthogIngestHost.replace('.i.posthog.com', '-assets.i.posthog.com')

const nextConfig: NextConfig = {
  // Dev only: phones on the LAN load the dev server by IP. Without this,
  // Next 16 answers every /_next/* request from that origin with 403 (and
  // refuses the HMR socket), so the page renders but never hydrates and
  // nothing is tappable. Add the machine's current LAN IP here.
  allowedDevOrigins: ['192.168.1.169'],
  // Keep the ffmpeg binary out of the bundler — Next must load it from
  // node_modules at runtime (video poster extraction in Media hooks).
  serverExternalPackages: ['ffmpeg-static'],
  // Vercel packs routes into as few functions as fit under the per-function
  // size cap, so anything traced into every route multiplies the function
  // count (Hobby caps a deployment at 12). Payload's config finder resolves
  // process.cwd() against an env var, which makes the tracer include the
  // whole project root in every Payload route, and its migration-dir finder
  // pulls src/migrations (100MB+ of drizzle JSON snapshots that only
  // migrate:create reads). Strip both, plus build-only trees.
  //
  // Turbopack applies these natively: keys are route pathnames with route
  // groups removed ('/api/**' is the Payload REST and GraphQL handlers),
  // '*' is every route, and includes are applied after excludes.
  outputFileTracingExcludes: {
    '*': [
      './src/migrations/**',
      './public/**',
      './docs/**',
      './plans/**',
      './scripts/**',
      './tests/**',
      './patches/**',
      './storybook-static/**',
      './ds-bundle/**',
      './playwright-report/**',
      './*.tsbuildinfo',
      './*.log',
      // The ffmpeg binary (~75MB on linux) is only spawned by the Media
      // video-poster hook, which runs on writes through the Payload API.
      // The package's index.js stays traced so the top-level import in
      // extractVideoFrame still resolves everywhere.
      './**/ffmpeg-static/ffmpeg',
    ],
  },
  outputFileTracingIncludes: {
    '/api/**': ['./node_modules/.pnpm/ffmpeg-static@*/node_modules/ffmpeg-static/ffmpeg'],
  },
  experimental: {
    viewTransition: true,
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    qualities: [100],
    remotePatterns: [
      {
        hostname: 'raw.githubusercontent.com',
        protocol: 'https',
      },
      // Production media bucket — block fixtures (src/blocks/fixtures.ts) use
      // absolute URLs so the /demo playgrounds can render them via next/image.
      {
        hostname: 'media.suits-sandals.com',
        protocol: 'https',
      },
      ...[deployUrl].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  // Markdown alternates for agents: /posts/foo.md, and content negotiation
  // (Accept: text/markdown) on /posts/foo. Both resolve to the markdown route
  // handler at /md/posts/[slug].
  rewrites: async () => [
    {
      source: '/posts/:slug.md',
      destination: '/md/posts/:slug',
    },
    {
      source: '/posts/:slug',
      destination: '/md/posts/:slug',
      has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
    },
    // PostHog reverse proxy — first-party /ingest path evades ad blockers.
    {
      source: '/ingest/static/:path*',
      destination: `${posthogAssetsHost}/static/:path*`,
    },
    {
      source: '/ingest/:path*',
      destination: `${posthogIngestHost}/:path*`,
    },
  ],
  // PostHog API paths require their trailing slashes preserved through the
  // /ingest proxy. Next still resolves page routes with or without a trailing
  // slash; this only drops the 308 normalization redirect.
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withSentryConfig(withPayload(nextConfig, { devBundleServerPackages: false }), {
  // Org and project come from SENTRY_ORG / SENTRY_PROJECT env vars; source map
  // upload needs SENTRY_AUTH_TOKEN as well and is skipped when absent.
  silent: !process.env.CI,

  // Upload a wider set of source maps for prettier stack traces (increases
  // build time, does not affect the served bundle).
  widenClientFileUpload: true,

  // Client sourcemaps are only for Sentry's eyes — remove them after upload.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Proxy browser events through /monitoring so ad blockers don't eat them.
  tunnelRoute: '/monitoring',

  webpack: {
    // Auto-instrument the Vercel cron in vercel.json (/api/payload-jobs/run)
    // as a Sentry Cron Monitor — missed or failing runs alert in Sentry.
    automaticVercelMonitors: true,

    // Strip Sentry debug logger statements from production bundles.
    treeshake: {
      removeDebugLogging: true,
    },
  },
})
