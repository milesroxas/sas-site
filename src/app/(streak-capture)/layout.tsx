import type { ReactNode } from 'react'

export default function CaptureLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: 'transparent' }}>{children}</body>
    </html>
  )
}
