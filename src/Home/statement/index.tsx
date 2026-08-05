import type React from 'react'
import { Container } from '@/blocks/shared/container'
import RichText from '@/components/RichText'
import type { HomeStatement as HomeStatementData } from '@/payload-types'

export const HomeStatement: React.FC<HomeStatementData> = ({ body }) => {
  if (!body) return null

  return (
    <section className="flex min-h-[calc(100svh-var(--footer-height))] flex-col items-center justify-center overflow-clip bg-background py-16 text-foreground md:py-24">
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
