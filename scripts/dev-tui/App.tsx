import path from 'node:path'
import { Box, Text, useApp, useInput } from 'ink'
import Spinner from 'ink-spinner'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LOCAL_POSTGRES_DB, PROJECT_ROOT, VERCEL_PULL_ENV_FILE } from './constants'
import { backupLocalDatabase, syncProductionToLocal } from './db-sync'
import {
  assertPostgresUrl,
  maskPostgresUrlForDisplay,
  productionEnvExists,
  readAppPostgresUrl,
  readProductionUrls,
} from './env'
import { checkVercelCli, ensureLocalPostgresReady } from './prereqs'
import { runPnpmCapture, runPnpmScript, runVercelEnvPull } from './run'

type Phase =
  | { kind: 'menu' }
  | { kind: 'running'; label: string }
  | { kind: 'done'; ok: boolean; output: string }
  | { kind: 'confirm'; title: string; danger: boolean; onYes: () => void }

type Stack = 'main' | 'db' | 'payload' | 'quality'

type ActionId =
  | 'dev-default'
  | 'dev-local'
  | 'dev-prod'
  | 'import-prod'
  | 'menu-db'
  | 'menu-payload'
  | 'menu-quality'
  | 'build'
  | 'start'
  | 'prod-style'
  | 'exit'
  | 'back'
  | 'db-up'
  | 'db-down'
  | 'db-backup'
  | 'seed'
  | 'seed-drop'
  | 'env-pull'
  | 'gen-types'
  | 'gen-importmap'
  | 'migrate-create'
  | 'lint'
  | 'lint-fix'
  | 'test-int'
  | 'test-e2e'
  | 'test-all'

type MenuItem = { id: ActionId; label: string; hint?: string }

const MENU: Record<Stack, MenuItem[]> = {
  main: [
    {
      id: 'dev-default',
      label: 'Dev server — default env',
      hint: 'POSTGRES_URL from your .env chain (see footer)',
    },
    {
      id: 'dev-local',
      label: 'Dev server — local Docker DB',
      hint: `forces ${LOCAL_POSTGRES_DB}; starts the container if needed`,
    },
    {
      id: 'dev-prod',
      label: 'Dev server — production DB',
      hint: `reads ${VERCEL_PULL_ENV_FILE}; schema push disabled`,
    },
    {
      id: 'import-prod',
      label: 'Pull production content → local Docker DB',
      hint: 'pg_dump production, parallel restore into Docker (local data is NOT backed up)',
    },
    { id: 'menu-db', label: 'Database…' },
    { id: 'menu-payload', label: 'Payload…' },
    { id: 'menu-quality', label: 'Quality…' },
    { id: 'build', label: 'Build (pnpm build)' },
    { id: 'start', label: 'Start production build (pnpm start)' },
    { id: 'prod-style', label: 'Full prod-style run (pnpm dev:prod)' },
    { id: 'exit', label: 'Exit' },
  ],
  db: [
    { id: 'db-up', label: 'Docker: start Postgres (pnpm db:up)' },
    { id: 'db-down', label: 'Docker: stop compose (pnpm db:down)' },
    {
      id: 'db-backup',
      label: 'Back up local Docker DB → .dev-tui/local-backup.dump',
      hint: 'run before pulling production if local has work worth keeping',
    },
    {
      id: 'seed',
      label: 'Seed placeholder content → local Docker DB (pnpm seed)',
      hint: 'upserts review content in place; media and users untouched',
    },
    {
      id: 'seed-drop',
      label: 'Drop content + reseed → local Docker DB (pnpm seed:drop)',
      hint: 'wipes pages, posts, work, content-hub records first',
    },
    {
      id: 'env-pull',
      label: `Pull Vercel production env → ${VERCEL_PULL_ENV_FILE}`,
      hint: 'force a re-pull; prod-DB options auto-pull when the file is missing',
    },
    { id: 'back', label: '← Back' },
  ],
  payload: [
    { id: 'gen-types', label: 'Generate TypeScript types (pnpm generate:types)' },
    { id: 'gen-importmap', label: 'Generate admin import map (pnpm generate:importmap)' },
    { id: 'migrate-create', label: 'Create migration from schema diff (pnpm migrate:create)' },
    { id: 'back', label: '← Back' },
  ],
  quality: [
    { id: 'lint', label: 'Lint (pnpm lint)' },
    { id: 'lint-fix', label: 'Lint fix (pnpm lint:fix)' },
    { id: 'test-int', label: 'Unit tests (pnpm test:int)' },
    { id: 'test-e2e', label: 'E2E tests (pnpm test:e2e)' },
    { id: 'test-all', label: 'All tests (pnpm test)' },
    { id: 'back', label: '← Back' },
  ],
}

export function App({ unmount }: { unmount: () => void }) {
  const { exit } = useApp()
  const [stack, setStack] = useState<Stack[]>(['main'])
  const [selected, setSelected] = useState(0)
  const [phase, setPhase] = useState<Phase>({ kind: 'menu' })
  const [dbFooter, setDbFooter] = useState<string[]>([])

  const current = stack[stack.length - 1]
  const items = MENU[current]
  const max = items.length - 1

  useEffect(() => {
    if (phase.kind !== 'menu') return
    let cancelled = false
    void (async () => {
      const r = await readAppPostgresUrl()
      if (cancelled) return
      if ('error' in r) {
        setDbFooter([`Default-env DB: unknown — ${r.error}`])
        return
      }
      const kind = r.url === LOCAL_POSTGRES_DB ? 'local Docker' : 'remote'
      setDbFooter([
        `Default-env DB (${kind}, from ${r.source}): ${maskPostgresUrlForDisplay(r.url)}`,
        'The local/production dev entries override this per-run without editing files.',
      ])
    })()
    return () => {
      cancelled = true
    }
  }, [phase.kind])

  const goBack = useCallback(() => {
    setSelected(0)
    setStack((s) => (s.length <= 1 ? s : s.slice(0, -1)))
  }, [])

  const enterMenu = useCallback((menu: Stack) => {
    setStack((s) => [...s, menu])
    setSelected(0)
  }, [])

  const runCapture = useCallback(
    async (label: string, args: string[], env?: Record<string, string>) => {
      setPhase({ kind: 'running', label })
      const r = await runPnpmCapture(args, env)
      const out = [r.stdout, r.stderr].filter(Boolean).join('\n').trim()
      const ok = r.exitCode === 0
      setPhase({
        kind: 'done',
        ok,
        output: out || (ok ? '(no output)' : `Exit code ${r.exitCode ?? 'unknown'}`),
      })
    },
    [],
  )

  /** Hand the terminal to a long-running pnpm script and leave the TUI. */
  const launchScript = useCallback(
    (script: string, env?: Record<string, string>) => {
      unmount()
      queueMicrotask(() => {
        void runPnpmScript(script, env).catch((e) => {
          console.error(e)
          process.exitCode = 1
        })
      })
    },
    [unmount],
  )

  const executeSync = useCallback(async (postgresUrl: string) => {
    const errUrl = assertPostgresUrl(postgresUrl)
    if (errUrl) {
      setPhase({ kind: 'done', ok: false, output: errUrl })
      return
    }
    setPhase({ kind: 'running', label: 'Starting local Postgres (Docker)…' })
    const ready = await ensureLocalPostgresReady()
    if (!ready.ok) {
      setPhase({ kind: 'done', ok: false, output: ready.message })
      return
    }
    setPhase({ kind: 'running', label: 'Dumping production + restoring local…' })
    const result = await syncProductionToLocal(postgresUrl)
    setPhase({ kind: 'done', ok: result.ok, output: result.messages.join('\n') })
  }, [])

  /**
   * Resolve the production connection URLs, pulling the Vercel env file first
   * if it does not exist yet. Sets a failure phase and returns null when the
   * vercel CLI is missing or the pull/read fails. Never refreshes an existing
   * file — use the "Pull Vercel production env" menu entry to force a re-pull
   * after credential rotation.
   */
  const ensureProductionUrls = useCallback(async (): Promise<{
    runtimeUrl: string
    dumpUrl: string
    payloadSecret?: string
  } | null> => {
    if (!(await productionEnvExists())) {
      const v = await checkVercelCli()
      if (!v.ok) {
        setPhase({ kind: 'done', ok: false, output: v.message })
        return null
      }
      setPhase({ kind: 'running', label: `Pulling production env → ${VERCEL_PULL_ENV_FILE}…` })
      try {
        await runVercelEnvPull(VERCEL_PULL_ENV_FILE)
      } catch (e) {
        setPhase({ kind: 'done', ok: false, output: e instanceof Error ? e.message : String(e) })
        return null
      }
    }
    const r = await readProductionUrls()
    if ('error' in r) {
      setPhase({ kind: 'done', ok: false, output: r.error })
      return null
    }
    return r
  }, [])

  const handleAction = useCallback(
    async (id: ActionId) => {
      switch (id) {
        case 'dev-default':
          launchScript('dev')
          return
        case 'dev-local': {
          setPhase({ kind: 'running', label: 'Starting local Postgres (Docker)…' })
          const ready = await ensureLocalPostgresReady()
          if (!ready.ok) {
            setPhase({ kind: 'done', ok: false, output: ready.message })
            return
          }
          launchScript('dev', { POSTGRES_URL: LOCAL_POSTGRES_DB })
          return
        }
        case 'dev-prod': {
          setPhase({ kind: 'running', label: 'Reading production env…' })
          const r = await ensureProductionUrls()
          if (!r) return
          setPhase({
            kind: 'confirm',
            danger: true,
            title:
              `Run next dev against PRODUCTION (${maskPostgresUrlForDisplay(r.runtimeUrl)})? ` +
              'Admin-panel writes hit real production data. Schema push is disabled for this run (PAYLOAD_DB_PUSH=false).',
            onYes: () =>
              launchScript('dev', {
                POSTGRES_URL: r.runtimeUrl,
                PAYLOAD_DB_PUSH: 'false',
                // Production content is encrypted/signed with production's secret.
                ...(r.payloadSecret ? { PAYLOAD_SECRET: r.payloadSecret } : {}),
              }),
          })
          return
        }
        case 'import-prod':
          setPhase({
            kind: 'confirm',
            danger: true,
            title:
              'Replace the local Docker `payload` database with a dump from production? ' +
              'The production URL is read (or pulled) automatically. ' +
              'Local data is overwritten and NOT backed up — use Database → Back up local Docker DB ' +
              'first if you need it. Env files are not changed.',
            onYes: () => {
              void (async () => {
                const r = await ensureProductionUrls()
                if (!r) return
                await executeSync(r.dumpUrl)
              })()
            },
          })
          return
        case 'menu-db':
          enterMenu('db')
          return
        case 'menu-payload':
          enterMenu('payload')
          return
        case 'menu-quality':
          enterMenu('quality')
          return
        case 'build':
          await runCapture('pnpm build', ['run', 'build'])
          return
        case 'start':
          launchScript('start')
          return
        case 'prod-style':
          launchScript('dev:prod')
          return
        case 'exit':
          exit()
          return
        case 'back':
          goBack()
          return
        case 'db-up':
          await runCapture('pnpm db:up', ['run', 'db:up'])
          return
        case 'db-down':
          await runCapture('pnpm db:down', ['run', 'db:down'])
          return
        case 'db-backup': {
          setPhase({ kind: 'running', label: 'Starting local Postgres (Docker)…' })
          const ready = await ensureLocalPostgresReady()
          if (!ready.ok) {
            setPhase({ kind: 'done', ok: false, output: ready.message })
            return
          }
          setPhase({ kind: 'running', label: 'Dumping local Docker DB…' })
          const result = await backupLocalDatabase()
          setPhase({ kind: 'done', ok: result.ok, output: result.messages.join('\n') })
          return
        }
        case 'seed': {
          setPhase({ kind: 'running', label: 'Starting local Postgres (Docker)…' })
          const ready = await ensureLocalPostgresReady()
          if (!ready.ok) {
            setPhase({ kind: 'done', ok: false, output: ready.message })
            return
          }
          // POSTGRES_URL is forced local so the seed never touches a remote DB
          // regardless of the .env chain (the script refuses remote URLs too).
          await runCapture('pnpm seed', ['run', 'seed'], { POSTGRES_URL: LOCAL_POSTGRES_DB })
          return
        }
        case 'seed-drop':
          setPhase({
            kind: 'confirm',
            danger: true,
            title:
              'Wipe content collections in the LOCAL Docker database (pages, posts, work pages, ' +
              'content-hub records, taxonomy, forms) and reseed placeholder content? ' +
              'Media and users are kept. Restore real content later via "Pull production content".',
            onYes: () => {
              void (async () => {
                setPhase({ kind: 'running', label: 'Starting local Postgres (Docker)…' })
                const ready = await ensureLocalPostgresReady()
                if (!ready.ok) {
                  setPhase({ kind: 'done', ok: false, output: ready.message })
                  return
                }
                await runCapture('pnpm seed:drop', ['run', 'seed:drop'], {
                  POSTGRES_URL: LOCAL_POSTGRES_DB,
                })
              })()
            },
          })
          return
        case 'env-pull': {
          const v = await checkVercelCli()
          if (!v.ok) {
            setPhase({ kind: 'done', ok: false, output: v.message })
            return
          }
          setPhase({ kind: 'running', label: 'vercel env pull' })
          try {
            await runVercelEnvPull(VERCEL_PULL_ENV_FILE)
            setPhase({
              kind: 'done',
              ok: true,
              output: `Wrote ${path.join(PROJECT_ROOT, VERCEL_PULL_ENV_FILE)}`,
            })
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            setPhase({ kind: 'done', ok: false, output: msg })
          }
          return
        }
        case 'gen-types':
          await runCapture('generate:types', ['run', 'generate:types'])
          return
        case 'gen-importmap':
          await runCapture('generate:importmap', ['run', 'generate:importmap'])
          return
        case 'migrate-create':
          // Only ever create migration files locally — never apply them. The
          // dev DB runs Drizzle push, and Payload forbids mixing push with
          // `migrate` on the same database. Migrations apply only in CI
          // (`pnpm ci`) against production. See README "Database & migrations".
          await runCapture('migrate:create', ['run', 'migrate:create'])
          return
        case 'lint':
          await runCapture('lint', ['run', 'lint'])
          return
        case 'lint-fix':
          await runCapture('lint:fix', ['run', 'lint:fix'])
          return
        case 'test-int':
          await runCapture('test:int', ['run', 'test:int'])
          return
        case 'test-e2e':
          await runCapture('test:e2e', ['run', 'test:e2e'])
          return
        case 'test-all':
          await runCapture('test', ['run', 'test'])
          return
        default:
          return
      }
    },
    [enterMenu, ensureProductionUrls, executeSync, exit, goBack, launchScript, runCapture],
  )

  useInput((input, key) => {
    if (phase.kind === 'done') {
      if (key.return) {
        setPhase({ kind: 'menu' })
      }
      return
    }

    if (phase.kind === 'confirm') {
      if (key.escape) {
        setPhase({ kind: 'menu' })
        return
      }
      if (key.return) {
        const run = phase.onYes
        run()
      }
      return
    }

    if (phase.kind === 'running') {
      return
    }

    if (key.upArrow || (input === 'k' && !key.meta)) {
      setSelected((s) => Math.max(0, s - 1))
      return
    }
    if (key.downArrow || (input === 'j' && !key.meta)) {
      setSelected((s) => Math.min(max, s + 1))
      return
    }
    if (key.return) {
      void handleAction(items[selected].id)
      return
    }
    if (key.escape) {
      if (stack.length > 1) {
        goBack()
      }
      return
    }
    if (input === 'q' && stack.length === 1) {
      exit()
    }
  })

  const title = useMemo(() => {
    if (stack.length === 1) return 'sas-site — dev'
    return `sas-site — ${stack[stack.length - 1]}`
  }, [stack])

  if (phase.kind === 'running') {
    return (
      <Box flexDirection="column">
        <Text color="cyan">
          <Spinner type="dots" /> {phase.label}
        </Text>
      </Box>
    )
  }

  if (phase.kind === 'done') {
    return (
      <Box flexDirection="column">
        <Text bold color={phase.ok ? 'green' : 'red'}>
          {phase.ok ? 'Done' : 'Failed'}
        </Text>
        <Text>{phase.output}</Text>
        <Box marginTop={1}>
          <Text dimColor>Enter — back to menu</Text>
        </Box>
      </Box>
    )
  }

  if (phase.kind === 'confirm') {
    return (
      <Box flexDirection="column">
        <Text bold color={phase.danger ? 'red' : 'yellow'}>
          Confirm
        </Text>
        <Text>{phase.title}</Text>
        <Box marginTop={1}>
          <Text dimColor>Enter — yes · Esc — cancel</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {title}
        </Text>
      </Box>
      {items.map((item, i) => {
        const prefix = i === selected ? '❯ ' : '  '
        const line = item.hint ? `${item.label} — ${item.hint}` : item.label
        return (
          <Text key={item.id} color={i === selected ? 'cyan' : undefined}>
            {prefix}
            {line}
          </Text>
        )
      })}
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>↑/↓ or j/k · Enter · Esc back · q quit</Text>
        {dbFooter.map((line) => (
          <Text key={line} dimColor>
            {line}
          </Text>
        ))}
      </Box>
    </Box>
  )
}
