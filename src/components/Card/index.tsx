'use client'
import Link from 'next/link'
import type React from 'react'
import { Fragment, ViewTransition } from 'react'
import { Media } from '@/components/Media'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as CardUi,
} from '@/components/ui/card'
import type { Post } from '@/payload-types'
import { forwardNavTransitionTypes, postImageVtName } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'> & {
  /** Explicit destination — takes precedence over `/${relationTo}/${slug}`. */
  url?: string
}

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = doc?.url ?? `/${relationTo}/${slug}`

  return (
    <CardUi className={cn('cursor-pointer pt-0', className)} ref={card.ref}>
      <div className="relative w-full">
        {!metaImage && <div>No image</div>}
        {metaImage &&
          typeof metaImage !== 'string' &&
          (slug ? (
            // Shared element: morphs into the post hero image on navigation. The
            // matching `name` lives in `PostHero`. `default: 'none'` keeps the other
            // (non-clicked) cards from cross-fading on list updates.
            <ViewTransition default="none" name={postImageVtName(slug)} share="morph">
              <Media resource={metaImage} size="33vw" />
            </ViewTransition>
          ) : (
            <Media resource={metaImage} size="33vw" />
          ))}
      </div>
      <CardHeader>
        {showCategories && hasCategories && (
          <CardDescription className="uppercase">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category

                const categoryTitle = titleFromCategory || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }

              return null
            })}
          </CardDescription>
        )}
        {titleToUse && (
          <CardTitle>
            <Link
              className="hover:underline"
              href={href}
              ref={link.ref}
              transitionTypes={[...forwardNavTransitionTypes]}
            >
              {titleToUse}
            </Link>
          </CardTitle>
        )}
      </CardHeader>
      {description && (
        <CardContent>
          <p>{sanitizedDescription}</p>
        </CardContent>
      )}
    </CardUi>
  )
}
