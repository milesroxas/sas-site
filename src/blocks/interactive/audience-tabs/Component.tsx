import { resolveRowVisuals } from '@/blocks/shared/row-visuals'
import type { AudienceTabsBlock as AudienceTabsBlockType } from '@/payload-types'
import { AudienceTabs } from './AudienceTabs'

/**
 * Adapter for the flat `{...block}` render map. Each tab's visual slot
 * (upload or Streak Field) resolves here, at the server boundary, so the
 * client block only ever sees a `Visual` per tab.
 */
export const AudienceTabsBlock = (props: AudienceTabsBlockType) => (
  <AudienceTabs heading={props.heading} tabs={resolveRowVisuals(props.tabs)} theme={props.theme} />
)
