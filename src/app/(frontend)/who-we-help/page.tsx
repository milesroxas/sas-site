import type { Metadata } from 'next'
import { SegmentIndex } from '@/sections/SegmentIndex'

export default function WhoWeHelpIndexPage() {
  return <SegmentIndex basePath="/who-we-help" collection="audience-pages" heading="Who we help" />
}

export function generateMetadata(): Metadata {
  return {
    title: 'Who We Help | Suits & Sandals',
    description:
      'The organizations Suits & Sandals works with: technical B2B companies, healthtech and life sciences, SaaS platforms, and companies repositioning for their next stage.',
    alternates: { canonical: '/who-we-help' },
  }
}
