import { createHash } from 'node:crypto'
import {
  isStoryCopyBlock,
  resolveStoryBlockCopy,
  type StoryCopyBlock,
} from '@/blocks/shared/story-copy'
import { type StoryOpener, sectionOpener } from '@/blocks/shared/story-headings'
import type { StoryRecord } from '@/collections/story/narrative'
import { passagesOf } from '../editorial/passages'

/** Shared by the page check and the reading-order review. Code is still text. */
export const VISUAL_BLOCKS: ReadonlySet<string> = new Set([
  'bespokeFigure',
  'chart',
  'diagram',
  'fullMedia',
  'labMediaShowcase',
  'mediaBlock',
  'youtube',
])

/** A review signal, not a reason to insert a decorative figure. */
export const PROSE_RUN_REVIEW_WORDS = 250

type Block = {
  blockType?: string
  blocks?: Block[]
  heading?: string
  blockName?: string
} & Record<string, unknown>
type ReviewSection = {
  heading: string
  paragraphs: string[]
  visuals: number
  longestProseRun: number
}

/**
 * Resolve the composed page, not the CMS section buckets. This is a reading
 * proof for editorial review, not an HTML preview or an automatic quality score.
 */
export function narrativeProof(page: Record<string, unknown>, record: StoryRecord) {
  const sections: ReviewSection[] = []
  const lines: string[] = []
  let current: ReviewSection | undefined
  let run = 0
  const text = (value: unknown, path: string, countProse = true) => {
    for (const passage of passagesOf(value, path)) {
      lines.push(passage.kind === 'heading' ? `### ${passage.text}` : passage.text, '')
      if (countProse && passage.kind !== 'heading' && current) {
        current.paragraphs.push(passage.text)
        run += passage.text.split(/\s+/).length
        current.longestProseRun = Math.max(current.longestProseRun, run)
      }
    }
  }
  const walk = (block: Block, opener: StoryOpener | null = null) => {
    if (block.blockType === 'section') {
      const children = block.blocks ?? []
      const ownOpener = sectionOpener(children as Parameters<typeof sectionOpener>[0], record)
      current = {
        heading: ownOpener?.heading || block.blockName || 'Unnamed section',
        paragraphs: [],
        visuals: 0,
        longestProseRun: 0,
      }
      sections.push(current)
      run = 0
      for (const child of children) walk(child, ownOpener)
      current = undefined
      run = 0
      return
    }
    if (VISUAL_BLOCKS.has(block.blockType ?? '')) {
      if (current) current.visuals += 1
      run = 0
      lines.push(`[Visual: ${block.blockType}${block.title ? ` | ${block.title}` : ''}]`, '')
      // Keep figure evidence in the fingerprint even when its drawing is not in this proof.
      text({ caption: block.caption, textAlternative: block.textAlternative }, 'figure', false)
      run = 0
      return
    }
    if (block.blockType === 'code') {
      lines.push('[Code listing: inspect in preview]', '')
      return
    }
    if (block.blockType === 'labFacts' || block.blockType === 'labRelatedProjects') return
    if (isStoryCopyBlock(block)) {
      const resolved = resolveStoryBlockCopy(block as StoryCopyBlock, record, opener)
      if (resolved.blockType === 'storyBeats') {
        for (const passage of resolved.passages ?? [])
          text({ heading: passage.heading, body: passage.body }, 'story')
      } else {
        // Lab prose headings and compatible story blocks use this body.
        text(
          {
            heading: 'heading' in resolved ? resolved.heading : undefined,
            body: 'body' in resolved ? resolved.body : undefined,
          },
          'story',
        )
      }
      return
    }
    text(block, 'block')
  }
  text(page.intro, 'intro')
  for (const block of (Array.isArray(page.layout) ? page.layout : []) as Block[]) walk(block)
  const fingerprint = createHash('sha256')
    .update(JSON.stringify([page.intro, page.layout, record]))
    .digest('hex')
  const handoffs = sections.slice(1).map((section, index) => {
    const previous = sections[index] as ReviewSection
    return `- ${previous.heading} → ${section.heading}: explain what question the earlier section leaves and how the next advances it.`
  })
  const longRuns = sections
    .filter((section) => section.longestProseRun > PROSE_RUN_REVIEW_WORDS)
    .map(
      (section) =>
        `- ${section.heading}: ${section.longestProseRun} words without a visual break. Cut repetition, move a relevant visual, or justify the sustained passage. Do not add decoration to pass a count.`,
    )
  return {
    fingerprint,
    sections,
    longRuns,
    markdown: [
      '# Narrative reading proof',
      '',
      `Draft fingerprint: ${fingerprint}`,
      '',
      'Read this in order, then inspect the page preview. Sentence support and a clean voice report do not establish narrative quality. Figure alternatives below are review evidence, not visible body copy.',
      '',
      '## Required editorial review',
      '',
      '- State the reader’s question and the answer the ending earns.',
      '- Read the headings alone: do they describe a progression or an inventory?',
      '- Read the prose without studying the figures: are causes, decisions and consequences still understandable?',
      '- Read the figures with their adjacent beats: does each add evidence or explanation, and can a reader skip technical detail?',
      '- Check introductions of tools, repeated claims, abrupt topic changes and unsupported hindsight. Record specific fixes or reasons to keep them.',
      '',
      '## Section handoffs',
      '',
      ...handoffs,
      '',
      '## Visual pacing signals',
      '',
      ...(longRuns.length
        ? longRuns
        : ['No long uninterrupted prose runs found. This does not assess visual relevance.']),
      '',
      '## Composed reading order',
      '',
      ...lines,
    ].join('\n'),
  }
}
