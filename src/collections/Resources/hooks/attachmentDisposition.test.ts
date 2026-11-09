import { describe, expect, it } from 'vitest'
import { attachmentDisposition } from './attachmentDisposition'

describe('attachmentDisposition', () => {
  it('names a plain file in both forms', () => {
    expect(attachmentDisposition('workbook.pdf')).toBe(
      `attachment; filename="workbook.pdf"; filename*=UTF-8''workbook.pdf`,
    )
  })

  it('keeps the exact UTF-8 name and an ASCII fallback', () => {
    expect(attachmentDisposition('café notes.pdf')).toBe(
      `attachment; filename="caf_ notes.pdf"; filename*=UTF-8''caf%C3%A9%20notes.pdf`,
    )
  })

  it('cannot break out of the quoted name or the encoded one', () => {
    const header = attachmentDisposition(`a"b\\c'd(e).zip`)
    expect(header).toBe(
      `attachment; filename="a_b_c'd(e).zip"; filename*=UTF-8''a%22b%5Cc%27d%28e%29.zip`,
    )
  })
})
