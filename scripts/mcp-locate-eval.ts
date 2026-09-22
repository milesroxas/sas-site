/**
 * How often `locateBlock` picks the block a task means. The ground truth is
 * `scripts/mcp-cases.ts`: each case names its target block (a type and an
 * ordinal) and carries the task in words, which is what a team member would
 * type. The eval sends the words to `locateBlock` over the MCP and compares
 * the first candidate with the target, so it measures the tool as a client
 * sees it, thresholds included.
 *
 *   pnpm exec tsx --env-file=.env scripts/mcp-locate-eval.ts <label> [--server url --local]
 *
 * Read-only. Each case costs one Jev request; the record lands in
 * docs/perf/mcp-tools/locate-<label>.json with every candidate and the
 * request's model, input tokens and milliseconds, so a threshold can be
 * re-read without another run.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { type Doc, listBlocks } from '@/plugins/mcp-tools/blocks'
import type { LocateResult } from '@/plugins/mcp-tools/locate'
import { cmsTarget } from './cms-target'
import { LOCATE_EXTRA_CASES, type LocateCase, MCP_CASES } from './mcp-cases'
import { McpClient } from './mcp-client'

const OUT_DIR = path.resolve('docs/perf/mcp-tools')

type CaseResult = {
  id: string
  task: string
  /** The block the task means, or 'none' when the document has no such block. */
  expected: { path: string; id: string; blockType: string } | 'none' | null
  verdict: LocateResult['verdict'] | null
  /** The first candidate is the expected block, or the verdict is `none` when that is the answer. */
  hit: boolean
  /** The expected block is among the candidates, at this rank from 1; 0 when absent. */
  rank: number
  exists: number | null
  confidence: number | null
  candidates: LocateResult['candidates']
  inputTokens: number | null
  ms: number | null
  error: string | null
}

function flag(args: string[], name: string): string | undefined {
  const at = args.indexOf(`--${name}`)
  return at === -1 ? undefined : args[at + 1]
}

function target(args: string[]): { key: string; server: string } {
  const server = flag(args, 'server')
  const resolved = cmsTarget({ local: args.includes('--local') })
  if (typeof resolved === 'string' && !server) {
    console.error(resolved)
    process.exit(1)
  }
  const key =
    process.env.CMS_MCP_API_KEY ?? process.env.SAS_CMS_MCP_KEY ?? (resolved as { key: string }).key
  return { key, server: (server ?? (resolved as { server: string }).server).replace(/\/$/, '') }
}

function docIn(text: string): Doc {
  const fenced = text.match(/```json\n([\s\S]*?)\n```/)
  if (fenced) return JSON.parse(fenced[1] as string) as Doc
  const at = text.indexOf('{')
  return JSON.parse(text.slice(at)) as Doc
}

async function evalCase(client: McpClient, c: LocateCase): Promise<CaseResult> {
  const base: CaseResult = {
    id: c.id,
    task: c.task,
    expected: null,
    verdict: null,
    hit: false,
    rank: 0,
    exists: null,
    confidence: null,
    candidates: [],
    inputTokens: null,
    ms: null,
    error: null,
  }
  try {
    const found = await client.call(c.findTool, c.docId ? { id: c.docId, depth: 0 } : { depth: 0 })
    const doc = docIn(found.content[0]?.text ?? '')
    const want = c.target
    const row =
      want === 'none'
        ? null
        : (listBlocks(doc).filter((r) => r.blockType === want.blockType)[(want.nth ?? 1) - 1] ??
          null)
    base.expected =
      want === 'none'
        ? 'none'
        : row
          ? { path: row.path, id: row.id, blockType: row.blockType }
          : null
    const located = await client.call('locateBlock', {
      collection: c.collection,
      ...(c.docId ? { id: c.docId } : {}),
      instruction: c.task,
    })
    const text = located.content[0]?.text ?? ''
    if (located.isError || text.startsWith('Error')) return { ...base, error: text.slice(0, 300) }
    const result = JSON.parse(text) as LocateResult
    const rank = row ? result.candidates.findIndex((cand) => cand.id === row.id) + 1 : 0
    return {
      ...base,
      verdict: result.verdict,
      hit: c.target === 'none' ? result.verdict === 'none' : rank === 1,
      rank,
      exists: result.exists,
      confidence: result.confidence,
      candidates: result.candidates,
      inputTokens: result.inputTokens,
      ms: result.ms,
    }
  } catch (error) {
    return { ...base, error: error instanceof Error ? error.message : String(error) }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const label = args.find(
    (a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'),
  )
  if (!label) throw new Error('usage: mcp-locate-eval.ts <label> [--server url --local]')
  const { key, server } = target(args)
  const client = new McpClient(server, key)
  await client.initialize('mcp-locate-eval')
  const results: CaseResult[] = []
  for (const c of [...MCP_CASES, ...LOCATE_EXTRA_CASES]) {
    const r = await evalCase(client, c)
    results.push(r)
    const top = r.candidates[0]
    console.log(
      `${r.hit ? 'HIT ' : 'MISS'} ${r.id.padEnd(18)} ${r.verdict ?? '-'} exists ${r.exists?.toFixed(2) ?? '-'} conf ${r.confidence?.toFixed(2) ?? '-'} rank ${r.rank} ${r.ms ?? '-'}ms ${r.inputTokens ?? '-'}tok` +
        (top ? `  top: ${top.blockType} ${top.path} p=${top.probability.toFixed(2)}` : '') +
        (r.error ? `  ERROR ${r.error}` : ''),
    )
  }
  const hits = results.filter((r) => r.hit).length
  const found = results.filter((r) => r.verdict === 'found').length
  const tokens = results.reduce((sum, r) => sum + (r.inputTokens ?? 0), 0)
  console.log(
    `\n${hits}/${results.length} right (first candidate, or none when there is no such block), ${found} found verdicts, ${tokens} Jev input tokens`,
  )
  mkdirSync(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, `locate-${label}.json`)
  writeFileSync(
    file,
    `${JSON.stringify({ label, at: new Date().toISOString(), server, hits, results }, null, 2)}\n`,
  )
  console.log(file)
}

await main()
