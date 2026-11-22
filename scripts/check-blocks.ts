/**
 * Block drift check (`pnpm check:blocks`, run by `pnpm lint`).
 *
 * The admin label and group on a block's config are its name everywhere
 * (docs/blocks-reorg-roadmap.md). This script fails when the code drifts
 * from them:
 *
 * 1. Every block an editor can still add (the Section-nestable run and each
 *    surface's shell blocks) has a Storybook story titled
 *    `Blocks/<Group>/<Label>`, both from its config.
 * 2. Every surface with a Section nests the whole shared run, so no surface
 *    quietly falls behind it. Known gaps are listed below with the step that
 *    closes them.
 * 3. Every shell block in `SHELL_BLOCKS` is offered by its surface.
 *
 * Renderer coverage is checked by the type checker instead: each renderer's
 * map or switch is exhaustive over its surface's block union.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { Block } from 'payload'

import { caseStudyBlocks } from '@/blocks/case-study/config'
import { labBlocks } from '@/blocks/lab/config'
import { sectionNestableBlocks } from '@/blocks/shared/section-blocks'
import { type CompositionSurface, SHELL_BLOCKS } from '@/blocks/shared/top-level-blocks'
import {
  homeLayoutBlocks,
  pageLayoutBlocks,
  postLayoutBlocks,
  segmentPageBlocks,
} from '@/fields/pageLayoutBlocks'

const SURFACE_BLOCKS: Record<CompositionSurface, Block[]> = {
  home: homeLayoutBlocks,
  lab: labBlocks,
  pages: pageLayoutBlocks,
  posts: postLayoutBlocks,
  segment: segmentPageBlocks,
  work: caseStudyBlocks,
}

/**
 * Run blocks a surface does not nest yet. Each entry is a gap to close, not
 * an exemption: delete it in the change that closes it.
 */
const KNOWN_RUN_GAPS: Partial<Record<CompositionSurface, readonly string[]>> = {}

/**
 * Run blocks a surface replaces with its own block under the same label, on
 * purpose: Work Pages offer the story-resolving `caseStudyTransition` as
 * their Standard heading (docs/blocks-reorg-roadmap.md, collection coverage).
 */
const RUN_SUBSTITUTES: Partial<Record<CompositionSurface, Record<string, string>>> = {
  work: { richTransition: 'caseStudyTransition' },
}

const toWords = (slug: string) =>
  slug.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

const labelOf = (block: Block) =>
  typeof block.labels?.singular === 'string' ? block.labels.singular : toWords(block.slug)

/** `Media and content` to `MediaAndContent`, `Forms & CTAs` to `FormsAndCTAs`. */
const storySegment = (words: string) =>
  words
    .replace(/&/g, ' and ')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')

const expectedStoryTitle = (block: Block) => {
  const group = typeof block.admin?.group === 'string' ? block.admin.group : 'Ungrouped'
  return `Blocks/${storySegment(group)}/${storySegment(labelOf(block))}`
}

const nestedBlocks = (blocks: Block[]): Block[] => {
  const section = blocks.find((block) => block.slug === 'section')
  const field = section?.fields.find((f) => 'name' in f && f.name === 'blocks')
  return field && field.type === 'blocks' ? field.blocks : []
}

const storyTitles = (root: string): Set<string> => {
  const titles = new Set<string>()
  for (const entry of readdirSync(root, { recursive: true })) {
    const file = String(entry)
    if (!file.endsWith('.stories.tsx')) continue
    const source = readFileSync(path.join(root, file), 'utf8')
    for (const match of source.matchAll(/^\s*title:\s*'([^']+\/[^']+)'/gm)) titles.add(match[1])
  }
  return titles
}

const failures: string[] = []
const titles = storyTitles(path.resolve('src'))

// Blocks an editor can still add, keyed by expected story title. Variants that
// share a label (Work and Lab story sections, the two Standard headings) share
// one story.
const addable = new Map<string, string[]>()
const note = (block: Block) => {
  const title = expectedStoryTitle(block)
  addable.set(title, [...new Set([...(addable.get(title) ?? []), block.slug])])
}

for (const [surface, blocks] of Object.entries(SURFACE_BLOCKS) as [CompositionSurface, Block[]][]) {
  const offered = new Set(blocks.map((block) => block.slug))
  const nested = nestedBlocks(blocks)
  const nestedSlugs = new Set(nested.map((block) => block.slug))

  for (const shell of SHELL_BLOCKS[surface]) {
    if (!offered.has(shell)) {
      failures.push(`${surface}: shell block "${shell}" is not offered by the surface`)
    }
  }

  for (const block of blocks) {
    if (block.slug === 'section' || SHELL_BLOCKS[surface].includes(block.slug)) note(block)
  }
  for (const block of nested) note(block)
  if (!nested.length) {
    // A Section-less surface offers the run directly at its top level.
    const run = new Set(sectionNestableBlocks.map((block) => block.slug))
    for (const block of blocks) if (run.has(block.slug)) note(block)
    continue
  }

  const gaps = KNOWN_RUN_GAPS[surface] ?? []
  const substitutes = RUN_SUBSTITUTES[surface] ?? {}
  for (const block of sectionNestableBlocks) {
    const missing = !nestedSlugs.has(substitutes[block.slug] ?? block.slug)
    if (missing && !gaps.includes(block.slug)) {
      failures.push(`${surface}: Section does not nest run block "${block.slug}"`)
    }
    if (!missing && gaps.includes(block.slug)) {
      failures.push(`${surface}: "${block.slug}" is nested now; remove it from KNOWN_RUN_GAPS`)
    }
  }
}

for (const [title, slugs] of addable) {
  if (!titles.has(title)) failures.push(`no story titled "${title}" (${slugs.join(', ')})`)
}

if (failures.length) {
  console.error(`check:blocks found ${failures.length} problem(s):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(`check:blocks: ${addable.size} addable blocks, all storied and on the run.`)
