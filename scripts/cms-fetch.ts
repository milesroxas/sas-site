import { cmsTarget } from './cms-target'

/**
 * One document, read the way an agent reads it: a `find*` tool call over the
 * MCP endpoint with the MCP key, so a script checks the same draft on the
 * same site the agent drafted on (`cms-target.ts` says how the pair is found).
 * A plain JSON-RPC POST; the tool answers with a line of words, the document,
 * then sometimes a fence.
 */
export async function fetchDocument(
  tool: string,
  id: string | number,
  options: { local: boolean },
): Promise<Record<string, unknown>> {
  const target = cmsTarget(options)
  if (typeof target === 'string') throw new Error(target)
  const response = await fetch(`${target.server}/api/mcp`, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { arguments: { draft: true, id: Number(id) }, name: tool },
    }),
    headers: {
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${target.key}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  if (!response.ok) throw new Error(`${target.server} answered ${response.status}.`)
  const body = await response.text()
  const data = body.startsWith('{') ? body : (body.match(/^data: (.*)$/m)?.[1] ?? '')
  const text: string | undefined = JSON.parse(data).result?.content?.[0]?.text
  const start = text?.indexOf('{') ?? -1
  if (!text || start === -1)
    throw new Error(`No document ${id} from ${tool} on ${target.server}: ${text}`)
  const loaded = JSON.parse(text.slice(start).replace(/\n```\s*$/, '')) as {
    docs?: Record<string, unknown>[]
  }
  return loaded.docs?.[0] ?? (loaded as Record<string, unknown>)
}

/** The `find*` tool for a collection slug: `lab-projects` reads with `findLabProjects`. */
export const findToolFor = (collection: string): string =>
  `find${collection
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}`
