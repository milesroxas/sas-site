'use client'

import { usePathname } from 'next/navigation'
import type React from 'react'
import { type CSSProperties, useMemo } from 'react'
import { Card, type CardPostData } from '@/components/Card'
import type { Post } from '@/payload-types'
import {
  ALL,
  BrowseIndex,
  FilterSelect,
  IndexEmpty,
  type IndexFilterOption,
} from '@/sections/Browse'
import { DATED_SORTS, type SortRegistry } from '@/sections/Browse/sorts'
import { replacePathShallow } from '@/shared/lib/view-transition/shallow-path'
import { FILTER_SWAP_MAX_STAGGER_STEPS, useFilterSwap } from '@/shared/ui/filter-swap'
import { RevealSection } from '@/shared/ui/reveal-section'

export type InsightsBrowsePost = CardPostData & Pick<Post, 'publishedAt'>

const INSIGHTS_SORTS = DATED_SORTS satisfies SortRegistry<InsightsBrowsePost>

type InsightsSortKey = keyof typeof INSIGHTS_SORTS

type InsightsQuery = { topic: string; sort: InsightsSortKey }

/** The query already orders newest first, so the default sort restates it in place. */
const INITIAL_QUERY: InsightsQuery = { topic: ALL, sort: 'newest' }

const NOUN = { one: 'Post', other: 'Posts' }

const hasTopic = (post: InsightsBrowsePost, slug: string) =>
  slug === ALL ||
  Boolean(
    post.categories?.some((category) => typeof category === 'object' && category.slug === slug),
  )

/**
 * The topic an `/insights/<topic>` address names, when the page did not pass
 * one. The filter writes that address as a shallow sync, so browser back to it
 * restores the tree Next cached for `/insights` (no `initialTopicSlug`); the
 * address is then the only record of the filter.
 */
const topicFromPath = (pathname: string, topics: IndexFilterOption[]) => {
  const slug = pathname.match(/^\/insights\/([^/]+)\/?$/)?.[1]
  return slug && topics.some((topic) => topic.slug === slug) ? slug : undefined
}

export type Props = {
  /** Kicker above the index title: CMS hero copy. */
  eyebrow?: string | null
  title?: string | null
  /** Topic pre-selected on mount, so /insights/[topic] deep links land filtered. */
  initialTopicSlug?: string | null
  posts: InsightsBrowsePost[]
  topics: IndexFilterOption[]
}

/**
 * Editorial insights index: the work index's frame over a three-column grid
 * of post cards. Topic and sort change the set in place (no navigation): the
 * grid cross-fades to the filtered set. The address bar stays shareable via
 * history.replaceState: a topic maps onto its static /insights/[slug] route,
 * the whole set falls back to /insights.
 */
export const InsightsBrowse: React.FC<Props> = ({
  eyebrow,
  title,
  initialTopicSlug,
  posts,
  topics,
}) => {
  const pathname = usePathname()
  const { selected, rendered, exiting, hasFiltered, apply } = useFilterSwap<InsightsQuery>({
    ...INITIAL_QUERY,
    topic: initialTopicSlug ?? topicFromPath(pathname, topics) ?? ALL,
  })

  const applyQuery = (next: InsightsQuery) => {
    if (typeof window !== 'undefined' && next.topic !== selected.topic) {
      // A sync, not a navigation: the page transition keeps this page mounted
      // (see `replacePathShallow`), so the swap below is not thrown away.
      replacePathShallow(next.topic === ALL ? '/insights' : `/insights/${next.topic}`)
    }
    apply(next)
  }

  const set = (patch: Partial<InsightsQuery>) => applyQuery({ ...selected, ...patch })

  const visiblePosts = useMemo(
    () =>
      posts
        .filter((post) => hasTopic(post, rendered.topic))
        .sort(INSIGHTS_SORTS[rendered.sort].compare),
    [posts, rendered],
  )

  const renderedKey = `${rendered.topic}|${rendered.sort}`
  const count = visiblePosts.length

  return (
    <BrowseIndex
      count={count}
      eyebrow={eyebrow}
      filters={
        <FilterSelect
          label="Topic"
          onValueChange={(topic) => set({ topic })}
          options={topics}
          value={selected.topic}
        />
      }
      noun={NOUN}
      sort={{ orders: INSIGHTS_SORTS, value: selected.sort, onChange: (sort) => set({ sort }) }}
      title={title}
      total={posts.length}
    >
      {/* The block reveal gates the grid's first-paint stagger; after a swap
          the cards enter on the filter swap's own beat instead. */}
      <RevealSection>
        <div className="filter-swap" data-exiting={exiting || undefined} key={renderedKey}>
          {count > 0 ? (
            <ul className="grid gap-grid gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post, index) => (
                <li
                  className={hasFiltered ? 'filter-swap-item' : 'reveal-stagger-item'}
                  key={post.slug ?? index}
                  style={
                    {
                      '--stagger': Math.min(index, FILTER_SWAP_MAX_STAGGER_STEPS),
                    } as CSSProperties
                  }
                >
                  <Card className="h-full" doc={post} relationTo="posts" variant="tile" />
                </li>
              ))}
            </ul>
          ) : (
            <IndexEmpty
              action="Show all posts"
              message="No posts match these filters yet."
              onReset={() => applyQuery(INITIAL_QUERY)}
            />
          )}
        </div>
      </RevealSection>
    </BrowseIndex>
  )
}
