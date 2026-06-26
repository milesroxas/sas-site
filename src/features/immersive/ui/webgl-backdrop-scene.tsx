'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

/**
 * Lightweight R3F content for the global orthographic canvas: scales to the viewport and stays readable behind hero imagery.
 */
export function WebGlBackdropScene() {
  const meshRef = useRef<Mesh>(null)
  const { viewport } = useThree()
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
      <directionalLight intensity={0.85} position={[6, 8, 10]} />
      <mesh ref={meshRef} position={[0, 0, 0]} scale={scale}>
        <torusKnotGeometry args={[1, 0.32, 160, 24]} />
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
