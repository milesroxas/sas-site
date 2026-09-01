import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useClickableCard from './useClickableCard'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

// `addTransitionType` ships in the React build Next bundles, not in the bare
// `react` package vitest resolves; the hook calls it inside its transition.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  addTransitionType: vi.fn(),
}))

const HREF = '/posts/hello'

function Fixture() {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  return (
    <div data-testid="card" ref={card.ref}>
      <p data-testid="body">Body copy</p>
      <a data-testid="link" href={HREF} ref={link.ref}>
        Hello
      </a>
    </div>
  )
}

const pointer = (type: string, x: number, y: number, init: PointerEventInit = {}) =>
  new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    isPrimary: true,
    button: 0,
    ...init,
  })

const click = (target: Element, init: MouseEventInit = {}) =>
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))

/** One press: down on `target`, optional travel, up, then the browser's click. */
function press(target: Element, travel = 0, init: MouseEventInit = {}) {
  target.dispatchEvent(pointer('pointerdown', 100, 100))
  if (travel !== 0) document.dispatchEvent(pointer('pointermove', 100 + travel, 100))
  document.dispatchEvent(pointer('pointerup', 100 + travel, 100))
  click(target, init)
}

describe('useClickableCard', () => {
  beforeEach(() => {
    render(<Fixture />)
  })

  afterEach(() => {
    cleanup()
  })

  it('navigates on a press that never moves', () => {
    // The hook pushes the anchor's resolved `href`, not its literal attribute.
    const resolved = (screen.getByTestId('link') as HTMLAnchorElement).href
    press(screen.getByTestId('body'))
    expect(push).toHaveBeenCalledWith(resolved, { scroll: true })
  })

  it('still navigates after a press held far longer than a quick tap', async () => {
    const body = screen.getByTestId('body')
    body.dispatchEvent(pointer('pointerdown', 100, 100))
    await new Promise((resolve) => setTimeout(resolve, 300))
    document.dispatchEvent(pointer('pointerup', 100, 100))
    click(body)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('does not navigate once the pointer travels past the drag slop', () => {
    press(screen.getByTestId('body'), 40)
    expect(push).not.toHaveBeenCalled()
  })

  it('navigates on travel within the slop', () => {
    press(screen.getByTestId('body'), 8)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('marks the card as dragging past the slop and releases it on pointer up', () => {
    const card = screen.getByTestId('card')
    const body = screen.getByTestId('body')

    body.dispatchEvent(pointer('pointerdown', 100, 100))
    document.dispatchEvent(pointer('pointermove', 104, 100))
    expect(card.hasAttribute('data-dragging')).toBe(false)

    document.dispatchEvent(pointer('pointermove', 140, 100))
    expect(card.hasAttribute('data-dragging')).toBe(true)

    document.dispatchEvent(pointer('pointerup', 140, 100))
    expect(card.hasAttribute('data-dragging')).toBe(false)
  })

  it('leaves a drag behind: the next stationary press still navigates', () => {
    press(screen.getByTestId('body'), 40)
    press(screen.getByTestId('body'))
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('leaves modifier clicks to the browser', () => {
    press(screen.getByTestId('body'), 0, { metaKey: true })
    press(screen.getByTestId('body'), 0, { ctrlKey: true })
    press(screen.getByTestId('body'), 0, { shiftKey: true })
    expect(push).not.toHaveBeenCalled()
  })

  it('does not double-navigate when the press starts on the anchor itself', () => {
    press(screen.getByTestId('link'))
    expect(push).not.toHaveBeenCalled()
  })

  it('ignores a click with no press behind it', () => {
    click(screen.getByTestId('body'))
    expect(push).not.toHaveBeenCalled()
  })

  it('ignores a click another handler already prevented', () => {
    const body = screen.getByTestId('body')
    body.dispatchEvent(pointer('pointerdown', 100, 100))
    document.dispatchEvent(pointer('pointerup', 100, 100))
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    event.preventDefault()
    body.dispatchEvent(event)
    expect(push).not.toHaveBeenCalled()
  })
})
