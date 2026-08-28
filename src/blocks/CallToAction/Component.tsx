import type React from 'react'
import { Section } from '@/blocks/shared/section'
import { CMSLink } from '@/components/Link'

// Payload website-template pattern: RichText renders embedded blocks, blocks render rich text
// fallow-ignore-next-line circular-dependency
import RichText from '@/components/RichText'
import { Card, CardContent } from '@/components/ui/card'
import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText, theme }) => {
  return (
    <Section theme={theme}>
      <div className="container">
        <Card>
          <CardContent className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-3xl items-center">
              {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
            </div>
            <div className="flex flex-col gap-4">
              {(links || []).map(({ link }, i) => {
                return <CMSLink key={i} size="lg" {...link} />
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
