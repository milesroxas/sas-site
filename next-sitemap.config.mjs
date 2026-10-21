import { resolveServerSideURL } from './site-url.mjs'

// Same resolution the app uses; the last-resort fallback differs because a
// sitemap has to emit absolute URLs even on a build with no origin configured.
const SITE_URL = resolveServerSideURL('https://example.com')

/**
 * AI crawlers explicitly welcomed for answer-engine visibility. Search/index
 * and user-triggered fetchers (OAI-SearchBot, Claude-SearchBot, PerplexityBot,
 * *-User) gate citation eligibility in AI answers; training bots (GPTBot,
 * ClaudeBot, CCBot, Google-Extended, meta-externalagent) build parametric
 * brand recall. Explicit groups also protect these bots from any future
 * blanket `User-agent: *` disallow.
 */
const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Amazonbot',
  'meta-externalagent',
  'CCBot',
]

/**
 * The preview deployment (preview.suits-sandals.com) turns every crawler
 * away and advertises no sitemaps: crawls there only wake the preview
 * database. Pages also carry `X-Robots-Tag: noindex` (next.config.ts) for
 * crawlers that ignore robots.txt. Agents calling /api/mcp are not crawlers
 * and are unaffected. VERCEL_ENV, not NODE_ENV: preview builds run as
 * production.
 */
const isPreview = process.env.VERCEL_ENV === 'preview'

const PRODUCTION_ROBOTS = {
  policies: [
    ...AI_CRAWLERS.map((userAgent) => ({
      userAgent,
      allow: '/',
      disallow: '/admin/*',
    })),
    {
      userAgent: '*',
      disallow: '/admin/*',
    },
  ],
  additionalSitemaps: [
    `${SITE_URL}/pages-sitemap.xml`,
    `${SITE_URL}/posts-sitemap.xml`,
    `${SITE_URL}/works-sitemap.xml`,
    `${SITE_URL}/lab-sitemap.xml`,
    `${SITE_URL}/expertise-sitemap.xml`,
    `${SITE_URL}/who-we-help-sitemap.xml`,
  ],
}

// next-sitemap always appends the generated sitemap index and a Host line;
// the transform replaces the whole file so preview lists neither.
const PREVIEW_ROBOTS = {
  policies: [{ userAgent: '*', disallow: '/' }],
  transformRobotsTxt: async () => 'User-agent: *\nDisallow: /\n',
}

/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: [
    '/posts-sitemap.xml',
    '/pages-sitemap.xml',
    '/works-sitemap.xml',
    '/lab-sitemap.xml',
    '/expertise-sitemap.xml',
    '/who-we-help-sitemap.xml',
    '/*',
    '/posts/*',
  ],
  robotsTxtOptions: isPreview ? PREVIEW_ROBOTS : PRODUCTION_ROBOTS,
}
