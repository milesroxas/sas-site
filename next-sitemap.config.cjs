function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return 'https://example.com'
}

const SITE_URL = getSiteUrl()

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

/** @type {import('next-sitemap').IConfig} */
module.exports = {
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
  robotsTxtOptions: {
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
  },
}
