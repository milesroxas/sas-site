'use client'
import Link from 'next/link'
import type React from 'react'
import { Fragment, ViewTransition } from 'react'
import { Media } from '@/components/Media'
import { Badge } from '@/components/ui/badge'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as CardUi,
} from '@/components/ui/card'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import type { Post } from '@/payload-types'
import {
  forwardNavTransitionTypes,
  postImageShare,
  postImageVtName,
} from '@/shared/lib/view-transition'
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
  // Split renders its own layout branch; no CardUi chrome to override.
  split: '',
  overlay: 'relative min-h-80 justify-end bg-muted ring-0 text-white',
  backdrop: 'relative isolate aspect-4/3 sm:aspect-3/2 justify-end bg-muted ring-0 text-white',
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
  const isBackdrop = variant === 'backdrop'
  const isMediaBackground = isOverlay || isBackdrop

  if (variant === 'split') {
    const firstCategory = hasCategories
      ? categories.find((category) => typeof category === 'object')
      : undefined

    const splitMedia = metaImage && typeof metaImage !== 'string' && (
      <Media
        fill
        // The frame is the clipped window (see `data-reveal="media"` below), so
        // the zoom rides the image itself — scaling the frame would fight the
        // wipe's clip-path for the same box.
        imgClassName="object-cover transition-transform duration-300 ease-out group-hover:scale-102 motion-reduce:transition-none"
        resource={metaImage}
        size="256px"
      />
    )

    return (
      // `data-reveal*` markers are inert without a `ScrollReveal` ancestor
      // (docs/animations.md); the related-posts rail is the shell that plays
      // them. One group value per card, so a card's copy lands on one beat and
      // consecutive cards still cascade.
      <div
        className={cn('group pressable pressable-subtle flex cursor-pointer gap-3', className)}
        ref={card.ref}
      >
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="flex flex-col gap-2">
            {titleToUse && (
              // Clamped so a card's height stays near its 4:5 frame: this
              // variant is built for a rail and a grid, where one long title
              // otherwise sets the height of every card beside it.
              <h3
                className="line-clamp-2 text-lg/normal font-normal"
                data-reveal
                data-reveal-group={slug ?? titleToUse}
              >
                <Link
                  className="hover:underline"
                  href={href}
                  ref={link.ref}
                  transitionTypes={[...forwardNavTransitionTypes]}
                >
                  {titleToUse}
                </Link>
              </h3>
            )}
            {sanitizedDescription && (
              <p
                className="line-clamp-3 text-sm/normal text-muted-foreground"
                data-reveal
                data-reveal-group={slug ?? titleToUse}
              >
                {sanitizedDescription}
              </p>
            )}
          </div>
          {showCategories && firstCategory && (
            <Badge data-reveal data-reveal-group={slug ?? titleToUse} variant="secondary">
              {firstCategory.title || 'Untitled category'}
            </Badge>
          )}
        </div>
        {/* 5/12 against the copy's remainder is the design's 155:197 split —
            the title needs the wider half to stay above two lines in the rail. */}
        <div className="min-w-0 max-w-64 shrink-0 basis-5/12">
          <div
            className="relative aspect-4/5 overflow-hidden rounded-xs bg-muted"
            data-reveal="media"
          >
            {splitMedia &&
              (slug ? (
                <ViewTransition default="none" name={postImageVtName(slug)} share={postImageShare}>
                  {splitMedia}
                </ViewTransition>
              ) : (
                splitMedia
              ))}
          </div>
        </div>
      </div>
    )
  }

  const media = metaImage && typeof metaImage !== 'string' && (
    <Media
      fill={isMediaBackground}
      imgClassName={isMediaBackground ? 'object-cover' : undefined}
      resource={metaImage}
      size={isBackdrop ? '(min-width: 64rem) 45vw, 100vw' : '33vw'}
    />
  )

  return (
    <CardUi
      className={cn(
        'pressable pressable-subtle cursor-pointer pt-0',
        variantClassNames[variant],
        className,
      )}
      ref={card.ref}
    >
      <div className={cn('relative w-full', isMediaBackground && 'absolute inset-0')}>
        {!metaImage && !isMediaBackground && <div>No image</div>}
        {media &&
          (slug ? (
            // Shared element: morphs into the post hero image on navigation. The
            // matching `name` lives in `PostHero`. `default: 'none'` keeps the other
            // (non-clicked) cards from cross-fading on list updates.
            <ViewTransition default="none" name={postImageVtName(slug)} share={postImageShare}>
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
      <CardHeader className={cn(isOpen && 'px-0', isMediaBackground && 'relative')}>
        {/* Bleeds into the card's own bottom padding so the material meets the edge. */}
        {isBackdrop && (
          <ProgressiveBlur className="absolute inset-x-0 -top-6 -bottom-(--card-spacing)" />
        )}
        {showCategories && hasCategories && (
          <CardDescription
            className={cn('uppercase', isMediaBackground && 'relative text-white/70')}
          >
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
          <CardTitle
            className={cn(isBackdrop && 'relative text-base/snug font-normal lg:text-lg/snug')}
          >
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
      {/* Backdrop keeps the surface title-only — the media is the content. */}
      {description && !isBackdrop && (
        <CardContent className={cn(isOpen && 'px-0', isOverlay && 'relative text-white/80')}>
          <p>{sanitizedDescription}</p>
        </CardContent>
      )}
    </CardUi>
  )
}
