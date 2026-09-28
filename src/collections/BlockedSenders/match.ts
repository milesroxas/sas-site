import type { SelectOption } from '@/shared/content/options'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'

/**
 * What a blocked-sender entry covers, and how a sender is matched against it.
 *
 * Pure on purpose: the entry form, the inquiry intake and the tests all read
 * these rules, so a sender is judged the same way wherever it is checked.
 */

export const BLOCK_KINDS = [
  { label: 'Address', value: 'address' },
  { label: 'Domain', value: 'domain' },
] as const satisfies readonly SelectOption[]

export type BlockKind = (typeof BLOCK_KINDS)[number]['value']

/** An entry as stored: what was typed (normalized), what it covers, and the key it is looked up by. */
export type BlockEntry = { kind: BlockKind; value: string; matchKey: string }

/**
 * Mail providers where one domain is millions of unrelated people. A domain
 * block on any of them would discard every lead who uses it, so these are
 * blocked address by address only.
 */
const SHARED_MAIL_DOMAINS: ReadonlySet<string> = new Set([
  '163.com',
  'aol.com',
  'att.net',
  'btinternet.com',
  'comcast.net',
  'fastmail.com',
  'gmail.com',
  'gmx.com',
  'gmx.net',
  'googlemail.com',
  'hey.com',
  'hotmail.co.uk',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'mac.com',
  'mail.com',
  'me.com',
  'msn.com',
  'outlook.com',
  'pm.me',
  'proton.me',
  'protonmail.com',
  'qq.com',
  'sbcglobal.net',
  'verizon.net',
  'web.de',
  'yahoo.co.uk',
  'yahoo.com',
  'yandex.com',
  'zoho.com',
])

/** Gmail ignores dots in the name and answers for both domains. */
const GMAIL_DOMAINS: ReadonlySet<string> = new Set(['gmail.com', 'googlemail.com'])

/** Two or more DNS labels (letters, digits, inner hyphens), ASCII only. */
const DOMAIN_PATTERN =
  /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$/

/** Typed as `name@…`: an address entry. Anything else is read as a domain. */
const ADDRESS_SHAPE = /^[^@]+@/

const splitAddress = (address: string) => {
  const at = address.lastIndexOf('@')
  return { local: address.slice(0, at), domain: address.slice(at + 1) }
}

/**
 * The mailbox an address delivers to, which is what an address block is
 * keyed on. A `+tag` (RFC 5233 subaddressing) and Gmail's ignored dots each
 * give one inbox endless spellings, and a blocked sender tries the next one.
 */
export function canonicalAddress(email: string): string {
  const { local, domain } = splitAddress(normalizeEmailAddress(email))
  const untagged = local.split('+')[0] || local
  if (GMAIL_DOMAINS.has(domain)) return `${untagged.replaceAll('.', '') || untagged}@gmail.com`
  return `${untagged}@${domain}`
}

/**
 * Every entry key that stops this sender: the canonical mailbox, then its
 * domain and each parent domain, so a block on `example.com` also covers
 * `mail.example.com`. A bare top-level domain is never a key.
 */
export function blockKeysFor(email: string): string[] {
  const address = canonicalAddress(email)
  const labels = splitAddress(address).domain.split('.')
  return [address, ...labels.slice(0, -1).map((_, index) => labels.slice(index).join('.'))]
}

/**
 * An entry as someone typed it, read as an address or a domain.
 * `@example.com` and `*.example.com` are accepted spellings of a domain.
 */
export function parseBlockEntry(raw: string): BlockEntry | { error: string } {
  const value = normalizeEmailAddress(raw)
  if (!value) return { error: 'Enter an email address or a domain.' }

  if (ADDRESS_SHAPE.test(value)) {
    return isValidEmailAddress(value)
      ? { kind: 'address', value, matchKey: canonicalAddress(value) }
      : { error: 'That is not a complete email address.' }
  }

  const domain = value.replace(/^(\*\.|@)/, '')
  if (!DOMAIN_PATTERN.test(domain)) {
    return { error: 'Enter a domain like example.com, or a full email address.' }
  }
  if (SHARED_MAIL_DOMAINS.has(domain)) {
    return {
      error: `${domain} is a shared mail provider. Blocking it would discard everyone who uses it, so block the address instead.`,
    }
  }
  return { kind: 'domain', value: domain, matchKey: domain }
}
