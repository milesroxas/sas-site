/**
 * Declarative spec for one AI instruction row. The registry in ./seeds.ts maps
 * field schema-paths (e.g. `work-pages.meta.title`) to these; boot seeding
 * turns them into `plugin-ai-instructions` rows.
 */
export type SeedSpec = {
  /**
   * Handlebars template. The whole in-progress form doc is in scope
   * ({{title}}, {{ toHTML content }}, {{#if}}), plus the computed variables
   * from ./promptFields.ts: {{brandVoice}}, {{siteInfo}}, {{caseStudy}},
   * {{labProject}}.
   */
  prompt: string
  /** richText only: system prompt (plain string, not templated). Defaults to the shared voice system prompt. */
  system?: string
  /** richText only: output structure hint (e.g. "Two short paragraphs, no headings"). */
  layout?: string
  /** Seed the row with Compose hidden. Admins can re-enable it in AI Instructions. */
  disabled?: boolean
  maxTokens?: number
}
