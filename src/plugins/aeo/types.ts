import type { CollectionSlug } from 'payload'

/**
 * One H2 section of llms.txt, sourced from a public content collection.
 * Entries render as `- [title](url): meta.description` per the llms.txt spec.
 */
export type AeoContentSection = {
  collection: CollectionSlug
  /** H2 heading in llms.txt (avoid "Optional" — reserved by the spec). */
  title: string
  /** URL prefix the collection publishes under, e.g. '/expertise'. Empty string for root. */
  urlPrefix: string
  /** Slug that maps to the site root instead of `${urlPrefix}/${slug}`. */
  homeSlug?: string
  /** Payload sort order for the section entries. Defaults to 'title'. */
  sort?: string
  /**
   * Include each doc's full body (Lexical richText converted to markdown) in
   * llms-full.txt. Only meaningful for collections whose content lives in a
   * single richText field named by `richTextField`.
   */
  fullContent?: {
    richTextField: string
  }
}

export type AeoPluginConfig = {
  /** Keep schema (site-info global) but skip hooks, for parity with other Payload plugins. */
  disabled?: boolean
  /** Override the default content sections. */
  content?: AeoContentSection[]
}
