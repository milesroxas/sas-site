import { execa } from 'execa'
import { PROJECT_ROOT } from './constants'

export async function which(cmd: string): Promise<string | null> {
  try {
    const r = await execa('which', [cmd], { reject: false })
    if (r.exitCode === 0 && r.stdout.trim()) {
      return r.stdout.trim()
    }
  } catch {
    /* ignore */
  }
  if (process.platform === 'win32') {
    try {
      const r = await execa('where', [cmd], {
        shell: true,
        reject: false,
      })
      if (r.exitCode === 0 && r.stdout.trim()) {
        return r.stdout.split(/\r?\n/)[0]?.trim() ?? null
      }
    } catch {
      /* ignore */
    }
  }
  return null
}

export async function checkDockerAvailable(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const docker = await which('docker')
  if (!docker) {
    return { ok: false, message: 'docker not found in PATH' }
  }
  const r = await execa('docker', ['info'], { reject: false, timeout: 15_000 })
  if (r.exitCode !== 0) {
    return {
      ok: false,
      message: `Docker daemon not reachable: ${r.stderr || r.stdout || 'unknown error'}`,
    }
  }
  return { ok: true }
}

export async function checkComposePostgresUp(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const r = await execa('docker', ['compose', 'ps', 'postgres'], {
    cwd: PROJECT_ROOT,
    reject: false,
  })
  const out = `${r.stdout}\n${r.stderr}`
  if (/\bUp\b/i.test(out) || /running/i.test(out)) {
    return { ok: true }
  }
  if (r.exitCode !== 0 && !out.trim()) {
    return {
      ok: false,
      message: `docker compose ps failed (is Docker running?): ${r.stderr || String(r.exitCode)}`,
    }
  }
  return {
    ok: false,
    message: 'Postgres container is not up. Run: pnpm db:up',
  }
}

export async function checkVercelCli(): Promise<
  { ok: true; path: string } | { ok: false; message: string }
> {
  const v = await which('vercel')
  if (!v) {
    return { ok: false, message: 'vercel CLI not found. Install: npm i -g vercel' }
  }
  return { ok: true, path: v }
}
