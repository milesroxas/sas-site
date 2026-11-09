import crypto from 'node:crypto'
import { APIError, type PayloadRequest } from 'payload'
import type { Media, PayloadMcpApiKey, Resource, User } from '@/payload-types'

/**
 * What the agent upload endpoints share: the key lookup, the capability each
 * one needs, and what an upload lands as. `agentMedia.ts` and
 * `agentResources.ts` decide everything else about their own files.
 *
 * MCP tools cannot carry a binary, and an MCP key fails every team-only REST
 * rule by design (`access/authenticated.ts`), so plain `POST /api/media` and
 * `POST /api/resources` stay closed to it. Each endpoint is a narrow door
 * instead of a wider rule.
 */

/** The key collection the MCP plugin creates (`plugins/mcp.ts`). */
const API_KEYS = 'payload-mcp-api-keys'

/**
 * One checkbox per endpoint on the API key (System, API Keys), off by default
 * like every capability: a key that can read a collection cannot add files to
 * it until a team member says so. `plugins/mcp.ts` builds the fields from this.
 */
export const AGENT_UPLOAD_CAPABILITIES = {
  uploadMedia: {
    command: 'pnpm cms:upload <image>',
    label: 'Upload media',
  },
  uploadResources: {
    command: 'pnpm cms:upload <file> --resource',
    label: 'Upload resources',
  },
} as const satisfies Record<keyof PayloadMcpApiKey & `upload${string}`, unknown>

export type AgentUploadCapability = keyof typeof AGENT_UPLOAD_CAPABILITIES

/**
 * What every agent upload lands as. Public on arrival, like any approved
 * asset: the agent's look at the file before uploading is the only check.
 */
export const AGENT_UPLOAD_STATUS = 'public-approved' satisfies Media['usageStatus'] &
  Resource['usageStatus']

/**
 * The team member a key acts as, if the key exists and holds `capability`.
 * Same lookup as the MCP plugin's own (`resolveAccessSettings`): the key is
 * never stored in the clear, only its HMAC under the Payload secret.
 *
 * Marks the request as an agent write, so the house style gate
 * (`plugins/house-style`) checks the copy it saves, as it does for every MCP
 * write, although the request now acts as a team member.
 */
export async function agentUploaderFor(
  req: PayloadRequest,
  capability: AgentUploadCapability,
): Promise<User> {
  const header = req.headers.get('Authorization')
  const key = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
  if (!key) throw new APIError('Send the MCP API key as "Authorization: Bearer <key>".', 401)

  const apiKeyIndex = crypto.createHmac('sha256', req.payload.secret).update(key).digest('hex')
  const { docs } = await req.payload.find({
    collection: API_KEYS,
    depth: 1,
    limit: 1,
    pagination: false,
    where: { apiKeyIndex: { equals: apiKeyIndex } },
  })
  const [apiKey] = docs
  const user = apiKey?.user
  if (!apiKey || !user || typeof user !== 'object') throw new APIError('Unknown API key.', 401)
  if (apiKey[capability] !== true) {
    const { label } = AGENT_UPLOAD_CAPABILITIES[capability]
    throw new APIError(
      `This key may not ${label.toLowerCase()}. A team member can allow it on the key: System, API Keys, "${label}".`,
      403,
    )
  }
  req.context.agentWrite = true
  return { ...user, collection: 'users' }
}

/** A short plain-text input, trimmed; empty when absent or not a string. */
export const agentText = (value: unknown, max: number, name: string): string => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (trimmed.length > max) throw new APIError(`${name} is limited to ${max} characters.`, 400)
  return trimmed
}
