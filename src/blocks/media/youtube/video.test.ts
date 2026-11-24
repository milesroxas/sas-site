import { describe, expect, it } from 'vitest'
import { parseYouTube, watchUrl } from './video'

describe('parseYouTube', () => {
  it('reads the id from every form YouTube hands out', () => {
    const forms = [
      'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      'https://m.youtube.com/watch?v=jNQXAC9IVRw&feature=share',
      'https://youtu.be/jNQXAC9IVRw',
      'https://www.youtube.com/shorts/jNQXAC9IVRw',
      'https://www.youtube.com/live/jNQXAC9IVRw',
      'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw',
      'youtube.com/watch?v=jNQXAC9IVRw',
      'jNQXAC9IVRw',
    ]
    for (const form of forms) expect(parseYouTube(form)).toEqual({ id: 'jNQXAC9IVRw' })
  })

  it('reads a start time in either form YouTube writes it', () => {
    expect(parseYouTube('https://youtu.be/jNQXAC9IVRw?t=90')).toEqual({
      id: 'jNQXAC9IVRw',
      start: 90,
    })
    expect(parseYouTube('https://www.youtube.com/watch?v=jNQXAC9IVRw&t=90s')).toEqual({
      id: 'jNQXAC9IVRw',
      start: 90,
    })
    expect(parseYouTube('https://www.youtube.com/watch?v=jNQXAC9IVRw&t=1h2m3s')).toEqual({
      id: 'jNQXAC9IVRw',
      start: 3723,
    })
    expect(parseYouTube('https://www.youtube.com/embed/jNQXAC9IVRw?start=30')).toEqual({
      id: 'jNQXAC9IVRw',
      start: 30,
    })
  })

  it('keeps a good link when its time is unreadable', () => {
    expect(parseYouTube('https://youtu.be/jNQXAC9IVRw?t=soon')).toEqual({ id: 'jNQXAC9IVRw' })
    expect(parseYouTube('https://youtu.be/jNQXAC9IVRw?t=0')).toEqual({ id: 'jNQXAC9IVRw' })
  })

  it('rejects anything that is not a YouTube video', () => {
    const rejected = [
      '',
      '   ',
      null,
      undefined,
      'https://vimeo.com/76979871',
      'https://www.youtube.com/@suitsandsandals',
      'https://www.youtube.com/watch?v=tooshort',
      'not a url at all',
    ]
    for (const input of rejected) expect(parseYouTube(input)).toBeNull()
  })
})

describe('watchUrl', () => {
  it('keeps the start time so the no-JS fallback lands where the embed would', () => {
    expect(watchUrl({ id: 'jNQXAC9IVRw' })).toBe('https://www.youtube.com/watch?v=jNQXAC9IVRw')
    expect(watchUrl({ id: 'jNQXAC9IVRw', start: 90 })).toBe(
      'https://www.youtube.com/watch?v=jNQXAC9IVRw&t=90',
    )
  })
})
