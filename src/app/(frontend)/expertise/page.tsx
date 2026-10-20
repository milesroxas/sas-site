import type { Metadata } from 'next'
import { SegmentIndex } from '@/sections/SegmentIndex'

export default function ExpertiseIndexPage() {
  return <SegmentIndex basePath="/expertise" collection="expertise-pages" heading="Expertise" />
}

export function generateMetadata(): Metadata {
  return {
    title: 'Expertise | Suits & Sandals',
    description:
      'What Suits & Sandals does: brand positioning and messaging, website strategy and UX, product design systems, sales and investor communications, and embedded creative support.',
    alternates: { canonical: '/expertise' },
  }
}
