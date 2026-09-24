import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { AskFeedbackProvider } from './feedback'
import { askHandoffTermsFixture, askNextPageFixture } from './fixtures'
import { Handoff } from './HandoffPanel'
import { AskNextPageCard } from './Sources'

vi.mock('@/components/ui/message-scroller', () => ({
  useMessageScroller: () => ({ scrollToMessage: vi.fn() }),
}))

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
})

afterEach(cleanup)

describe('AskNextPageCard', () => {
  it('is a link to the page, titled, with its section', () => {
    render(<AskNextPageCard page={askNextPageFixture} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe(askNextPageFixture.url)
    expect(link.textContent).toContain(askNextPageFixture.title)
    expect(link.textContent).toContain('Who We Help')
  })
})

describe('Handoff', () => {
  const props = {
    terms: askHandoffTermsFixture,
    messages: [
      {
        id: 'u1',
        role: 'user' as const,
        parts: [{ type: 'text' as const, text: 'Please send this to the team' }],
      },
    ],
    itemId: 'a1:handoff',
    onSent: () => {},
    turn: 'u1',
  }

  const feedback = { conversation: 'c1', ratings: {}, rate: () => {}, handoff: () => {} }
  const renderHandoff = (kind: 'person' | 'estimate') =>
    render(
      <AskFeedbackProvider value={feedback}>
        <Handoff {...props} kind={kind} />
      </AskFeedbackProvider>,
    )

  it('opens straight into the form when the visitor asked for a person', () => {
    renderHandoff('person')
    expect(screen.getByLabelText(/name/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send to the team' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Talk to the team' })).toBeNull()
  })

  it('stays a quiet offer for a kind the visitor did not ask for', () => {
    renderHandoff('estimate')
    expect(screen.getByRole('button', { name: 'Talk to the team' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Send to the team' })).toBeNull()
  })
})
