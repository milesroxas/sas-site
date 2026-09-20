/**
 * Which document keys carry reader-facing content, shared by every walk over
 * a page's stored shape: the RAG corpus extractor (`./extract`) and the
 * reading-time counter (`@/blocks/shared/reading-time`). One list, so a new
 * text field is taught to both walkers at once.
 *
 * Keys are compared lowercase with a trailing `override` stripped, because an
 * override field holds the same substance as the field it replaces.
 */

export const normalizeKey = (key: string): string => key.toLowerCase().replace(/override$/, '')

/** String fields whose values are reader-facing content. */
export const CONTENT_TEXT_KEYS = new Set([
  'answer',
  'body',
  'caption',
  'decision',
  'description',
  'excerpt',
  'eyebrow',
  'footnote',
  'heading',
  'impact',
  'intro',
  'lead',
  'medium',
  'oneline',
  'problem',
  'question',
  'quote',
  'rationale',
  'secondline',
  'short',
  'standfirst',
  'statement',
  'subheading',
  'subtitle',
  'summary',
  'tagline',
  'text',
  // A figure's plain-language description (blocks/figures): what a chart or
  // diagram shows, which is all of it a text corpus can hold. Not rendered
  // copy — a reading-time walk drops it (see NON_RENDERED_TEXT_KEYS).
  'textalternative',
  'thesis',
  'title',
])

/** Keys emitted as markdown headings — natural chunk boundaries. */
export const CONTENT_HEADING_KEYS = new Set(['title', 'heading'])

/** Subtrees that never carry body content (system, SEO, navigation, media). */
export const CONTENT_SKIP_KEYS = new Set([
  '_status',
  'breadcrumbs',
  'createdat',
  // A figure's stored diagram geometry: coordinates and wrapped label fragments.
  'geometry',
  'id',
  'blockname',
  'link',
  'links',
  'media',
  'meta',
  'parent',
  'publishedat',
  'slug',
  'sluglock',
  // A figure's chart or diagram spec: data, not prose. Its words are the
  // block's title, caption and text alternative, which are text keys.
  'spec',
  'updatedat',
])

/**
 * Text keys a corpus reads but a visitor never does: alternative text is for
 * a screen reader and a language model, so charging a sighted reader for it
 * would add minutes no one spends.
 */
export const NON_RENDERED_TEXT_KEYS = new Set(['textalternative'])
