import type { Visual } from '@/features/immersive/visual'

/**
 * One poster, whichever source filled it: an item the editor wrote, or a Work
 * page flattened by the featured-work resolver. The rail never learns which.
 */
export type PosterItem = {
  id: string
  title: string
  /**
   * Meta line under the title, inline in order: a Work page's client, then its
   * industry (`presentFacts`, as every featured work entry). Written items
   * have none.
   */
  facts: string[]
  description: string
  visual: Visual | null
  href: string | null
}

export type PosterListLayout = 'stacked' | 'row'

/** What opening a linked poster does, named on the veil. */
export const POSTER_ACTION = 'View case study'

/** The summary textarea's paragraphs: split on blank lines, empties dropped. */
export const summaryParagraphs = (summary?: string | null): string[] =>
  (summary ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
