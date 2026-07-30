import Link from 'next/link'
import type React from 'react'
import { Media } from '@/components/Media'
import type { Post } from '@/payload-types'

type FeaturedCardProps = {
  label?: string | null
  post: Post
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ label = 'Insights', post }) => {
  const image =
    (post.meta?.image && typeof post.meta.image === 'object' && post.meta.image) ||
    (post.heroImage && typeof post.heroImage === 'object' && post.heroImage) ||
    null

  if (!post.slug) return null

  return (
    <Link
      className="grid w-max max-w-full grid-cols-[191px_auto] items-stretch gap-3 rounded-md bg-black/35 p-3 shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-[background-color,box-shadow] hover:bg-black/45 hover:shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.24),inset_0_1px_0_0_rgba(255,255,255,0.14)] supports-[backdrop-filter]:bg-white/8 supports-[backdrop-filter]:hover:bg-white/12"
      href={`/posts/${post.slug}`}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-[oklch(82.7%_0.173_148)]" />
          <span className="font-mono text-xs leading-none text-foreground">{label}</span>
        </div>
        <p className="text-xs leading-relaxed text-foreground">{post.title}</p>
      </div>
      {image && (
        <div className="relative aspect-square h-auto min-h-0 min-w-0 overflow-clip rounded-md">
          <Media fill imgClassName="object-cover select-none" resource={image} size="200px" />
        </div>
      )}
    </Link>
  )
}
