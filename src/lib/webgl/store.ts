import tunnel from 'tunnel-rat'
import { create } from 'zustand'

type WebGLTunnelInstance = ReturnType<typeof tunnel>

let webGLTunnelSingleton: WebGLTunnelInstance | null = null
let domTunnelSingleton: WebGLTunnelInstance | null = null

function getWebGLTunnel(): WebGLTunnelInstance {
  if (!webGLTunnelSingleton) {
    webGLTunnelSingleton = tunnel()
  }
  return webGLTunnelSingleton
}

function getDOMTunnel(): WebGLTunnelInstance {
  if (!domTunnelSingleton) {
    domTunnelSingleton = tunnel()
  }
  return domTunnelSingleton
}

type WebGLStore = {
  isActivated: boolean
  /** True while at least one consumer holds an activity lease. */
  isActive: boolean
  /** Open leases; `isActive` is derived from it, never set directly by a consumer. */
  activeLeases: number
  /**
   * Number of Preload compile passes in flight. The frame loop must not render
   * while this is nonzero: WebGPU pipelines created by compileAsync are pending
   * promises, and drawing an object whose pipeline hasn't resolved makes Dawn
   * reject the draw with "No pipeline set". A count (not a boolean) because
   * passes overlap — React StrictMode double-invokes Preload's effect, and the
   * second pass resolves instantly off three's pipeline cache while the first
   * still awaits createRenderPipelineAsync.
   */
  compilingCount: number
  getWebGLTunnel: () => WebGLTunnelInstance
  getDOMTunnel: () => WebGLTunnelInstance
  activate: () => void
  /**
   * Hold the canvas active until the returned release is called. Reference
   * counted and idempotent: one provider unmounting never deactivates the
   * canvas for another that still holds a lease.
   */
  acquireActive: () => () => void
  beginCompiling: () => void
  endCompiling: () => void
}

export const useWebGLStore = create<WebGLStore>((set, get) => ({
  isActivated: false,
  isActive: false,
  activeLeases: 0,
  compilingCount: 0,

  getWebGLTunnel,
  getDOMTunnel,

  activate: () => {
    const state = get()
    if (state.isActivated) return

    set({ isActivated: true })
  },

  acquireActive: () => {
    set((state) => ({ activeLeases: state.activeLeases + 1, isActive: true }))
    let released = false
    return () => {
      if (released) return
      released = true
      set((state) => {
        const activeLeases = Math.max(0, state.activeLeases - 1)
        return { activeLeases, isActive: activeLeases > 0 }
      })
    }
  },

  beginCompiling: () => {
    set((state) => ({ compilingCount: state.compilingCount + 1 }))
  },

  endCompiling: () => {
    set((state) => ({ compilingCount: Math.max(0, state.compilingCount - 1) }))
  },
}))
