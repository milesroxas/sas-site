'use client'

import type React from 'react'
import { ViewTransition } from 'react'

import {
  NAV_TRANSITION_TYPE,
  PAGE_VIEW_TRANSITION_CLASS,
} from '@/shared/lib/view-transition/constants'

import './view-transition.css'

const updateTransitionClass = {
  default: PAGE_VIEW_TRANSITION_CLASS,
  [NAV_TRANSITION_TYPE]: PAGE_VIEW_TRANSITION_CLASS,
} as const

export function ViewTransitionBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition default={PAGE_VIEW_TRANSITION_CLASS} update={updateTransitionClass}>
      {/* Avoid display:contents — it breaks view-transition snapshots in Chromium. */}
      <div className="relative w-full min-h-0">{children}</div>
    </ViewTransition>
  )
}
