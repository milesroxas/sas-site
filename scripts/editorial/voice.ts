import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { choice, noul, type Questions, score, type TypeSafeClient } from '@typesafe-ai/sdk'
import { ASK_JUDGE_MODEL } from '@/features/ask/judge'
import { redactFreeText } from '@/features/ask/redact'
import { lintVoice, type VoiceFinding } from '@/features/editorial/voice'
import type { Passage } from './passages'

/**
 * The voice check: docs/editorial/voice.md held against a document's copy.
 * Code first, for what is exact (`lintVoice`: em dashes, the banned phrases,
 * contrast frames, flattened claims, counts). Then Jev (TypeSafe's System One
 * model), for what the doc names but code cannot read: whether a passage is
 * specific or generic, composed or inflated, human or formulaic, and whether
 * it closes on a punchline. Headings are judged for their grammatical form,
 * and code flags a run of headings that share one.
 *
 * Jev judges, it does not write: every finding is a place for a person or an
 * agent to look, never a rewrite. Code owns the policy: every number is in
 * `VOICE_JUDGE_THRESHOLDS`, and the raw probabilities are cached so moving a
 * threshold reruns nothing. Used by `pnpm editorial:voice` on any document
 * and by `pnpm lab:journal:verify` on a Lab Project draft.
 *
 * What leaves the machine: the passages, redacted first, to TypeSafe.
 */

export const VOICE_JUDGE_THRESHOLDS = {
  /**
   * `specific` (0 to 2) at or below which a passage is listed as generic. Measured 2026-09-21 on the
   * two published Lab Projects and a planted agency draft: planted paragraphs read 0.00 to 0.59;
   * approved copy mostly 0.5 and up, except a few abstract thesis lines (0.05 to 0.47) that Jev
   * cannot tell from agency copy. Those stay listed: the section says to read, not to cut.
   */
  generic: 0.5,
  /**
   * `inflated` at or above which a passage is listed. A confident assertion the doc asks for
   * ("Nobody wants semver for a background") read 0.60 to 0.78; the planted hype 0.87 to 0.94.
   */
  inflated: 0.8,
  /** `formulaic` at or above which a passage is listed. Approved copy read up to 0.68, the planted draft 0.79 and up. */
  formulaic: 0.75,
  /** `punchline` at or above which a paragraph counts as closing on one. */
  punchline: 0.6,
  /** Share of paragraphs closing on a punchline at or above which they are listed: the doc's "every paragraph". */
  punchlineShare: 0.4,
  /** Share of headings in one grammatical form at or above which the run is flagged. */
  headingShare: 0.7,
  /** Headings a document needs before their forms are compared at all. */
  headingsMin: 4,
} as const

/** Bump when a question below is reworded: answers cached under the old wording are asked again. */
export const VOICE_QUESTIONS_VERSION = 1
const MAX_CHARS = 4000
const CONCURRENCY = 8

const PASSAGE_QUESTIONS = {
  specific: score(
    'How specific is `passage`, a paragraph of copy from a design and technology studio?',
    [
      'Generic: it could be any studio speaking. Broad claims (helping brands grow, creating impact, combining strategy and creativity) with no name, number, mechanism or particular a reader could check.',
      'Mixed: one particular (a name, a number, a step, a tool) inside claims that are otherwise general.',
      'Specific: it says what was done or what is meant, with the particulars (names, numbers, steps, causes) carrying the point.',
    ],
  ),
  inflated: noul('Does `passage` overstate?', {
    true: 'It ranks itself or its subject with superlatives or hype (revolutionary, game-changing, the best), presses urgency, or promises results it does not show.',
    false:
      'It states what happened, what is offered or what was learned without ranking it, and any claim of a result comes with its evidence.',
  }),
  formulaic: noul('Does `passage` read as formulaic, machine-written prose?', {
    true: 'It leans on a template: a contrast frame (not X but Y; more than X, it is Y), a triplet of parallel phrases, sentences that all share one shape, a rhetorical question followed by its answer, or a closing line that restates what the paragraph already said.',
    false:
      'The sentences vary in length and shape, and each one adds something the previous did not. A single contrast or a single list is not a template.',
  }),
  punchline: noul('Does `passage` end on a dramatic conclusion?', {
    true: 'Its last sentence is a short, sweeping line that turns the paragraph into a lesson or a flourish, and states no fact of its own.',
    false: 'Its last sentence carries its own fact or detail, or the paragraph ends plainly.',
  }),
} satisfies Questions

const HEADING_QUESTIONS = {
  form: choice('What is the grammatical form of `heading`, a heading from a web page?', {
    imperative:
      'A command or instruction to the reader: "Make the difference visible", "Give people somewhere to start".',
    gerund:
      'Opens with a verb ending in -ing: "Building a shader studio", "Keeping the record straight".',
    noun_phrase:
      'A noun or noun phrase with no verb: "The flow field", "One field, three jobs", "Prompts and tokens".',
    question: 'A question: "Why is the field cheap?".',
    sentence:
      'A complete statement with a subject and a verb: "The depth stays", "Jev reads the record".',
    other: 'None of the above: a fragment, a label, a number, a name.',
  }),
} satisfies Questions

export type PassageJudgment = {
  specific: number
  specificConfidence: number
  inflated: number
  formulaic: number
  punchline: number
}
export type HeadingJudgment = { form: string; confidence: number }

export type VoiceCache = {
  model: string
  version: number
  passages: Record<string, PassageJudgment>
  headings: Record<string, HeadingJudgment>
}

export const emptyVoiceCache = (): VoiceCache => ({
  model: ASK_JUDGE_MODEL,
  version: VOICE_QUESTIONS_VERSION,
  passages: {},
  headings: {},
})

export function loadVoiceCache(path: string): VoiceCache {
  if (!existsSync(path)) return emptyVoiceCache()
  const stored = JSON.parse(readFileSync(path, 'utf8')) as VoiceCache
  return stored.model === ASK_JUDGE_MODEL && stored.version === VOICE_QUESTIONS_VERSION
    ? stored
    : emptyVoiceCache()
}

export const saveVoiceCache = (path: string, cache: VoiceCache): void =>
  writeFileSync(path, `${JSON.stringify(cache, null, 2)}\n`)

const hashOf = (text: string) => createHash('sha1').update(text).digest('hex').slice(0, 16)
const clip = (text: string) => redactFreeText(text).slice(0, MAX_CHARS)

export type VoiceUsage = { requests: number; inputTokens: number }

/**
 * Asks Jev about every paragraph and heading not yet in the cache. A failed
 * request leaves its passage unjudged, which the report says.
 */
export async function judgeVoice(
  passages: Passage[],
  cache: VoiceCache,
  jev: TypeSafeClient,
): Promise<VoiceUsage> {
  const usage: VoiceUsage = { requests: 0, inputTokens: 0 }
  const pending = passages.filter(
    (passage) =>
      (passage.kind === 'paragraph' && !(hashOf(passage.text) in cache.passages)) ||
      (passage.kind === 'heading' && !(hashOf(passage.text) in cache.headings)),
  )
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
      while (next < pending.length) {
        const passage = pending[next++] as Passage
        const key = hashOf(passage.text)
        try {
          if (passage.kind === 'paragraph') {
            const result = await jev.systemOne({
              state: { passage: clip(passage.text) },
              questions: PASSAGE_QUESTIONS,
            })
            usage.inputTokens += result.usage.input_tokens
            usage.requests += 1
            const { specific, inflated, formulaic, punchline } = result.answers
            cache.passages[key] = {
              specific: specific.score,
              specificConfidence: specific.confidence,
              inflated: inflated.noul,
              formulaic: formulaic.noul,
              punchline: punchline.noul,
            }
          } else {
            const result = await jev.systemOne({
              state: { heading: clip(passage.text) },
              questions: HEADING_QUESTIONS,
            })
            usage.inputTokens += result.usage.input_tokens
            usage.requests += 1
            cache.headings[key] = {
              form: result.answers.form.choice,
              confidence: result.answers.form.confidence,
            }
          }
        } catch (err) {
          console.error(
            `Jev: ${err instanceof Error ? err.name : 'error'} on one passage, left unjudged`,
          )
        }
      }
    }),
  )
  return usage
}

const excerpt = (text: string, length = 140) => {
  const line = text.replace(/\s+/g, ' ').trim()
  return line.length > length ? `${line.slice(0, length)}...` : line
}

const RULE_LABELS: Record<VoiceFinding['rule'], string> = {
  'em-dash': 'em dash',
  'avoid-phrase': 'banned phrase',
  'flattened-claim': 'flattened claim',
  'contrast-frame': 'contrast frame',
  semicolons: 'semicolons',
  'long-paragraph': 'long paragraph',
  'uniform-sentences': 'sentences of one length',
}

export type VoiceReport = { lines: string[]; counts: Record<string, number> }

/**
 * The report, from the code findings and whatever Jev has judged. Sections
 * in the order a writer fixes them: what the save refuses, what the doc
 * lists, then the judgments.
 */
export function voiceReport(
  passages: Passage[],
  cache: VoiceCache,
  thresholds = VOICE_JUDGE_THRESHOLDS,
): VoiceReport {
  const linted = passages.map((passage) => ({ passage, findings: lintVoice(passage.text) }))
  const refused = linted.flatMap(({ passage, findings }) => {
    const gate = findings.filter((f) => f.rule === 'em-dash' || f.rule === 'avoid-phrase')
    return gate.length ? [{ passage, findings: gate }] : []
  })
  const listed = linted.flatMap(({ passage, findings }) => {
    const rest = findings.filter((f) => f.rule !== 'em-dash' && f.rule !== 'avoid-phrase')
    return rest.length ? [{ passage, findings: rest }] : []
  })
  const findingLine = ({ passage, findings }: { passage: Passage; findings: VoiceFinding[] }) =>
    `- ${passage.path} | ${[...new Set(findings.map((f) => `${RULE_LABELS[f.rule]}: ${f.match}`))].join('; ')} | ${excerpt(passage.text)}`

  const paragraphs = passages.filter((passage) => passage.kind === 'paragraph')
  const judged = paragraphs.flatMap((passage) => {
    const answers = cache.passages[hashOf(passage.text)]
    return answers ? [{ passage, answers }] : []
  })
  const unjudged = paragraphs.length - judged.length
  const line = ({ passage }: (typeof judged)[number], value: number) =>
    `- ${passage.path} | ${value.toFixed(2)} | ${excerpt(passage.text)}`

  const generic = judged
    .filter(({ answers }) => answers.specific <= thresholds.generic)
    .sort((a, b) => a.answers.specific - b.answers.specific)
  const inflated = judged
    .filter(({ answers }) => answers.inflated >= thresholds.inflated)
    .sort((a, b) => b.answers.inflated - a.answers.inflated)
  const formulaic = judged
    .filter(({ answers }) => answers.formulaic >= thresholds.formulaic)
    .sort((a, b) => b.answers.formulaic - a.answers.formulaic)
  const punchlines = judged.filter(({ answers }) => answers.punchline >= thresholds.punchline)
  const punchShare = judged.length ? punchlines.length / judged.length : 0

  const headings = passages.filter((passage) => passage.kind === 'heading')
  const forms = new Map<string, Passage[]>()
  for (const heading of headings) {
    const answer = cache.headings[hashOf(heading.text)]
    if (!answer) continue
    forms.set(answer.form, [...(forms.get(answer.form) ?? []), heading])
  }
  const judgedHeadings = [...forms.values()].reduce((sum, list) => sum + list.length, 0)
  const [topForm, topList] = [...forms].sort((a, b) => b[1].length - a[1].length)[0] ?? [
    null,
    [] as Passage[],
  ]
  const topShare = judgedHeadings ? topList.length / judgedHeadings : 0
  const headingRun =
    topForm !== null &&
    judgedHeadings >= thresholds.headingsMin &&
    topShare >= thresholds.headingShare

  const lines = [
    `### Refused at save: em dashes and banned phrases (${refused.length})`,
    '',
    'An API key cannot save these; a person can. Recast each.',
    '',
    ...refused.map(findingLine),
    '',
    `### Listed by the doc: frames, flattened claims, counts (${listed.length})`,
    '',
    'One contrast frame is allowed; two in one passage are listed. Semicolons, long paragraphs and sentences of one length are counts to read, not errors.',
    '',
    ...listed.map(findingLine),
    '',
    `### Generic (${generic.length} of ${judged.length} paragraphs)`,
    '',
    `Jev scored each paragraph from 0 (any studio could say it) to 2 (the particulars carry the point). Listed at or below ${thresholds.generic}.`,
    '',
    ...generic.map((item) => line(item, item.answers.specific)),
    '',
    `### Inflated (${inflated.length})`,
    '',
    ...inflated.map((item) => line(item, item.answers.inflated)),
    '',
    `### Formulaic (${formulaic.length})`,
    '',
    ...formulaic.map((item) => line(item, item.answers.formulaic)),
    '',
    `### Paragraphs that close on a punchline (${punchlines.length} of ${judged.length}, ${Math.round(punchShare * 100)}%)`,
    '',
    punchShare >= thresholds.punchlineShare
      ? 'More than the doc allows: not every paragraph ends with a dramatic conclusion. Vary the closes.'
      : 'Within the doc: a memorable line now and then.',
    '',
    ...(punchShare >= thresholds.punchlineShare
      ? punchlines.map((item) => line(item, item.answers.punchline))
      : []),
    '',
    `### Heading forms (${judgedHeadings} headings)`,
    '',
    ...[...forms]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([form, list]) => `- ${form}: ${list.length}`),
    '',
    headingRun
      ? `${Math.round(topShare * 100)}% of the headings are ${topForm?.replace('_', ' ')}: the doc says not every heading follows one grammatical formula. Vary them.`
      : 'No one form runs through the headings.',
    ...(unjudged > 0 ? ['', `Unjudged paragraphs: ${unjudged}.`] : []),
    '',
  ]
  return {
    lines,
    counts: {
      refused: refused.length,
      listed: listed.length,
      generic: generic.length,
      inflated: inflated.length,
      formulaic: formulaic.length,
      punchlines: punchlines.length,
      paragraphs: judged.length,
      headingRun: headingRun ? 1 : 0,
    },
  }
}
