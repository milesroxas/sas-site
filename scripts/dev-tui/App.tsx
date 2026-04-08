import path from 'node:path'
import { Box, Text, useApp, useInput } from 'ink'
import Spinner from 'ink-spinner'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_SYNC_ENV_FILE,
  LOCAL_POSTGRES_DB,
  PROJECT_ROOT,
  VERCEL_PULL_ENV_FILE,
} from './constants'
import { syncProductionToLocal } from './db-sync'
import {
  assertPostgresUrl,
  maskPostgresUrlForDisplay,
  REMOTE_IMPORT_POSTGRES_URL_CHAIN,
  readAppPostgresUrl,
  readPostgresUrlFromEnvChain,
  readPostgresUrlFromFile,
  upsertPostgresUrlInFile,
} from './env'
import { checkComposePostgresUp, checkDockerAvailable, checkVercelCli } from './prereqs'
import { runPnpmCapture, runPnpmScript, runVercelEnvPull } from './run'

type Phase =
  | { kind: 'menu' }
  | { kind: 'running'; label: string }
  | { kind: 'done'; ok: boolean; output: string }
  | { kind: 'confirm'; title: string; danger: boolean; onYes: () => void }
  | { kind: 'input'; title: string; value: string }

type Stack = 'main' | 'db' | 'payload' | 'quality'

const MENU: Record<Stack, { label: string; hint?: string }[]> = {
  main: [
    { label: 'Dev server (pnpm dev)', hint: 'Next.js + hot reload' },
    { label: 'Database…' },
    { label: 'Payload…' },
    { label: 'Quality…' },
    { label: 'Build (pnpm build)' },
    { label: 'Start production build (pnpm start)' },
    { label: 'Full prod-style run (pnpm dev:prod)' },
    { label: 'Exit' },
  ],
  db: [
    { label: 'Docker: start Postgres (pnpm db:up)' },
    { label: 'Docker: stop compose (pnpm db:down)' },
    { label: 'Pull Vercel production env → .env.production.local' },
    {
      label: 'Import production data → local Docker',
      hint: 'pg_dump + restore; does not change POSTGRES_URL (app stays on local by default)',
    },
    {
      label: 'Point app at remote DB',
      hint: `sets POSTGRES_URL in ${DEFAULT_SYNC_ENV_FILE} from ${VERCEL_PULL_ENV_FILE}`,
    },
    {
      label: 'Point app at local Docker (default)',
      hint: `sets POSTGRES_URL in ${DEFAULT_SYNC_ENV_FILE} to ${LOCAL_POSTGRES_DB}`,
    },
    { label: '← Back' },
  ],
  payload: [
    { label: 'Generate TypeScript types (pnpm generate:types)' },
    { label: 'Generate admin import map (pnpm generate:importmap)' },
    { label: 'Run migrations (pnpm payload migrate)' },
    { label: '← Back' },
  ],
  quality: [
    { label: 'Lint (pnpm lint)' },
    { label: 'Lint fix (pnpm lint:fix)' },
    { label: 'Unit tests (pnpm test:int)' },
    { label: 'E2E tests (pnpm test:e2e)' },
    { label: 'All tests (pnpm test)' },
    { label: '← Back' },
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
        setDbFooter([`Active DB: unknown — ${r.error}`, `Local default: ${LOCAL_POSTGRES_DB}`])
        return
      }
      const local = LOCAL_POSTGRES_DB
      if (r.url === local) {
        setDbFooter([`Active DB: local — read from ${r.source}`, local])
      } else {
        setDbFooter([
          `Active DB: remote — ${maskPostgresUrlForDisplay(r.url)}`,
          `Read from ${r.source} — use “Point app at local Docker” to switch back`,
        ])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [phase.kind])

  const goBack = useCallback(() => {
    setSelected(0)
    setStack((s) => (s.length <= 1 ? s : s.slice(0, -1)))
  }, [])

  const runCapture = useCallback(async (label: string, args: string[]) => {
    setPhase({ kind: 'running', label })
    const r = await runPnpmCapture(args)
    const out = [r.stdout, r.stderr].filter(Boolean).join('\n').trim()
    const ok = r.exitCode === 0
    setPhase({
      kind: 'done',
      ok,
      output: out || (ok ? '(no output)' : `Exit code ${r.exitCode ?? 'unknown'}`),
    })
  }, [])

  const handleMainSelect = useCallback(
    async (index: number) => {
      switch (index) {
        case 0:
          unmount()
          queueMicrotask(() => {
            void runPnpmScript('dev').catch((e) => {
              console.error(e)
              process.exitCode = 1
            })
          })
          return
        case 1:
          setStack((s) => [...s, 'db'])
          setSelected(0)
          return
        case 2:
          setStack((s) => [...s, 'payload'])
          setSelected(0)
          return
        case 3:
          setStack((s) => [...s, 'quality'])
          setSelected(0)
          return
        case 4:
          await runCapture('pnpm build', ['run', 'build'])
          return
        case 5:
          unmount()
          queueMicrotask(() => {
            void runPnpmScript('start').catch((e) => {
              console.error(e)
              process.exitCode = 1
            })
          })
          return
        case 6:
          unmount()
          queueMicrotask(() => {
            void runPnpmScript('dev:prod').catch((e) => {
              console.error(e)
              process.exitCode = 1
            })
          })
          return
        case 7:
          exit()
          return
        default:
          return
      }
    },
    [exit, runCapture, unmount],
  )

  const handleDbSelect = useCallback(
    async (index: number) => {
      switch (index) {
        case 0:
          await runCapture('pnpm db:up', ['run', 'db:up'])
          return
        case 1:
          await runCapture('pnpm db:down', ['run', 'db:down'])
          return
        case 2: {
          const v = await checkVercelCli()
          if (!v.ok) {
            setPhase({
              kind: 'done',
              ok: false,
              output: v.message,
            })
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
        case 3: {
          setPhase({
            kind: 'confirm',
            title:
              'Replace local Docker Postgres (payload DB) with a dump from production? Local data will be overwritten (a backup is attempted first). POSTGRES_URL in your env files is not changed.',
            danger: true,
            onYes: () => {
              setPhase({
                kind: 'input',
                title: `Import uses this URL only to read production (pg_dump). App POSTGRES_URL is unchanged unless you use “Point app at remote DB”. Paste a postgres URL, or a path to an env file. If you leave the default or press Enter on ${DEFAULT_SYNC_ENV_FILE}, files are tried in order: ${REMOTE_IMPORT_POSTGRES_URL_CHAIN.join(' → ')}.`,
                value: DEFAULT_SYNC_ENV_FILE,
              })
            },
          })
          return
        }
        case 4: {
          setPhase({
            kind: 'confirm',
            title: `Set POSTGRES_URL in ${DEFAULT_SYNC_ENV_FILE} to the production database from ${VERCEL_PULL_ENV_FILE}? Restart the dev server after. Use “Point app at local Docker” to go back.`,
            danger: true,
            onYes: () => {
              void (async () => {
                setPhase({ kind: 'running', label: 'Applying remote POSTGRES_URL…' })
                const r = await readPostgresUrlFromFile(VERCEL_PULL_ENV_FILE)
                if ('error' in r) {
                  setPhase({
                    kind: 'done',
                    ok: false,
                    output: `${r.error}\n\nRun “Pull Vercel production env” first, or add POSTGRES_URL to ${VERCEL_PULL_ENV_FILE}.`,
                  })
                  return
                }
                const errUrl = assertPostgresUrl(r.url)
                if (errUrl) {
                  setPhase({ kind: 'done', ok: false, output: errUrl })
                  return
                }
                try {
                  await upsertPostgresUrlInFile(DEFAULT_SYNC_ENV_FILE, r.url)
                  setPhase({
                    kind: 'done',
                    ok: true,
                    output: `Updated ${DEFAULT_SYNC_ENV_FILE}. Restart pnpm dev. The app will use the remote database.`,
                  })
                } catch (e) {
                  const msg = e instanceof Error ? e.message : String(e)
                  setPhase({ kind: 'done', ok: false, output: msg })
                }
              })()
            },
          })
          return
        }
        case 5: {
          setPhase({
            kind: 'confirm',
            title: `Set POSTGRES_URL in ${DEFAULT_SYNC_ENV_FILE} to local Docker (${LOCAL_POSTGRES_DB})? Restart the dev server after.`,
            danger: false,
            onYes: () => {
              void (async () => {
                setPhase({ kind: 'running', label: 'Applying local POSTGRES_URL…' })
                try {
                  await upsertPostgresUrlInFile(DEFAULT_SYNC_ENV_FILE, LOCAL_POSTGRES_DB)
                  setPhase({
                    kind: 'done',
                    ok: true,
                    output: `Updated ${DEFAULT_SYNC_ENV_FILE}. Restart pnpm dev. Default: local database.`,
                  })
                } catch (e) {
                  const msg = e instanceof Error ? e.message : String(e)
                  setPhase({ kind: 'done', ok: false, output: msg })
                }
              })()
            },
          })
          return
        }
        case 6:
          goBack()
          return
        default:
          return
      }
    },
    [goBack, runCapture],
  )

  const handlePayloadSelect = useCallback(
    async (index: number) => {
      switch (index) {
        case 0:
          await runCapture('generate:types', ['run', 'generate:types'])
          return
        case 1:
          await runCapture('generate:importmap', ['run', 'generate:importmap'])
          return
        case 2:
          await runCapture('payload migrate', ['payload', 'migrate'])
          return
        case 3:
          goBack()
          return
        default:
          return
      }
    },
    [goBack, runCapture],
  )

  const handleQualitySelect = useCallback(
    async (index: number) => {
      switch (index) {
        case 0:
          await runCapture('lint', ['run', 'lint'])
          return
        case 1:
          await runCapture('lint:fix', ['run', 'lint:fix'])
          return
        case 2:
          await runCapture('test:int', ['run', 'test:int'])
          return
        case 3:
          await runCapture('test:e2e', ['run', 'test:e2e'])
          return
        case 4:
          await runCapture('test', ['run', 'test'])
          return
        case 5:
          goBack()
          return
        default:
          return
      }
    },
    [goBack, runCapture],
  )

  const executeSync = useCallback(async (postgresUrl: string) => {
    setPhase({ kind: 'running', label: 'Checking Docker + Postgres…' })
    const d = await checkDockerAvailable()
    if (!d.ok) {
      setPhase({ kind: 'done', ok: false, output: d.message })
      return
    }
    const p = await checkComposePostgresUp()
    if (!p.ok) {
      setPhase({ kind: 'done', ok: false, output: p.message })
      return
    }
    setPhase({ kind: 'running', label: 'Dumping production + restoring local…' })
    const errUrl = assertPostgresUrl(postgresUrl)
    if (errUrl) {
      setPhase({ kind: 'done', ok: false, output: errUrl })
      return
    }

    const result = await syncProductionToLocal(postgresUrl)
    setPhase({
      kind: 'done',
      ok: result.ok,
      output: result.messages.join('\n'),
    })
  }, [])

  const onSelect = useCallback(async () => {
    if (phase.kind !== 'menu') return
    const idx = selected
    if (current === 'main') await handleMainSelect(idx)
    else if (current === 'db') await handleDbSelect(idx)
    else if (current === 'payload') await handlePayloadSelect(idx)
    else await handleQualitySelect(idx)
  }, [
    current,
    handleDbSelect,
    handleMainSelect,
    handlePayloadSelect,
    handleQualitySelect,
    phase.kind,
    selected,
  ])

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

    if (phase.kind === 'input') {
      if (key.escape) {
        setPhase({ kind: 'menu' })
        return
      }
      if (key.return) {
        const trimmed = phase.value.trim()
        const raw = trimmed || DEFAULT_SYNC_ENV_FILE
        void (async () => {
          if (raw.startsWith('postgres')) {
            await executeSync(raw)
            return
          }
          const useDefaultLookup = !trimmed || trimmed === DEFAULT_SYNC_ENV_FILE
          const r = useDefaultLookup
            ? await readPostgresUrlFromEnvChain(REMOTE_IMPORT_POSTGRES_URL_CHAIN)
            : await readPostgresUrlFromFile(raw)
          if ('error' in r) {
            const hint = useDefaultLookup
              ? `\n\nRun “Pull Vercel production env”, add POSTGRES_URL to .env, or paste the URL here.`
              : ''
            setPhase({ kind: 'done', ok: false, output: r.error + hint })
            return
          }
          await executeSync(r.url)
        })()
        return
      }
      if (key.backspace || key.delete) {
        setPhase((p) => (p.kind === 'input' ? { ...p, value: p.value.slice(0, -1) } : p))
        return
      }
      if (input && !key.ctrl && !key.meta) {
        setPhase((p) => (p.kind === 'input' ? { ...p, value: p.value + input } : p))
      }
      return
    }

    if (phase.kind === 'running') {
      return
    }

    if (key.upArrow) {
      setSelected((s) => Math.max(0, s - 1))
      return
    }
    if (key.downArrow) {
      setSelected((s) => Math.min(max, s + 1))
      return
    }
    if (input === 'k' && !key.meta) {
      setSelected((s) => Math.max(0, s - 1))
      return
    }
    if (input === 'j' && !key.meta) {
      setSelected((s) => Math.min(max, s + 1))
      return
    }
    if (key.return) {
      void onSelect()
      return
    }
    if (key.escape) {
      if (stack.length > 1) {
        goBack()
      }
      return
    }
    if (input === 'q' && stack[0] === 'main' && stack.length === 1) {
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

  if (phase.kind === 'input') {
    return (
      <Box flexDirection="column">
        <Text bold>Input</Text>
        <Text>{phase.title}</Text>
        <Text>
          <Text color="cyan">{phase.value}</Text>
          <Text inverse> </Text>
        </Text>
        <Box marginTop={1}>
          <Text dimColor>Enter — submit · Esc — cancel</Text>
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
          <Text key={`${stack.join('.')}-${i}`} color={i === selected ? 'cyan' : undefined}>
            {prefix}
            {line}
          </Text>
        )
      })}
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>↑/↓ or j/k · Enter · Esc back · q quit</Text>
        {dbFooter.map((line, i) => (
          <Text key={`db-footer-${i}`} dimColor>
            {line}
          </Text>
        ))}
      </Box>
    </Box>
  )
}
