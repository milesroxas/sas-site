import { afterEach, describe, expect, it } from 'vitest'
import { clearShallowPath, isShallowPath, replacePathShallow } from './shallow-path'

describe('replacePathShallow', () => {
  afterEach(() => {
    clearShallowPath()
    window.history.replaceState(null, '', '/')
  })

  it('writes the address and records its path as a sync', () => {
    replacePathShallow('/insights/branding')
    expect(window.location.pathname).toBe('/insights/branding')
    expect(isShallowPath('/insights/branding')).toBe(true)
    expect(isShallowPath('/insights')).toBe(false)
  })

  it('records only the latest sync', () => {
    replacePathShallow('/insights/branding')
    replacePathShallow('/insights')
    expect(isShallowPath('/insights')).toBe(true)
    expect(isShallowPath('/insights/branding')).toBe(false)
  })

  it('records the path alone, without search or hash', () => {
    replacePathShallow('/insights/press?from=rail#top')
    expect(isShallowPath('/insights/press')).toBe(true)
  })

  it('forgets the sync once a real navigation clears it', () => {
    replacePathShallow('/insights/branding')
    clearShallowPath()
    expect(isShallowPath('/insights/branding')).toBe(false)
  })
})
