/**
 * Ask handoff eval: asks a running site the closing band's suggestion chips
 * and a few questions that should reach a person, and reports what came
 * back for each: how many sources were retrieved, what the model said, and
 * whether it offered a handoff. A chip must get a grounded answer and no
 * offer; a request for a price or a person must get one.
 *
 *   pnpm exec tsx scripts/ask-eval.ts [http://localhost:3001]
 *
 * Runs against the endpoint, so the server needs OPENAI_API_KEY and an
 * indexed corpus. Six questions fit under the endpoint's per-minute limit.
 */

type Case = { question: string; handoff: boolean }

const CASES: Case[] = [
  // The closing band's chips: answered from the site, never an offer.
  { question: 'How do we start?', handoff: false },
  { question: 'Who have you worked with?', handoff: false },
  { question: 'What is your process like?', handoff: false },
  // Only a person can settle these.
  { question: 'What does it cost?', handoff: true },
  { question: 'How much would a new website for my startup cost?', handoff: true },
  { question: 'Can I talk to someone on the team?', handoff: true },
]

type Outcome = { sources: number; text: string; reason: string | null; status: number }

async function ask(base: string, question: string): Promise<Outcome> {
  const res = await fetch(`${base}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `eval-${Date.now()}`,
      pagePath: '/eval',
      handoff: 'none',
      messages: [{ id: 'q', role: 'user', parts: [{ type: 'text', text: question }] }],
    }),
  })
  const outcome: Outcome = { sources: 0, text: '', reason: null, status: res.status }
  if (!res.ok) {
    outcome.text = await res.text()
    return outcome
  }
  for (const line of (await res.text()).split('\n')) {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
    const chunk = JSON.parse(line.slice('data: '.length)) as {
      type: string
      delta?: string
      toolName?: string
      input?: { reason?: string }
    }
    if (chunk.type === 'source-url') outcome.sources += 1
    if (chunk.type === 'text-delta') outcome.text += chunk.delta ?? ''
    if (chunk.type === 'tool-input-available' && chunk.toolName === 'handoff') {
      outcome.reason = chunk.input?.reason ?? 'unknown'
    }
  }
  return outcome
}

const base = (process.argv[2] ?? 'http://localhost:3001').replace(/\/$/, '')
let failures = 0

for (const { question, handoff } of CASES) {
  const outcome = await ask(base, question)
  const offered = outcome.reason !== null
  const ok = outcome.status === 200 && offered === handoff
  if (!ok) failures += 1
  console.log(
    [
      ok ? 'ok  ' : 'FAIL',
      `"${question}"`,
      `status ${outcome.status}`,
      `sources ${outcome.sources}`,
      `handoff ${outcome.reason ?? 'none'} (expected ${handoff ? 'one' : 'none'})`,
    ].join('  '),
  )
  if (outcome.text) console.log(`      ${outcome.text.replaceAll('\n', ' ').slice(0, 220)}`)
}

console.log(failures === 0 ? '\nAll cases as expected.' : `\n${failures} case(s) off.`)
process.exit(failures === 0 ? 0 : 1)

export {}
