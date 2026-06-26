'use client'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type * as THREE from 'three'
import { CubeCamera, WebGLCubeRenderTarget } from 'three'

export function Preload() {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    async function load() {
      const compile = gl.compileAsync?.bind(gl)
      const invisible: THREE.Object3D[] = []
      scene.traverse((object: THREE.Object3D) => {
        if (object.visible === false && !object.userData?.debug) {
          invisible.push(object)
          object.visible = true
        }
      })

      if (compile) {
        await compile(scene, camera)
      }

      if ('render' in gl && typeof gl.render === 'function') {
        const cubeRenderTarget = new WebGLCubeRenderTarget(128)
        const cubeCamera = new CubeCamera(0.01, 100000, cubeRenderTarget)
        cubeCamera.update(gl as THREE.WebGLRenderer, scene as THREE.Scene)
        cubeRenderTarget.dispose()
      }

      for (const object of invisible) {
        object.visible = false
      }
    }

    void load()
  }, [camera, gl, scene])

  return null
}
