import type { SeedSpec } from '../types'

/**
 * Website editorial fields: work/lab page heroes and intros, post titles.
 * Work and lab pages present a canonical Content Hub record, so their prompts
 * pull {{caseStudy}} / {{labProject}} rather than inventing content.
 */

const heroSeeds = (slug: string, source: string): Record<string, SeedSpec> => ({
  [`${slug}.hero.eyebrow`]: {
    prompt: `Write the eyebrow label shown above the hero title of this page.

{{brandVoice}}

Source material:
${source}

Rules:
- One to three words naming the kind of work (for example "Brand Identity" or "Platform").
- No punctuation, no client name.
- Return only the label.`,
  },
  [`${slug}.hero.titleOverride`]: {
    prompt: `Write a website-only hero title for this page. It replaces the canonical title below, so only produce something meaningfully better for a hero context.

{{brandVoice}}

Source material:
${source}

Rules:
- Short and declarative. Under 60 characters.
- Keep the substance of the canonical title; sharpen the phrasing for a full-screen hero.
- Return only the title text.`,
  },
  [`${slug}.hero.summaryOverride`]: {
    prompt: `Write a website-only hero summary for this page. It replaces the canonical summary in the hero band.

{{brandVoice}}

Source material:
${source}

Rules:
- One or two sentences. Standalone; a visitor sees it before anything else on the page.
- Ground it in the thesis and summaries above. Do not invent outcomes.
- Return only the summary text.`,
  },
})

const WORK_SOURCE = '{{caseStudy}}'
const LAB_SOURCE = '{{labProject}}'

export const EDITORIAL_SEEDS: Record<string, SeedSpec> = {
  ...heroSeeds('work-pages', WORK_SOURCE),
  ...heroSeeds('lab-pages', LAB_SOURCE),

  'work-pages.intro.eyebrow': {
    prompt: `Write the short label above the introduction copy of this case study page.

Rules:
- One or two words, e.g. "Introduction" or "Overview".
- Return only the label.`,
  },
  'work-pages.intro.title': {
    prompt: `Write the statement headline for the introduction section of this case study page.

{{brandVoice}}

Case study source material:
{{caseStudy}}

Rules:
- One line. A strong, simple assertion about the engagement, not a label.
- Do not repeat the hero title{{#if hero.titleOverride}} ("{{hero.titleOverride}}"){{/if}}.
- Return only the headline.`,
  },
  'work-pages.intro.bodyOverride': {
    prompt: `Write the introduction body for this case study page. It sits under the intro heading and sets up the full story told below. It replaces the canonical summary, so only produce something meaningfully better for this page.

Case study source material:
{{caseStudy}}

{{#if intro.title}}The intro heading is already set to "{{intro.title}}". Do not repeat it.{{/if}}

Cover: who the client is and their situation, what the engagement set out to change, and one concrete detail that signals depth. Do not give away the outcome; the page tells that story below.`,
    layout:
      'Two to three short paragraphs. Plain paragraphs only: no headings, no lists, no bold or italics.',
  },

  // Shares its row with the SEO meta title (see prompts/meta.ts on path
  // collapse); a strong headline serves both, and generateMeta derives the
  // rendered meta title from it anyway.
  'posts.title': {
    prompt: `Write the headline for this insights article.

{{brandVoice}}

{{#if content}}Article body:
{{ toHTML content }}{{/if}}

Rules:
- Under 70 characters. Say what the article actually argues or shows.
- No colons unless genuinely needed, no listicle framing, no questions.
- Return only the headline.`,
  },
}
