import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { choice, noul, type Questions, TypeSafeClient } from '@typesafe-ai/sdk'
import { ASK_JUDGE_KEY_VAR, ASK_JUDGE_MODEL } from '@/features/ask/judge'
import { redactFreeText } from '@/features/ask/redact'
import { cmsTarget } from '../cms-target'
import {
  activeJournal,
  type JournalEntry,
  journalDir,
  parseEntries,
  privateDir,
  promptsPath,
  readJsonl,
  readMetas,
  repoRoot,
  type SessionRow,
  sessionsPath,
  totalUsage,
} from './lib'

/**
 * The check on the writer: every sentence of a Lab Project draft, held against
 * the record it was written from. The writer's one rule is that anything the
 * record does not say, it does not say; a person checking that by eye reads
 * the draft and the journal side by side, and a second Claude pass costs what
 * the first did. Code and Jev do it for a fraction of a cent.
 *
 *   pnpm lab:journal:verify [slug] --project <lab project id> [--local]
 *   pnpm lab:journal:verify [slug] --file <lab project document>.json
 *
 * Code first, because code is exact: every em dash, and every number in the
 * draft that appears nowhere in the record (the journal, the two usage files,
 * and the sums a writer is told to compute from them). Then Jev, per sentence,
 * following TypeSafe's citation check: the few entries that share the most
 * words with the sentence are the evidence, and the answer is supports,
 * contradicts or says nothing. A second question asked over the same state
 * says whether the sentence claims a fact at all, so a line of connective
 * prose is not reported as unsupported.
 *
 * `--project` reads the draft over the MCP endpoint with the MCP key
 * (`../cms-target.ts`), the way the writer wrote it. What leaves the machine:
 * draft sentences and journal entries, redacted first, to TypeSafe. The report
 * is written beside the digest, outside the repository.
 */

const VERIFY_THRESHOLDS = {
  /**
   * `checkable` at or above which a sentence is held to the record at all. Low on purpose: an
   * invented result ("cut review time by 83 percent") scored 0.47, and a missed invention costs
   * more than a transition listed by mistake.
   */
  checkable: 0.25,
  /** Verdict confidence below which a supported sentence is still listed for a person. */
  confidence: 0.6,
} as const

/** Bump when a question below is reworded: answers cached under the old wording are asked again. */
const QUESTIONS_VERSION = 1
/** Entries sent as evidence for one sentence. Jev loses accuracy as unrelated state grows. */
const EVIDENCE = 3
const MIN_SENTENCE_CHARS = 30
const MAX_CHARS = 6000
const CONCURRENCY = 8
/** House style bans it in copy. Built from its code point so this file holds none. */
const EM_DASH = String.fromCharCode(0x2014)
const STORY_SECTIONS = [
  'context',
  'challenge',
  'strategy',
  'approach',
  'outcomeSummary',
  'learnings',
] as const

const QUESTIONS = {
  verdict: choice(
    'How does `record`, notes kept while a software feature was built, relate to `claim`, a sentence from an article about that feature?',
    {
      supports:
        'The record states what the claim states, in the same or other words. Every specific in the claim, such as a name, a number, a cause or an order of events, is in the record.',
      contradicts:
        'The record states something that cannot be true if the claim is: a different number, a different cause, a different choice, or the opposite outcome.',
      says_nothing:
        'The record is about the same feature but does not state what the claim states, or states only part of it and the claim adds a specific the record lacks.',
    },
  ),
  checkable: noul('Does `claim` state a fact that notes from the build could confirm or deny?', {
    true: 'It says what was built, chosen, rejected, measured, broken or learned, or what existed before.',
    false:
      'It is a heading, a question, a transition between passages, or a general opinion with no specific in it.',
  }),
} satisfies Questions

type Verdict = { verdict: string; confidence: number; checkable: number }
type VerifyCache = { model: string; version: number; claims: Record<string, Verdict> }
type Sentence = { where: string; text: string }
type Lexical = { type?: string; text?: unknown; children?: unknown }
type StoryBeat = { key?: string; body?: unknown }
type StorySection = { body?: unknown; storyBeats?: StoryBeat[] | null }

const hashOf = (text: string) => createHash('sha1').update(text).digest('hex').slice(0, 16)
const clip = (text: string) => redactFreeText(text).slice(0, MAX_CHARS)

const TEXT_BLOCKS = new Set(['paragraph', 'heading', 'quote', 'listitem'])

const textOf = (node: Lexical): string =>
  typeof node.text === 'string'
    ? node.text
    : Array.isArray(node.children)
      ? node.children.map((child) => textOf(child as Lexical)).join('')
      : ''

/** The paragraphs of a Lexical body, as plain text. */
function paragraphs(node: unknown): string[] {
  if (!node || typeof node !== 'object') return []
  if ('root' in node) return paragraphs(node.root)
  const { type, children } = node as Lexical
  if (type && TEXT_BLOCKS.has(type)) return [textOf(node as Lexical)]
  return Array.isArray(children) ? children.flatMap((child) => paragraphs(child)) : []
}

/** Splits on a full stop, question mark or colon that ends a sentence. "1.5" and "lib.ts" do not. */
const sentencesOf = (paragraph: string): string[] =>
  paragraph
    .split(/(?<=[.?!])\s+(?=[A-Z"'`(])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= MIN_SENTENCE_CHARS)

/** Every string in the document, for the checks that are not about the story. */
function strings(node: unknown, path = ''): { path: string; text: string }[] {
  if (typeof node === 'string') return [{ path, text: node }]
  if (Array.isArray(node)) return node.flatMap((item, index) => strings(item, `${path}[${index}]`))
  if (!node || typeof node !== 'object') return []
  return Object.entries(node).flatMap(([key, value]) =>
    strings(value, path ? `${path}.${key}` : key),
  )
}

const wordsOf = (text: string) => new Set(text.toLowerCase().match(/[a-z][a-z0-9_.-]{3,}/g) ?? [])

/** The entries that share the most words with a sentence, rarer words counting for more. */
function evidenceFor(sentence: string, entries: { text: string; words: Set<string> }[]): string[] {
  const seen = new Map<string, number>()
  for (const entry of entries)
    for (const word of entry.words) seen.set(word, (seen.get(word) ?? 0) + 1)
  const wanted = wordsOf(sentence)
  return entries
    .map((entry) => {
      let score = 0
      for (const word of wanted) if (entry.words.has(word)) score += 1 / (seen.get(word) ?? 1)
      return { entry, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, EVIDENCE)
    .map(({ entry }) => entry.text)
}

/** `1,234`, `1234` and `1234.0` are one number. Digits under 13 are words in prose, not data. */
const numbersIn = (text: string): string[] =>
  (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [])
    .map((raw) => raw.replace(/,/g, '').replace(/\.0+$/, ''))
    .filter((number) => !(Number.isInteger(Number(number)) && Number(number) < 13))

/** The sums a writer is told to compute, so a total it reports is a number the record holds. */
function usageFacts(root: string, slug: string, entries: JournalEntry[]): string {
  const sessions = readJsonl<SessionRow>(sessionsPath(root, slug))
  const jev = readJsonl<{ requests: number; inputTokens: number }>(
    join(journalDir(root, slug), 'jev.jsonl'),
  )
  const prompts = readJsonl<{ at: string }>(promptsPath(root, slug))
  const usage = totalUsage(sessions)
  const columns = ['input', 'output', 'cacheWrite', 'cacheRead'] as const
  const lines = Object.entries(usage).map(
    ([model, counts]) =>
      `${model}: ${columns.map((column) => `${column} ${counts[column]}`).join(', ')}, messages ${counts.messages}.`,
  )
  const all = columns.map(
    (column) =>
      `${column} ${Object.values(usage).reduce((sum, counts) => sum + counts[column], 0)}`,
  )
  const days = new Set(entries.map((entry) => entry.at.slice(0, 10))).size
  return [
    `Sessions and usage, summed from sessions.jsonl and jev.jsonl. ${sessions.length} sessions, ${entries.length} journal entries, ${prompts.length} prompts, over ${days} days.`,
    ...lines,
    `All models: ${all.join(', ')}.`,
    `Jev: ${jev.reduce((sum, row) => sum + row.requests, 0)} requests, ${jev.reduce((sum, row) => sum + row.inputTokens, 0)} input tokens, in ${jev.length} runs.`,
  ].join('\n')
}

async function fetchProject(id: string, local: boolean): Promise<unknown> {
  const target = cmsTarget({ local })
  if (typeof target === 'string') throw new Error(target)
  const response = await fetch(`${target.server}/api/mcp`, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { arguments: { draft: true, id: Number(id) }, name: 'findLabProjects' },
    }),
    headers: {
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${target.key}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  if (!response.ok) throw new Error(`${target.server} answered ${response.status}.`)
  const body = await response.text()
  const data = body.startsWith('{') ? body : (body.match(/^data: (.*)$/m)?.[1] ?? '')
  const text: string | undefined = JSON.parse(data).result?.content?.[0]?.text
  const start = text?.indexOf('{') ?? -1
  if (!text || start === -1) throw new Error(`No Lab Project ${id} on ${target.server}: ${text}`)
  // The tool answers with a line of words, the document, then sometimes a fence.
  return JSON.parse(text.slice(start).replace(/\n```\s*$/, ''))
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const option = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
  const root = repoRoot(process.cwd())
  const slug = args[0] && !args[0].startsWith('--') ? args[0] : undefined
  const journal = slug ? readMetas(root).find((meta) => meta.slug === slug) : activeJournal(root)
  if (!journal) throw new Error('No journal: pass a slug, or resume one on this branch.')
  const file = option('--file')
  const project = option('--project')
  if (!file && !project) {
    throw new Error('usage: pnpm lab:journal:verify [slug] --project <id> | --file <document.json>')
  }

  const loaded: unknown = file
    ? JSON.parse(readFileSync(file, 'utf8'))
    : await fetchProject(project as string, args.includes('--local'))
  const document = ((loaded as { docs?: unknown[] }).docs?.[0] ?? loaded) as Record<
    string,
    StorySection | undefined
  >

  const sentences: Sentence[] = STORY_SECTIONS.flatMap((section) => {
    const story = document[section]
    if (!story) return []
    const passages = [
      { where: section, body: story.body },
      ...(story.storyBeats ?? []).map((beat) => ({
        where: `${section}.${beat.key ?? '?'}`,
        body: beat.body,
      })),
    ]
    return passages.flatMap(({ where, body }) =>
      paragraphs(body).flatMap((paragraph) =>
        sentencesOf(paragraph).map((text) => ({ where, text })),
      ),
    )
  })
  if (sentences.length === 0) throw new Error('The document has no story copy to check.')

  const journalPath = join(journalDir(root, journal.slug), 'journal.md')
  const entries = existsSync(journalPath) ? parseEntries(readFileSync(journalPath, 'utf8')) : []
  const commits =
    execFileSync('git', ['log', '--format=%s', '-n', '200', ...journal.branches.slice(0, 1)], {
      cwd: root,
      encoding: 'utf8',
    }) || ''
  const record = [
    ...entries.map((entry) => `${entry.at} | ${entry.kind} | ${entry.title}\n\n${entry.body}`),
    usageFacts(root, journal.slug, entries),
  ]
  const evidence = record.map((text) => ({ text, words: wordsOf(text) }))

  // Code first: exact, free, and nothing leaves the machine.
  const dashes = strings(document).filter(({ text }) => text.includes(EM_DASH))
  const known = new Set(numbersIn(`${record.join('\n')}\n${commits}`))
  const strangers = sentences.flatMap((sentence) => {
    const missing = numbersIn(sentence.text).filter((number) => !known.has(number))
    return missing.length > 0 ? [{ sentence, missing }] : []
  })

  const out = privateDir(root, journal.slug)
  mkdirSync(out, { recursive: true })
  const cachePath = join(out, 'verify.json')
  let cache: VerifyCache = { model: ASK_JUDGE_MODEL, version: QUESTIONS_VERSION, claims: {} }
  if (existsSync(cachePath)) {
    const stored = JSON.parse(readFileSync(cachePath, 'utf8')) as VerifyCache
    if (stored.model === ASK_JUDGE_MODEL && stored.version === QUESTIONS_VERSION) cache = stored
  }

  let inputTokens = 0
  let requests = 0
  const stateOf = (sentence: Sentence) => ({
    claim: clip(sentence.text),
    record: evidenceFor(sentence.text, evidence).map(clip),
  })
  const keyOf = (sentence: Sentence) => hashOf(JSON.stringify(stateOf(sentence)))

  if (process.env[ASK_JUDGE_KEY_VAR]?.trim()) {
    const jev = new TypeSafeClient({ defaultModel: ASK_JUDGE_MODEL, logLevel: 'error' })
    const pending = sentences.filter((sentence) => !(keyOf(sentence) in cache.claims))
    let next = 0
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
        while (next < pending.length) {
          const sentence = pending[next++] as Sentence
          try {
            const result = await jev.systemOne({ state: stateOf(sentence), questions: QUESTIONS })
            inputTokens += result.usage.input_tokens
            requests += 1
            const { verdict, checkable } = result.answers
            cache.claims[keyOf(sentence)] = {
              verdict: verdict.choice,
              confidence: verdict.confidence,
              checkable: checkable.noul,
            }
          } catch (err) {
            console.error(
              `Jev: ${err instanceof Error ? err.name : 'error'} on one sentence, left unjudged`,
            )
          }
        }
      }),
    )
    writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`)
  } else {
    console.error(`${ASK_JUDGE_KEY_VAR} is not set: only the code checks ran.`)
  }

  const judged = sentences.map((sentence) => ({ sentence, answer: cache.claims[keyOf(sentence)] }))
  const held = judged.filter(
    ({ answer }) => answer && answer.checkable >= VERIFY_THRESHOLDS.checkable,
  )
  const pick = (verdict: string) => held.filter(({ answer }) => answer?.verdict === verdict)
  const contradicted = pick('contradicts')
  const unsupported = pick('says_nothing')
  const unsure = pick('supports').filter(
    ({ answer }) => (answer?.confidence ?? 0) < VERIFY_THRESHOLDS.confidence,
  )
  const unjudged = judged.filter(({ answer }) => !answer)
  const line = ({ sentence, answer }: (typeof judged)[number]) =>
    `- ${sentence.where} | ${answer?.confidence.toFixed(2) ?? '-'} | ${sentence.text}`

  const report = [
    `# Draft check: ${journal.title}`,
    '',
    `${sentences.length} sentences from ${file ?? `Lab Project ${project}`}, against ${entries.length} journal entries and the usage files. Judged by ${ASK_JUDGE_MODEL}. A listed sentence is one to read against the journal, not a proven error: the record may say it in a session's prompts or in a commit this check does not read.`,
    '',
    `## Em dashes (${dashes.length})`,
    '',
    ...dashes.map(({ path, text }) => `- ${path} | ${text.slice(0, 120)}`),
    '',
    `## Numbers the record does not hold (${strangers.length})`,
    '',
    'A rounded number lands here too. Say "about" in the copy, or use the number the record has.',
    '',
    ...strangers.map(
      ({ sentence, missing }) => `- ${sentence.where} | ${missing.join(', ')} | ${sentence.text}`,
    ),
    '',
    `## Contradicted by the record (${contradicted.length})`,
    '',
    ...contradicted.map(line),
    '',
    `## Not in the record (${unsupported.length})`,
    '',
    ...unsupported.map(line),
    '',
    `## Supported, but Jev was unsure (${unsure.length})`,
    '',
    ...unsure.map(line),
    ...(unjudged.length > 0 ? ['', `Unjudged sentences: ${unjudged.length}.`] : []),
    '',
  ].join('\n')

  writeFileSync(join(out, 'verify.md'), report)
  if (requests > 0) {
    appendFileSync(
      join(journalDir(root, journal.slug), 'jev.jsonl'),
      `${JSON.stringify({ at: new Date().toISOString(), model: ASK_JUDGE_MODEL, task: 'verify', requests, inputTokens })}\n`,
    )
  }
  console.log(join(out, 'verify.md'))
  console.log(
    `${sentences.length} sentences. Em dashes ${dashes.length}, unknown numbers ${strangers.length}, contradicted ${contradicted.length}, not in the record ${unsupported.length}, unsure ${unsure.length}. Jev: ${requests} requests, ${inputTokens} input tokens.`,
  )
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
