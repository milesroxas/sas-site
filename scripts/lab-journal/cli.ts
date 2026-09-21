import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import {
  activeJournal,
  addPrompts,
  currentBranch,
  currentTranscript,
  ENTRY_KINDS,
  type EntryKind,
  findTranscript,
  formatEntry,
  inWindow,
  JOURNAL_ROOT,
  type JournalMeta,
  journalDir,
  type PromptRow,
  parseEntries,
  promptsFromTranscript,
  promptsPath,
  readJsonl,
  readMetas,
  repoRoot,
  type SessionRow,
  type SessionWindow,
  sessionOf,
  sessionRow,
  sessionsPath,
  sessionWindow,
  totalUsage,
  upsertSession,
  writeMeta,
} from './lib'

/**
 * The lab journal's commands, run by the agent (the lab-journal skill says
 * when) or by hand:
 *
 *   pnpm lab:journal start <slug> --title "<title>"
 *   pnpm lab:journal log --kind <kind> --title "<title>" < body.md
 *   pnpm lab:journal status | pause | resume [slug] | wrap | sync [session-id]
 *   pnpm lab:journal window [--from <iso>] [--to <iso>]
 *
 * `log` appends, so an entry costs the same on day five as on day one: the
 * agent never has to read the journal back to add to it.
 */

const root = repoRoot(process.cwd())
function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** One session's prompts and token counts, from its transcript. Safe to repeat: both are keyed. */
function capture(slug: string, transcript: string | null, given?: SessionWindow): void {
  if (!transcript || !existsSync(transcript)) return
  const window = given ?? sessionWindow(root, slug, sessionOf(transcript))
  addPrompts(root, slug, promptsFromTranscript(readFileSync(transcript, 'utf8'), window))
  const row = sessionRow(transcript, window)
  if (row) upsertSession(root, slug, row)
}

const captureCurrentSession = (slug: string) => capture(slug, currentTranscript(process.cwd()))

function requireActive(): JournalMeta {
  return (
    activeJournal(root) ??
    fail(`No lab journal is live on ${currentBranch(root)}. Run: pnpm lab:journal resume <slug>`)
  )
}

function start(slug: string | undefined, title: string | undefined): void {
  if (!slug || !SLUG.test(slug)) fail('A slug is required: lowercase words joined by hyphens.')
  const name = slug
  if (existsSync(journalDir(root, name)))
    fail(`${JOURNAL_ROOT}/${name} already exists. Use resume.`)
  const live = activeJournal(root)
  if (live) fail(`"${live.title}" is live on this branch. Pause or wrap it first.`)

  const branch = currentBranch(root)
  const meta: JournalMeta = {
    slug: name,
    title: title?.trim() || name,
    status: 'active',
    branches: branch ? [branch] : [],
    startedAt: new Date().toISOString(),
  }
  writeMeta(root, meta)
  writeFileSync(
    join(journalDir(root, name), 'journal.md'),
    `# Lab journal: ${meta.title}\n\nKept while the feature is built, newest entry last. How entries are written: \`.agents/skills/lab-journal/SKILL.md\`. Token usage per session is in \`sessions.jsonl\`; prompts stay outside the repository.\n`,
  )
  // The session that starts a journal began before it: keep the prompts that led here.
  captureCurrentSession(name)
  console.log(`Started ${JOURNAL_ROOT}/${name} on ${branch}.`)
}

function log(kind: string | undefined, title: string | undefined): void {
  const journal = requireActive()
  if (!ENTRY_KINDS.includes(kind as EntryKind)) fail(`--kind is one of: ${ENTRY_KINDS.join(', ')}`)
  if (!title?.trim()) fail('--title is required.')
  const body = process.stdin.isTTY ? '' : readFileSync(0, 'utf8')
  if (!body.trim()) fail('The entry body is read from stdin and was empty.')

  const transcript = currentTranscript(process.cwd())
  appendFileSync(
    join(journalDir(root, journal.slug), 'journal.md'),
    formatEntry({
      kind: kind as EntryKind,
      title,
      body,
      at: new Date(),
      session: transcript ? sessionOf(transcript) : null,
      branch: currentBranch(root),
    }),
  )
  console.log(`Logged ${kind}: ${title}`)
}

function setStatus(slug: string | undefined, status: JournalMeta['status']): void {
  const metas = readMetas(root)
  const open = metas.filter((meta) => meta.status !== 'wrapped')
  const meta = slug
    ? metas.find((known) => known.slug === slug)
    : status === 'active'
      ? open.length === 1
        ? open[0]
        : undefined
      : (activeJournal(root) ?? undefined)
  if (!meta) {
    fail(
      slug
        ? `No journal named ${slug}.`
        : `Name the journal: ${open.map((known) => known.slug).join(', ') || 'none open'}.`,
    )
  }
  const next = meta
  const branch = currentBranch(root)
  if (status === 'active' && branch && !next.branches.includes(branch)) next.branches.push(branch)
  if (status === 'wrapped') next.wrappedAt = new Date().toISOString()
  // A wrap or a pause closes this session's row while the journal can still be found.
  if (status !== 'active' && next.status === 'active') captureCurrentSession(next.slug)
  next.status = status
  writeMeta(root, next)
  if (status === 'active') captureCurrentSession(next.slug)
  console.log(`${next.slug}: ${status}${status === 'active' ? ` on ${branch}` : ''}`)
}

/**
 * Rereads every session whose transcript is still on this machine, and the
 * running one: token counts, and any prompt typed while the journal was paused.
 */
function sync(extra: string | undefined): void {
  const journal = requireActive()
  const sessions = readJsonl<SessionRow>(sessionsPath(root, journal.slug)).map((row) => row.session)
  // A session the hooks missed (the journal was paused, or not live on its branch) is named by id.
  if (extra) sessions.push(extra)
  for (const session of sessions) {
    capture(journal.slug, findTranscript(session, process.cwd()))
  }
  captureCurrentSession(journal.slug)
  status()
}

/**
 * One session, two features: says which part of the running session is this
 * journal's, so its tokens and prompts are not counted into both. Prompts
 * already captured outside the window are removed.
 */
function setWindow(from: string | undefined, to: string | undefined): void {
  const journal = requireActive()
  const transcript = currentTranscript(process.cwd())
  if (!transcript) fail('No transcript found for the running session.')
  for (const value of [from, to]) {
    if (value && Number.isNaN(Date.parse(value))) fail(`Not an ISO time: ${value}`)
  }
  const window: SessionWindow = { ...(from ? { from } : {}), ...(to ? { to } : {}) }
  const session = sessionOf(transcript)
  const path = promptsPath(root, journal.slug)
  const kept = readJsonl<PromptRow>(path).filter(
    (row) => row.session !== session || inWindow(row.at, window),
  )
  writeFileSync(path, kept.map((row) => `${JSON.stringify(row)}\n`).join(''))
  capture(journal.slug, transcript, window)
  status()
}

function status(): void {
  const journal = activeJournal(root)
  if (!journal) {
    const open = readMetas(root).filter((meta) => meta.status !== 'wrapped')
    console.log(
      `No lab journal live on ${currentBranch(root)}.${open.length > 0 ? ` Open: ${open.map((meta) => `${meta.slug} (${meta.status}, ${meta.branches.join(', ')})`).join('; ')}.` : ''}`,
    )
    return
  }
  const dir = journalDir(root, journal.slug)
  const sessions = readJsonl<SessionRow>(sessionsPath(root, journal.slug))
  const entries = existsSync(join(dir, 'journal.md'))
    ? parseEntries(readFileSync(join(dir, 'journal.md'), 'utf8'))
    : []
  console.log(
    `${journal.title} (${journal.slug}), ${journal.status} on ${journal.branches.join(', ')}`,
  )
  console.log(`Entries: ${entries.length}. Sessions: ${sessions.length}.`)
  console.log(
    `Prompts: ${readJsonl(promptsPath(root, journal.slug)).length}, in ${dirname(promptsPath(root, journal.slug))}`,
  )
  for (const [model, counts] of Object.entries(totalUsage(sessions))) {
    console.log(
      `${model}: input ${counts.input}, output ${counts.output}, cache write ${counts.cacheWrite}, cache read ${counts.cacheRead} (${counts.messages} messages)`,
    )
  }
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    kind: { type: 'string' },
    title: { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
  },
})
const [command, slug] = positionals

switch (command) {
  case 'start':
    start(slug, values.title)
    break
  case 'log':
    log(values.kind, values.title)
    break
  case 'pause':
    setStatus(slug, 'paused')
    break
  case 'resume':
    setStatus(slug, 'active')
    break
  case 'wrap':
    setStatus(slug, 'wrapped')
    break
  case 'sync':
    sync(slug)
    break
  case 'window':
    setWindow(values.from, values.to)
    break
  case 'status':
    status()
    break
  default:
    fail('Usage: pnpm lab:journal start|log|status|pause|resume|wrap|sync|window')
}
