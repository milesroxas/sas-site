import type { Metadata } from 'next/types'
import { AskWidget } from '@/features/ask/AskWidget'

export default function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Ask</h1>
        </div>
        <div className="max-w-[50rem] mx-auto">
          <AskWidget />
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Ask | Suits & Sandals',
  }
}
