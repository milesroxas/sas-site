import { describe, expect, it } from 'vitest'
import { formatPostalAddress } from './address'

describe('formatPostalAddress', () => {
  it('sets the studio address as a two-line postal block', () => {
    expect(
      formatPostalAddress({
        streetAddress: '240 Kent Ave',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11249',
        country: 'US',
      }),
    ).toEqual(['240 Kent Ave', 'Brooklyn, NY 11249'])
  })

  it('drops missing parts without stray punctuation', () => {
    expect(formatPostalAddress({ city: 'Brooklyn', postalCode: '11249' })).toEqual([
      'Brooklyn 11249',
    ])
    expect(formatPostalAddress({ streetAddress: ' 240 Kent Ave ' })).toEqual(['240 Kent Ave'])
  })

  it('returns no lines for an empty address', () => {
    expect(formatPostalAddress(undefined)).toEqual([])
    expect(formatPostalAddress({ streetAddress: '', city: null })).toEqual([])
  })
})
