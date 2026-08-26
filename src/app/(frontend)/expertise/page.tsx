import type { Metadata } from 'next'
import { SegmentIndex } from '@/sections/SegmentIndex'

export default function ExpertiseIndexPage() {
  return <SegmentIndex basePath="/expertise" collection="expertise-pages" heading="Expertise" />
}

export function generateMetadata(): Metadata {
  return { title: 'Expertise | Suits & Sandals' }
}
