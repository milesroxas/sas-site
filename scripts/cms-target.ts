/**
 * The site and the key an agent's scripts talk to. It has to be the pair the
 * sas-cms MCP client uses, or the two disagree about which database they are
 * in: a media id uploaded to a workspace's dev server does not exist on the
 * production site the MCP drafts on, and the draft would point at nothing.
 *
 * Env: the key from CMS_MCP_API_KEY, else SAS_CMS_MCP_KEY (the name the MCP
 * client configs read). The site from CMS_UPLOAD_SERVER, else
 * NEXT_PUBLIC_SERVER_URL. A local site is refused unless the caller was
 * passed `--local`, which says the MCP client points at that dev server too.
 */
export type CmsTarget = { key: string; server: string }

const isLocal = (server: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(server)

/** The target, or the sentence that says why there is none. */
export function cmsTarget(options: { local: boolean }): CmsTarget | string {
  const key = (process.env.CMS_MCP_API_KEY ?? process.env.SAS_CMS_MCP_KEY)?.trim()
  const server = (process.env.CMS_UPLOAD_SERVER ?? process.env.NEXT_PUBLIC_SERVER_URL)
    ?.trim()
    .replace(/\/$/, '')
  if (!key) return 'set CMS_MCP_API_KEY to the MCP API key (the one the MCP client uses).'
  if (!server) return 'set CMS_UPLOAD_SERVER (or NEXT_PUBLIC_SERVER_URL) to the site to talk to.'
  if (isLocal(server) && !options.local) {
    return `the target is ${server}, a local database. The sas-cms MCP server writes to the site in docs/mcp.md, so an id from here would not exist there. Set CMS_UPLOAD_SERVER to that site, or pass --local if your MCP client points at this dev server.`
  }
  return { key, server }
}
