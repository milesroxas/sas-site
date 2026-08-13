import type React from 'react'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { Page } from '@/payload-types'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  return (
    <Container width="narrow" className="mt-16">
      {children || (richText && <RichText data={richText} enableGutter={false} />)}
    </Container>
  )
}
