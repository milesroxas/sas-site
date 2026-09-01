import type { Footer, PageClosing } from '@/payload-types'

/**
 * Merge a page's closing overrides onto the Footer global. Empty override
 * fields inherit; hiding is handled by the renderer before this runs.
 */
export const resolveClosing = (
  page: PageClosing | null | undefined,
  fallback: Footer['closing'],
): Footer['closing'] => {
  if (!page) return fallback

  return {
    eyebrow: page.eyebrowOverride || fallback?.eyebrow,
    heading: page.headingOverride || fallback?.heading,
    links: page.linksOverride?.length ? page.linksOverride : fallback?.links,
    ask: {
      title: page.askOverride?.title || fallback?.ask?.title,
      body: page.askOverride?.body || fallback?.ask?.body,
    },
    media: page.mediaOverride || fallback?.media,
  }
}
