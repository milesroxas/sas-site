import type { ReactNode } from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section, type SectionTheme } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { FigureFrame, type FigureFrameProps } from '@/features/figures/ui/figure-frame'

/**
 * The composition shell every figure block shares: the band, the page column
 * and the 8-column grid. The figure itself is one grid cell (`FigureFrame`
 * places it by `width`), so a figure lines up with the rich text and media
 * around it and never owns vertical spacing.
 *
 * `bare` skips the band for callers that supply their own shell (a Section
 * block's band, or a renderer's reveal band).
 */
export const FigureShell = ({
  bare,
  children,
  theme,
}: {
  bare?: boolean
  children: ReactNode
  theme?: SectionTheme | null
}) => (
  <Section bare={bare} theme={theme}>
    <Container>
      <BlockGrid>{children}</BlockGrid>
    </Container>
  </Section>
)

/**
 * A figure whose stored data today's renderer cannot read (a spec saved by an
 * autosave mid-edit, or one an older schema allowed). The words still stand:
 * the frame keeps the title, caption and text alternative, and says plainly
 * that the drawing is missing rather than showing half of one.
 */
export const FigureUnavailable = (frame: Omit<FigureFrameProps, 'children'>) => (
  <FigureFrame {...frame}>
    <p className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
      This figure cannot be drawn from its current data. Its description is below.
    </p>
  </FigureFrame>
)
