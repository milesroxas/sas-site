import type React from 'react'
import { Container } from '@/blocks/shared/container'
import { fullViewportSectionClassName, themeClasses } from '@/blocks/shared/section'
import RichText from '@/components/RichText'
import type { HomeStatement as HomeStatementData } from '@/payload-types'
import { cn } from '@/utilities/ui'

export const HomeStatement: React.FC<HomeStatementData> = ({ body }) => {
  if (!body) return null

  return (
    <section className={cn(fullViewportSectionClassName, themeClasses.light, 'items-center')}>
      <Container>
        <RichText
          className="mx-auto max-w-2xl text-center text-2xl leading-snug md:text-3xl [&_p+p]:mt-4"
          data={body}
          enableGutter={false}
          enableProse={false}
          variant="emphasis"
        />
      </Container>
    </section>
  )
}
