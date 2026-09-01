'use client'

import { IconX } from '@tabler/icons-react'
import type React from 'react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { Card, type CardPostData } from '@/components/Card'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/payload-types'
import { FILTER_SWAP_MAX_STAGGER_STEPS, useFilterSwap } from '@/shared/ui/filter-swap'
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
 * Below `lg` the topic list pans instead of stacking. The rail bleeds past the
 * page gutter so a half-cut topic — not a scrollbar — is the affordance, and
 * `scroll-fade-x` dims only the edge that still has topics behind it (it rides
 * the rail's own scroll timeline, so the fade clears at either end of the pan).
 *
 * `-my-2 / py-2` is layout-neutral padding, not spacing: `overflow-x-auto`
 * clips on the block axis too, and the clip takes hit-testing with it — without
 * the room the tap slop below each row would be dead on touch.
 */
const TOPIC_RAIL_MOBILE =
  'max-lg:no-scrollbar max-lg:scroll-fade-x max-lg:scroll-fade-8 max-lg:-mx-gutter max-lg:-my-2 max-lg:overflow-x-auto max-lg:overscroll-x-contain max-lg:py-2 max-lg:pe-gutter max-lg:ps-gutter'

/**
 * Topic-filter sidebar + post grid. Topics toggle in place (multi-select,
 * union) — no navigation, the grid cross-fades to the filtered set. Selected
 * topics surface as removable chips under the Explore eyebrow. The address
 * bar is kept shareable via history.replaceState: one topic maps onto its
 * static /insights/[slug] route, anything else falls back to /insights.
 */
export const InsightsBrowse: React.FC<Props> = ({ initialTopicSlug, posts, topics }) => {
  const { selected, rendered, exiting, hasFiltered, apply } = useFilterSwap<string[]>(
    initialTopicSlug ? [initialTopicSlug] : [],
  )
  const railRef = useRef<HTMLUListElement>(null)

  // Land a deep-linked topic inside the rail's viewport. Below `lg` the rail
  // pans, and /insights/[topic] preselects a topic that is usually past the
  // edge on a phone — the page would open filtered with nothing on screen
  // saying so. Scrolls the rail itself (`scrollIntoView` walks up every
  // ancestor scroller and would move the page under Lenis) and only by the
  // shortfall, so a topic already in view never shifts. The inset it scrolls
  // to is the rail's own padding, read off the element, so the gutter is never
  // restated here. No-op above `lg`, where the rail has no overflow. Unanimated
  // either way: this corrects the landing frame, it is not a move the reader
  // asked for.
  useEffect(() => {
    const rail = railRef.current
    const row = rail?.querySelector<HTMLElement>('[data-topic-active="true"]')
    if (!rail || !row) return

    const style = getComputedStyle(rail)
    const railBox = rail.getBoundingClientRect()
    const rowBox = row.getBoundingClientRect()
    const pastStart = railBox.left + Number.parseFloat(style.paddingLeft) - rowBox.left
    const pastEnd = rowBox.right - (railBox.right - Number.parseFloat(style.paddingRight))
    const left = pastStart > 0 ? -pastStart : pastEnd > 0 ? pastEnd : 0
    if (!left) return

    rail.scrollBy({ left, behavior: 'auto' })
  }, [])

  const applySelection = (next: string[]) => {
    if (typeof window !== 'undefined') {
      const href = next.length === 1 ? `/insights/${next[0]}` : '/insights'
      // Null state lets Next's patched replaceState wrap its own internals and
      // sync the router's canonical URL. Reusing window.history.state carries
      // Next's __NA flag, which skips that sync — the router then restores the
      // stale tree on back/forward and snaps the address bar back.
      window.history.replaceState(null, '', href)
    }
    apply(next)
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
      // `::after` pads the row out to a 44px press target on touch-sized
      // screens without inflating how it reads — the same trick the audience
      // tabs use. Dropped at `lg`, where the rows stack and the pad would
      // swallow hover on the neighbouring topic.
      'after:absolute after:inset-x-0 after:-inset-y-2 lg:after:hidden',
      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
    )

  /**
   * Active marker. On the rail it is a rule under the label: a bar at the
   * leading edge would have to push the label sideways to clear it, and a row
   * that changes width mid-pan drags every topic after it. In the sidebar the
   * bar returns to the leading edge and the label slides off it.
   */
  const rowContent = (active: boolean, label: string) => (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'absolute rounded-full bg-active transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none',
          'inset-x-0 bottom-0 h-0.5 lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-0 lg:h-4 lg:w-0.5 lg:-translate-y-1/2',
          active ? 'scale-100 opacity-100' : 'scale-x-50 opacity-0 lg:scale-x-100 lg:scale-y-50',
        )}
      />
      <span
        className={cn(
          'inline-block transition-transform duration-200 ease-out motion-reduce:transition-none',
          active && 'lg:translate-x-3',
        )}
      >
        {label}
      </span>
    </>
  )

  return (
    <RevealSection className="container">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* `min-w-0` or the grid item takes its automatic minimum size from the
            topic rail's min-content width — ~680px of labels — and pins the track
            open, scrolling the whole page sideways on a phone. */}
        <aside className="min-w-0 lg:col-span-4 xl:col-span-3">
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
            {/* The rail owns the bleed, so the margin that separates it from the
                chips lives out here — `-my-2` inside it would fight an `mt-*`
                on the same element. */}
            <div className="mt-6">
              {/* A named list because below `lg` this is a scroll container, and
                  Chrome and Firefox make those keyboard-focusable on their own.
                  `data-lenis-prevent-horizontal`: root Lenis runs `syncTouch`, so
                  it preventDefaults every touchmove and drives the page itself —
                  without this a sideways swipe here never reaches the browser and
                  the rail simply will not pan. The attribute releases only the
                  gestures Lenis reads as horizontal, so an up/down swipe started
                  on a topic still scrolls the page. */}
              <ul
                aria-label="Topics"
                className={cn(
                  'flex items-center gap-x-6 lg:flex-col lg:items-stretch lg:gap-x-0 lg:overflow-visible',
                  TOPIC_RAIL_MOBILE,
                )}
                data-lenis-prevent-horizontal
                ref={railRef}
              >
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
                        data-topic-active={active || undefined}
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
            </div>
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
                    style={
                      {
                        '--stagger': Math.min(index, FILTER_SWAP_MAX_STAGGER_STEPS),
                      } as CSSProperties
                    }
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
