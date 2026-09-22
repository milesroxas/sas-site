import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, extname, join } from 'node:path'
import { TypeSafeClient } from '@typesafe-ai/sdk'
import { ASK_JUDGE_KEY_VAR, ASK_JUDGE_MODEL } from '@/features/ask/judge'
import { fetchDocument, findToolFor } from '../cms-fetch'
import { type Passage, passagesOf } from './passages'
import { judgeVoice, loadVoiceCache, saveVoiceCache, voiceReport } from './voice'

/**
 * The house voice, checked on any copy (docs/editorial/voice.md):
 *
 *   pnpm editorial:voice --project <lab project id>            a Lab Project's story
 *   pnpm editorial:voice --collection posts --id <id>          any document, by its find tool
 *   pnpm editorial:voice --file <document.json | draft.md | copy.txt>
 *   pnpm editorial:voice --text "<a passage>"
 *
 * `--local` allows a local site when the MCP client points at one. Without
 * TYPESAFE_API_KEY only the code checks run. The report is printed and
 * written outside the repository, beside the lab journals' private files.
 */

const OUT_DIR = join(homedir(), '.claude', 'lab-journals', 'sas-site', '_editorial')

/** A Markdown or text file: `#` lines are headings, blank lines split paragraphs. */
function passagesOfText(text: string, path: string): Passage[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const heading = block.match(/^#{1,6}\s+(.*)$/)
      return heading
        ? { path: `${path}:${index + 1}`, kind: 'heading' as const, text: heading[1] as string }
        : { path: `${path}:${index + 1}`, kind: 'paragraph' as const, text: block }
    })
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const option = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
  const local = args.includes('--local')
  const project = option('--project')
  const collection = project ? 'lab-projects' : option('--collection')
  const id = project ?? option('--id')
  const file = option('--file')
  const text = option('--text')

  let passages: Passage[]
  let name: string
  if (collection && id) {
    const document = await fetchDocument(findToolFor(collection), id, { local })
    passages = passagesOf(document)
    name = `${collection}-${id}`
  } else if (file) {
    const raw = readFileSync(file, 'utf8')
    passages =
      extname(file) === '.json'
        ? passagesOf((JSON.parse(raw) as { docs?: unknown[] }).docs?.[0] ?? JSON.parse(raw))
        : passagesOfText(raw, basename(file))
    name = basename(file, extname(file))
  } else if (text) {
    passages = passagesOfText(text, 'text')
    name = 'text'
  } else {
    throw new Error(
      'usage: pnpm editorial:voice --project <id> | --collection <slug> --id <id> | --file <path> | --text "<copy>"',
    )
  }
  if (passages.length === 0) throw new Error('No copy to check.')

  mkdirSync(OUT_DIR, { recursive: true })
  const cachePath = join(OUT_DIR, 'voice.json')
  const cache = loadVoiceCache(cachePath)
  let usage = { requests: 0, inputTokens: 0 }
  if (process.env[ASK_JUDGE_KEY_VAR]?.trim()) {
    const jev = new TypeSafeClient({ defaultModel: ASK_JUDGE_MODEL, logLevel: 'error' })
    usage = await judgeVoice(passages, cache, jev)
    saveVoiceCache(cachePath, cache)
  } else {
    console.error(`${ASK_JUDGE_KEY_VAR} is not set: only the code checks ran.`)
  }

  const { lines, counts } = voiceReport(passages, cache)
  const report = [
    `# Voice check: ${name}`,
    '',
    `${passages.length} passages (${passages.filter((p) => p.kind === 'paragraph').length} paragraphs, ${passages.filter((p) => p.kind === 'heading').length} headings, ${passages.filter((p) => p.kind === 'label').length} labels) against docs/editorial/voice.md. Judged by ${ASK_JUDGE_MODEL}. A listed passage is one to read against the doc, not a proven fault.`,
    '',
    ...lines,
  ].join('\n')
  const reportPath = join(OUT_DIR, `voice-${name}.md`)
  writeFileSync(reportPath, report)
  console.log(report)
  console.log(reportPath)
  console.log(
    `Refused ${counts.refused}, listed ${counts.listed}, generic ${counts.generic}, inflated ${counts.inflated}, formulaic ${counts.formulaic}, punchlines ${counts.punchlines} of ${counts.paragraphs}, heading run ${counts.headingRun ? 'yes' : 'no'}. Jev: ${usage.requests} requests, ${usage.inputTokens} input tokens.`,
  )
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
