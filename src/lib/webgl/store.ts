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
  isActive: boolean
  getWebGLTunnel: () => WebGLTunnelInstance
  getDOMTunnel: () => WebGLTunnelInstance
  activate: () => void
  setActive: (active: boolean) => void
}

export const useWebGLStore = create<WebGLStore>((set, get) => ({
  isActivated: false,
  isActive: false,

  getWebGLTunnel,
  getDOMTunnel,

  activate: () => {
    const state = get()
    if (state.isActivated) return

    set({
      isActivated: true,
      isActive: true,
    })
  },

  setActive: (active: boolean) => {
    set({ isActive: active })
  },
}))
