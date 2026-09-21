import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { choice, noul, type Questions, score, TypeSafeClient } from '@typesafe-ai/sdk'
import { ASK_JUDGE_KEY_VAR, ASK_JUDGE_MODEL } from '@/features/ask/judge'
import { redactFreeText } from '@/features/ask/redact'
import {
  activeJournal,
  assistantTexts,
  findTranscript,
  journalDir,
  type PromptRow,
  parseEntries,
  privateDir,
  promptsPath,
  readJsonl,
  readMetas,
  repoRoot,
  type SessionRow,
  sessionsPath,
} from './lib'

/**
 * The digest: Jev (TypeSafe's System One model) reads the raw record so the
 * writing agent does not have to. A feature's transcripts run to hundreds of
 * thousands of tokens and most of its prompts are "continue"; a Claude pass
 * over that costs dollars, a Jev pass cents. Jev cannot write, so it only
 * judges, and code turns the judgments into a short brief:
 *
 * - each prompt: what it was doing, how much of the story it tells, and
 *   whether it holds something that must not be published
 * - each journal entry: the Lab Project story section it belongs in
 * - each agent message: whether it states a decision, a problem, a
 *   measurement or a lesson, so a moment nobody logged can still be found
 *
 *   pnpm lab:journal:digest [slug]
 *
 * Code owns the policy: every number is in `DIGEST_THRESHOLDS`, untuned
 * defaults until a journal or two has been read against them. The raw
 * probabilities are kept in `digest.json`, so moving a threshold reruns
 * nothing, and an item already judged is never sent again.
 *
 * What leaves the machine: prompts, journal entries and the agent's prose,
 * redacted first, to TypeSafe. The brief holds prompt text, so it is written
 * beside the prompts, outside the repository.
 */

const DIGEST_THRESHOLDS = {
  /** `story_value` (0 to 3) at or above which a prompt is offered for quoting. */
  storyValue: 1.5,
  /** `sensitive` at or above which a prompt is held back, whatever its value. */
  sensitive: 0.4,
  /** Any moment Noul at or above which an agent message is listed as a candidate. */
  moment: 0.75,
  /** `section` confidence below which an entry is left for the writer to place. */
  section: 0.4,
} as const

/** Bump when a question below is reworded: answers cached under the old wording are asked again. */
const QUESTIONS_VERSION = 1
const MAX_CHARS = 6000
const MIN_MESSAGE_CHARS = 280
const MAX_CANDIDATES = 40
const CONCURRENCY = 8

const PROMPT_QUESTIONS = {
  kind: choice('What is `prompt`, a message a developer sent to their AI coding agent, doing?', {
    direction: 'It sets or changes the goal, the scope, or a requirement of the work.',
    decision:
      'It picks between options the agent offered, approves a proposal, or tells the agent to go ahead and build.',
    correction:
      'It says the agent got something wrong, rejects its work, or redirects an approach already under way.',
    question:
      'It asks for an explanation, an opinion, or whether something is possible, without asking for a change.',
    chore:
      'A routine instruction with no content of its own: continue, commit, push, run a command, fix a lint error.',
    other: 'None of the above.',
  }),
  story_value: score('How much does `prompt` tell a reader about how this feature came to be?', [
    'Nothing: it is routine, or it only means something beside the conversation around it.',
    'A little: a small request or a clarification inside work already under way.',
    'A fair amount: it states a requirement, a constraint, or a preference that shaped the work.',
    'A great deal: it states the goal of the feature, a change of direction, or the reason behind a key choice.',
  ]),
  sensitive: noul('Does `prompt` contain something that should not be published?', {
    true: "It holds a password, key or token, a private person's name or contact details, or a client's confidential business detail.",
    false:
      'It only discusses the code, the product, tools, or public information. Naming a software vendor or a public company is not sensitive.',
  }),
} satisfies Questions

const ENTRY_QUESTIONS = {
  section: choice(
    'Which part of a written case study of this feature does `entry`, a note from the build log, belong in?',
    {
      context:
        'Where things stood before the work: the existing system, who it serves, why it matters.',
      challenge: 'The problem to solve, a constraint, or something that went wrong along the way.',
      strategy:
        'A choice of direction made before building: the plan, the trade-off, the option rejected.',
      approach: 'How it was built: an implementation step, a technique, a tool, a fix.',
      outcome: 'What the work achieved: a measured result, a before and after, what shipped.',
      learnings: 'A lesson that applies beyond this feature, or what would be done differently.',
      none: 'It belongs in none of these.',
    },
  ),
} satisfies Questions

const MESSAGE_QUESTIONS = {
  decision: noul('Does `message` state a choice between alternatives and give the reason for it?'),
  problem: noul(
    'Does `message` report something that failed, broke, or turned out differently than expected?',
  ),
  measurement: noul(
    'Does `message` report a measured number, such as a duration, a size, a count, or a before and after comparison?',
  ),
  insight: noul(
    'Does `message` state a lesson or a finding that would apply beyond this one task?',
  ),
} satisfies Questions

type PromptAnswers = { kind: string; kindConfidence: number; storyValue: number; sensitive: number }
type EntryAnswers = { section: string; confidence: number }
type MessageAnswers = { decision: number; problem: number; measurement: number; insight: number }

type DigestCache = {
  model: string
  version: number
  prompts: Record<string, PromptAnswers>
  entries: Record<string, EntryAnswers>
  messages: Record<string, MessageAnswers>
}

const hashOf = (text: string) => createHash('sha1').update(text).digest('hex').slice(0, 16)
const clip = (text: string) => redactFreeText(text).slice(0, MAX_CHARS)
const excerpt = (text: string, length = 300) => {
  const line = text.replace(/\s+/g, ' ').trim()
  return line.length > length ? `${line.slice(0, length)}...` : line
}

/** Whether a prompt is offered to the writer for quoting. */
function quotable(answers: PromptAnswers): boolean {
  return (
    answers.sensitive < DIGEST_THRESHOLDS.sensitive &&
    answers.storyValue >= DIGEST_THRESHOLDS.storyValue
  )
}

let inputTokens = 0
let requests = 0

/** One request per item, each judged alone: a state full of unrelated text costs Jev accuracy. */
async function judgeEach<Item, Answers>(
  items: Item[],
  cache: Record<string, Answers>,
  textOf: (item: Item) => string,
  ask: (text: string) => Promise<Answers>,
): Promise<void> {
  const pending = items.filter((item) => !(hashOf(textOf(item)) in cache))
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
      while (next < pending.length) {
        const text = textOf(pending[next++] as Item)
        try {
          cache[hashOf(text)] = await ask(text)
        } catch (err) {
          // Unjudged is a state the brief reports, not a failure of the run.
          console.error(
            `Jev: ${err instanceof Error ? err.name : 'error'} on one item, left unjudged`,
          )
        }
      }
    }),
  )
}

async function main(): Promise<void> {
  const root = repoRoot(process.cwd())
  const slug = process.argv[2]
  const journal = slug ? readMetas(root).find((meta) => meta.slug === slug) : activeJournal(root)
  if (!journal) throw new Error('No journal: pass a slug, or resume one on this branch.')
  if (!process.env[ASK_JUDGE_KEY_VAR]?.trim()) {
    throw new Error(`${ASK_JUDGE_KEY_VAR} is not set. Without it the writer reads the raw record.`)
  }

  const out = privateDir(root, journal.slug)
  mkdirSync(out, { recursive: true })
  const cachePath = join(out, 'digest.json')
  let cache: DigestCache = {
    model: ASK_JUDGE_MODEL,
    version: QUESTIONS_VERSION,
    prompts: {},
    entries: {},
    messages: {},
  }
  if (existsSync(cachePath)) {
    const stored = JSON.parse(readFileSync(cachePath, 'utf8')) as DigestCache
    if (stored.model === ASK_JUDGE_MODEL && stored.version === QUESTIONS_VERSION) cache = stored
  }

  const prompts = readJsonl<PromptRow>(promptsPath(root, journal.slug))
  const journalPath = join(journalDir(root, journal.slug), 'journal.md')
  const entries = existsSync(journalPath) ? parseEntries(readFileSync(journalPath, 'utf8')) : []
  const sessions = readJsonl<SessionRow>(sessionsPath(root, journal.slug))
  const messages = sessions
    .flatMap(({ session, window }) => {
      const path = findTranscript(session, process.cwd())
      return path ? assistantTexts(readFileSync(path, 'utf8'), window) : []
    })
    .filter((message) => message.text.length >= MIN_MESSAGE_CHARS)

  const jev = new TypeSafeClient({ defaultModel: ASK_JUDGE_MODEL, logLevel: 'error' })
  const entryText = (entry: { title: string; body: string }) => `${entry.title}\n\n${entry.body}`

  await Promise.all([
    judgeEach(
      prompts,
      cache.prompts,
      (row) => row.text,
      async (text) => {
        const result = await jev.systemOne({
          state: { prompt: clip(text) },
          questions: PROMPT_QUESTIONS,
        })
        inputTokens += result.usage.input_tokens
        requests += 1
        const { kind, story_value, sensitive } = result.answers
        return {
          kind: kind.choice,
          kindConfidence: kind.confidence,
          storyValue: story_value.score,
          sensitive: sensitive.noul,
        }
      },
    ),
    judgeEach(entries, cache.entries, entryText, async (text) => {
      const result = await jev.systemOne({
        state: { entry: clip(text) },
        questions: ENTRY_QUESTIONS,
      })
      inputTokens += result.usage.input_tokens
      requests += 1
      return {
        section: result.answers.section.choice,
        confidence: result.answers.section.confidence,
      }
    }),
    judgeEach(
      messages,
      cache.messages,
      (message) => message.text,
      async (text) => {
        const result = await jev.systemOne({
          state: { message: clip(text) },
          questions: MESSAGE_QUESTIONS,
        })
        inputTokens += result.usage.input_tokens
        requests += 1
        const { decision, problem, measurement, insight } = result.answers
        return {
          decision: decision.noul,
          problem: problem.noul,
          measurement: measurement.noul,
          insight: insight.noul,
        }
      },
    ),
  ])

  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`)

  const judgedPrompts = prompts.map((row) => ({ row, answers: cache.prompts[hashOf(row.text)] }))
  const quoted = judgedPrompts.filter(({ answers }) => answers && quotable(answers))
  const held = judgedPrompts.filter(
    ({ answers }) => answers && answers.sensitive >= DIGEST_THRESHOLDS.sensitive,
  )
  const unjudged = judgedPrompts.filter(({ answers }) => !answers)

  const sections = new Map<string, string[]>()
  for (const entry of entries) {
    const answers = cache.entries[hashOf(entryText(entry))]
    const section =
      answers && answers.confidence >= DIGEST_THRESHOLDS.section ? answers.section : 'unplaced'
    sections.set(section, [
      ...(sections.get(section) ?? []),
      `- ${entry.at} | ${entry.kind} | ${entry.title}`,
    ])
  }

  const candidates = messages
    .flatMap((message) => {
      const answers = cache.messages[hashOf(message.text)]
      if (!answers) return []
      const [label, p] = Object.entries(answers).sort((a, b) => b[1] - a[1])[0] as [string, number]
      return p >= DIGEST_THRESHOLDS.moment ? [{ message, label, p }] : []
    })
    .sort((a, b) => b.p - a.p)
    .slice(0, MAX_CANDIDATES)
    .sort((a, b) => a.message.at.localeCompare(b.message.at))

  const brief = [
    `# Digest: ${journal.title}`,
    '',
    `Judged by ${ASK_JUDGE_MODEL}. ${prompts.length} prompts, ${entries.length} entries, ${messages.length} agent messages. Holds prompt text: never commit or publish this file.`,
    '',
    `## Prompts worth quoting (${quoted.length} of ${prompts.length})`,
    '',
    ...quoted.map(
      ({ row, answers }) =>
        `- ${row.at.slice(0, 16)} | ${answers?.kind} | ${excerpt(row.text, 600)}`,
    ),
    '',
    `## Held back as sensitive (${held.length})`,
    '',
    'Read each in prompts.jsonl before quoting it, and ask Miles when unsure.',
    '',
    ...held.map(({ row }) => `- ${row.id} | ${row.at.slice(0, 16)}`),
    ...(unjudged.length > 0
      ? ['', `Unjudged prompts: ${unjudged.length}. Read those in prompts.jsonl.`]
      : []),
    '',
    '## Journal entries by story section',
    '',
    ...[...sections].flatMap(([section, lines]) => [`### ${section}`, '', ...lines, '']),
    `## Moments that may be missing from the journal (${candidates.length})`,
    '',
    'Agent messages that read as a decision, a problem, a measurement or a lesson. Check each against the entries above; log the ones that are missing.',
    '',
    ...candidates.map(
      ({ message, label, p }) =>
        `- ${message.at.slice(0, 16)} | ${label} ${p.toFixed(2)} | session ${message.session.slice(0, 8)} | ${excerpt(message.text)}`,
    ),
    '',
  ].join('\n')

  writeFileSync(join(out, 'digest.md'), brief)
  if (requests > 0) {
    appendFileSync(
      join(journalDir(root, journal.slug), 'jev.jsonl'),
      `${JSON.stringify({ at: new Date().toISOString(), model: ASK_JUDGE_MODEL, requests, inputTokens })}\n`,
    )
  }
  console.log(`${join(out, 'digest.md')}`)
  console.log(
    `Jev: ${requests} requests, ${inputTokens} input tokens. Quotable prompts ${quoted.length}, held back ${held.length}, candidate moments ${candidates.length}.`,
  )
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
