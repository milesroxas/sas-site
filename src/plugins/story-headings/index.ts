import { choice, noul, type Questions, TypeSafeClient } from '@typesafe-ai/sdk'
import type { CollectionBeforeChangeHook, Field, PayloadRequest, Plugin } from 'payload'
import {
  type BeatHeadingAuto,
  beatOpening,
  type HeadingAuto,
  headingInputsHash,
  presentedBeats,
  readHeadingAuto,
  restatesOpener,
  type StoryOpener,
  sectionOpener,
  stepDown,
} from '@/blocks/shared/story-headings'
import type { StoryRecord } from '@/collections/story/narrative'
import { ASK_JUDGE_KEY_VAR, ASK_JUDGE_MODEL } from '@/features/ask/judge'
import { relationshipId } from '@/utilities/relationshipId'

/**
 * Beat headings at the document boundary. A Story beats block prints each
 * beat's heading from the story record under the Section's Prose opener
 * (`shared/story-headings.ts`); what code cannot read is whether a heading
 * only restates the opener in other words, and whether the beat opens a
 * subsection or a short passage of the idea above. Jev (TypeSafe's System
 * One model) answers both when the page is saved, and the answers are stored
 * on the block as `headingAuto`, keyed by beat, beside a hash of what was
 * judged. The renderer trusts a stored answer only while its hash matches;
 * a beat edited on the record after this save falls back to the code rule
 * until the page is saved again.
 *
 * Same shape as the figures plugin: computed on every full save, never taken
 * from the request, reused from the saved document when the inputs are
 * unchanged, and exempt on autosave. Fail open: no key, a timeout or a bad
 * answer leaves the beat to the code rule, and a save never fails for it.
 *
 * Code owns the policy: the one threshold is `STORY_HEADING_THRESHOLDS`.
 */

export const STORY_HEADING_THRESHOLDS = {
  /** `restates` at or above which the beat's heading is hidden under the opener. */
  restates: 0.6,
} as const

const QUESTIONS = {
  restates: noul(
    'Does `beat_heading` only restate `section_heading`, the heading printed directly above it on the page?',
    {
      true: 'It names the same idea in the same or other words, so a reader would see one heading twice.',
      false:
        'It names a different step, a part, a consequence or a narrower point than the heading above, so it adds something.',
    },
  ),
  weight: choice(
    'Under `section_heading`, what does `beat_heading` open? `beat_opening` is the start of its copy.',
    {
      subsection:
        'A distinct step or part of the idea above: a stage, a mechanism, a component, something that could carry several paragraphs of its own.',
      passage:
        'A single point inside the idea above: one paragraph, an aside, an example, a detail.',
    },
  ),
} satisfies Questions

/** What Jev answers for one beat: raw, so the policy stays in code. */
export type BeatJudgment = { restates: number; weight: 'subsection' | 'passage' }

export type BeatJudge = (state: {
  section_heading: string
  beat_heading: string
  beat_opening: string
}) => Promise<BeatJudgment>

const CONCURRENCY = 8
const MAX_STATE_CHARS = 600

/** Jev, when a key is set; otherwise nothing, and every beat takes the code rule. */
export const jevBeatJudge = (): BeatJudge | null => {
  if (!process.env[ASK_JUDGE_KEY_VAR]?.trim()) return null
  const client = new TypeSafeClient({ defaultModel: ASK_JUDGE_MODEL, logLevel: 'error' })
  return async (state) => {
    const result = await client.systemOne({ state, questions: QUESTIONS })
    return {
      restates: result.answers.restates.noul,
      weight: result.answers.weight.choice as BeatJudgment['weight'],
    }
  }
}

/** The stored answer from a judgment, the policy applied. */
export const autoFromJudgment = (
  judgment: BeatJudgment,
  opener: StoryOpener | null,
  hash: string,
): BeatHeadingAuto => ({
  hash,
  level: opener ? stepDown(opener.level, judgment.weight === 'passage' ? 2 : 1) : 'h2',
  show: judgment.restates < STORY_HEADING_THRESHOLDS.restates,
})

type Block = Record<string, unknown> & { blockType?: string; id?: string }

const hostsStoryBeats = (fields: Field[]): boolean =>
  fields.some((field) => {
    if (field.type === 'tabs') return field.tabs.some((tab) => hostsStoryBeats(tab.fields))
    if (field.type === 'blocks')
      return field.blocks.some(
        (block) => block.slug === 'storyBeats' || hostsStoryBeats(block.fields),
      )
    return 'fields' in field && hostsStoryBeats(field.fields)
  })

/** The relationship that names the page's story record: `labProject` or `caseStudy`. */
const storyRelationship = (fields: Field[]): { collection: string; name: string } | null => {
  for (const field of fields) {
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const found = storyRelationship(tab.fields)
        if (found) return found
      }
    } else if (
      field.type === 'relationship' &&
      typeof field.relationTo === 'string' &&
      (field.relationTo === 'lab-projects' || field.relationTo === 'case-studies')
    ) {
      return { collection: field.relationTo, name: field.name }
    } else if ('fields' in field) {
      const found = storyRelationship(field.fields)
      if (found) return found
    }
  }
  return null
}

/** Every Story beats block in a layout, each with its Section's children (or none at the top level). */
const storyBeatBlocks = (layout: unknown): Array<{ block: Block; siblings: Block[] }> => {
  if (!Array.isArray(layout)) return []
  return layout.flatMap((row: Block) => {
    if (row.blockType === 'storyBeats') return [{ block: row, siblings: [] }]
    if (row.blockType === 'section' && Array.isArray(row.blocks)) {
      const siblings = row.blocks as Block[]
      return siblings
        .filter((child) => child.blockType === 'storyBeats')
        .map((block) => ({ block, siblings }))
    }
    return []
  })
}

const isAutosave = (req: PayloadRequest): boolean => req.query?.autosave === 'true'

type Options = { judge?: () => BeatJudge | null }

const judgeStoryHeadings =
  ({ judge = jevBeatJudge }: Options): CollectionBeforeChangeHook =>
  async ({ collection, data, originalDoc, req }) => {
    if (isAutosave(req)) return data
    const targets = storyBeatBlocks(data.layout)
    if (targets.length === 0) return data
    const relation = storyRelationship(collection.fields)
    const recordId = relation
      ? relationshipId(
          (data[relation.name] ?? originalDoc?.[relation.name]) as Parameters<
            typeof relationshipId
          >[0],
        )
      : null
    if (!relation || !recordId) return data

    let record: StoryRecord
    try {
      record = (await req.payload.findByID({
        collection: relation.collection as 'lab-projects' | 'case-studies',
        depth: 0,
        draft: true,
        id: recordId,
        req,
      })) as StoryRecord
    } catch {
      return data
    }

    const previous = new Map<string, HeadingAuto>(
      storyBeatBlocks(originalDoc?.layout).flatMap(({ block }) =>
        block.id ? [[block.id, readHeadingAuto(block.headingAuto)] as const] : [],
      ),
    )
    const pending: Array<{
      auto: HeadingAuto
      hash: string
      key: string
      opener: StoryOpener | null
      state: Parameters<BeatJudge>[0]
    }> = []

    for (const { block, siblings } of targets) {
      const opener = sectionOpener(siblings as Parameters<typeof sectionOpener>[0], record)
      const stored = block.id ? (previous.get(block.id) ?? {}) : {}
      const auto: HeadingAuto = {}
      for (const beat of presentedBeats(block as Parameters<typeof presentedBeats>[0], record)) {
        if (!beat.heading) continue
        const opening = beatOpening(beat.body)
        const hash = headingInputsHash(opener?.heading, beat.heading, opening)
        const kept = stored[beat.key]
        if (kept && kept.hash === hash) {
          auto[beat.key] = kept
          continue
        }
        // An exact repeat needs no model; the level is the rule's.
        if (!opener || restatesOpener(opener.heading, beat.heading)) {
          auto[beat.key] = { hash, level: opener ? stepDown(opener.level, 1) : 'h2', show: !opener }
          continue
        }
        pending.push({
          auto,
          hash,
          key: beat.key,
          opener,
          state: {
            section_heading: opener.heading,
            beat_heading: beat.heading,
            beat_opening: opening.slice(0, MAX_STATE_CHARS),
          },
        })
      }
      // Always written from here, never taken from the request.
      block.headingAuto = auto
    }

    const ask = pending.length ? judge() : null
    if (ask) {
      let next = 0
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
          while (next < pending.length) {
            const item = pending[next++] as (typeof pending)[number]
            try {
              const judgment = await ask(item.state)
              item.auto[item.key] = autoFromJudgment(judgment, item.opener, item.hash)
            } catch {
              // Unjudged: the renderer applies the code rule for this beat.
            }
          }
        }),
      )
    }
    return data
  }

/** Attaches the judgment to every collection that offers the Story beats block. */
export const storyHeadingsPlugin =
  (options: Options = {}): Plugin =>
  (config) => ({
    ...config,
    collections: config.collections?.map((collection) =>
      hostsStoryBeats(collection.fields)
        ? {
            ...collection,
            hooks: {
              ...collection.hooks,
              beforeChange: [
                ...(collection.hooks?.beforeChange ?? []),
                judgeStoryHeadings(options),
              ],
            },
          }
        : collection,
    ),
  })
