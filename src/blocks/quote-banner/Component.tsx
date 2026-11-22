import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { isPublicTestimonial } from '@/blocks/shared/public-testimonial'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { QuoteBannerBlock as QuoteBannerData, Testimonial } from '@/payload-types'
import { QuoteBannerSwitcher } from './QuoteBanner.client'
import {
  QuoteBody,
  type QuoteEntry,
  quoteColumnClassName,
  quoteFigureClassName,
} from './QuoteFigure'

type QuoteBannerProps = Pick<QuoteBannerData, 'eyebrow' | 'testimonials' | 'theme'> & {
  bare?: boolean
}

type LexicalNode = { children?: LexicalNode[]; text?: string }

const plainText = (node: LexicalNode): string =>
  node.text ?? (node.children ?? []).map(plainText).join(' ')

/**
 * A quote stored with its own marks keeps them, so the page never doubles
 * them: the `quote-marks` utility only wraps a bare quote.
 */
const hasOwnMarks = (quote: Testimonial['quote']) => {
  const text = plainText(quote.root as LexicalNode)
  return /^\s*["“‘']/.test(text) && /["”’']\s*$/.test(text)
}

const toEntry = (testimonial: Testimonial): QuoteEntry => ({
  id: String(testimonial.id),
  label: testimonial.speakerOrganization || testimonial.speakerName,
  quote: (
    <RichText
      className={hasOwnMarks(testimonial.quote) ? undefined : 'quote-marks'}
      data={testimonial.quote}
      enableGutter={false}
      enableProse={false}
    />
  ),
  speakerName: testimonial.speakerName,
  speakerMeta: [testimonial.speakerRole, testimonial.speakerOrganization]
    .filter(Boolean)
    .join(', '),
})

/**
 * Flush layout: everything starts on column 1 of the page column, so the band
 * lines up with the blocks around it on any theme, a `default` band included.
 * With two or more voices the client row under the quote runs the full page
 * column (`QuoteBannerSwitcher`).
 */
export const QuoteBannerBlock: React.FC<QuoteBannerProps> = ({
  bare,
  eyebrow,
  testimonials,
  theme,
}) => {
  const entries = (testimonials ?? []).filter(isPublicTestimonial).map(toEntry)
  const [first] = entries
  if (!first) return null

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        {entries.length > 1 ? (
          <QuoteBannerSwitcher entries={entries} eyebrow={eyebrow} />
        ) : (
          <BlockGrid>
            <div className={quoteColumnClassName}>
              {eyebrow ? <p className={eyebrowClassName}>{eyebrow}</p> : null}
              <figure className={quoteFigureClassName}>
                <QuoteBody entry={first} />
              </figure>
            </div>
          </BlockGrid>
        )}
      </Container>
    </Section>
  )
}
