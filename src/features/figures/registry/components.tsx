import type { ComponentType } from 'react'
import CurlVsGradient from '../ui/bespoke/curl-vs-gradient'
import DashAnatomy from '../ui/bespoke/dash-anatomy'
import type { BespokeFigureId, BespokeFigureProps } from './definitions'

/**
 * The component for every registered id. `satisfies` is the check that keeps
 * this file and `./definitions` in step: an id declared there with no entry
 * here does not compile, and neither does an entry whose props disagree.
 *
 * Each is a client component, so Next ships its code only with pages that
 * render it, and its server render at the starting props is the static
 * fallback a reader without JavaScript sees.
 */
export const BESPOKE_COMPONENTS = {
  'streak-curl-vs-gradient-v1': CurlVsGradient,
  'streak-dash-anatomy-v1': DashAnatomy,
} satisfies { [Id in BespokeFigureId]: ComponentType<{ props?: BespokeFigureProps<Id> }> }
