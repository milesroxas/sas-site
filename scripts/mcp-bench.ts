/**
 * MCP authoring benchmark: what one block edit costs a client over the
 * sas-cms MCP, with the generated tools and with the block tools. The
 * before-and-after record for docs/typesafe-mcp-roadmap.md.
 *
 *   pnpm exec tsx --env-file=.env scripts/mcp-bench.ts capture <label> [--server url --local]
 *   pnpm exec tsx scripts/mcp-bench.ts compare <label> <label> [label ...]
 *   pnpm exec tsx --env-file=.env scripts/mcp-bench.ts outline <case-id>
 *
 * The site and key come from Claude Code's `sas-cms` entry (scripts/cms-target.ts)
 * unless `--server` names one; `--local` allows a dev server. A capture is
 * read-only: it never calls an update tool. What it measures, per case:
 *
 * - list: the bytes of the generated find tool's answer with no id, its
 *   first page of ten whole documents, which is what a client that starts
 *   from a title reads to learn the id.
 * - read, today: the bytes of the generated find tool's answer for the id,
 *   the whole document, which is what a client reads to find a block.
 * - write, today: the bytes of the field that holds the block (`layout`),
 *   which an update tool makes the client resend, as output tokens.
 * - read, block tools: outlineDocument plus getBlock, when the server has them.
 * - write, block tools: the bytes of the target block, the most a patch sends.
 *
 * And once per capture: the size of tools/list, which a client that loads
 * every schema pays before any call. Bytes are exact; tokens are an estimate
 * at four characters a token, and are labelled so. Real Claude Code counts
 * come from the lab journal's session hook, not from here.
 *
 * Captures land in docs/perf/mcp-tools/<label>.json; compare writes report.md.
 */

import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { type Doc, findBlock, listBlocks, rootField } from '@/plugins/mcp-tools/blocks'
import { cmsTarget } from './cms-target'
import { MCP_CASES, type McpCase } from './mcp-cases'
import { McpClient } from './mcp-client'

const OUT_DIR = path.resolve('docs/perf/mcp-tools')
const CHARS_PER_TOKEN = 4

type CaseCapture = {
  id: string
  collection: string
  docId: number | string | null
  title: string | null
  blocks: number
  /** The target block: null when the document has no such block. */
  target: { path: string; id: string; blockType: string } | null
  bytes: {
    /** The find tool's first page with no id; null for a global, which has no list. */
    listResult: number | null
    findResult: number
    layout: number
    block: number
    outlineResult: number | null
    getBlockResult: number | null
  }
  error: string | null
}

type Capture = {
  header: {
    label: string
    date: string
    gitSha: string
    server: string
    instructionsChars: number
    blockTools: boolean
  }
  tools: {
    count: number
    bytes: number
    byVerb: Record<string, number>
    largest: { name: string; bytes: number }[]
  }
  cases: CaseCapture[]
}

const bytes = (value: unknown): number => Buffer.byteLength(JSON.stringify(value))

const tokens = (n: number | null): string =>
  n === null ? '' : `~${Math.round(n / CHARS_PER_TOKEN).toLocaleString('en-US')}`

const kb = (n: number | null): string => (n === null ? '' : `${(n / 1024).toFixed(1)}KB`)

function flag(args: string[], name: string): string | undefined {
  const at = args.indexOf(`--${name}`)
  return at === -1 ? undefined : args[at + 1]
}

function positional(args: string[]): string[] {
  return args.filter((arg, i) => !arg.startsWith('--') && !args[i - 1]?.startsWith('--'))
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

/** The documents in a find answer: one per fenced JSON block, or the one after "Resource from". */
function docsIn(text: string): Doc[] {
  const fenced = [...text.matchAll(/```json\n([\s\S]*?)\n```/g)].map(
    (m) => JSON.parse(m[1] as string) as Doc,
  )
  if (fenced.length) return fenced
  const at = text.indexOf('{')
  return at === -1 ? [] : [JSON.parse(text.slice(at)) as Doc]
}

const nthOfType = (doc: Doc, blockType: string, nth = 1) =>
  listBlocks(doc).filter((row) => row.blockType === blockType)[nth - 1] ?? null

async function captureCase(
  client: McpClient,
  c: McpCase,
  blockTools: boolean,
): Promise<CaseCapture> {
  const empty: CaseCapture = {
    id: c.id,
    collection: c.collection,
    docId: c.docId ?? null,
    title: null,
    blocks: 0,
    target: null,
    bytes: {
      listResult: null,
      findResult: 0,
      layout: 0,
      block: 0,
      outlineResult: null,
      getBlockResult: null,
    },
    error: null,
  }
  try {
    const listResult =
      c.docId === undefined
        ? null
        : Buffer.byteLength(
            McpClient.text(await client.call(c.findTool, { draft: true, limit: 10 })),
          )
    const args = c.docId === undefined ? { draft: true } : { id: c.docId, draft: true }
    const found = await client.call(c.findTool, args)
    const text = McpClient.text(found)
    if (found.isError) return { ...empty, error: text.slice(0, 200) }
    const [doc] = docsIn(text)
    if (!doc) return { ...empty, error: `no document in the ${c.findTool} answer` }
    const row = nthOfType(doc, c.target.blockType, c.target.nth)
    const result: CaseCapture = {
      ...empty,
      docId: (doc.id as number | string | undefined) ?? c.docId ?? null,
      title: typeof doc.title === 'string' ? doc.title : null,
      blocks: listBlocks(doc).length,
      target: row ? { path: row.path, id: row.id, blockType: row.blockType } : null,
      bytes: {
        ...empty.bytes,
        listResult,
        findResult: Buffer.byteLength(text),
        layout: row ? bytes(doc[rootField(row.path)]) : 0,
        block: row ? bytes(row.block) : 0,
      },
    }
    if (!row) return { ...result, error: `no ${c.target.blockType} block #${c.target.nth ?? 1}` }
    if (!blockTools) return result
    const targetArgs =
      c.docId === undefined
        ? { collection: c.collection }
        : { collection: c.collection, id: c.docId }
    const outlined = await client.call('outlineDocument', targetArgs)
    const got = await client.call('getBlock', { ...targetArgs, blockId: row.id })
    const gotText = McpClient.text(got)
    const same = !got.isError && findBlock({ layout: [JSON.parse(gotText).block] }, row.id) !== null
    return {
      ...result,
      bytes: {
        ...result.bytes,
        outlineResult: Buffer.byteLength(McpClient.text(outlined)),
        getBlockResult: Buffer.byteLength(gotText),
      },
      error: same ? null : `getBlock did not return block ${row.id}: ${gotText.slice(0, 120)}`,
    }
  } catch (error) {
    return { ...empty, error: error instanceof Error ? error.message : String(error) }
  }
}

async function capture(args: string[]): Promise<void> {
  const [label] = positional(args)
  if (!label) throw new Error('capture needs a label')
  const { key, server } = target(args)
  const client = new McpClient(server, key)
  const { instructions } = await client.initialize('mcp-bench')
  const tools = await client.listTools()
  const blockTools = tools.some((tool) => tool.name === 'outlineDocument')
  const sized = tools
    .map((tool) => ({ name: tool.name, bytes: bytes(tool) }))
    .sort((a, b) => b.bytes - a.bytes)
  const byVerb: Record<string, number> = {}
  for (const tool of sized) {
    const verb = tool.name.replace(/[A-Z].*$/, '')
    byVerb[verb] = (byVerb[verb] ?? 0) + tool.bytes
  }
  const cases: CaseCapture[] = []
  for (const c of MCP_CASES) {
    const result = await captureCase(client, c, blockTools)
    cases.push(result)
    console.log(
      `${c.id.padEnd(20)} list ${kb(result.bytes.listResult).padStart(8)}  find ${kb(result.bytes.findResult).padStart(8)}  layout ${kb(result.bytes.layout).padStart(8)}  block ${kb(result.bytes.block).padStart(7)}${
        blockTools
          ? `  outline ${kb(result.bytes.outlineResult).padStart(7)}  getBlock ${kb(result.bytes.getBlockResult).padStart(7)}`
          : ''
      }${result.error ? `  ERROR ${result.error}` : ''}`,
    )
  }
  const record: Capture = {
    header: {
      label,
      date: new Date().toISOString(),
      gitSha: execSync('git rev-parse --short HEAD').toString().trim(),
      server,
      instructionsChars: instructions.length,
      blockTools,
    },
    tools: {
      count: tools.length,
      bytes: sized.reduce((n, tool) => n + tool.bytes, 0),
      byVerb,
      largest: sized.slice(0, 8),
    },
    cases,
  }
  mkdirSync(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, `${label}.json`)
  writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`)
  console.log(
    `\ntools/list: ${tools.length} tools, ${kb(record.tools.bytes)} (${tokens(record.tools.bytes)} tokens, estimate)`,
  )
  console.log(`wrote ${path.relative(process.cwd(), file)}`)
}

const load = (label: string): Capture =>
  JSON.parse(readFileSync(path.join(OUT_DIR, `${label}.json`), 'utf8')) as Capture

function compare(args: string[]): void {
  const labels = positional(args)
  if (labels.length < 1) throw new Error('compare needs at least one label')
  const captures = labels.map(load)
  const lines: string[] = [
    '# MCP block tools benchmark',
    '',
    `Written by \`scripts/mcp-bench.ts compare\`. Bytes are exact; tokens are an estimate at ${CHARS_PER_TOKEN} characters a token. "Read" is what a client takes in to find the block; "write" is what it has to send to save the change (output tokens, the expensive side). Cases: \`scripts/mcp-cases.ts\`.`,
    '',
    '## Captures',
    '',
    '| Label | Date | Git sha | Server | Tools | tools/list | Block tools |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...captures.map(
      (c) =>
        `| ${c.header.label} | ${c.header.date.slice(0, 16).replace('T', ' ')} | ${c.header.gitSha} | ${c.header.server} | ${c.tools.count} | ${kb(c.tools.bytes)} (${tokens(c.tools.bytes)}) | ${c.header.blockTools ? 'yes' : 'no'} |`,
    ),
    '',
    '## Per case',
    '',
  ]
  for (const c of captures[0]?.cases ?? []) {
    lines.push(`### ${c.id}: ${c.title ?? c.collection}`, '')
    lines.push(
      '| Label | Blocks | List, no id | Read, generated | Write, generated | Read, block tools | Write, block tools | Read saved | Write saved |',
    )
    lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |')
    for (const capture of captures) {
      const row = capture.cases.find((x) => x.id === c.id)
      if (!row) continue
      if (row.error) {
        lines.push(`| ${capture.header.label} | | | error: ${row.error} | | | | | |`)
        continue
      }
      const { listResult, findResult, layout, block, outlineResult, getBlockResult } = row.bytes
      const readTools =
        outlineResult !== null && getBlockResult !== null ? outlineResult + getBlockResult : null
      const pct = (before: number, after: number | null) =>
        after === null || before === 0 ? '' : `${Math.round((1 - after / before) * 100)}%`
      const size = (n: number | null) => (n === null ? '' : `${kb(n)} (${tokens(n)})`)
      lines.push(
        `| ${capture.header.label} | ${row.blocks} | ${size(listResult)} | ${size(findResult)} | ${size(layout)} | ${size(readTools)} | ${size(block)} | ${pct(findResult, readTools)} | ${pct(layout, block)} |`,
      )
    }
    lines.push('')
  }
  lines.push('## Tool list', '')
  lines.push('| Label | Tools | Bytes | update | create | find | delete | Largest |')
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |')
  for (const c of captures) {
    const v = c.tools.byVerb
    lines.push(
      `| ${c.header.label} | ${c.tools.count} | ${kb(c.tools.bytes)} | ${kb(v.update ?? 0)} | ${kb(v.create ?? 0)} | ${kb(v.find ?? 0)} | ${kb(v.delete ?? 0)} | ${c.tools.largest
        .slice(0, 3)
        .map((t) => `${t.name} ${kb(t.bytes)}`)
        .join(', ')} |`,
    )
  }
  lines.push('')
  const file = path.join(OUT_DIR, 'report.md')
  writeFileSync(file, `${lines.join('\n')}\n`)
  console.log(lines.join('\n'))
  console.log(`wrote ${path.relative(process.cwd(), file)}`)
}

/** Print a case's outline from the generated find tool, to pick or check its target. */
async function outlineCase(args: string[]): Promise<void> {
  const [caseId] = positional(args)
  const c = MCP_CASES.find((x) => x.id === caseId)
  if (!c) throw new Error(`no case ${caseId}; cases: ${MCP_CASES.map((x) => x.id).join(', ')}`)
  const { key, server } = target(args)
  const client = new McpClient(server, key)
  await client.initialize('mcp-bench')
  const found = await client.call(
    c.findTool,
    c.docId === undefined ? { draft: true } : { id: c.docId, draft: true },
  )
  const [doc] = docsIn(McpClient.text(found))
  if (!doc) throw new Error('no document in the answer')
  for (const row of listBlocks(doc)) {
    console.log(
      `${row.path.padEnd(24)} ${row.blockType.padEnd(18)} ${row.id}  ${kb(bytes(row.block))}${row.blockName ? `  "${row.blockName}"` : ''}`,
    )
  }
}

const [command, ...rest] = process.argv.slice(2)
const run =
  command === 'capture'
    ? capture
    : command === 'compare'
      ? compare
      : command === 'outline'
        ? outlineCase
        : null
if (!run) {
  console.error(
    'usage: mcp-bench.ts capture <label> [--server url --local] | compare <label...> | outline <case-id>',
  )
  process.exit(1)
}
Promise.resolve(run(rest)).catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
