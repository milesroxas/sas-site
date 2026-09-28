import { describe, expect, it } from 'vitest'
import { blockKeysFor, canonicalAddress, parseBlockEntry } from './match'

describe('canonicalAddress', () => {
  it('lowercases and drops a +tag', () => {
    expect(canonicalAddress(' Jordan+Leads@Northwind.co ')).toBe('jordan@northwind.co')
  })

  it('drops Gmail dots and folds googlemail into gmail', () => {
    expect(canonicalAddress('j.o.r.d.a.n+x@googlemail.com')).toBe('jordan@gmail.com')
  })

  it('keeps dots everywhere else', () => {
    expect(canonicalAddress('jordan.lee@northwind.co')).toBe('jordan.lee@northwind.co')
  })

  it('keeps a name that is nothing but a tag', () => {
    expect(canonicalAddress('+promo@northwind.co')).toBe('+promo@northwind.co')
  })
})

describe('blockKeysFor', () => {
  it('lists the mailbox, the domain and each parent domain, never the bare TLD', () => {
    expect(blockKeysFor('a+b@mail.eu.northwind.co')).toEqual([
      'a@mail.eu.northwind.co',
      'mail.eu.northwind.co',
      'eu.northwind.co',
      'northwind.co',
    ])
  })
})

describe('parseBlockEntry', () => {
  it('reads an address and keys it on the canonical mailbox', () => {
    expect(parseBlockEntry('J.Ordan+x@Gmail.com')).toEqual({
      kind: 'address',
      value: 'j.ordan+x@gmail.com',
      matchKey: 'jordan@gmail.com',
    })
  })

  it('reads a domain in any of its spellings', () => {
    for (const raw of ['northwind.co', '@northwind.co', '*.northwind.co', ' NorthWind.co ']) {
      expect(parseBlockEntry(raw)).toEqual({
        kind: 'domain',
        value: 'northwind.co',
        matchKey: 'northwind.co',
      })
    }
  })

  it('refuses a shared mail provider as a whole domain', () => {
    expect(parseBlockEntry('gmail.com')).toHaveProperty('error')
    expect(parseBlockEntry('@outlook.com')).toHaveProperty('error')
  })

  it('refuses shapes that are neither', () => {
    for (const raw of ['', 'com', 'north wind.co', 'jordan@', 'jordan@northwind', '-bad.co']) {
      expect(parseBlockEntry(raw)).toHaveProperty('error')
    }
  })

  it('matches what it blocks', () => {
    const address = parseBlockEntry('jordan@northwind.co')
    const domain = parseBlockEntry('northwind.co')
    if ('error' in address || 'error' in domain) throw new Error('expected valid entries')
    expect(blockKeysFor('Jordan+2@northwind.co')).toContain(address.matchKey)
    expect(blockKeysFor('anyone@mail.northwind.co')).toContain(domain.matchKey)
    expect(blockKeysFor('anyone@northwind.com')).not.toContain(domain.matchKey)
  })
})
