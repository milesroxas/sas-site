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
import type { CardVariant } from './variants'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'> & {
  /** Explicit destination — takes precedence over `/${relationTo}/${slug}`. */
  url?: string
}

const variantClassNames: Record<CardVariant, string> = {
  contained: '',
  open: 'rounded-none bg-transparent ring-0',
  overlay: 'relative min-h-80 justify-end bg-muted ring-0 text-white',
}

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
  variant?: CardVariant
}> = (props) => {
  const { card, link } = useClickableCard<HTMLDivElement>({})
  const {
    className,
    doc,
    relationTo,
    showCategories,
    title: titleFromProps,
    variant = 'contained',
  } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = doc?.url ?? `/${relationTo}/${slug}`

  const isOpen = variant === 'open'
  const isOverlay = variant === 'overlay'

  const media = metaImage && typeof metaImage !== 'string' && (
    <Media
      fill={isOverlay}
      imgClassName={isOverlay ? 'object-cover' : undefined}
      resource={metaImage}
      size="33vw"
    />
  )

  return (
    <CardUi
      className={cn('cursor-pointer pt-0', variantClassNames[variant], className)}
      ref={card.ref}
    >
      <div className={cn('relative w-full', isOverlay && 'absolute inset-0')}>
        {!metaImage && !isOverlay && <div>No image</div>}
        {media &&
          (slug ? (
            // Shared element: morphs into the post hero image on navigation. The
            // matching `name` lives in `PostHero`. `default: 'none'` keeps the other
            // (non-clicked) cards from cross-fading on list updates.
            <ViewTransition default="none" name={postImageVtName(slug)} share="morph">
              {media}
            </ViewTransition>
          ) : (
            media
          ))}
      </div>
      {isOverlay && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-b from-transparent to-black/80"
        />
      )}
      <CardHeader className={cn(isOpen && 'px-0', isOverlay && 'relative')}>
        {showCategories && hasCategories && (
          <CardDescription className={cn('uppercase', isOverlay && 'text-white/70')}>
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
        <CardContent className={cn(isOpen && 'px-0', isOverlay && 'relative text-white/80')}>
          <p>{sanitizedDescription}</p>
        </CardContent>
      )}
    </CardUi>
  )
}
