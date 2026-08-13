import type React from 'react'
import { fullViewportSectionClassName, themeClasses } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { HomeStatement as HomeStatementData } from '@/payload-types'
import { SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD, ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

export const HomeStatement: React.FC<HomeStatementData> = ({ body }) => {
  if (!body) return null

  return (
    <ScrollReveal
      className={cn(fullViewportSectionClassName, themeClasses.light, 'items-center')}
      enterThreshold={SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD}
      variant="intro"
    >
      <Container>
        <div data-reveal>
          <RichText
            className="mx-auto max-w-2xl text-center text-2xl leading-snug md:text-3xl [&_p+p]:mt-4"
            data={body}
            enableGutter={false}
            enableProse={false}
            variant="emphasis"
          />
        </div>
      </Container>
    </ScrollReveal>
  )
}
