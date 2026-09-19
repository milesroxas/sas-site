/**
 * Ask judge eval: the tuning tool for Jev's questions and thresholds
 * (src/features/ask/judge.ts). No server and no visitor: it calls the judge
 * directly and prints the probabilities beside what the fixture expects, so a
 * threshold is chosen from numbers and a question is reworded from a miss.
 *
 *   pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts              # turn judgments
 *   pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts --passages   # + passage checks
 *   pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts --from-db    # replay stored questions
 *
 * `--passages` and `--from-db` boot Payload, as scripts/backfill-ask-index.ts
 * does, and need an indexed corpus (or stored `ask-questions` rows) in the
 * database `POSTGRES_URL` names. Needs TYPESAFE_API_KEY; `--passages` also
 * needs OPENAI_API_KEY for the query embedding.
 */

import type { Payload } from 'payload'
import {
  ASK_JUDGE_KEY_VAR,
  ASK_JUDGE_THRESHOLDS,
  type AskTurnJudgment,
  dependsOnPrevious,
  judgePassages,
  judgeTurn,
  routeCardReason,
  routePassage,
  routeTurn,
} from '@/features/ask/judge'
import { ASK_CASES, type AskCase } from './ask-cases'

/** A tuning run must not be colored by the network, so it waits far longer than a visitor would. */
const TIMEOUT_MS = 10_000

if (!process.env[ASK_JUDGE_KEY_VAR]) {
  console.error(`${ASK_JUDGE_KEY_VAR} is not set. Aborting.`)
  process.exit(1)
}

const args = process.argv.slice(2)
const pct = (value: number | null | undefined) =>
  value == null ? '  - ' : value.toFixed(2).padStart(4)

function describe(judgment: AskTurnJudgment | null): string {
  if (!judgment) return 'judge returned null'
  return [
    `${judgment.request.padEnd(12)} conf ${pct(judgment.confidence)}`,
    `own ${pct(judgment.ownProject)}  general ${pct(judgment.generalQuestion)}  names ${pct(judgment.namesWork)}`,
    `depends ${pct(judgment.dependsOnPrevious)}`,
    `${judgment.ms} ms`,
  ].join('  ')
}

/**
 * The card the turn judgment alone leads to. An `evidence` route without a
 * reason can still end in `no_answer` once passages are checked, so a case
 * that expects `no_answer` passes here on an `evidence` route.
 */
function turnAgrees(testCase: AskCase, judgment: AskTurnJudgment | null): boolean {
  const route = routeTurn(judgment, {
    isFollowUp: testCase.turns.length > 1,
    handoffState: 'none',
  })
  if (route.kind === 'fallback') return false
  const { handoff, text } = testCase.expect
  // Contact details are found by a regex before Jev is asked.
  if (handoff === 'contact_details') return true
  if (handoff === 'no_answer') return route.kind === 'evidence' && route.reason === null
  if (routeCardReason(route) !== handoff) return false
  if (text === false) return route.kind === 'card'
  if (text === true) return route.kind !== 'card'
  return true
}

async function evalTurns(): Promise<Map<string, AskTurnJudgment | null>> {
  console.log('\nTurn judgments (thresholds:', JSON.stringify(ASK_JUDGE_THRESHOLDS), ')\n')
  const judgments = new Map<string, AskTurnJudgment | null>()
  let agreed = 0

  for (const testCase of ASK_CASES) {
    const question = testCase.turns.at(-1) ?? ''
    const previousQuestion = testCase.turns.at(-2) ?? null
    const judgment = await judgeTurn({
      question,
      previousQuestion,
      timeoutMs: TIMEOUT_MS,
      logger: console,
    })
    judgments.set(testCase.id, judgment)

    const route = routeTurn(judgment, {
      isFollowUp: previousQuestion !== null,
      handoffState: 'none',
    })
    const ok = turnAgrees(testCase, judgment)
    if (ok) agreed += 1
    const expected = `${testCase.expect.handoff ?? 'no card'}${
      testCase.expect.text === undefined ? '' : testCase.expect.text ? ' + words' : ', no words'
    }`
    console.log(`${ok ? 'ok  ' : 'MISS'} ${testCase.id.padEnd(20)} "${question}"`)
    console.log(`       ${describe(judgment)}`)
    console.log(
      `       route ${route.kind}${'reason' in route && route.reason ? ` (${route.reason})` : ''}   expected ${expected}`,
    )
    if (judgment) {
      const spread = Object.entries(judgment.probabilities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([kind, probability]) => `${kind} ${pct(probability)}`)
        .join('  ')
      console.log(`       ${spread}`)
    }
  }

  console.log(`\nturn routing agrees with the fixture on ${agreed} of ${ASK_CASES.length} cases`)
  return judgments
}

async function evalPassages(
  payload: Payload,
  judgments: Map<string, AskTurnJudgment | null>,
): Promise<void> {
  // Loaded here, not at the top: a turn-only run needs neither Payload nor the corpus.
  const { nearestChunks, retrievalQueries } = await import('@/features/ask/retrieve')
  const { indexedSourcePath } = await import('@/shared/content/surfaces')

  console.log('\nPassage checks\n')
  for (const testCase of ASK_CASES) {
    const question = testCase.turns.at(-1) ?? ''
    const previousQuestion = testCase.turns.at(-2) ?? null
    const queries = retrievalQueries(question, previousQuestion)
    const judgment = judgments.get(testCase.id) ?? null
    const query = queries[previousQuestion && dependsOnPrevious(judgment) ? 1 : 0] ?? question

    const chunks = await nearestChunks(payload, query)
    const judged = await judgePassages({ query, chunks, timeoutMs: TIMEOUT_MS, logger: console })
    const kept = chunks.filter((_, i) => routePassage(judged?.answers[i] ?? null) === 'keep')
    const keptPaths = new Set(kept.map((chunk) => indexedSourcePath(chunk.collection, chunk.slug)))
    const missing = (testCase.expect.sources ?? []).filter((source) => !keptPaths.has(source))

    console.log(
      `${testCase.id.padEnd(20)} "${query.replaceAll('\n', ' / ')}"  kept ${kept.length} of ${chunks.length}  ${judged?.ms ?? '-'} ms${
        missing.length ? `  MISSING ${missing.join(', ')}` : ''
      }`,
    )
    for (const [i, chunk] of chunks.entries()) {
      const answers = judged?.answers[i] ?? null
      console.log(
        `   ${routePassage(answers).padEnd(4)} sim ${pct(chunk.similarity)}  rel ${pct(answers?.isRelevant)}  evid ${pct(answers?.hasEvidence)}  ${indexedSourcePath(chunk.collection, chunk.slug)}  ${chunk.headingPath ?? ''}`.slice(
          0,
          160,
        ),
      )
    }
  }
}

/** Stored turns as labels: the redacted question, and the card the writing model ended it with. */
async function evalFromDb(payload: Payload): Promise<void> {
  const { docs } = await payload.find({
    collection: 'ask-questions',
    depth: 0,
    limit: 500,
    pagination: false,
    sort: 'createdAt',
  })
  console.log(`\nReplaying ${docs.length} stored questions\n`)
  if (docs.length === 0) return

  const previousByConversation = new Map<string, string>()
  let judged = 0
  let agreed = 0

  for (const doc of docs) {
    const previousQuestion =
      doc.followUp && doc.conversation
        ? (previousByConversation.get(doc.conversation) ?? null)
        : null
    if (doc.conversation) previousByConversation.set(doc.conversation, doc.question)
    // A stopped or failed turn has no card to compare with.
    if (doc.outcome === 'stopped' || doc.outcome === 'error') continue

    const judgment = await judgeTurn({
      question: doc.question,
      previousQuestion,
      timeoutMs: TIMEOUT_MS,
      logger: console,
    })
    const route = routeTurn(judgment, { isFollowUp: Boolean(doc.followUp), handoffState: 'none' })
    if (route.kind === 'fallback') continue

    const recorded = doc.handoffReason ?? null
    const jev = routeCardReason(route)
    // `no_answer` and `contact_details` are not the turn judgment's to call.
    const comparable = recorded !== 'no_answer' && recorded !== 'contact_details'
    if (!comparable) continue

    judged += 1
    const ok = jev === recorded
    if (ok) agreed += 1
    console.log(
      `${ok ? 'ok  ' : 'DIFF'} recorded ${String(recorded ?? 'none').padEnd(9)} jev ${String(jev ?? 'none').padEnd(9)} ${describe(judgment)}  "${doc.question.slice(0, 80)}"`,
    )
  }

  console.log(`\nJev's card matches the recorded one on ${agreed} of ${judged} comparable turns`)
}

const judgments = args.includes('--from-db') ? new Map() : await evalTurns()

if (args.includes('--passages') || args.includes('--from-db')) {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })
  if (args.includes('--passages')) await evalPassages(payload, judgments)
  if (args.includes('--from-db')) await evalFromDb(payload)
}

process.exit(0)
