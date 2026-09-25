import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { AskFeedbackProvider } from './feedback'
import { askHandoffTermsFixture, askNextPageFixture, askSourcesFixture } from './fixtures'
import { Handoff } from './HandoffPanel'
import { ASK_HANDOFF_ACTION, ASK_HANDOFF_DRAFT_EMPTY } from './handoff'
import { AskSources } from './Sources'

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

describe('AskSources', () => {
  const sources = askSourcesFixture.map((source) => ({
    type: 'source-url' as const,
    sourceId: source.url,
    url: source.url,
    title: source.title,
  }))

  it('leads with the page to open next, a link titled with its section', () => {
    render(<AskSources next={askNextPageFixture} sources={sources} />)
    const lead = screen.getAllByRole('link')[0]
    expect(lead.getAttribute('href')).toBe(askNextPageFixture.url)
    expect(lead.textContent).toContain(askNextPageFixture.title)
    expect(lead.textContent).toContain('Who We Help')
  })

  it('counts the rest as more sources, never listing the lead twice', () => {
    render(<AskSources next={askNextPageFixture} sources={sources} />)
    const more = screen.getByRole('button', { name: /More sources/ })
    expect(more.textContent).toContain(String(sources.length - 1))
    const hrefs = screen.getAllByRole('link', { hidden: true }).map((a) => a.getAttribute('href'))
    expect(hrefs.filter((href) => href === askNextPageFixture.url)).toHaveLength(1)
  })

  it('is the plain Sources disclosure without a lead', () => {
    render(<AskSources sources={sources} />)
    expect(screen.getByRole('button', { name: /^Sources/ })).toBeTruthy()
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
    replyId: 'a1',
    onSent: () => {},
    turn: 'u1',
    draft: ASK_HANDOFF_DRAFT_EMPTY,
    onDraft: () => {},
  }

  const feedback = { conversation: 'c1', ratings: {}, rate: () => {}, handoff: () => {} }
  const renderHandoff = (kind: 'person' | 'estimate', open: boolean) =>
    render(
      <AskFeedbackProvider value={feedback}>
        <Handoff {...props} kind={kind} open={open} />
      </AskFeedbackProvider>,
    )

  it('arrives as the form when it is open, with what it sends named', () => {
    renderHandoff('person', true)
    expect(screen.getByLabelText(/name/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send to the team' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Not now' })).toBeTruthy()
    expect(screen.getByText('Sends your message to our inbox, never the chat log.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: ASK_HANDOFF_ACTION })).toBeNull()
  })

  it('is one quiet row with a statement and the chip while closed', () => {
    renderHandoff('estimate', false)
    expect(screen.getByRole('button', { name: ASK_HANDOFF_ACTION })).toBeTruthy()
    expect(screen.getByText('A partner can price it with you.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Send to the team' })).toBeNull()
  })
})
