import type { Metadata } from 'next'
import { ImmersiveDemoPage } from '@/widgets/immersive-demo'

export default function ImmersiveDemoRoute() {
  return (
    <article className="pt-16">
      <ImmersiveDemoPage />
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Immersive demo',
  robots: 'noindex, nofollow',
}
