import { ShimmerEffect } from '@payloadcms/ui'
import Link from 'next/link'
import styles from './admin-card.module.css'

const isExternal = (href: string) => /^https?:\/\//.test(href)

/** An admin link: `next/link` inside the admin, a new tab off it. */
function AdminLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string
  className?: string
  children: React.ReactNode
} & React.AriaAttributes) {
  return isExternal(href) ? (
    <a
      className={className}
      data-external
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...rest}
    >
      {children}
    </a>
  ) : (
    <Link className={className} href={href} {...rest}>
      {children}
    </Link>
  )
}

/**
 * A dashboard card: a title, an optional `meta` beside it (the window it
 * counts), any `controls`, and a link to the list it summarizes. A link that
 * stays in the admin ends in `→`, one that leaves it opens a new tab and ends
 * in `↗`. A card that only continues its neighbor's story leaves the link to
 * the neighbor. Fills its dashboard widget, so cards side by side end on one
 * line; Payload's widget grid owns the gaps between them.
 */
export function AdminCard({
  title,
  meta,
  href,
  action,
  controls,
  children,
}: {
  title: string
  meta?: React.ReactNode
  href?: string
  action?: string
  controls?: React.ReactNode
  children: React.ReactNode
}) {
  const external = href ? isExternal(href) : false
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{title}</h2>
          {meta && <span className={styles.meta}>{meta}</span>}
        </div>
        {controls && <div className={styles.controls}>{controls}</div>}
        {href && action && (
          <AdminLink className={styles.action} href={href}>
            {action}
            <span aria-hidden className={styles.glyph}>
              {external ? '↗' : '→'}
            </span>
          </AdminLink>
        )}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

export type AdminStatItem = {
  label: string
  /** `null` while the count is on its way. */
  value: string | number | null
  /** The list the count was taken from. */
  href?: string
  /** Zero, or nothing to act on: the value steps back. */
  quiet?: boolean
  /** Waiting on someone: a warning dot beside the label. */
  flag?: boolean
}

/**
 * Counts in one strip. Three to a row, two on a narrow card once there are
 * more than three, so every row is full. A count with an `href` is a link to
 * the list it was taken from.
 */
export function AdminStats({ items, label }: { items: AdminStatItem[]; label: string }) {
  const cols = Math.min(items.length, 3)
  const narrow = items.length > 3 ? 2 : cols
  return (
    <ul
      aria-label={label}
      className={styles.stats}
      style={{ '--cols': cols, '--cols-narrow': narrow } as React.CSSProperties}
    >
      {items.map((item) => (
        <li key={item.label}>
          <AdminStat item={item} />
        </li>
      ))}
    </ul>
  )
}

function AdminStat({ item }: { item: AdminStatItem }) {
  const quiet = item.quiet ?? (item.value === 0 || item.value === '0')
  const content = (
    <>
      <span className={styles.statLabel}>
        {item.flag && <span aria-hidden className={styles.statFlag} />}
        {item.label}
      </span>
      {item.value === null ? (
        <span aria-hidden className={styles.statPending}>
          <ShimmerEffect height={32} width={48} />
        </span>
      ) : (
        <span className={styles.statValue} data-quiet={quiet}>
          {item.value}
        </span>
      )}
    </>
  )
  return item.href ? (
    <AdminLink className={styles.stat} href={item.href}>
      {content}
    </AdminLink>
  ) : (
    <div className={styles.stat}>{content}</div>
  )
}

/** A titled list inside a card, with an optional note at the right of its title. */
export function AdminList({
  title,
  note,
  empty,
  children,
}: {
  title: string
  note?: string
  /** Shown instead of the rows when there are none. */
  empty?: string | false
  children?: React.ReactNode
}) {
  return (
    <section className={styles.list}>
      <div className={styles.listHead}>
        <h3>{title}</h3>
        {note && <span>{note}</span>}
      </div>
      {empty ? <p className={styles.empty}>{empty}</p> : children}
    </section>
  )
}

/** The rows of an `AdminList`: one document each, the whole line its link. */
export function AdminRows({ children }: { children: React.ReactNode }) {
  return <ul className={styles.rows}>{children}</ul>
}

/**
 * One document. `lead` sits before the title (a reference), `details` after
 * it, right-aligned; a detail marked `wideOnly` drops out on a narrow card so
 * the title keeps its room.
 */
export function AdminRow({
  href,
  lead,
  title,
  details = [],
}: {
  href: string
  lead?: string | null
  title: string
  details?: { text: string; wideOnly?: boolean }[]
}) {
  return (
    <li>
      <AdminLink className={styles.row} href={href}>
        {lead && <span className={styles.rowLead}>{lead}</span>}
        <span className={styles.rowTitle} title={title}>
          {title}
        </span>
        {details.map((detail, index) => (
          <span className={styles.rowDetail} data-wide-only={detail.wideOnly} key={index}>
            {detail.text}
          </span>
        ))}
      </AdminLink>
    </li>
  )
}
