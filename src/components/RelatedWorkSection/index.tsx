import type React from 'react'
import { WorkPageCard, type WorkPageCardData } from '@/components/WorkPageCard'

type Props = {
  pages: WorkPageCardData[]
  heading?: string
}

export const RelatedWorkSection: React.FC<Props> = ({ pages, heading = 'Related work' }) => {
  if (!pages.length) return null
  return (
    <section className="container mt-24">
      <h2 className="mb-12 text-4xl">{heading}</h2>
      <div className="grid gap-12 md:grid-cols-2">
        {pages.map((page) => (
          <WorkPageCard key={page.id} page={page} titleAs="h3" />
        ))}
      </div>
    </section>
  )
}
