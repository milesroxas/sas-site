'use client'

import Link from 'next/link'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Media } from '@/components/Media'
import type { Post } from '@/payload-types'

type FeaturedCardProps = {
  label?: string | null
  post: Post
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ label = 'Insights', post }) => {
  const titleRef = useRef<HTMLParagraphElement>(null)
  const [thumbSize, setThumbSize] = useState<number>(0)

  const image =
    (post.meta?.image && typeof post.meta.image === 'object' && post.meta.image) ||
    (post.heroImage && typeof post.heroImage === 'object' && post.heroImage) ||
    null

  useEffect(() => {
    const el = titleRef.current
    if (!el) return

    const update = () => {
      setThumbSize(Math.round(el.getBoundingClientRect().height))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [post.title])

  if (!post.slug) return null

  return (
    <Link
      className="flex flex-col gap-3 rounded-md bg-black/35 p-3 shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.16),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-[background-color,box-shadow] hover:bg-black/45 hover:shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.24),inset_0_1px_0_0_rgba(255,255,255,0.14)] supports-[backdrop-filter]:bg-white/8 supports-[backdrop-filter]:hover:bg-white/12"
      href={`/posts/${post.slug}`}
    >
      <div className="flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full bg-[oklch(82.7%_0.173_148)]" />
        <span className="font-mono text-xs leading-none text-foreground">{label}</span>
      </div>

      <div className="flex items-start gap-3">
        <p ref={titleRef} className="w-[191px] shrink-0 text-xs leading-relaxed text-foreground">
          {post.title}
        </p>
        {image && thumbSize > 0 && (
          <div
            className="relative shrink-0 overflow-clip rounded-md"
            style={{ width: thumbSize, height: thumbSize }}
          >
            <Media fill imgClassName="object-cover select-none" resource={image} size="200px" />
          </div>
        )}
      </div>
    </Link>
  )
}
