'use client'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex justify-end">
      <Button
        variant="secondary"
        onClick={async () => {
          await navigator.clipboard.writeText(code)
          if (!copied) {
            setCopied(true)
            setTimeout(() => {
              setCopied(false)
            }, 1000)
          }
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
        {copied ? <IconCheck data-icon="inline-end" /> : <IconCopy data-icon="inline-end" />}
      </Button>
    </div>
  )
}
