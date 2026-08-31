import React, { ViewTransition } from 'react'
import { Media } from '@/components/Media'
import type { Post } from '@/payload-types'
import { postImageShare, postImageVtName } from '@/shared/lib/view-transition'
import { formatAuthors } from '@/utilities/formatAuthors'
import { PostHeroBanner } from './Banner'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, slug, title } = post

  if (post.heroStyle === 'banner') {
    return <PostHeroBanner post={post} />
  }

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    // isolate: the hero image layers at -z-10; without a stacking context here it
    // falls into the root context and paints beneath the page frame's opaque
    // bg-background (layout.tsx), disappearing entirely.
    <div className="relative isolate -mt-(--header-height) flex items-end">
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] text-white pb-8">
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          <div className="uppercase text-sm mb-6">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category

                const titleToUse = categoryTitle || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <React.Fragment key={index}>
                    {titleToUse}
                    {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                  </React.Fragment>
                )
              }
              return null
            })}
          </div>

          <div className="">
            <h1 className="mb-6 text-heading-1">{title}</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-16">
            {hasAuthors && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm">Author</p>

                  <p>{formatAuthors(populatedAuthors)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* data-hero-media: takeover-menu dissolve source (src/Header/Menu). */}
      <div data-hero-media className="min-h-[80vh] select-none">
        {heroImage &&
          typeof heroImage !== 'string' &&
          (slug ? (
            // Shared element: receives the morph from the clicked post card's image
            // (matching `name` in `Card`). The wrapper is a full-bleed positioned box
            // so the view-transition snapshot has real geometry — naming the default
            // wrapper (which collapses around the absolute `fill` image) would morph to
            // a zero-size rect and fling the image to the corner.
            <ViewTransition default="none" name={postImageVtName(slug)} share={postImageShare}>
              <Media
                className="absolute inset-0 -z-10"
                fill
                imgClassName="object-cover"
                priority
                resource={heroImage}
              />
            </ViewTransition>
          ) : (
            <Media
              className="absolute inset-0 -z-10"
              fill
              imgClassName="object-cover"
              priority
              resource={heroImage}
            />
          ))}
        <div className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-linear-to-t from-black to-transparent" />
      </div>
    </div>
  )
}
