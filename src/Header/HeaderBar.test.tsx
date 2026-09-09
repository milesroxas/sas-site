import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { HeaderBar } from './HeaderBar'

describe('HeaderBar', () => {
  afterEach(() => {
    cleanup()
  })

  it('stamps data-chrome-live on a client render and stays on the site theme without a band', () => {
    const { container } = render(<HeaderBar menuOpen={false}>x</HeaderBar>)
    const header = container.querySelector('header')
    expect(header).not.toBeNull()
    expect(header?.hasAttribute('data-chrome-live')).toBe(true)
    expect(header?.hasAttribute('data-theme')).toBe(false)
  })
})
