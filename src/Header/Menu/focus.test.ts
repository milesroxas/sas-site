import { afterEach, describe, expect, it } from 'vitest'
import { focusForKeyboard, lastInputWasKeyboard, trackInputModality } from './focus'

describe('focusForKeyboard', () => {
  let stop: (() => void) | null = null
  afterEach(() => {
    stop?.()
    stop = null
    document.body.innerHTML = ''
  })

  it('moves focus after keyboard input and holds it after pointer input', () => {
    stop = trackInputModality()
    const button = document.createElement('button')
    document.body.appendChild(button)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(lastInputWasKeyboard()).toBe(true)
    expect(focusForKeyboard(button)).toBe(true)
    expect(document.activeElement).toBe(button)
    button.blur()

    window.dispatchEvent(new PointerEvent('pointerdown'))
    expect(lastInputWasKeyboard()).toBe(false)
    expect(focusForKeyboard(button)).toBe(false)
    expect(document.activeElement).toBe(document.body)

    // Modifier-only presses do not flip the modality back.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta' }))
    expect(lastInputWasKeyboard()).toBe(false)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(lastInputWasKeyboard()).toBe(true)
  })

  it('stops listening once every tracker has stopped', () => {
    const stopA = trackInputModality()
    const stopB = trackInputModality()
    window.dispatchEvent(new PointerEvent('pointerdown'))
    expect(lastInputWasKeyboard()).toBe(false)
    stopA()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(lastInputWasKeyboard()).toBe(true)
    stopB()
    window.dispatchEvent(new PointerEvent('pointerdown'))
    expect(lastInputWasKeyboard()).toBe(true)
  })
})
