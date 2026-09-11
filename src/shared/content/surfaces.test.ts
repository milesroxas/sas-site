import { describe, expect, it } from 'vitest'
import { surfaceForPath } from './surfaces'

describe('surfaceForPath', () => {
  it('names the section a document path sits under', () => {
    expect(surfaceForPath('/works/interchecks')?.collection).toBe('work-pages')
    expect(surfaceForPath('/who-we-help/platforms-digital-products')?.title).toBe('Who We Help')
    expect(surfaceForPath('/posts/beyond-the-logo')?.collection).toBe('posts')
  })

  it('matches a prefix on its own, but never a longer segment that starts the same', () => {
    expect(surfaceForPath('/contact')?.collection).toBe('contact-pages')
    expect(surfaceForPath('/worksheets')).toBeNull()
  })

  it('has no section for root pages or the homepage', () => {
    expect(surfaceForPath('/about')).toBeNull()
    expect(surfaceForPath('/')).toBeNull()
  })
})
