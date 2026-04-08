import { execa } from 'execa'
import { PROJECT_ROOT } from './constants'

export async function runPnpmCapture(
  args: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  const r = await execa('pnpm', args, {
    cwd: PROJECT_ROOT,
    all: true,
    reject: false,
    env: { ...process.env, FORCE_COLOR: '0' },
  })
  const combined =
    typeof (r as { all?: string }).all === 'string'
      ? (r as { all: string }).all
      : [r.stdout, r.stderr].filter(Boolean).join('\n')
  return {
    stdout: combined,
    stderr: r.stderr,
    exitCode: r.exitCode ?? null,
  }
}

/** Run `pnpm run <script>` with inherited stdio (interactive / long-running). */
export async function runPnpmScript(script: string): Promise<void> {
  await execa('pnpm', ['run', script], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  })
}

export async function runVercelEnvPull(targetFile: string): Promise<void> {
  await execa('vercel', ['env', 'pull', targetFile, '--environment=production', '--yes'], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  })
}
