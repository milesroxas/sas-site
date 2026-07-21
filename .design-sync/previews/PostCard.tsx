// Owned preview. The generated wrapper compiles the story module, which
// imports the post Card from source (`./index`) — the dir name "Card" collides
// with the shadcn `Card` export, so it can't shim to the bundle global. Source
// bundling drags in a private next/navigation copy whose AppRouterContext the
// cfg.provider can't reach ("invariant expected app router to be mounted").
// Rendering PostCard from the bundle uses the one shared context instead.
// Mirrors src/components/Card/index.stories.tsx (Contained / Open / Overlay).
import * as React from 'react'
import { postFixtures } from '@/blocks/fixtures'
import { PostCard } from 'with-vercel-website'

const args = {
  doc: postFixtures[0],
  relationTo: 'posts' as const,
  showCategories: true,
}

const InColumn = ({ variant }: { variant: 'contained' | 'open' | 'overlay' }) => (
  <div className="w-96">
    <PostCard {...args} variant={variant} />
  </div>
)

export const Contained = () => <InColumn variant="contained" />
export const Open = () => <InColumn variant="open" />
export const Overlay = () => <InColumn variant="overlay" />
