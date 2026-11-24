import { resolveRowVisuals } from '@/blocks/shared/row-visuals'
import type { TabsBlock as TabsBlockType } from '@/payload-types'
import { TabsView } from './TabsView'

/**
 * Adapter for the flat `{...block}` render map and the story-resolved Work
 * and Lab variants. Each tab's visual slot (upload or Streak Field) resolves
 * here, at the server boundary, so the client strip only ever sees a
 * `Visual`. `bare` is forwarded for callers whose shell owns the band (the
 * Section block, the work-page reveal band).
 */
export const TabsBlock = (
  props: TabsBlockType & { bare?: boolean; disableInnerContainer?: boolean },
) => (
  <TabsView
    bare={props.bare}
    tabs={resolveRowVisuals(props.tabs)}
    tabSize={props.tabSize}
    theme={props.theme}
  />
)
