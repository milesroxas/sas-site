'use client'

import Link from 'next/link'
import { type CSSProperties, useState } from 'react'
import { Media } from '@/components/Media'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import type { FeaturedWorkEntry } from './resolveEntry'

type Props = {
  eyebrow?: string | null
  entries: FeaturedWorkEntry[]
}

export const FeaturedWorkList: React.FC<Props> = ({ eyebrow, entries }) => {
  const [activeId, setActiveId] = useState<number | null>(null)

  if (entries.length === 0) return null

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      {eyebrow ? (
        <div className="reveal-stagger-item flex items-center gap-2.5">
          <span aria-hidden className="block h-px w-8 shrink-0 bg-muted-foreground" />
          <p className="font-mono text-base/none font-medium text-muted-foreground uppercase">
            {eyebrow}
          </p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-8" onMouseLeave={() => setActiveId(null)}>
        {entries.map((entry, index) => {
          const active = activeId === entry.id
          const showDetails = active && Boolean(entry.client || entry.industry || entry.media)

          return (
            <li
              key={entry.id}
              className="reveal-stagger-item border-b border-muted-foreground"
              style={{ '--stagger': index + (eyebrow ? 1 : 0) } as CSSProperties}
              onMouseEnter={() => setActiveId(entry.id)}
            >
              <Link
                href={entry.href}
                transitionTypes={[...forwardNavTransitionTypes]}
                className="flex flex-col pb-8 outline-none md:flex-row md:items-center"
                onFocus={() => setActiveId(entry.id)}
              >
                <div className="w-full shrink-0 md:w-[min(100%,32rem)]">
                  <h3
                    className={cn(
                      'text-2xl/9 font-light md:text-3xl/9',
                      active ? 'text-foreground/90' : 'text-muted-foreground',
                    )}
                  >
                    {entry.title}
                  </h3>

                  {/* Gap lives inside the collapse so idle rows stay title + padding only */}
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                      showDetails && (entry.client || entry.industry)
                        ? 'grid-rows-[1fr]'
                        : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <dl className="flex w-[min(100%,16.375rem)] items-start justify-between gap-6 pt-12">
                        {entry.client ? (
                          <div className="flex flex-col gap-3">
                            <dt className="font-mono text-xs/none font-medium text-muted-foreground">
                              Client
                            </dt>
                            <dd className="text-base/none text-foreground">{entry.client}</dd>
                          </div>
                        ) : null}
                        {entry.industry ? (
                          <div className="flex flex-col gap-3">
                            <dt className="font-mono text-xs/none font-medium text-muted-foreground">
                              Industry
                            </dt>
                            <dd className="text-base/none text-foreground">{entry.industry}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    'min-w-0 flex-1 grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                    entry.media
                      ? showDetails
                        ? 'grid-rows-[1fr]'
                        : 'grid-rows-[1fr] md:grid-rows-[0fr]'
                      : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    {entry.media ? (
                      <div className="flex justify-end pt-8 md:pt-0 md:pl-8">
                        <div className="w-full max-w-[33.9375rem] overflow-hidden rounded-md">
                          <div className="relative aspect-16/9 w-full bg-muted">
                            <Media
                              fill
                              htmlElement={null}
                              imgClassName="object-cover"
                              resource={entry.media}
                              size="(max-width: 768px) 100vw, 544px"
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
