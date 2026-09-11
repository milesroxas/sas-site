import { describe, expect, it } from 'vitest'
import { redactFreeText } from './redact'

describe('redactFreeText', () => {
  it('leaves an ordinary question alone', () => {
    const question = 'Do you work with healthtech startups on rebrands?'
    expect(redactFreeText(question)).toBe(question)
  })

  it('removes email addresses', () => {
    expect(redactFreeText('Reach me at jane.doe+work@acme.co.uk please')).toBe(
      'Reach me at [email] please',
    )
  })

  it.each([
    '+1 (555) 123-4567',
    '555-123-4567',
    '5551234567',
    '+44 20 7946 0958',
    '4111 1111 1111 1111',
  ])('removes the number in "%s"', (number) => {
    expect(redactFreeText(`Call ${number} today`)).toBe('Call [number] today')
  })

  it.each([
    'Our budget is $50,000',
    'Somewhere between 50k and 100k',
    'Around $50000-100000 all in',
    'Projects from 2019-2024',
    'Can you start by 2026-10-01?',
    'We launched in 2026',
  ])('keeps the figures in "%s"', (question) => {
    expect(redactFreeText(question)).toBe(question)
  })

  it('drops query strings and fragments but keeps the page', () => {
    expect(redactFreeText('Like https://acme.com/work?utm_source=x&token=abc#top')).toBe(
      'Like https://acme.com/work',
    )
  })

  it('keeps a plain URL and a long page slug', () => {
    const question =
      'Is https://suits-sandals.com/works/vault-workforce-screening-case-study yours?'
    expect(redactFreeText(question)).toBe(question)
  })

  it.each([
    'sk-proj-a1B2c3D4e5F6g7H8i9J0',
    'ghp_a1B2c3D4e5F6g7H8i9J0k1L2',
    'AKIAIOSFODNN7EXAMPLE',
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b',
  ])('removes the credential-shaped string "%s"', (secret) => {
    expect(redactFreeText(`my key is ${secret} ok`)).toBe('my key is [secret] ok')
  })
})
