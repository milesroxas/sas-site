import { describe, expect, it } from 'vitest'
import {
  generateInquiryReference,
  INQUIRY_BUDGETS,
  INQUIRY_OPEN_STATUSES,
  INQUIRY_STATUSES,
  inquiryOptionLabel,
} from './inquiry'

describe('generateInquiryReference', () => {
  it('is a prefixed four-character code', () => {
    expect(generateInquiryReference(() => 0)).toBe('SS-0000')
    expect(generateInquiryReference()).toMatch(/^SS-[0-9A-Z]{4}$/)
  })

  it('leaves out the glyphs that get misread aloud', () => {
    // 32 draws, each landing on a different slot in the alphabet.
    const alphabet = new Set(
      Array.from({ length: 32 }, (_, index) =>
        generateInquiryReference(() => index / 32).slice(3, 4),
      ),
    )
    expect(alphabet.size).toBe(32)
    for (const ambiguous of ['I', 'L', 'O', 'U']) {
      expect(alphabet.has(ambiguous)).toBe(false)
    }
  })
})

describe('inquiryOptionLabel', () => {
  it('reads a stored value back as the label a person wrote', () => {
    expect(inquiryOptionLabel(INQUIRY_BUDGETS, '50-100k')).toBe('50–100K')
  })

  it('has no answer for a value that is not in the list', () => {
    expect(inquiryOptionLabel(INQUIRY_BUDGETS, 'unlimited')).toBeUndefined()
    expect(inquiryOptionLabel(INQUIRY_BUDGETS, null)).toBeUndefined()
  })
})

describe('INQUIRY_OPEN_STATUSES', () => {
  it('only names statuses the collection actually offers', () => {
    const known = new Set(INQUIRY_STATUSES.map((status) => status.value))
    for (const status of INQUIRY_OPEN_STATUSES) {
      expect(known.has(status)).toBe(true)
    }
  })
})
