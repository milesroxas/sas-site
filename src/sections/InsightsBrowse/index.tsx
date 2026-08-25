'use client'

import { IconX } from '@tabler/icons-react'
import type React from 'react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, type CardPostData } from '@/components/Card'
import { Badge } from '@/components/ui/badge'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { Category } from '@/payload-types'
import { RevealSection } from '@/shared/ui/reveal-section'
import { cn } from '@/utilities/ui'

export type InsightsBrowseTopic = Pick<Category, 'id' | 'title' | 'slug' | 'description'>

export type Props = {
  /** Topic pre-selected on mount — lets /insights/[topic] deep links land filtered. */
  initialTopicSlug?: string | null
  posts: CardPostData[]
  topics: InsightsBrowseTopic[]
}

/**
 * Outgoing-grid fade before the filtered set enters. Pairs with the
 * `.filter-swap` transition in globals.css — exit stays faster than enter.
 */
const GRID_EXIT_MS = 150
/** Cap the enter stagger so late cards don't trail on big result sets. */
const MAX_STAGGER_STEPS = 8

/**
 * Topic-filter sidebar + post grid. Topics toggle in place (multi-select,
 * union) — no navigation, the grid cross-fades to the filtered set. Selected
 * topics surface as removable chips under the Explore eyebrow. The address
 * bar is kept shareable via history.replaceState: one topic maps onto its
 * static /insights/[slug] route, anything else falls back to /insights.
 */
export const InsightsBrowse: React.FC<Props> = ({ initialTopicSlug, posts, topics }) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [selected, setSelected] = useState<string[]>(() =>
    initialTopicSlug ? [initialTopicSlug] : [],
  )
  /** What the grid currently shows — lags `selected` by the exit fade. */
  const [rendered, setRendered] = useState(selected)
  const [exiting, setExiting] = useState(false)
  /** First render keeps the scroll-reveal stagger; swaps use the faster filter enter. */
  const [hasFiltered, setHasFiltered] = useState(false)
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (swapTimer.current) clearTimeout(swapTimer.current)
    },
    [],
  )

  // fallow-ignore-next-line complexity -- CRAP flags coverage gap; small state handler
  const applySelection = (next: string[]) => {
    setSelected(next)
    setHasFiltered(true)
    if (typeof window !== 'undefined') {
      const href = next.length === 1 ? `/insights/${next[0]}` : '/insights'
      // Null state lets Next's patched replaceState wrap its own internals and
      // sync the router's canonical URL. Reusing window.history.state carries
      // Next's __NA flag, which skips that sync — the router then restores the
      // stale tree on back/forward and snaps the address bar back.
      window.history.replaceState(null, '', href)
    }
    if (swapTimer.current) clearTimeout(swapTimer.current)
    if (prefersReducedMotion) {
      setExiting(false)
      setRendered(next)
      return
    }
    setExiting(true)
    swapTimer.current = setTimeout(() => {
      setRendered(next)
      setExiting(false)
    }, GRID_EXIT_MS)
  }

  const toggleTopic = (slug: string) => {
    applySelection(
      selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug],
    )
  }

  const topicItems = topics.filter((topic): topic is InsightsBrowseTopic & { slug: string } =>
    Boolean(topic.slug),
  )
  const selectedTopics = topicItems.filter((topic) => selected.includes(topic.slug))
  const allActive = selected.length === 0

  const visiblePosts = useMemo(() => {
    if (rendered.length === 0) return posts
    return posts.filter((post) =>
      post.categories?.some(
        (category) =>
          typeof category === 'object' && category.slug && rendered.includes(category.slug),
      ),
    )
  }, [posts, rendered])

  const renderedKey = rendered.length ? rendered.join('|') : 'all'

  const rowClassName = (active: boolean) =>
    cn(
      'pressable pressable-subtle relative flex w-full items-center py-2 text-left whitespace-nowrap',
      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
    )

  /** Green bar slides the label right when a topic is active — replaces the old `+` icon. */
  const rowContent = (active: boolean, label: string) => (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-active transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none',
          active ? 'scale-y-100 opacity-100' : 'scale-y-50 opacity-0',
        )}
      />
      <span
        className={cn(
          'inline-block transition-transform duration-200 ease-out motion-reduce:transition-none',
          active && 'translate-x-3',
        )}
      >
        {label}
      </span>
    </>
  )

  return (
    <RevealSection className="container">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <aside className="lg:col-span-4 xl:col-span-3">
          <section aria-label="Filter posts by topic" className="lg:sticky lg:top-24">
            <p className="font-mono text-sm/none tracking-tight text-muted-foreground">Explore</p>
            <div
              className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none"
              data-open={selectedTopics.length > 0}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-wrap gap-2 pt-4">
                  {selectedTopics.map((topic) => (
                    <li
                      className="transition-[opacity,translate,scale] duration-200 ease-out active:scale-95 starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none"
                      key={topic.slug}
                    >
                      <Badge asChild variant="outline">
                        <button
                          aria-label={`Remove ${topic.title} filter`}
                          className="gap-1.5 py-1 pr-1.5 pl-2.5 font-mono text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          onClick={() => toggleTopic(topic.slug)}
                          type="button"
                        >
                          {topic.title}
                          <IconX aria-hidden="true" className="size-3" />
                        </button>
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <ul className="no-scrollbar mt-6 flex items-center gap-x-6 overflow-x-auto lg:flex-col lg:items-stretch lg:gap-x-0 lg:overflow-visible">
              <li className="shrink-0 lg:shrink lg:border-t lg:border-border lg:pb-4">
                <button
                  aria-pressed={allActive}
                  className={rowClassName(allActive)}
                  onClick={() => applySelection([])}
                  type="button"
                >
                  {rowContent(allActive, 'All Posts')}
                </button>
              </li>
              {topicItems.map((topic) => {
                const active = selected.includes(topic.slug)
                return (
                  <li
                    className="shrink-0 lg:shrink lg:border-t lg:border-border lg:pb-4"
                    key={topic.slug}
                  >
                    <button
                      aria-pressed={active}
                      className={rowClassName(active)}
                      onClick={() => toggleTopic(topic.slug)}
                      type="button"
                    >
                      {rowContent(active, topic.title)}
                    </button>
                    {topic.description && (
                      <div
                        className="hidden transition-[grid-template-rows] duration-300 ease-out data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none lg:grid lg:grid-rows-[0fr]"
                        data-open={active}
                      >
                        <div className="overflow-hidden">
                          <p
                            className={cn(
                              'max-w-sm pb-2 text-sm/relaxed text-muted-foreground transition-opacity duration-200 ease-out motion-reduce:transition-none',
                              active ? 'opacity-100' : 'opacity-0',
                            )}
                          >
                            {topic.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </aside>
        <div className="lg:col-span-8 xl:col-span-9">
          <p aria-live="polite" className="sr-only">
            {`Showing ${visiblePosts.length} of ${posts.length} posts`}
          </p>
          <div className="filter-swap" data-exiting={exiting || undefined} key={renderedKey}>
            {visiblePosts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-8">
                {visiblePosts.map((post, index) => (
                  <div
                    className={hasFiltered ? 'filter-swap-item' : 'reveal-stagger-item'}
                    key={post.slug ?? index}
                    style={{ '--stagger': Math.min(index, MAX_STAGGER_STEPS) } as CSSProperties}
                  >
                    <Card className="h-full" doc={post} relationTo="posts" variant="backdrop" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground">No posts match these topics yet.</p>
                <button
                  className="pressable mt-4 text-sm text-foreground underline underline-offset-4"
                  onClick={() => applySelection([])}
                  type="button"
                >
                  Show all posts
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RevealSection>
  )
}
