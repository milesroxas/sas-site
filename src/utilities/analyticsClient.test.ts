import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  attachClientCapture,
  captureClientEvent,
  captureCtaClick,
  capturePageNotFound,
  resetClientCapture,
} from './analyticsClient'

describe('captureClientEvent', () => {
  afterEach(() => {
    resetClientCapture()
  })

  it('queues events until the SDK attaches, then drains them in order', () => {
    captureClientEvent('page_not_found', { page_path: '/old' })
    captureClientEvent('cta_clicked', { location: 'header' })

    const capture = vi.fn()
    attachClientCapture(capture)

    expect(capture.mock.calls).toEqual([
      ['page_not_found', { page_path: '/old' }],
      ['cta_clicked', { location: 'header' }],
    ])
  })

  it('sends straight through once attached', () => {
    const capture = vi.fn()
    attachClientCapture(capture)
    captureClientEvent('cta_clicked', { location: 'faq' })
    expect(capture).toHaveBeenCalledWith('cta_clicked', { location: 'faq' })
  })

  it('keeps only the newest events while nothing is attached', () => {
    for (let i = 0; i < 25; i += 1) captureClientEvent('cta_clicked', { i })
    const capture = vi.fn()
    attachClientCapture(capture)
    expect(capture).toHaveBeenCalledTimes(20)
    expect(capture.mock.calls[0][1]).toEqual({ i: 5 })
  })

  it('names the page a call to action was clicked on', () => {
    const capture = vi.fn()
    attachClientCapture(capture)
    window.history.replaceState(null, '', '/expertise/brand-positioning-messaging')
    captureCtaClick({ location: 'closing', label: 'Start a conversation', href: '/contact' })
    expect(capture).toHaveBeenCalledWith('cta_clicked', {
      location: 'closing',
      label: 'Start a conversation',
      href: '/contact',
      page_path: '/expertise/brand-positioning-messaging',
    })
  })

  it('reports the missing path and where the visitor came from', () => {
    const capture = vi.fn()
    attachClientCapture(capture)
    window.history.replaceState(null, '', '/blog/old-post')
    capturePageNotFound()
    expect(capture).toHaveBeenCalledWith('page_not_found', {
      page_path: '/blog/old-post',
      referrer: null,
    })
  })
})
