import type { ComponentType } from 'react'
import { BESPOKE_COMPONENTS } from '../../registry/components'
import {
  BESPOKE_FIGURES,
  type BespokeFigureId,
  bespokePropsSchema,
} from '../../registry/definitions'
import { readSpec } from '../../spec/read'
import { FigureFrame, type FigureFrameProps, figureIds } from '../figure-frame'

type BespokeFigureProps = Omit<
  FigureFrameProps,
  'children' | 'dataView' | 'dataViewLabel' | 'textAlternative'
> & {
  figure: BespokeFigureId
  /** Stored props, unparsed. Anything the figure's schema rejects falls back to its defaults. */
  props?: unknown
  /** The block's own text alternative; the registry's stands in when it is empty. */
  textAlternative?: null | string
}

/**
 * A registered figure in the shared frame. The drawing is grouped and named by
 * the frame's title and text alternative: a group, not an image, because most
 * bespoke figures carry controls a reader has to be able to reach.
 */
export const BespokeFigure = ({ figure, props, textAlternative, ...frame }: BespokeFigureProps) => {
  const definition = BESPOKE_FIGURES[figure]
  const Figure = BESPOKE_COMPONENTS[figure] as ComponentType<{ props?: unknown }>
  const ids = figureIds(frame.blockId)
  return (
    <FigureFrame {...frame} textAlternative={textAlternative || definition.textAlternative}>
      {/* biome-ignore lint/a11y/useSemanticElements: a fieldset is for form controls; this groups a figure. */}
      <div
        aria-describedby={ids.description}
        aria-label={frame.title ? undefined : definition.label}
        aria-labelledby={frame.title ? ids.title : undefined}
        role="group"
      >
        <Figure props={readSpec(bespokePropsSchema(figure), props ?? {}).spec} />
      </div>
    </FigureFrame>
  )
}
