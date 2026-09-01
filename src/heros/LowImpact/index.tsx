import type React from 'react'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import { HeroEyebrow, HeroTitle } from '@/heros/shared'
import type { Page } from '@/payload-types'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      eyebrow?: Page['hero']['eyebrow']
      title?: Page['hero']['title']
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

// fallow-ignore-next-line complexity -- CRAP flags coverage gap; conditional JSX is idiomatic
export const LowImpactHero: React.FC<LowImpactHeroType> = ({
  children,
  eyebrow,
  richText,
  title,
}) => {
  return (
    <div className="bg-background pt-12 pb-24 text-foreground">
      <Container className="flex flex-col items-start gap-12">
        {(eyebrow || title) && (
          <div className="flex flex-col items-start gap-6">
            <HeroEyebrow eyebrow={eyebrow} />
            <HeroTitle title={title} />
          </div>
        )}
        {(children || richText) && (
          <div className="max-w-sm text-sm/relaxed">
            {children ||
              (richText && <RichText data={richText} enableGutter={false} enableProse={false} />)}
          </div>
        )}
      </Container>
    </div>
  )
}
