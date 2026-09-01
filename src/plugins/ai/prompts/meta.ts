import type { SeedSpec } from '../types'

/**
 * SEO/meta prompts for the six website surfaces. Length and formatting rules
 * mirror the editor guidance in src/fields/seoMetaTabFields.ts and the AEO
 * rules in docs/aeo.md (the meta description doubles as the page's blurb in
 * llms.txt and JSON-LD).
 *
 * Schema paths follow the plugin's walker, not Payload's: tabs (even the
 * named `meta` tab) add nothing to the path, groups do. So `meta.title`
 * lands at `<slug>.title` and SHARES one instruction row with the root
 * `title` field; `meta.description` is `<slug>.description`; the og group is
 * `<slug>.og.*`. The shared title prompt is written to work for both fields.
 */

type MetaSurface = {
  /** Collection slug; used as the schema-path prefix. */
  slug: string
  /** What the page is, spliced into prompt copy. */
  subject: string
  /** Handlebars block rendering the page's source material. */
  context: string
  /** Extra surface-specific title rule. */
  titleRule?: string
}

const title = ({ subject, context, titleRule }: MetaSurface): SeedSpec => ({
  prompt: `Write the SEO meta title for ${subject} on the Suits & Sandals website.

{{brandVoice}}

${context}

Rules:
- 35 to 45 characters. The site appends " | Suits & Sandals" when rendering, so do not include the studio name or a trailing separator.
${titleRule ? `${titleRule}\n` : ''}- One clear, specific idea. Specific over clever. No clickbait.
- Follow the voice rules above, especially the banned vocabulary.
- Return only the title text, with no quotes.`,
})

const description = ({ subject, context }: MetaSurface): SeedSpec => ({
  prompt: `Write the SEO meta description for ${subject}.

{{brandVoice}}

${context}

Rules:
- 100 to 150 characters, one or two plain sentences.
- Answer-first: the first clause states what this page covers and for whom. This text is reused as the page's standalone blurb in llms.txt and structured data, so it must make sense with zero surrounding context.
- No calls to action, no questions, no "Learn more".
- Return only the description text.`,
})

const ogTitle = ({ subject, context }: MetaSurface): SeedSpec => ({
  prompt: `Write the Open Graph title for ${subject}. It is the headline on share cards (LinkedIn, Slack, iMessage).

{{brandVoice}}

${context}

{{#if meta.title}}The SEO title is "{{meta.title}}". Take a different angle rather than repeating it.{{/if}}

Rules:
- Up to 65 characters. Nothing is appended at render, so it stands alone. Do not include "| Suits & Sandals".
- It can take a stronger stance than the SEO title.
- Return only the title text, with no quotes.`,
})

const ogDescription = ({ subject, context }: MetaSurface): SeedSpec => ({
  prompt: `Write the Open Graph description for ${subject}: the one or two sentences under the share-card headline.

{{brandVoice}}

${context}

{{#if meta.description}}The SEO description is "{{meta.description}}". Vary the angle rather than repeating it.{{/if}}

Rules:
- Under 200 characters; platforms truncate longer text. Front-load the hook.
- Return only the description text.`,
})

const metaSeeds = (surface: MetaSurface): Record<string, SeedSpec> => ({
  [`${surface.slug}.title`]: title(surface),
  [`${surface.slug}.description`]: description(surface),
  [`${surface.slug}.og.title`]: ogTitle(surface),
  [`${surface.slug}.og.description`]: ogDescription(surface),
  // Image generation is out of scope; keep Compose off the upload fields.
  [`${surface.slug}.image`]: { prompt: '', disabled: true },
  [`${surface.slug}.og.image`]: { prompt: '', disabled: true },
})

const WORK_PAGE_CONTEXT = `Page context:
{{#if title}}Editorial title: {{title}}{{/if}}
{{#if hero.titleOverride}}Hero title: {{hero.titleOverride}}{{/if}}

Case study source material:
{{caseStudy}}`

const LAB_PAGE_CONTEXT = `Page context:
{{#if title}}Editorial title: {{title}}{{/if}}
{{#if hero.titleOverride}}Hero title: {{hero.titleOverride}}{{/if}}

Lab project source material:
{{labProject}}`

const GENERIC_CONTEXT = `Page title: {{title}}
About the studio: {{siteInfo}}`

export const META_SEEDS: Record<string, SeedSpec> = {
  ...metaSeeds({
    slug: 'pages',
    subject: 'a website page',
    context: GENERIC_CONTEXT,
  }),
  ...metaSeeds({
    slug: 'posts',
    subject: 'an insights article',
    context: `Article title: {{title}}

{{#if content}}Article body:
{{ toHTML content }}{{/if}}`,
  }),
  ...metaSeeds({
    slug: 'work-pages',
    subject: 'a client case study page',
    context: WORK_PAGE_CONTEXT,
    titleRule:
      '- Lead with the client name or the concrete work (identity, platform, website). Never use the phrase "case study".',
  }),
  ...metaSeeds({
    slug: 'lab-pages',
    subject: 'a lab project page',
    context: LAB_PAGE_CONTEXT,
    titleRule: '- Lead with what was built or explored, not with the word "lab".',
  }),
  ...metaSeeds({
    slug: 'expertise-pages',
    subject: 'an expertise page describing a studio capability',
    context: GENERIC_CONTEXT,
  }),
  ...metaSeeds({
    slug: 'audience-pages',
    subject: 'a page addressed to a specific kind of client',
    context: GENERIC_CONTEXT,
  }),
}
