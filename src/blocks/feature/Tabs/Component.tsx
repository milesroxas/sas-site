import { resolveRowVisuals } from '@/blocks/shared/row-visuals'
import type { FeatureTabsBlock as FeatureTabsBlockType } from '@/payload-types'
import { FeatureTabs } from './FeatureTabs'

/**
 * Adapter for the flat `{...block}` render map and the story-resolved Work
 * and Lab variants. Each tab's visual slot (upload or Streak Field) resolves
 * here, at the server boundary, so the client strip only ever sees a
 * `Visual`. `bare` is forwarded for callers whose shell owns the band (the
 * Section block, the work-page reveal band).
 */
export const FeatureTabsBlock = (
  props: FeatureTabsBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => (
  <FeatureTabs
    bare={props.bare}
    tabs={resolveRowVisuals(props.tabs)}
    tabSize={props.tabSize}
    theme={props.theme}
  />
)
