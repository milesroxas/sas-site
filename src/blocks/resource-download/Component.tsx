import { IconDownload } from '@tabler/icons-react'
import type React from 'react'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { CtaClick } from '@/components/CtaClick'
import { buttonVariants } from '@/components/ui/button'
import type { ResourceDownloadBlock as ResourceDownloadData } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { downloadableResource, fileTypeLabel, formatFileSize, resourceHref } from './resource'

export type ResourceDownloadProps = Pick<
  ResourceDownloadData,
  'buttonLabel' | 'description' | 'heading' | 'resource'
> & { className?: string }

/**
 * The download card: what the file is, then the one action that hands it
 * over. Every visual decision lives here, so a download reads the same inline
 * in a post body and on the composition grid (`Section.tsx`); the className a
 * caller passes is placement, nothing else.
 *
 * Stacked in a narrow column; from a 32rem container the copy and the button
 * share a row, bottoms aligned, so the button ends the thought it sits beside.
 * The type and size line is the reader's "what am I getting" before the click.
 *
 * Renders nothing unless the resource is downloadable (`downloadableResource`).
 *
 * `download` only takes effect on a same-origin URL, so on the R2 custom
 * domain the object's own `Content-Disposition: attachment` metadata is what
 * makes a PDF save instead of open (Resources `hooks/attachmentDisposition.ts`).
 */
export const ResourceDownload: React.FC<ResourceDownloadProps> = ({
  buttonLabel,
  className,
  description,
  heading,
  resource,
}) => {
  const file = downloadableResource(resource)
  const href = file ? resourceHref(file) : ''
  if (!file || !href) return null

  const type = fileTypeLabel(file)
  const size = formatFileSize(file.filesize)
  const title = heading?.trim() || file.title
  const body = description?.trim() || file.description?.trim()
  const label = buttonLabel?.trim() || (type ? `Download ${type}` : 'Download')
  const meta = [type, size].filter(Boolean).join(' · ')

  return (
    <div
      className={cn(
        'not-prose @container rounded-lg border border-border bg-background p-6 text-foreground',
        className,
      )}
    >
      <div className="flex flex-col gap-6 @lg:flex-row @lg:items-end @lg:justify-between @lg:gap-10">
        <div className="text-stack min-w-0">
          {meta ? (
            <p className={cn(eyebrowClassName, 'text-muted-foreground tabular-nums')}>{meta}</p>
          ) : null}
          <h3 className="text-lead font-medium text-balance">{title}</h3>
          {body ? (
            <p className="max-w-prose text-base/relaxed text-pretty text-muted-foreground">
              {body}
            </p>
          ) : null}
        </div>
        <CtaClick href={href} label={label} location="download">
          <a
            className={cn(buttonVariants({ size: 'xl' }), 'self-start @lg:self-auto')}
            download={file.filename ?? true}
            href={href}
          >
            {label}
            {/* Read after the label, so the name says which file and how big. */}
            <span className="sr-only">{`: ${title}${meta ? `, ${meta}` : ''}`}</span>
            <IconDownload
              aria-hidden="true"
              className="transition-transform duration-150 ease-out group-hover/button:translate-y-0.5 motion-reduce:transition-none"
              data-icon="inline-end"
            />
          </a>
        </CtaClick>
      </div>
    </div>
  )
}
