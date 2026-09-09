import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FooterBar } from './FooterBar'

describe('FooterBar', () => {
  afterEach(() => {
    cleanup()
  })

  it('stamps data-chrome-live on a client render and stays on the site theme without a band', () => {
    const { container } = render(<FooterBar>x</FooterBar>)
    const footer = container.querySelector('footer')
    expect(footer).not.toBeNull()
    expect(footer?.hasAttribute('data-chrome-live')).toBe(true)
    expect(footer?.hasAttribute('data-theme')).toBe(false)
  })
})
