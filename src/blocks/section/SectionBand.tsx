import type { ReactNode } from 'react'
import { Section, STACK_SPACING } from '@/blocks/shared/section'
import { cn } from '@/utilities/ui'
import {
  resolveSectionSpacing,
  SECTION_THEME_TO_BAND,
  type SectionBlockSpacing,
  type SectionBlockTheme,
} from './shared'

/**
 * The band a Section block paints, shared by every renderer (Pages/Home,
 * work, lab) so the editor vocabulary resolves to surfaces and rhythm in one
 * place. Children are the section's nested blocks, each rendered `bare` by
 * its renderer: the band and its internal stack live here and nowhere else.
 *
 * `customize` off ignores any previously stored theme/spacing/stack:
 * unchecking the box must restore the defaults even though the hidden fields
 * keep their values.
 */
export const SectionBand = ({
  children,
  className,
  customize,
  spacing,
  stack,
  theme,
}: {
  children: ReactNode
  className?: string
  customize?: boolean | null
  spacing?: SectionBlockSpacing | null
  stack?: SectionBlockSpacing | null
  theme?: SectionBlockTheme | null
}) => (
  <Section
    className={cn(STACK_SPACING[resolveSectionSpacing(customize, stack)], className)}
    spacing={resolveSectionSpacing(customize, spacing)}
    theme={SECTION_THEME_TO_BAND[(customize && theme) || 'inherit']}
  >
    {children}
  </Section>
)
