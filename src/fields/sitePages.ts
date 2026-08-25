/**
 * Singleton globals that publish at a fixed path. Relationship fields cannot
 * target globals, so the shared link field offers these as a "Site page" pick.
 */
export const SITE_PAGE_OPTIONS = [
  { label: 'Home', value: 'home' },
  { label: 'Works Index', value: 'works-index' },
  { label: 'Insights Index', value: 'insights-index' },
] as const

export type SitePage = (typeof SITE_PAGE_OPTIONS)[number]['value']

export const SITE_PAGE_HREFS: Record<SitePage, string> = {
  home: '/',
  'works-index': '/works',
  'insights-index': '/insights',
}
