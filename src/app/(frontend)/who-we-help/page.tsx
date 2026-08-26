import type { Metadata } from 'next'
import { SegmentIndex } from '@/sections/SegmentIndex'

export default function WhoWeHelpIndexPage() {
  return <SegmentIndex basePath="/who-we-help" collection="audience-pages" heading="Who we help" />
}

export function generateMetadata(): Metadata {
  return { title: 'Who We Help | Suits & Sandals' }
}
