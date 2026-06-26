import type React from 'react'
import type { CSSProperties } from 'react'
import { Card, type CardPostData } from '@/components/Card'
import { RevealSection } from '@/shared/ui/reveal-section'
import { cn } from '@/utilities/ui'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <RevealSection className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div
                  className="col-span-4 reveal-stagger-item"
                  key={index}
                  style={{ '--stagger': index } as CSSProperties}
                >
                  <Card className="h-full" doc={result} relationTo="posts" showCategories />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </RevealSection>
  )
}
