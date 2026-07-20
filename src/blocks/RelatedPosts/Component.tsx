import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import clsx from 'clsx'
import type React from 'react'
import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'
import { Card } from '../../components/Card'
import type { CardVariant } from '../../components/Card/variants'

export type RelatedPostsProps = {
  cardVariant?: CardVariant
  className?: string
  docs?: Post[]
  introContent?: DefaultTypedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { cardVariant, className, docs, introContent } = props

  return (
    <div className={clsx('lg:container', className)}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch">
        {docs?.map((doc, index) => {
          if (typeof doc === 'string') return null

          return (
            <Card key={index} doc={doc} relationTo="posts" showCategories variant={cardVariant} />
          )
        })}
      </div>
    </div>
  )
}
