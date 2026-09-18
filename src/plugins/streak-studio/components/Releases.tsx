'use client'

import './studio.css'

import { Link, toast, useConfig, useDocumentInfo } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { Button } from '@/components/ui/button'
import { STUDIO_GROUND } from '@/features/immersive'
import { recipeFromSnapshot, type StreakSnapshot } from '@/features/immersive/studio/recipe'
import type { Media, StreakRelease } from '@/payload-types'
import { RELEASES_SLUG } from './paths'
import { useReleases } from './polling'
import { sessionKey, studioStore } from './store'

const posterUrl = (poster: Media | number | null | undefined) =>
  poster && typeof poster === 'object' ? (poster.sizes?.thumbnail?.url ?? poster.url) : null

const Poster = ({ src }: { src: string }) => (
  // biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin
  <img src={src} alt="" className="size-full object-cover" loading="lazy" />
)

/**
 * The Releases tab: every immutable release published from this look, newest
 * first, with its posters. A release opens its own document (usage lives
 * there) or goes to the stage as the comparison.
 */
export const Releases: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const releases = useReleases(id)
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()

  const compare = (release: StreakRelease) => {
    try {
      studioStore.patch(sessionKey(id), {
        comparison: recipeFromSnapshot(release.snapshot as StreakSnapshot),
        comparisonLabel: release.title,
        comparisonAt: new Date(release.createdAt).getTime(),
        showComparison: true,
      })
      toast.success(`${release.title} is on the stage. Open Studio to see it.`)
    } catch {
      toast.error('This release was published by an older renderer and cannot be compared.')
    }
  }

  if (!id)
    return (
      <p data-streak-studio className="text-xs text-muted-foreground">
        Save this look once to publish it.
      </p>
    )
  if (!releases.length)
    return (
      <p data-streak-studio className="text-xs text-muted-foreground">
        No releases yet. Publish from Studio to make one.
      </p>
    )

  return (
    <ul data-streak-studio className="flex flex-col divide-y divide-border">
      {releases.map((release) => (
        <li key={release.id} className="flex flex-wrap items-center gap-4 py-3">
          <div className="flex gap-1">
            {(['darkPoster', 'lightPoster'] as const).map((field) => {
              const url = posterUrl(release[field] as Media | number | null)
              const surface = field === 'darkPoster' ? 'dark' : 'light'
              return (
                <span
                  key={field}
                  className="block h-9 w-16 overflow-hidden rounded-sm border border-border"
                  style={{ backgroundColor: STUDIO_GROUND[surface] }}
                >
                  {url && <Poster src={url} />}
                </span>
              )
            })}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs font-medium">{release.title}</span>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {new Date(release.createdAt).toLocaleString()} · {release.sourceHash.slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => compare(release)}>
              Compare on stage
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`${admin}/collections/${RELEASES_SLUG}/${release.id}`} prefetch={false}>
                Open release
              </Link>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
