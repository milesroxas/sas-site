import type { Metadata } from 'next'
import { ImmersiveDemoPage } from '@/widgets/immersive-demo'

export default function ImmersiveDemoRoute() {
  return <ImmersiveDemoPage />
}

export const metadata: Metadata = {
  title: 'Micro interactions demo',
  robots: 'noindex, nofollow',
}
