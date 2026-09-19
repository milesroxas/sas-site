/**
 * Ask benchmark: captures how Ask behaves on the shared fixture, and compares
 * captures. The before-and-after tool for docs/ask-jev-roadmap.md, and the
 * retrieval eval stage 5 of the RAG roadmap asked for.
 *
 *   pnpm exec tsx --env-file=.env scripts/ask-bench.ts capture <label> [base-url]
 *   pnpm exec tsx scripts/ask-bench.ts compare <label> <label> [label ...]
 *
 * Capture flags: `--runs 3`, `--pace-ms 7000`, `--only id,id`, and
 * `--mode off|shadow|on` when the server's ASK_JEV differs from this shell's.
 *
 * Captures land in docs/perf/ask-jev/<label>.json; compare prints a table and
 * writes docs/perf/ask-jev/report.md. Numbers are relative: run every label
 * on the same machine against the same database. The endpoint allows 10
 * requests a minute per IP, hence the 7 second pace.
 *
 * Against `next dev`: Payload keeps endpoint code across hot reloads, so an
 * edit to the endpoint or its prompts is not live until the server reloads
 * (any change to `.env` does it). Confirm the new code answers before a
 * capture, or the label measures the old code.
 */

import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { ASK_JUDGE_MODEL, askJudgeMode } from '@/features/ask/judge'
import { askModel } from '@/features/ask/model'
import { ASK_CASES, type AskCase } from './ask-cases'

const OUT_DIR = path.resolve('docs/perf/ask-jev')
const DEFAULT_BASE = 'http://localhost:3001'
const DEFAULT_RUNS = 3
const DEFAULT_PACE_MS = 7_000
/** The limiter's window: how long a 429 means waiting. */
const RATE_WINDOW_MS = 61_000

type TurnCapture = {
  question: string
  status: number
  /** Request start to the first text or card chunk; null when neither arrived. */
  firstOutputMs: number | null
  totalMs: number
  sources: string[]
  text: string
  /** The card's reason, or null when the reply carried none. */
  reason: string | null
  /** No model step in the stream: the reply was written by code alone. */
  modelSkipped: boolean
  error: string | null
}

type CaseRun = { turns: TurnCapture[] }

type Capture = {
  header: {
    label: string
    date: string
    gitSha: string
    baseUrl: string
    judgeMode: string
    answerModel: string
    judgeModel: string
    runs: number
    paceMs: number
  }
  cases: { id: string; turns: string[]; expect: AskCase['expect']; runs: CaseRun[] }[]
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function flag(args: string[], name: string): string | undefined {
  const at = args.indexOf(`--${name}`)
  return at === -1 ? undefined : args[at + 1]
}

/** Positional arguments: everything that is neither a flag nor a flag's value. */
function positional(args: string[]): string[] {
  return args.filter((arg, i) => !arg.startsWith('--') && !args[i - 1]?.startsWith('--'))
}

type HistoryMessage = { id: string; role: 'user' | 'assistant'; parts: unknown[] }

/** The reply as the widget would hold it, so the next turn replays what the visitor saw. */
function assistantMessage(turn: TurnCapture, handoff: unknown, index: number): HistoryMessage {
  const parts: unknown[] = []
  if (turn.text) parts.push({ type: 'text', text: turn.text })
  if (turn.reason && handoff) {
    parts.push({
      type: 'tool-handoff',
      toolCallId: `bench-${index}`,
      state: 'output-available',
      input: { reason: turn.reason },
      output: handoff,
    })
  }
  return { id: `a${index}`, role: 'assistant', parts }
}

let lastRequestAt = 0

async function askTurn(
  base: string,
  chatId: string,
  messages: HistoryMessage[],
  handoffState: 'none' | 'offered',
  paceMs: number,
): Promise<{ turn: TurnCapture; handoff: unknown }> {
  const question = String((messages.at(-1)?.parts[0] as { text?: string } | undefined)?.text ?? '')

  for (let attempt = 0; ; attempt += 1) {
    const wait = lastRequestAt + paceMs - Date.now()
    if (wait > 0) await sleep(wait)
    lastRequestAt = Date.now()

    const startedAt = performance.now()
    const turn: TurnCapture = {
      question,
      status: 0,
      firstOutputMs: null,
      totalMs: 0,
      sources: [],
      text: '',
      reason: null,
      modelSkipped: true,
      error: null,
    }
    let handoff: unknown = null

    try {
      const res = await fetch(`${base}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chatId, pagePath: '/bench', handoff: handoffState, messages }),
      })
      turn.status = res.status

      if (res.status === 429 && attempt < 2) {
        console.log('      429, waiting out the rate window')
        await sleep(RATE_WINDOW_MS)
        continue
      }
      if (!res.ok || !res.body) {
        turn.error = (await res.text()).slice(0, 300)
        turn.totalMs = Math.round(performance.now() - startedAt)
        return { turn, handoff }
      }

      // Read the stream as it arrives: `await res.text()` would hide the time to first output.
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const event of events) {
          for (const line of event.split('\n')) {
            if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
            const chunk = JSON.parse(line.slice('data: '.length)) as {
              type: string
              delta?: string
              url?: string
              toolName?: string
              input?: { reason?: string }
              output?: unknown
              errorText?: string
            }
            const isOutput = chunk.type === 'text-delta' || chunk.type === 'tool-output-available'
            if (isOutput && turn.firstOutputMs === null) {
              turn.firstOutputMs = Math.round(performance.now() - startedAt)
            }
            if (chunk.type === 'start-step') turn.modelSkipped = false
            if (chunk.type === 'source-url' && chunk.url) turn.sources.push(chunk.url)
            if (chunk.type === 'text-delta') turn.text += chunk.delta ?? ''
            if (chunk.type === 'tool-input-available' && chunk.toolName === 'handoff') {
              turn.reason = chunk.input?.reason ?? 'unknown'
            }
            if (chunk.type === 'tool-output-available') handoff = chunk.output
            if (chunk.type === 'error') turn.error = chunk.errorText ?? 'stream error'
          }
        }
      }
    } catch (err) {
      turn.error = err instanceof Error ? err.message : String(err)
    }

    turn.totalMs = Math.round(performance.now() - startedAt)
    return { turn, handoff }
  }
}

async function runCase(base: string, testCase: AskCase, paceMs: number): Promise<CaseRun> {
  const chatId = `bench-${testCase.id}-${Date.now()}`
  const messages: HistoryMessage[] = []
  const turns: TurnCapture[] = []
  let offered = false

  for (const [i, question] of testCase.turns.entries()) {
    messages.push({ id: `q${i}`, role: 'user', parts: [{ type: 'text', text: question }] })
    const { turn, handoff } = await askTurn(
      base,
      chatId,
      messages,
      offered ? 'offered' : 'none',
      paceMs,
    )
    turns.push(turn)
    if (turn.reason) offered = true
    messages.push(assistantMessage(turn, handoff, i))
  }
  return { turns }
}

async function capture(args: string[]): Promise<void> {
  const [label, baseArg] = positional(args)
  if (!label) throw new Error('usage: ask-bench.ts capture <label> [base-url]')

  const base = (baseArg ?? DEFAULT_BASE).replace(/\/$/, '')
  const runs = Number(flag(args, 'runs') ?? DEFAULT_RUNS)
  const paceMs = Number(flag(args, 'pace-ms') ?? DEFAULT_PACE_MS)
  const only = flag(args, 'only')?.split(',')
  const cases = only ? ASK_CASES.filter((testCase) => only.includes(testCase.id)) : ASK_CASES

  // Dev compiles the route on the first hit; that turn is not a measurement.
  console.log(`warming up ${base}`)
  await askTurn(
    base,
    `bench-warmup-${Date.now()}`,
    [{ id: 'q0', role: 'user', parts: [{ type: 'text', text: 'What is your process like?' }] }],
    'none',
    paceMs,
  )

  const result: Capture = {
    header: {
      label,
      date: new Date().toISOString(),
      gitSha: execSync('git rev-parse --short HEAD').toString().trim(),
      baseUrl: base,
      judgeMode: flag(args, 'mode') ?? askJudgeMode(),
      answerModel: askModel.modelId,
      judgeModel: ASK_JUDGE_MODEL,
      runs,
      paceMs,
    },
    cases: cases.map(({ id, turns, expect }) => ({ id, turns, expect, runs: [] })),
  }

  for (let run = 0; run < runs; run += 1) {
    for (const [i, testCase] of cases.entries()) {
      const caseRun = await runCase(base, testCase, paceMs)
      result.cases[i].runs.push(caseRun)
      const last = caseRun.turns.at(-1)
      console.log(
        [
          `run ${run + 1}/${runs}`,
          testCase.id.padEnd(20),
          `status ${last?.status}`,
          `first ${last?.firstOutputMs ?? '-'}ms`,
          `total ${last?.totalMs}ms`,
          `card ${last?.reason ?? 'none'}`,
          `sources ${last?.sources.length}`,
        ].join('  '),
      )
    }
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, `${label}.json`)
  writeFileSync(file, `${JSON.stringify(result, null, 2)}\n`)
  console.log(`\nwrote ${path.relative(process.cwd(), file)}`)
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return Math.round(sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2)
}

const ms = (value: number | null) => (value === null ? 'n/a' : `${value} ms`)

/** The turn under test: a multi-turn case's earlier turns are only its setup. */
const lastTurns = (testCase: Capture['cases'][number]) =>
  testCase.runs.map((run) => run.turns.at(-1)).filter((turn): turn is TurnCapture => Boolean(turn))

function cardOk(turn: TurnCapture, expect: AskCase['expect']): boolean {
  return turn.status === 200 && turn.reason === expect.handoff
}

function textOk(turn: TurnCapture, expect: AskCase['expect']): boolean {
  if (expect.text === undefined) return true
  return expect.text ? turn.text.trim().length > 0 : turn.text.trim().length === 0
}

function sourcesOk(turn: TurnCapture, expect: AskCase['expect']): boolean {
  return (expect.sources ?? []).every((source) => turn.sources.includes(source))
}

type Summary = {
  firstAll: number | null
  totalAll: number | null
  firstWords: number | null
  totalWords: number | null
  firstCardOnly: number | null
  totalCardOnly: number | null
  card: [number, number]
  text: [number, number]
  sources: [number, number]
  stable: [number, number]
  skipped: [number, number]
}

function summarize(data: Capture): Summary {
  const all = data.cases.flatMap((testCase) =>
    lastTurns(testCase).map((turn) => ({ turn, expect: testCase.expect })),
  )
  const firsts = (rows: typeof all) =>
    rows.map(({ turn }) => turn.firstOutputMs).filter((value): value is number => value !== null)
  const totals = (rows: typeof all) => rows.map(({ turn }) => turn.totalMs)
  const words = all.filter(({ expect }) => expect.text === true)
  const cardOnly = all.filter(({ expect }) => expect.text === false)
  const withSources = all.filter(({ expect }) => expect.sources?.length)
  const count = (
    rows: typeof all,
    ok: (row: (typeof all)[number]) => boolean,
  ): [number, number] => [rows.filter(ok).length, rows.length]

  return {
    firstAll: median(firsts(all)),
    totalAll: median(totals(all)),
    firstWords: median(firsts(words)),
    totalWords: median(totals(words)),
    firstCardOnly: median(firsts(cardOnly)),
    totalCardOnly: median(totals(cardOnly)),
    card: count(all, ({ turn, expect }) => cardOk(turn, expect)),
    text: count(all, ({ turn, expect }) => textOk(turn, expect)),
    sources: count(withSources, ({ turn, expect }) => sourcesOk(turn, expect)),
    stable: [
      data.cases.filter((testCase) => {
        const reasons = lastTurns(testCase).map((turn) => turn.reason)
        return reasons.every((reason) => reason === reasons[0])
      }).length,
      data.cases.length,
    ],
    skipped: count(all, ({ turn }) => turn.modelSkipped),
  }
}

const ratio = ([hit, of]: [number, number]) => (of === 0 ? 'n/a' : `${hit} of ${of}`)

function compare(labels: string[]): void {
  if (labels.length < 2) throw new Error('usage: ask-bench.ts compare <label> <label> [label ...]')

  const captures = labels.map(
    (label) => JSON.parse(readFileSync(path.join(OUT_DIR, `${label}.json`), 'utf8')) as Capture,
  )
  const summaries = captures.map(summarize)
  const lines: string[] = []
  const row = (cells: string[]) => lines.push(`| ${cells.join(' | ')} |`)
  const head = (cells: string[]) => {
    row(cells)
    row(cells.map(() => '---'))
  }

  lines.push('# Ask + Jev benchmark', '')
  lines.push(
    'Written by `scripts/ask-bench.ts compare`. Numbers are relative: same machine, same database for every label. Each case ran several times; times are medians over the runs of the turn under test (the last turn of a case).',
    '',
  )

  lines.push('## Captures', '')
  head(['Label', 'Date', 'Git sha', 'Base URL', 'Judge mode', 'Answer model', 'Jev model', 'Runs'])
  for (const { header } of captures) {
    row([
      header.label,
      header.date.slice(0, 16).replace('T', ' '),
      header.gitSha,
      header.baseUrl,
      header.judgeMode,
      header.answerModel,
      header.judgeModel,
      String(header.runs),
    ])
  }

  lines.push('', '## Summary', '')
  head(['Metric', ...labels])
  const metric = (name: string, read: (summary: Summary) => string) =>
    row([name, ...summaries.map(read)])
  metric('Median time to first output, all turns', (s) => ms(s.firstAll))
  metric('Median total time, all turns', (s) => ms(s.totalAll))
  metric('Median time to first output, turns that must have words', (s) => ms(s.firstWords))
  metric('Median total time, turns that must have words', (s) => ms(s.totalWords))
  metric('Median time to first output, card-only turns', (s) => ms(s.firstCardOnly))
  metric('Median total time, card-only turns', (s) => ms(s.totalCardOnly))
  metric('Card accuracy', (s) => ratio(s.card))
  metric('Words when expected, none when not', (s) => ratio(s.text))
  metric('Expected sources present', (s) => ratio(s.sources))
  metric('Cases with the same card on every run', (s) => ratio(s.stable))
  metric('Turns with no writing-model call', (s) => ratio(s.skipped))

  lines.push('', '## Per case', '')
  head([
    'Case',
    'Expected',
    ...labels.flatMap((label) => [`${label}: first`, `${label}: total`, `${label}: card`]),
  ])
  for (const [i, testCase] of captures[0].cases.entries()) {
    const expected = [
      testCase.expect.handoff ?? 'no card',
      testCase.expect.text === undefined ? null : testCase.expect.text ? 'words' : 'no words',
    ]
      .filter(Boolean)
      .join(', ')
    row([
      testCase.id,
      expected,
      ...captures.flatMap((data) => {
        const found = data.cases.find((other) => other.id === testCase.id) ?? data.cases[i]
        const turns = found ? lastTurns(found) : []
        const firsts = turns
          .map((turn) => turn.firstOutputMs)
          .filter((value): value is number => value !== null)
        const correct = turns.filter(
          (turn) =>
            cardOk(turn, testCase.expect) &&
            textOk(turn, testCase.expect) &&
            sourcesOk(turn, testCase.expect),
        ).length
        const cards = [...new Set(turns.map((turn) => turn.reason ?? 'none'))].join('/')
        return [
          ms(median(firsts)),
          ms(median(turns.map((turn) => turn.totalMs))),
          `${correct} of ${turns.length} (${cards})`,
        ]
      }),
    ])
  }

  lines.push('', '## Answers side by side', '')
  lines.push(
    'The first run of each label. Answer quality is a human read: no invented facts, no markdown, no talk of "sources", under 120 words, and a partial answer names a real page path.',
    '',
  )
  for (const testCase of captures[0].cases) {
    lines.push(`### ${testCase.id}`, '', `> ${testCase.turns.join(' → ')}`, '')
    for (const data of captures) {
      const turn = data.cases.find((other) => other.id === testCase.id)?.runs[0]?.turns.at(-1)
      const words = turn?.text.trim().replaceAll('\n', ' ') || '(no words)'
      const card = turn?.reason ? ` [card: ${turn.reason}]` : ''
      const sources = turn?.sources.length ? ` [sources: ${turn.sources.join(', ')}]` : ''
      lines.push(`- **${data.header.label}**: ${words}${card}${sources}`)
    }
    lines.push('')
  }

  const report = `${lines.join('\n')}\n`
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(path.join(OUT_DIR, 'report.md'), report)
  console.log(report.split('## Answers side by side')[0])
  console.log(`wrote ${path.relative(process.cwd(), path.join(OUT_DIR, 'report.md'))}`)
}

const [command, ...rest] = process.argv.slice(2)
if (command === 'capture') await capture(rest)
else if (command === 'compare') compare(positional(rest))
else {
  console.error('usage: ask-bench.ts capture <label> [base-url] | compare <label> <label> [...]')
  process.exit(2)
}
