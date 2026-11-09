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
  /** The editor's button label, else "Download": for a row that shows the type beside it. */
  bareLabel: string
  filename: string | null | undefined
  href: string
  /** The editor's button label, else "Download PDF": for a button that stands alone. */
  label: string
  meta: string
  /** "2.4 MB", or empty when the size is unknown. */
  size: string
  title: string
  /** "PDF", or empty when the file has no recognisable type. */
  type: string
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
  const custom = buttonLabel?.trim()
  const size = formatFileSize(file.filesize)
  return {
    bareLabel: custom || 'Download',
    body: description?.trim() || file.description?.trim() || undefined,
    filename: file.filename,
    href,
    label: custom || (type ? `Download ${type}` : 'Download'),
    meta: [type, size].filter(Boolean).join(' · '),
    size,
    title: heading?.trim() || file.title,
    type,
  }
}

/**
 * The anchor both layouts end on, with its click tracked. `download` only takes
 * effect on a same-origin URL, so on the R2 custom domain the object's own
 * `Content-Disposition: attachment` metadata is what makes a PDF save instead
 * of open (Resources `hooks/attachmentDisposition.ts`).
 */
const DownloadAnchor: React.FC<{
  children: React.ReactNode
  className: string
  download: Download
  label: string
  location: CtaLocation
}> = ({ children, className, download, label, location }) => (
  <CtaClick href={download.href} label={label} location={location}>
    <a className={className} download={download.filename ?? true} href={download.href}>
      {children}
    </a>
  </CtaClick>
)

/** The arrow drops a step on hover, the direction the file is about to go. */
const DownloadGlyph: React.FC = () => (
  <IconDownload
    aria-hidden="true"
    className="size-4 transition-transform duration-150 ease-out group-hover/button:translate-y-0.5 motion-reduce:transition-none"
    data-icon="inline-end"
  />
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
        <DownloadAnchor
          className={cn(buttonVariants({ size: 'xl' }), 'self-start @lg:self-auto')}
          download={download}
          label={download.label}
          location="download"
        >
          {download.label}
          {/* Read after the label, so the name says which file and how big. */}
          <span className="sr-only">{`: ${download.title}${download.meta ? `, ${download.meta}` : ''}`}</span>
          <DownloadGlyph />
        </DownloadAnchor>
      </div>
    </div>
  )
}

/** A title block's field label: small mono caps over the value it names. */
const fieldLabelClassName = 'font-mono text-xs/none tracking-widest text-muted-foreground uppercase'

/**
 * A post's Primary resource, drawn as a drawing sheet's title block: the file
 * filed like a sheet, not sold like a product. One design at every width: in
 * the side rail from `lg`, and closing the article below it, where the post
 * page has no rail. The caller passes the placement (`className`) and which
 * of the two it is (`location`), so rail and end-of-article clicks stay apart.
 *
 * The drafting rules it keeps: two line weights only (a full-ink frame, thin
 * `border` rules between cells); every value sits under a mono field label;
 * cells share their rules, never gaps; no fill and no colour at rest. The
 * file type takes the sheet-number cell at the top right. The last cell is
 * the action, with the size beside the arrow so "how big" is on the line you
 * click; on hover it fills with ink, the only filled cell the block ever
 * shows. Sharp corners: a title block is ruled, not rounded.
 *
 * The description is clamped from `lg` only, the post page's rail breakpoint:
 * the rail is sticky, and a long one would push the action below a short
 * viewport. In the article's flow below `lg` it reads in full.
 *
 * Padding is optical, measured on the ink: a cell's type should sit about
 * 13px off every rule. Line boxes add leading the eye does not count, so the
 * header cells take less below (the gap is read to the baseline) and the
 * relaxed-leading description takes less above and below. In the action row
 * the label and size share a baseline (sans and mono centered on their line
 * boxes land 1px apart), and the arrow, whose glyph is inset in its box,
 * moves 1px out to sit on the label's 13px margin.
 */
export const ResourceDownloadTitleBlock: React.FC<
  ResourceDownloadProps & { location: Extract<CtaLocation, 'download' | 'download_rail'> }
> = ({ className, location, ...props }) => {
  const download = resolveDownload(props)
  if (!download) return null

  return (
    <div className={cn('flex flex-col border border-foreground text-foreground', className)}>
      <div className="flex">
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 pt-3 pb-2">
          <p className={fieldLabelClassName}>Resource</p>
          <p className="text-sm/snug font-medium text-balance">{download.title}</p>
        </div>
        {download.type ? (
          <div className="flex shrink-0 flex-col gap-2 border-l border-border px-3 pt-3 pb-2">
            <p className={fieldLabelClassName}>Format</p>
            <p className="font-mono text-sm/snug">{download.type}</p>
          </div>
        ) : null}
      </div>
      {download.body ? (
        <p className="border-t border-border px-3 pt-2 pb-1.5 text-sm/relaxed text-pretty text-muted-foreground lg:line-clamp-4">
          {download.body}
        </p>
      ) : null}
      <DownloadAnchor
        className={cn(
          'group/button flex h-11 touch-manipulation items-center gap-2 border-t border-foreground px-3 text-sm outline-none',
          'transition-colors duration-150 ease-out motion-reduce:transition-none',
          'hover:bg-foreground hover:text-background active:bg-foreground/85 active:text-background',
          'focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring',
        )}
        download={download}
        label={download.bareLabel}
        location={location}
      >
        <span className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
          <span className="min-w-0 truncate">
            {download.bareLabel}
            <span className="sr-only">{`: ${download.title}${download.meta ? `, ${download.meta}` : ''}`}</span>
          </span>
          {download.size ? (
            <span aria-hidden="true" className="shrink-0 font-mono text-xs tabular-nums">
              {download.size}
            </span>
          ) : null}
        </span>
        <span className="-mr-px flex shrink-0">
          <DownloadGlyph />
        </span>
      </DownloadAnchor>
    </div>
  )
}
