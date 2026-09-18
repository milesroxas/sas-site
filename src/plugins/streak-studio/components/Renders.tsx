'use client'

import './studio.css'

import { Link, toast, useConfig, useDocumentInfo } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { Button } from '@/components/ui/button'
import type { StreakRender } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { RELEASES_SLUG, RENDERS_SLUG } from './paths'
import { useRenders } from './polling'

const STATE_TONE: Record<StreakRender['state'], string> = {
  queued: 'bg-muted-foreground',
  rendering: 'bg-warning',
  complete: 'bg-success',
  failed: 'bg-destructive',
  cancelled: 'bg-muted-foreground',
}

/**
 * The Renders tab: the durable poster and export jobs of this look, polled
 * while the page is on screen. A failed job can be retried; a job still in
 * the queue can be cancelled.
 */
export const Renders: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const { docs: jobs, refresh } = useRenders(id)
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()

  const act = async (job: StreakRender, action: 'retry' | 'cancel') => {
    try {
      const response = await fetch(`/api/${RENDERS_SLUG}/${job.id}/${action}`, { method: 'POST' })
      if (!response.ok) throw new Error(`Could not ${action} this render.`)
      await refresh()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  if (!id)
    return <p className="m-0 text-xs text-muted-foreground">Save this look once to render it.</p>
  if (!jobs.length)
    return (
      <p className="m-0 text-xs text-muted-foreground">
        No renders yet. Publishing and exporting from Studio queue them here.
      </p>
    )

  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
      {jobs.map((job) => {
        const releaseId =
          job.release && typeof job.release === 'object' ? job.release.id : job.release
        const output = job.output && typeof job.output === 'object' ? job.output : null
        return (
          <li key={job.id} className="flex flex-col gap-1.5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span aria-hidden className={cn('size-1.5 rounded-full', STATE_TONE[job.state])} />
              <span className="text-xs font-medium">
                {job.kind === 'publish' ? 'Release' : 'Still'}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {job.state}
                {job.attempts ? ` · attempt ${job.attempts}` : ''} · {job.sourceHash.slice(0, 8)} ·{' '}
                {new Date(job.createdAt).toLocaleString()}
              </span>
              <div className="ml-auto flex items-center gap-1">
                {releaseId && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`${admin}/collections/${RELEASES_SLUG}/${releaseId}`}
                      prefetch={false}
                    >
                      Open release
                    </Link>
                  </Button>
                )}
                {output?.url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={output.url} download target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </Button>
                )}
                {job.state === 'failed' && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => act(job, 'retry')}>
                    Retry
                  </Button>
                )}
                {['queued', 'rendering', 'failed'].includes(job.state) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => act(job, 'cancel')}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            {job.error && <p className="m-0 pl-4.5 text-[11px]/4 text-destructive">{job.error}</p>}
          </li>
        )
      })}
    </ul>
  )
}
