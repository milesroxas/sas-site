import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { redactFreeText } from '@/features/ask/redact'
import {
  activeJournal,
  addPrompts,
  cleanPromptText,
  currentBranch,
  inWindow,
  JOURNAL_ROOT,
  parseEntries,
  repoRoot,
  sessionOf,
  sessionRow,
  sessionWindow,
  upsertSession,
} from './lib'

/**
 * The lab journal's Claude Code hooks (`.claude/settings.json`), one entry
 * for every event. No model runs here, so what it captures costs no tokens
 * and cannot be paraphrased or forgotten:
 *
 * - SessionStart: says a journal is live on this branch, so a session on day
 *   three picks it up without being told. The only event that prints.
 * - UserPromptSubmit: the prompt, redacted, to the private prompts file.
 * - Stop, SessionEnd: the session's token counts from its transcript.
 *
 * With no journal live on the branch every event is a no-op. It never fails
 * a session: any error is swallowed and the exit code is always 0.
 */

type HookInput = {
  hook_event_name?: string
  session_id?: string
  prompt_id?: string
  transcript_path?: string
  cwd?: string
  prompt?: string
  agent_id?: string
}

function run(input: HookInput): void {
  // A subagent's events belong to its parent session, which reports them.
  if (input.agent_id) return
  const root = repoRoot(input.cwd ?? process.cwd())
  const journal = activeJournal(root)
  if (!journal) return

  switch (input.hook_event_name) {
    case 'SessionStart': {
      const path = join(JOURNAL_ROOT, journal.slug, 'journal.md')
      let recent: string[] = []
      try {
        recent = parseEntries(readFileSync(join(root, path), 'utf8'))
          .slice(-5)
          .map((entry) => `- ${entry.at} | ${entry.kind} | ${entry.title}`)
      } catch {
        // A journal with no entries yet.
      }
      process.stdout.write(
        [
          `Lab journal live on this branch: "${journal.title}" (${journal.slug}), at ${path}.`,
          'Load the lab-journal skill now and log decisions, challenges, insights and measurements as they happen. Prompts and token usage are captured by hooks: do not log those.',
          recent.length > 0 ? `Latest entries:\n${recent.join('\n')}` : 'No entries yet.',
        ].join('\n'),
      )
      return
    }
    case 'UserPromptSubmit': {
      const text = input.prompt ? cleanPromptText(input.prompt) : null
      if (!text || !input.session_id) return
      const at = new Date().toISOString()
      // A session whose window for this journal has closed is another feature's now.
      if (!inWindow(at, sessionWindow(root, journal.slug, input.session_id))) return
      addPrompts(root, journal.slug, [
        {
          id: input.prompt_id ?? `${input.session_id}:${Date.now()}`,
          session: input.session_id,
          at,
          branch: currentBranch(root),
          text: redactFreeText(text),
        },
      ])
      return
    }
    case 'Stop':
    case 'SessionEnd': {
      const path = input.transcript_path
      const row = path ? sessionRow(path, sessionWindow(root, journal.slug, sessionOf(path))) : null
      if (row) upsertSession(root, journal.slug, row)
      return
    }
  }
}

try {
  run(JSON.parse(readFileSync(0, 'utf8')) as HookInput)
} catch {
  // Never a session's problem.
}
