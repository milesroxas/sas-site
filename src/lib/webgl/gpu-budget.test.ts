import { afterEach, describe, expect, it } from 'vitest'
import {
  GPU_LIVE_CEILING,
  GPU_PRIORITY,
  gpuBudgetState,
  isGpuAdmitted,
  requestGpuLease,
  resetGpuBudgetForTests,
  STREAK_KIND_CEILING,
  subscribeGpuAdmission,
  trackGpuContext,
} from './gpu-budget'

afterEach(() => resetGpuBudgetForTests())

describe('gpu budget', () => {
  it('admits up to the total ceiling, highest priority first', () => {
    expect(GPU_LIVE_CEILING).toBe(3)
    requestGpuLease('leak', 'leak', GPU_PRIORITY.overlay)
    requestGpuLease('gallery', 'gallery', GPU_PRIORITY.block)
    requestGpuLease('lens', 'lens', GPU_PRIORITY.hero)
    requestGpuLease('backdrop', 'backdrop', GPU_PRIORITY.backdrop)
    expect(gpuBudgetState().admitted).toEqual(['lens', 'gallery', 'backdrop'])
    expect(isGpuAdmitted('leak')).toBe(false)
  })

  it('caps the streak kind at one and lets a lower kind through instead', () => {
    expect(STREAK_KIND_CEILING).toBe(1)
    const releaseHero = requestGpuLease('hero', 'streak', GPU_PRIORITY.hero)
    requestGpuLease('block', 'streak', GPU_PRIORITY.block)
    requestGpuLease('leak', 'leak', GPU_PRIORITY.overlay)
    expect(isGpuAdmitted('hero')).toBe(true)
    expect(isGpuAdmitted('block')).toBe(false)
    expect(isGpuAdmitted('leak')).toBe(true)
    releaseHero()
    expect(isGpuAdmitted('block')).toBe(true)
  })

  it('evicts the lowest rank when a higher one arrives, and readmits on release', () => {
    requestGpuLease('leak', 'leak', GPU_PRIORITY.overlay)
    requestGpuLease('lens', 'lens', GPU_PRIORITY.hero)
    requestGpuLease('gallery', 'gallery', GPU_PRIORITY.block)
    expect(isGpuAdmitted('leak')).toBe(true)
    const releaseStreak = requestGpuLease('streak', 'streak', GPU_PRIORITY.block)
    expect(isGpuAdmitted('leak')).toBe(false)
    expect(isGpuAdmitted('streak')).toBe(true)
    releaseStreak()
    expect(isGpuAdmitted('leak')).toBe(true)
  })

  it('keeps arrival order among equal priorities', () => {
    requestGpuLease('a', 'lens', 1)
    requestGpuLease('b', 'lens', 1)
    requestGpuLease('c', 'lens', 1)
    requestGpuLease('d', 'lens', 1)
    expect(gpuBudgetState().admitted).toEqual(['a', 'b', 'c'])
  })

  it('re-ranks a lease whose priority changes in place', () => {
    requestGpuLease('backdrop', 'backdrop', GPU_PRIORITY.idle)
    requestGpuLease('x', 'lens', 1)
    requestGpuLease('y', 'lens', 1)
    requestGpuLease('z', 'lens', 1)
    expect(isGpuAdmitted('backdrop')).toBe(false)
    requestGpuLease('backdrop', 'backdrop', GPU_PRIORITY.hero)
    expect(isGpuAdmitted('backdrop')).toBe(true)
    expect(gpuBudgetState().wanting.map((lease) => lease.id)).toEqual(['backdrop', 'x', 'y', 'z'])
  })

  it('is idempotent: a repeated request updates in place and a double release is harmless', () => {
    const first = requestGpuLease('a', 'streak', 1)
    const second = requestGpuLease('a', 'streak', 1)
    expect(gpuBudgetState().wanting.map((lease) => lease.id)).toEqual(['a'])
    first()
    first()
    expect(gpuBudgetState().wanting).toEqual([])
    // The second handle refers to the same lease, already gone.
    second()
    expect(gpuBudgetState().wanting).toEqual([])
  })

  it('never lets one slot release another', () => {
    const releaseA = requestGpuLease('a', 'streak', 1)
    requestGpuLease('b', 'streak', 1)
    releaseA()
    releaseA()
    expect(gpuBudgetState().wanting.map((lease) => lease.id)).toEqual(['b'])
    expect(isGpuAdmitted('b')).toBe(true)
  })

  it('notifies subscribers only when the admitted set changes', () => {
    let calls = 0
    const unsubscribe = subscribeGpuAdmission(() => {
      calls += 1
    })
    const release = requestGpuLease('a', 'streak', 1)
    requestGpuLease('b', 'streak', 0)
    expect(calls).toBe(1)
    release()
    expect(calls).toBe(2)
    unsubscribe()
  })

  it('keeps a census of live contexts apart from leases, mirrored onto <html>', () => {
    const retire = trackGpuContext('c1', 'leak')
    trackGpuContext('c2', 'streak')
    requestGpuLease('s', 'streak', 1)
    expect(gpuBudgetState().contexts).toEqual([
      { id: 'c1', kind: 'leak' },
      { id: 'c2', kind: 'streak' },
    ])
    const root = document.documentElement.dataset
    expect(root.gpuContexts).toBe('2')
    expect(root.gpuLeases).toBe('1')
    expect(root.gpuAdmitted).toBe('1')
    retire()
    retire()
    expect(gpuBudgetState().contexts).toEqual([{ id: 'c2', kind: 'streak' }])
    expect(root.gpuContexts).toBe('1')
  })
})
