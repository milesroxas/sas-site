import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

import { redirects } from './redirects'
import { getServerSideURL } from './src/utilities/getURL'

const deployUrl = getServerSideURL()

const nextConfig: NextConfig = {
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
  ],
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
