import Link from 'next/link'
import type React from 'react'
import { Media } from '@/components/Media'
import { cursorTarget } from '@/features/cursor'
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
      // Hover state is continuous, driven by the cursor feature's
      // `--cursor-proximity` (0–1) — see the contract in
      // src/features/cursor/variants.ts. Base state = var fallback 0.
      // Press/release timing comes from the shared `--press-*` tokens
      // (globals.css, same source as the `pressable` utility). The card can't
      // use `pressable` directly — its background fill transitions at its own
      // 300ms (the one documented delta) and its base scale is the cursor
      // proximity calc — so it merges the tokens into its own transition list.
      // Duration/easing lists match the property order: scale, background-color.
      className="grid w-max max-w-full grid-cols-[191px_auto] items-stretch gap-3 rounded-md bg-[rgb(0_0_0/calc(35%_+_10%_*_var(--cursor-proximity,0)))] p-3 shadow-[inset_0_0_0_0.5px_rgb(255_255_255/calc(16%_+_8%_*_var(--cursor-proximity,0))),inset_0_1px_0_0_rgb(255_255_255/calc(10%_+_4%_*_var(--cursor-proximity,0)))] backdrop-blur-md transition-[scale,background-color] [transition-timing-function:var(--press-release-ease),var(--press-ease)] [transition-duration:var(--press-release-duration),300ms] active:[transition-timing-function:var(--press-ease)] active:[transition-duration:var(--press-duration),300ms] scale-[calc(1_+_0.02_*_var(--cursor-proximity,0))] active:scale-[var(--press-scale)] active:bg-[rgb(0_0_0/calc(50%_+_10%_*_var(--cursor-proximity,0)))] supports-[backdrop-filter]:bg-[rgb(255_255_255/calc(8%_+_4%_*_var(--cursor-proximity,0)))] supports-[backdrop-filter]:active:bg-[rgb(255_255_255/calc(16%_+_4%_*_var(--cursor-proximity,0)))]"
      href={`/posts/${post.slug}`}
      {...cursorTarget({ variant: 'emphasize', label: 'Read post' })}
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
