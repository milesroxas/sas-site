import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/**
 * The site and the key an agent's scripts talk to. It has to be the pair the
 * sas-cms MCP client uses, or the two disagree about which database they are
 * in: a media id uploaded to a workspace's dev server does not exist on the
 * production site the MCP drafts on, and the draft would point at nothing.
 *
 * So the pair is read from where the MCP client keeps it: the `sas-cms` server
 * in Claude Code's config (`~/.claude.json`, this project's entry before the
 * machine-wide one). A script is a plain process with no MCP connection of its
 * own, but it can use the same address and key, and then it cannot disagree.
 *
 * Env wins when set, for CI and for other agents: the key from
 * CMS_MCP_API_KEY, else SAS_CMS_MCP_KEY; the site from CMS_UPLOAD_SERVER. With
 * a key in env and no site, NEXT_PUBLIC_SERVER_URL is the site, and a local one
 * is refused unless the caller was passed `--local`, which says the MCP client
 * points at that dev server too.
 */
export type CmsTarget = { key: string; server: string }

const MCP_SERVER = 'sas-cms'

const isLocal = (server: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(server)

type McpServer = { url?: string; headers?: Record<string, string> }
type ClaudeConfig = {
  mcpServers?: Record<string, McpServer>
  projects?: Record<string, { mcpServers?: Record<string, McpServer> }>
}

/** `${VAR}` and `${env:VAR}` in a config value, the way the MCP clients expand them. */
const expand = (value: string) =>
  value.replace(/\$\{(?:env:)?([A-Z0-9_]+)\}/gi, (_, name: string) => process.env[name] ?? '')

/** What the MCP client on this machine connects to, if Claude Code has the server configured. */
function fromClaudeConfig(): CmsTarget | null {
  const path = join(homedir(), '.claude.json')
  if (!existsSync(path)) return null
  try {
    const config = JSON.parse(readFileSync(path, 'utf8')) as ClaudeConfig
    const entry =
      config.projects?.[process.cwd()]?.mcpServers?.[MCP_SERVER] ?? config.mcpServers?.[MCP_SERVER]
    const authorization = Object.entries(entry?.headers ?? {}).find(
      ([name]) => name.toLowerCase() === 'authorization',
    )?.[1]
    const key = authorization
      ? expand(authorization)
          .replace(/^Bearer\s+/i, '')
          .trim()
      : ''
    if (!entry?.url || !key) return null
    return { key, server: new URL(expand(entry.url)).origin }
  } catch {
    return null
  }
}

/** The target, or the sentence that says why there is none. */
export function cmsTarget(options: { local: boolean }): CmsTarget | string {
  const configured = fromClaudeConfig()
  const key =
    (process.env.CMS_MCP_API_KEY ?? process.env.SAS_CMS_MCP_KEY)?.trim() || configured?.key
  const explicit = process.env.CMS_UPLOAD_SERVER?.trim()
  const server = (
    explicit ||
    configured?.server ||
    process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  )?.replace(/\/$/, '')
  if (!key) {
    return `no MCP key: Claude Code has no ${MCP_SERVER} server configured (docs/mcp.md), and CMS_MCP_API_KEY is not set.`
  }
  if (!server) return 'no site: set CMS_UPLOAD_SERVER to the site the MCP server drafts on.'
  if (isLocal(server) && !options.local) {
    return `the target is ${server}, a local database. The ${MCP_SERVER} MCP server writes to the site in docs/mcp.md, so an id from here would not exist there. Set CMS_UPLOAD_SERVER to that site, or pass --local if your MCP client points at this dev server.`
  }
  return { key, server }
}
