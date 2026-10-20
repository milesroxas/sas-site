import { describe, expect, it } from 'vitest'
import { titleWithSuffix } from './generateMeta'

describe('titleWithSuffix', () => {
  it('appends the site name once', () => {
    expect(titleWithSuffix('Contact')).toBe('Contact | Suits & Sandals')
  })

  it('does not double a suffix the editor already typed', () => {
    expect(titleWithSuffix('B2B Web Design Agency | Suits & Sandals')).toBe(
      'B2B Web Design Agency | Suits & Sandals',
    )
    expect(titleWithSuffix('Top 30 List | Suits & Sandals ')).toBe('Top 30 List | Suits & Sandals')
  })

  it('falls back to the bare site name', () => {
    expect(titleWithSuffix(null)).toBe('Suits & Sandals')
    expect(titleWithSuffix(' | Suits & Sandals')).toBe('Suits & Sandals')
  })
})
