import { IconDownload } from '@tabler/icons-react'
import type React from 'react'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { CtaClick } from '@/components/CtaClick'
import { buttonVariants } from '@/components/ui/button'
import type { ResourceDownloadBlock as ResourceDownloadData } from '@/payload-types'
import type { CtaLocation } from '@/utilities/analyticsClient'
import { cn } from '@/utilities/ui'
import { downloadableResource, fileTypeLabel, formatFileSize, resourceHref } from './resource'

/**
 * A Download block's fields or a post's Primary resource group: the same
 * shape, except the group's file is optional (nothing renders without one).
 */
export type ResourceDownloadProps = Pick<
  ResourceDownloadData,
  'buttonLabel' | 'description' | 'heading'
> & { className?: string; resource?: ResourceDownloadData['resource'] | null }

type Download = {
  body: string | undefined
  filename: string | null | undefined
  href: string
  label: string
  meta: string
  title: string
}

/**
 * The copy both layouts show, with the block's own copy over the resource's,
 * or `null` when the resource is not downloadable (`downloadableResource`).
 */
const resolveDownload = ({
  buttonLabel,
  description,
  heading,
  resource,
}: ResourceDownloadProps): Download | null => {
  const file = downloadableResource(resource)
  const href = file ? resourceHref(file) : ''
  if (!file || !href) return null

  const type = fileTypeLabel(file)
  return {
    body: description?.trim() || file.description?.trim() || undefined,
    filename: file.filename,
    href,
    label: buttonLabel?.trim() || (type ? `Download ${type}` : 'Download'),
    meta: [type, formatFileSize(file.filesize)].filter(Boolean).join(' · '),
    title: heading?.trim() || file.title,
  }
}

/**
 * The one action both layouts end on. `download` only takes effect on a
 * same-origin URL, so on the R2 custom domain the object's own
 * `Content-Disposition: attachment` metadata is what makes a PDF save instead
 * of open (Resources `hooks/attachmentDisposition.ts`). The arrow drops a step
 * on hover, the direction the file is about to go.
 */
const DownloadLink: React.FC<{
  className?: string
  download: Download
  location: CtaLocation
  size: 'action' | 'xl'
}> = ({ className, download, location, size }) => (
  <CtaClick href={download.href} label={download.label} location={location}>
    <a
      className={cn(buttonVariants({ size }), className)}
      download={download.filename ?? true}
      href={download.href}
    >
      {download.label}
      {/* Read after the label, so the name says which file and how big. */}
      <span className="sr-only">{`: ${download.title}${download.meta ? `, ${download.meta}` : ''}`}</span>
      <IconDownload
        aria-hidden="true"
        className="transition-transform duration-150 ease-out group-hover/button:translate-y-0.5 motion-reduce:transition-none"
        data-icon="inline-end"
      />
    </a>
  </CtaClick>
)

/**
 * The download card: what the file is, then the one action that hands it
 * over. Every visual decision lives here, so a download reads the same inline
 * in a post body and on the composition grid (`Section.tsx`); the className a
 * caller passes is placement, nothing else.
 *
 * Stacked in a narrow column; from a 32rem container the copy and the button
 * share a row, bottoms aligned, so the button ends the thought it sits beside.
 * The type and size line is the reader's "what am I getting" before the click.
 */
export const ResourceDownload: React.FC<ResourceDownloadProps> = ({ className, ...props }) => {
  const download = resolveDownload(props)
  if (!download) return null

  return (
    <div
      className={cn(
        'not-prose @container rounded-lg border border-border bg-background p-6 text-foreground',
        className,
      )}
    >
      <div className="flex flex-col gap-6 @lg:flex-row @lg:items-end @lg:justify-between @lg:gap-10">
        <div className="text-stack min-w-0">
          {download.meta ? (
            <p className={cn(eyebrowClassName, 'text-muted-foreground tabular-nums')}>
              {download.meta}
            </p>
          ) : null}
          <h3 className="text-lead font-medium text-balance">{download.title}</h3>
          {download.body ? (
            <p className="max-w-prose text-base/relaxed text-pretty text-muted-foreground">
              {download.body}
            </p>
          ) : null}
        </div>
        <DownloadLink
          className="self-start @lg:self-auto"
          download={download}
          location="download"
          size="xl"
        />
      </div>
    </div>
  )
}

/**
 * A post's Primary resource set in the article's side rail: the rail's own voice
 * (mono meta, small type) under a hairline that recedes beside the rail's
 * full-ink rule, and the 32px `action` chip, since the rail is a desktop
 * column with a fine pointer. No card: the rail is already a frame, and a
 * box inside it would compete with the article it sits beside.
 */
export const ResourceDownloadRail: React.FC<ResourceDownloadProps> = ({ className, ...props }) => {
  const download = resolveDownload(props)
  if (!download) return null

  return (
    <div className={cn('flex flex-col gap-4 border-t border-border pt-3', className)}>
      <div className="flex flex-col gap-1.5">
        {download.meta ? (
          <p className="font-mono text-xs leading-normal text-muted-foreground tabular-nums">
            {download.meta}
          </p>
        ) : null}
        <p className="text-sm/snug font-medium text-balance">{download.title}</p>
        {download.body ? (
          <p className="text-sm/relaxed text-pretty text-muted-foreground">{download.body}</p>
        ) : null}
      </div>
      <DownloadLink
        className="self-start"
        download={download}
        location="download_rail"
        size="action"
      />
    </div>
  )
}
