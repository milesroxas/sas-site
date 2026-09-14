import { afterEach, describe, expect, it } from 'vitest'
import {
  isStreakAdmitted,
  requestStreakLease,
  resetStreakAdmissionForTests,
  streakAdmissionState,
  subscribeStreakAdmission,
} from './admission'
import { STREAK_LIVE_CEILING } from './placement'

afterEach(() => resetStreakAdmissionForTests())

describe('streak admission', () => {
  it('admits up to the ceiling, highest priority first', () => {
    const releaseBlock = requestStreakLease('block', 2)
    const releaseHero = requestStreakLease('hero', 3)
    expect(STREAK_LIVE_CEILING).toBe(1)
    expect(isStreakAdmitted('hero')).toBe(true)
    expect(isStreakAdmitted('block')).toBe(false)
    releaseHero()
    expect(isStreakAdmitted('block')).toBe(true)
    releaseBlock()
    expect(streakAdmissionState().admitted).toEqual([])
  })

  it('keeps arrival order among equal priorities', () => {
    requestStreakLease('a', 1)
    requestStreakLease('b', 1)
    expect(isStreakAdmitted('a')).toBe(true)
    expect(isStreakAdmitted('b')).toBe(false)
  })

  it('is idempotent: a repeated request updates in place and a double release is harmless', () => {
    const first = requestStreakLease('a', 1)
    const second = requestStreakLease('a', 1)
    expect(streakAdmissionState().wanting).toEqual(['a'])
    first()
    first()
    expect(streakAdmissionState().wanting).toEqual([])
    // The second handle refers to the same lease, already gone.
    second()
    expect(streakAdmissionState().wanting).toEqual([])
  })

  it('never lets one slot release another', () => {
    const releaseA = requestStreakLease('a', 1)
    requestStreakLease('b', 1)
    releaseA()
    releaseA()
    expect(streakAdmissionState().wanting).toEqual(['b'])
    expect(isStreakAdmitted('b')).toBe(true)
  })

  it('notifies subscribers only when the admitted set changes', () => {
    let calls = 0
    const unsubscribe = subscribeStreakAdmission(() => {
      calls += 1
    })
    const release = requestStreakLease('a', 1)
    requestStreakLease('b', 0)
    expect(calls).toBe(1)
    release()
    expect(calls).toBe(2)
    unsubscribe()
  })
})
