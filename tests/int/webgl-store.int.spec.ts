import { beforeEach, describe, expect, it } from 'vitest'
import { useWebGLStore } from '@/lib/webgl/store'

/**
 * The frame loop must stay held while ANY Preload compile pass is in flight.
 * React StrictMode double-invokes Preload's effect, so passes overlap: the
 * second resolves instantly off three's pipeline cache while the first still
 * awaits createRenderPipelineAsync. A boolean flag drops the gate at that
 * point and WebGPU draws an unresolved pipeline (Dawn: "No pipeline set").
 */
describe('webgl store compile gate', () => {
  beforeEach(() => {
    useWebGLStore.setState({ compilingCount: 0 })
  })

  it('holds the gate until every overlapping compile pass ends', () => {
    const { beginCompiling, endCompiling } = useWebGLStore.getState()

    beginCompiling() // StrictMode effect run A
    beginCompiling() // StrictMode effect run B
    endCompiling() // B resolves instantly via pipeline cache

    expect(useWebGLStore.getState().compilingCount).toBeGreaterThan(0)

    endCompiling() // A's pipeline promises resolve
    expect(useWebGLStore.getState().compilingCount).toBe(0)
  })

  it('never goes negative on unbalanced end calls', () => {
    const { endCompiling } = useWebGLStore.getState()

    endCompiling()
    expect(useWebGLStore.getState().compilingCount).toBe(0)
  })
})
