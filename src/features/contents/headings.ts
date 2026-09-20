/**
 * The Contents index is read off the rendered page, not the CMS document.
 *
 * Five collections reach a heading five different ways: three block renderers,
 * canonical story copy resolved from a related record, and a post's Lexical
 * body. Whatever produced it, a section heading lands in the article as an
 * `<h2>`, so the article is the one source every surface shares: what the
 * reader sees is what the index lists, and a new block needs no registration.
 */

export type ContentsEntry = {
  id: string
  label: string
  element: HTMLElement
}

/** Below this an index is noise: the page is short enough to scan. */
export const CONTENTS_MIN_ENTRIES = 3

/**
 * Headings that are not sections of the page: a form's own step titles,
 * anything a block opts out with `data-contents-skip`, and copy that is
 * hidden from sight or from the accessibility tree.
 */
const SKIPPED_HEADING = 'form h2, [data-contents-skip] h2, [aria-hidden="true"] h2, h2.sr-only'

/** Clears the fixed header, with air, wherever a jump or a `#hash` load lands. */
const HEADING_SCROLL_MARGIN = 'calc(var(--header-height) + 1.5rem)'

const slugify = (text: string) =>
  text
    .normalize('NFKD')
    .toLowerCase()
    // Drop apostrophes rather than split on them: "brand's" is `brands`.
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * A split-text entrance leaves the readable string in `aria-label` and the
 * glyphs in spans; either way the label is the heading as it is read.
 */
const headingLabel = (heading: HTMLElement) =>
  (heading.getAttribute('aria-label') ?? heading.textContent ?? '').replace(/\s+/g, ' ').trim()

/**
 * Collects the article's section headings and makes each one a jump target:
 * an `id` (kept when the markup already has one), a scroll margin that Lenis,
 * native anchors, and hash loads all honor, and `tabindex="-1"` so focus can
 * follow the jump. DOM writes only, no layout reads, so it is safe in a layout
 * effect ahead of the route's hash scroll. Returns the entries and the undo.
 */
export function collectContentsEntries(article: HTMLElement): {
  entries: ContentsEntry[]
  restore: () => void
} {
  const taken = new Set<string>()
  const undo: (() => void)[] = []
  const entries: ContentsEntry[] = []

  for (const heading of article.querySelectorAll<HTMLElement>('h2')) {
    if (heading.matches(SKIPPED_HEADING)) continue
    const label = headingLabel(heading)
    if (!label) continue

    let id = heading.id
    if (!id) {
      const base = slugify(label) || `section-${entries.length + 1}`
      id = base
      for (let n = 2; taken.has(id) || document.getElementById(id); n++) id = `${base}-${n}`
      heading.id = id
      undo.push(() => heading.removeAttribute('id'))
    }
    taken.add(id)

    if (!heading.hasAttribute('tabindex')) {
      heading.tabIndex = -1
      undo.push(() => heading.removeAttribute('tabindex'))
    }
    heading.style.scrollMarginTop = HEADING_SCROLL_MARGIN
    undo.push(() => heading.style.removeProperty('scroll-margin-top'))

    entries.push({ id, label, element: heading })
  }

  return {
    entries,
    restore: () => {
      for (const run of undo) run()
    },
  }
}
