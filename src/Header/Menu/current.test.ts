import { describe, expect, it } from 'vitest'
import { ariaCurrent, menuCurrent } from './current'

describe('ariaCurrent', () => {
  it('marks the row for the page itself', () => {
    expect(ariaCurrent('/about', '/about')).toBe('page')
    expect(ariaCurrent('/works/adacore', '/works/adacore')).toBe('page')
  })

  it('marks a section row the page sits under', () => {
    expect(ariaCurrent('/works', '/works/adacore')).toBe('true')
    expect(ariaCurrent('/contact', '/contact/sales')).toBe('true')
  })

  it('ignores trailing slashes on either side', () => {
    expect(ariaCurrent('/about/', '/about')).toBe('page')
    expect(ariaCurrent('/about', '/about/')).toBe('page')
    expect(ariaCurrent('/works/', '/works/adacore/')).toBe('true')
  })

  it('compares paths only', () => {
    expect(ariaCurrent('/about?ref=menu', '/about')).toBe('page')
    expect(ariaCurrent('/about#team', '/about')).toBe('page')
  })

  it('does not match a sibling that shares a prefix', () => {
    expect(ariaCurrent('/work', '/works')).toBeUndefined()
    expect(ariaCurrent('/about', '/about-us')).toBeUndefined()
  })

  it('never marks the root as a section', () => {
    expect(ariaCurrent('/', '/')).toBe('page')
    expect(ariaCurrent('/', '/about')).toBeUndefined()
  })

  it('never matches off-site or missing rows', () => {
    expect(ariaCurrent('https://example.com/about', '/about')).toBeUndefined()
    expect(ariaCurrent(null, '/about')).toBeUndefined()
    expect(ariaCurrent(undefined, '/about')).toBeUndefined()
  })
})

describe('menuCurrent', () => {
  const rows = ['/works', '/works/adacore', '/contact', null]

  it('marks only the row that is the page when the menu lists it', () => {
    const current = menuCurrent(rows, '/works/adacore')
    expect(current('/works/adacore')).toBe('page')
    expect(current('/works')).toBeUndefined()
    expect(current('/contact')).toBeUndefined()
  })

  it('falls back to the section row when the menu does not list the page', () => {
    const current = menuCurrent(rows, '/works/trialbee-hive')
    expect(current('/works')).toBe('true')
    expect(current('/works/adacore')).toBeUndefined()
  })

  it('marks the page row wherever it sits', () => {
    expect(menuCurrent(rows, '/contact')('/contact')).toBe('page')
    expect(menuCurrent(rows, '/lab')('/works')).toBeUndefined()
  })
})
