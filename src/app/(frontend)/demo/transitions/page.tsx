import type { Metadata } from 'next'
import { TransitionDemoPage } from '@/widgets/transition-demo'

export default function TransitionDemoRoute() {
  return (
    <article>
      <TransitionDemoPage />
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Page transition demo',
  robots: 'noindex, nofollow',
}
