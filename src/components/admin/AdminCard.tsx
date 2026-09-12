import Link from 'next/link'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  marginBottom: 24,
  padding: 24,
}

/** A row in a card's preview list: one document, linking to it. */
export const adminRowStyle: React.CSSProperties = {
  alignItems: 'baseline',
  borderTop: '1px solid var(--theme-elevation-100)',
  display: 'flex',
  gap: 16,
  padding: '10px 0',
  textDecoration: 'none',
}

/** A dashboard card: a title, a link to the list it summarizes, and the summary. */
export function AdminCard({
  title,
  href,
  action,
  children,
}: {
  title: string
  href: string
  action: string
  children: React.ReactNode
}) {
  return (
    <section style={cardStyle}>
      <header style={{ alignItems: 'baseline', display: 'flex', gap: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>{title}</h2>
        <Link href={href} style={{ fontSize: 12, marginLeft: 'auto' }}>
          {action}
        </Link>
      </header>
      {children}
    </section>
  )
}
