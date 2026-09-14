'use client'

import { useEffect, useSyncExternalStore } from 'react'
import {
  type GpuLeaseKind,
  isGpuAdmitted,
  requestGpuLease,
  subscribeGpuAdmission,
} from './gpu-budget'

/**
 * Hold a lease on the document's GPU budget while `wanted`, and report
 * whether this effect is among the admitted ones. Release is idempotent;
 * the effect's cleanup is the one place it happens. Server and hydration
 * render `false`, so no canvas is admitted before the client is in charge.
 */
export function useGpuLease(
  id: string,
  wanted: boolean,
  kind: GpuLeaseKind,
  priority: number,
): boolean {
  useEffect(() => {
    if (!wanted) return
    return requestGpuLease(id, kind, priority)
  }, [id, wanted, kind, priority])
  return useSyncExternalStore(
    subscribeGpuAdmission,
    () => wanted && isGpuAdmitted(id),
    () => false,
  )
}
