import type React from 'react'
import { ViewTransition } from 'react'
import { Media } from '@/components/Media'
import type { Post } from '@/payload-types'
import { postImageVtName } from '@/shared/lib/view-transition'

export const PostHeroBanner: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, slug, title } = post

  const categoryTitles = (categories ?? [])
    .filter((category) => typeof category === 'object' && category !== null)
    .map((category) => category.title || 'Untitled category')

  const image = heroImage && typeof heroImage !== 'string' && (
    <Media
      className="absolute inset-0 -z-10 select-none"
      fill
      imgClassName="object-cover"
      priority
      resource={heroImage}
    />
  )

  return (
    // isolate: keeps the -z-10 background image inside this stacking context so it
    // doesn't drop beneath the page frame's opaque bg-background (layout.tsx).
    <div className="relative isolate flex min-h-75 items-center overflow-hidden">
      {image &&
        (slug ? (
          // Shared element: receives the morph from the clicked post card's image
          // (matching `name` in `Card`).
          <ViewTransition name={postImageVtName(slug)} share="morph">
            {image}
          </ViewTransition>
        ) : (
          image
        ))}

      <div className="container grid w-full grid-cols-1 gap-8 py-12 text-foreground lg:grid-cols-[1fr_3fr] lg:gap-20">
        <p className="font-mono text-xs leading-4">
          Insights
          {categoryTitles.length > 0 && (
            <span className="uppercase">{` // ${categoryTitles.join(', ')}`}</span>
          )}
        </p>
        <h1 className="max-w-xl text-2xl leading-normal">{title}</h1>
      </div>
    </div>
  )
}
