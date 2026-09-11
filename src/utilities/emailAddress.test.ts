import { describe, expect, it } from 'vitest'
import { findEmailAddress } from './emailAddress'

describe('findEmailAddress', () => {
  it('finds an address in running text, normalized', () => {
    expect(findEmailAddress("Can you send me a quote? I'm at Jordan@Northwind.co")).toBe(
      'jordan@northwind.co',
    )
  })

  it('leaves sentence punctuation off the end', () => {
    expect(findEmailAddress('Reach me at jordan@northwind.co.')).toBe('jordan@northwind.co')
    expect(findEmailAddress('Email (jordan@northwind.co), thanks!')).toBe('jordan@northwind.co')
  })

  it('skips shapes that are not addresses', () => {
    expect(findEmailAddress('We met @northwind last week')).toBeNull()
    expect(findEmailAddress('jordan@northwind is my handle')).toBeNull()
    expect(findEmailAddress('What does a website cost?')).toBeNull()
  })
})
