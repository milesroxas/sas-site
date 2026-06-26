'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

// Hoisted so JSX never allocates fresh arrays per render (perf-avoid-inline-objects).
const LIGHT_POSITION: [number, number, number] = [6, 8, 10]
const MESH_POSITION: [number, number, number] = [0, 0, 0]
const KNOT_ARGS: [number, number, number, number] = [1, 0.32, 160, 24]

/**
 * Lightweight R3F content for the global orthographic canvas: scales to the viewport and stays readable behind hero imagery.
 */
export function WebGlBackdropScene() {
  const meshRef = useRef<Mesh>(null)
  // Select only viewport; `useThree()` (no selector) re-renders on any R3F state change (perf-zustand-selectors).
  const viewport = useThree((state) => state.viewport)
  const scale = Math.min(viewport.width, viewport.height) * 0.22

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.rotation.x += delta * 0.12
    mesh.rotation.y += delta * 0.18
  })

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight intensity={0.85} position={LIGHT_POSITION} />
      <mesh ref={meshRef} position={MESH_POSITION} scale={scale}>
        <torusKnotGeometry args={KNOT_ARGS} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#2e1065"
          emissiveIntensity={0.45}
          metalness={0.35}
          roughness={0.42}
        />
      </mesh>
    </>
  )
}
