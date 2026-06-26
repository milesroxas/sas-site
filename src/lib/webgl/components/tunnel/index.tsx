'use client'

import { Fragment, type PropsWithChildren, useId } from 'react'
import { useCanvas } from '@/lib/webgl/components/canvas'

export function WebGLTunnel({ children }: PropsWithChildren) {
  const { WebGLTunnel: Tunnel } = useCanvas()
  const uuid = useId()

  if (!Tunnel) return null

  return (
    <Tunnel.In>
      <Fragment key={uuid}>{children}</Fragment>
    </Tunnel.In>
  )
}

export function DOMTunnel({ children }: PropsWithChildren) {
  const { DOMTunnel: Tunnel } = useCanvas()
  const uuid = useId()

  if (!Tunnel) return null

  return (
    <Tunnel.In>
      <Fragment key={uuid}>{children}</Fragment>
    </Tunnel.In>
  )
}
