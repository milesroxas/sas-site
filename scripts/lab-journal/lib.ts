import { execFileSync } from 'node:child_process'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { redactFreeText } from '@/features/ask/redact'

/**
 * The lab journal: the record of how a feature was built, kept while it is
 * built, so it can become a Lab Project entry. The contract (what is logged,
 * when, and the entry format the writer reads) is in
 * `.agents/skills/lab-journal/SKILL.md`; this file is its storage.
 *
 * Two places, on purpose. The repository is public, so what is committed is
 * what the agent wrote for a reader: `journal.md`, `sessions.jsonl` (token
 * counts), `meta.json`. What was typed is not: prompts land redacted in
 * `~/.claude/lab-journals/`, outside every checkout, where every workspace
 * and worktree on this machine reaches the same file.
 */

export const JOURNAL_ROOT = 'docs/lab-journal'

export const ENTRY_KINDS = [
  'decision',
  'challenge',
  'insight',
  'measurement',
  'milestone',
  'note',
] as const

export type EntryKind = (typeof ENTRY_KINDS)[number]

export type JournalStatus = 'active' | 'paused' | 'wrapped'

export type JournalMeta = {
  slug: string
  title: string
  status: JournalStatus
  /** A journal is live only on the branches it was started or resumed on. */
  branches: string[]
  startedAt: string
  wrappedAt?: string
}

export type TokenCounts = {
  input: number
  output: number
  cacheWrite: number
  cacheRead: number
  messages: number
}

export type SessionRow = {
  session: string
  branch: string | null
  /** Claude Code's version, as the transcript records it. */
  version: string | null
  startedAt: string | null
  endedAt: string | null
  prompts: number
  /** Per model, subagents included: a subagent on another model is its own key. */
  models: Record<string, TokenCounts>
}

export type PromptRow = {
  id: string
  session: string
  at: string
  branch: string | null
  text: string
}

// Transcript rows, only as far as this file reads them.
type TranscriptBlock = { type?: string; text?: string }
type TranscriptRow = {
  type?: string
  isMeta?: boolean
  isSidechain?: boolean
  timestamp?: string
  promptId?: string
  uuid?: string
  sessionId?: string
  gitBranch?: string
  version?: string
  message?: {
    id?: string
    model?: string
    content?: string | TranscriptBlock[]
    usage?: Record<string, number | null | undefined>
  }
}

function parseRows(jsonl: string): TranscriptRow[] {
  return jsonl.split('\n').flatMap((line) => {
    if (!line.trim()) return []
    try {
      return [JSON.parse(line) as TranscriptRow]
    } catch {
      return []
    }
  })
}

const rowText = (row: TranscriptRow): string => {
  const content = row.message?.content
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .flatMap((block) => (block.type === 'text' && block.text ? [block.text] : []))
    .join('\n\n')
}

/**
 * Token usage per model. A transcript repeats one API message on several
 * lines (one per content block), each carrying the same usage, so a message
 * id counts once. `seen` is shared across a session's files.
 */
export function sumUsage(jsonl: string, seen = new Set<string>()): Record<string, TokenCounts> {
  const models: Record<string, TokenCounts> = {}
  for (const row of parseRows(jsonl)) {
    const { id, model, usage } = row.message ?? {}
    if (row.type !== 'assistant' || !usage || !id || !model || model === '<synthetic>') continue
    if (seen.has(id)) continue
    seen.add(id)
    models[model] ??= { input: 0, output: 0, cacheWrite: 0, cacheRead: 0, messages: 0 }
    const counts = models[model]
    counts.input += usage.input_tokens ?? 0
    counts.output += usage.output_tokens ?? 0
    counts.cacheWrite += usage.cache_creation_input_tokens ?? 0
    counts.cacheRead += usage.cache_read_input_tokens ?? 0
    counts.messages += 1
  }
  return models
}

export function mergeUsage(
  into: Record<string, TokenCounts>,
  from: Record<string, TokenCounts>,
): Record<string, TokenCounts> {
  for (const [model, counts] of Object.entries(from)) {
    into[model] ??= { input: 0, output: 0, cacheWrite: 0, cacheRead: 0, messages: 0 }
    const target = into[model]
    for (const key of Object.keys(counts) as (keyof TokenCounts)[]) target[key] += counts[key]
  }
  return into
}

/**
 * What the person typed, as they typed it. A slash command arrives wrapped in
 * tags and reads back as `/name args`; harness text that rides in user rows
 * (command output, reminders, interruptions) is not a prompt.
 */
export function cleanPromptText(raw: string): string | null {
  const name = raw.match(/<command-name>([\s\S]*?)<\/command-name>/)?.[1]?.trim()
  if (name) {
    const args = raw.match(/<command-args>([\s\S]*?)<\/command-args>/)?.[1]?.trim()
    return args ? `${name} ${args}` : name
  }
  const text = raw.trim()
  if (!text) return null
  if (/^<(local-command-|system-reminder|task-notification|bash-)/.test(text)) return null
  if (text.startsWith('[Request interrupted')) return null
  return text
}

export function promptsFromTranscript(jsonl: string): PromptRow[] {
  return parseRows(jsonl).flatMap((row): PromptRow[] => {
    if (row.type !== 'user' || row.isMeta || row.isSidechain) return []
    const text = cleanPromptText(rowText(row))
    if (!text || !row.sessionId || !row.timestamp) return []
    return [
      {
        id: row.promptId ?? row.uuid ?? `${row.sessionId}:${row.timestamp}`,
        session: row.sessionId,
        at: row.timestamp,
        branch: row.gitBranch ?? null,
        text: redactFreeText(text),
      },
    ]
  })
}

export type AssistantText = { id: string; session: string; at: string; text: string }

/** The agent's prose per API message, tool calls and thinking left out. For the digest. */
export function assistantTexts(jsonl: string): AssistantText[] {
  const byMessage = new Map<string, AssistantText>()
  for (const row of parseRows(jsonl)) {
    const id = row.message?.id
    if (row.type !== 'assistant' || row.isSidechain || !id || !row.sessionId) continue
    const text = rowText(row)
    if (!text) continue
    const known = byMessage.get(id)
    if (known) known.text += `\n\n${text}`
    else byMessage.set(id, { id, session: row.sessionId, at: row.timestamp ?? '', text })
  }
  return [...byMessage.values()]
}

/** The journals live on `branch`. More than one: the newest, since a branch has one feature in hand. */
export function resolveActive(metas: JournalMeta[], branch: string | null): JournalMeta | null {
  const live = metas
    .filter((meta) => meta.status === 'active' && branch !== null && meta.branches.includes(branch))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  return live[0] ?? null
}

export function formatEntry(entry: {
  kind: EntryKind
  title: string
  body: string
  at: Date
  session: string | null
  branch: string | null
}): string {
  const stamp = `${entry.at.toISOString().slice(0, 16).replace('T', ' ')} UTC`
  const origin = [
    entry.session && `session: ${entry.session}`,
    entry.branch && `branch: ${entry.branch}`,
  ]
    .filter(Boolean)
    .join(', ')
  return `\n## ${stamp} | ${entry.kind} | ${entry.title.trim()}\n\n${entry.body.trim()}\n\n<!-- ${origin} -->\n`
}

export type JournalEntry = { at: string; kind: string; title: string; body: string }

export function parseEntries(journal: string): JournalEntry[] {
  return journal
    .split(/^## /m)
    .slice(1)
    .flatMap((chunk): JournalEntry[] => {
      const [heading = '', ...rest] = chunk.split('\n')
      const [at, kind, ...title] = heading.split(' | ')
      if (!at || !kind || title.length === 0) return []
      const body = rest
        .join('\n')
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim()
      return [{ at: at.trim(), kind: kind.trim(), title: title.join(' | ').trim(), body }]
    })
}

// Storage. Everything above is pure; everything below touches the disk or git.

const git = (cwd: string, ...args: string[]): string | null => {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return null
  }
}

export const repoRoot = (cwd: string): string => git(cwd, 'rev-parse', '--show-toplevel') ?? cwd

export const currentBranch = (cwd: string): string | null =>
  git(cwd, 'rev-parse', '--abbrev-ref', 'HEAD')

/**
 * The repository's name from its origin, not the directory (a Conductor
 * workspace or a worktree has a name of its own) and not the package name
 * (still the template's).
 */
function projectName(root: string): string {
  const origin = git(root, 'remote', 'get-url', 'origin')
  return basename(origin ?? root).replace(/\.git$/, '')
}

export const journalDir = (root: string, slug: string) => join(root, JOURNAL_ROOT, slug)

export const privateDir = (root: string, slug: string) =>
  join(homedir(), '.claude', 'lab-journals', projectName(root), slug)

export function readMetas(root: string): JournalMeta[] {
  const base = join(root, JOURNAL_ROOT)
  if (!existsSync(base)) return []
  return readdirSync(base).flatMap((slug) => {
    try {
      return [JSON.parse(readFileSync(join(base, slug, 'meta.json'), 'utf8')) as JournalMeta]
    } catch {
      return []
    }
  })
}

export function writeMeta(root: string, meta: JournalMeta): void {
  mkdirSync(journalDir(root, meta.slug), { recursive: true })
  writeFileSync(
    join(journalDir(root, meta.slug), 'meta.json'),
    `${JSON.stringify(meta, null, 2)}\n`,
  )
}

export const activeJournal = (root: string): JournalMeta | null =>
  resolveActive(readMetas(root), currentBranch(root))

export function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return []
  return parseRows(readFileSync(path, 'utf8')) as T[]
}

const writeJsonl = (path: string, rows: unknown[]) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, rows.map((row) => `${JSON.stringify(row)}\n`).join(''))
}

export const promptsPath = (root: string, slug: string) =>
  join(privateDir(root, slug), 'prompts.jsonl')

/** Appends the prompts not already there: the hook and a backfill may both see one. */
export function addPrompts(root: string, slug: string, prompts: PromptRow[]): number {
  const path = promptsPath(root, slug)
  const known = readJsonl<PromptRow>(path)
  const ids = new Set(known.map((row) => row.id))
  const texts = new Set(known.map((row) => `${row.session}\n${row.text}`))
  const fresh = prompts.filter(
    (row) => !ids.has(row.id) && !texts.has(`${row.session}\n${row.text}`),
  )
  if (fresh.length === 0) return 0
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, fresh.map((row) => `${JSON.stringify(row)}\n`).join(''))
  return fresh.length
}

/** Claude Code files a project's transcripts under its path with every separator flattened. */
export const transcriptDir = (cwd: string) =>
  join(homedir(), '.claude', 'projects', cwd.replace(/[^a-zA-Z0-9]/g, '-'))

/**
 * The transcript of the session running this command. Claude Code names the
 * session in the environment of every tool call. The newest file is only the
 * fallback (another agent, a shell): with two sessions open in one checkout
 * it is as likely to be the other one.
 */
export function currentTranscript(...cwds: string[]): string | null {
  const dirs = [...new Set(cwds.map(transcriptDir))].filter((dir) => existsSync(dir))
  const session = process.env.CLAUDE_CODE_SESSION_ID
  if (session) {
    const named = dirs.map((dir) => join(dir, `${session}.jsonl`)).find((path) => existsSync(path))
    if (named) return named
  }
  const newest = dirs
    .flatMap((dir) => readdirSync(dir).map((name) => join(dir, name)))
    .filter((path) => path.endsWith('.jsonl'))
    .map((path) => ({ path, at: statSync(path).mtimeMs }))
    .sort((a, b) => b.at - a.at)[0]
  return newest?.path ?? null
}

export const sessionOf = (transcriptPath: string) => basename(transcriptPath, '.jsonl')

/** One session's row: its own transcript plus every subagent transcript beside it. */
export function sessionRow(transcriptPath: string): SessionRow | null {
  if (!existsSync(transcriptPath)) return null
  const main = readFileSync(transcriptPath, 'utf8')
  const seen = new Set<string>()
  const models = sumUsage(main, seen)

  const subagents = join(dirname(transcriptPath), sessionOf(transcriptPath), 'subagents')
  if (existsSync(subagents)) {
    for (const name of readdirSync(subagents)) {
      if (name.endsWith('.jsonl')) {
        mergeUsage(models, sumUsage(readFileSync(join(subagents, name), 'utf8'), seen))
      }
    }
  }

  const rows = parseRows(main)
  const stamps = rows.flatMap((row) => (row.timestamp ? [row.timestamp] : []))
  const last = rows.filter((row) => row.gitBranch || row.version).at(-1)
  return {
    session: sessionOf(transcriptPath),
    branch: last?.gitBranch ?? null,
    version: last?.version ?? null,
    startedAt: stamps[0] ?? null,
    endedAt: stamps.at(-1) ?? null,
    prompts: promptsFromTranscript(main).length,
    models,
  }
}

export const sessionsPath = (root: string, slug: string) =>
  join(journalDir(root, slug), 'sessions.jsonl')

export function upsertSession(root: string, slug: string, row: SessionRow): void {
  const path = sessionsPath(root, slug)
  const rows = readJsonl<SessionRow>(path).filter((known) => known.session !== row.session)
  rows.push(row)
  rows.sort((a, b) => (a.startedAt ?? '').localeCompare(b.startedAt ?? ''))
  writeJsonl(path, rows)
}

export function totalUsage(rows: SessionRow[]): Record<string, TokenCounts> {
  return rows.reduce<Record<string, TokenCounts>>((all, row) => mergeUsage(all, row.models), {})
}
