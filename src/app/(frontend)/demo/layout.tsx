import type { ReactNode } from 'react'
import { DemoNav } from '@/shared/ui/demo-kit'

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pt-16">
      <div className="container max-w-4xl pt-6">
        <DemoNav />
      </div>
      {children}
    </div>
  )
}
