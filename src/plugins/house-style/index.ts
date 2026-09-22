import {
  type CollectionBeforeChangeHook,
  type PayloadRequest,
  type Plugin,
  ValidationError,
} from 'payload'
import { gateFindings, type VoiceFinding } from '@/features/editorial/voice'

/**
 * The house voice at the document boundary (docs/editorial/voice.md). An
 * agent writing over MCP is told the style in the server instructions and in
 * its skills, and still slips: an em dash in a caption, "seamless" in a beat.
 * A rule that only lives in a prompt is a request. This hook makes the exact
 * part of it a refusal, the way the figures plugin refuses a bad spec: every
 * problem in one error, each with the path Payload reports on, because the
 * MCP tools relay `error.message` and nothing else.
 *
 * Who is gated: a request authenticated as anything but a team member, which
 * on this site is an MCP API key (`src/access/authenticated.ts`). A person in
 * the admin is never refused: a quotation or a client's own words may hold a
 * phrase the doc bans, and that is their call. A visitor's form has no user
 * and is not copy. Autosave is exempt, as it is for figures.
 *
 * What is read: every string in the incoming data, at any depth, except the
 * fields that are not copy (`SKIPPED_KEYS`) and the body of a `code` block.
 * Lexical is walked like any object, so its text nodes are read and its
 * `type`, `format` and `direction` keys are not.
 */

const SKIPPED_KEYS: ReadonlySet<string> = new Set([
  'id',
  '_status',
  'blockType',
  'blockName',
  'type',
  'mode',
  'format',
  'direction',
  'style',
  'tag',
  'listType',
  'key',
  'slug',
  'url',
  'href',
  'src',
  'filename',
  'mimeType',
  'language',
  'figure',
  'spec',
  'geometry',
  'props',
  'code',
  'markdown',
  'email',
  'password',
  'apiKey',
  'internalNotes',
])

type FieldError = { message: string; path: string }

/** Every copy string in a document, at any depth, with the data path Payload reports errors on. */
const copyStrings = (value: unknown, path = '', found: { path: string; text: string }[] = []) => {
  if (typeof value === 'string') {
    if (path) found.push({ path, text: value })
    return found
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      copyStrings(item, path ? `${path}.${index}` : String(index), found)
    })
    return found
  }
  if (!value || typeof value !== 'object') return found
  const { blockType } = value as { blockType?: unknown }
  if (blockType === 'code') return found
  for (const [key, child] of Object.entries(value)) {
    if (SKIPPED_KEYS.has(key)) continue
    copyStrings(child, path ? `${path}.${key}` : key, found)
  }
  return found
}

const describe = (findings: VoiceFinding[]): string => {
  const dashes = findings.filter((finding) => finding.rule === 'em-dash').length
  const phrases = [
    ...new Set(findings.filter((f) => f.rule === 'avoid-phrase').map((f) => f.match)),
  ]
  const parts: string[] = []
  if (dashes > 0)
    parts.push(
      `${dashes === 1 ? 'an em dash' : `${dashes} em dashes`}: recast with a comma, a colon, parentheses or a period`,
    )
  if (phrases.length > 0)
    parts.push(
      `${phrases.map((phrase) => `"${phrase}"`).join(', ')}: language the house voice avoids (docs/editorial/voice.md); say the specific thing instead`,
    )
  return parts.join('; ')
}

const isApiKeyUser = (req: PayloadRequest): boolean =>
  Boolean(req.user) && req.user?.collection !== 'users'

const isAutosave = (req: PayloadRequest): boolean => req.query?.autosave === 'true'

export const refuseOffVoiceCopy: CollectionBeforeChangeHook = ({ collection, data, req }) => {
  if (!isApiKeyUser(req) || isAutosave(req)) return data
  const errors: FieldError[] = copyStrings(data).flatMap(({ path, text }) => {
    const findings = gateFindings(text)
    return findings.length ? [{ message: describe(findings), path }] : []
  })
  if (errors.length)
    throw new ValidationError({
      collection: collection.slug,
      errors: errors.map(({ message, path }) => ({
        label: `${path} (${message})`,
        message,
        path,
      })),
      req,
    })
  return data
}

/** Attaches the gate to every collection: every one of them holds copy somewhere. */
export const houseStylePlugin = (): Plugin => (config) => ({
  ...config,
  collections: config.collections?.map((collection) => ({
    ...collection,
    hooks: {
      ...collection.hooks,
      beforeChange: [...(collection.hooks?.beforeChange ?? []), refuseOffVoiceCopy],
    },
  })),
})
