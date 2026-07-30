'use client'

import { IconClipboardCheck } from '@tabler/icons-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { PasteTarget } from './format-snippet'

const codeClass = 'rounded-sm bg-muted px-1 py-0.5 font-mono text-xs text-foreground'

export type PasteGuideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: PasteTarget
  snippet: string
  /** Turns the guide off for every section until it is re-enabled in GUI settings. */
  onStopShowing: () => void
}

/** Shown after the copy button lands values on the clipboard: where they go. */
export function PasteGuideDialog({
  open,
  onOpenChange,
  target,
  snippet,
  onStopShowing,
}: PasteGuideDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="data-[size=default]:max-w-[min(92vw,40rem)] data-[size=default]:sm:max-w-[min(92vw,40rem)]">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <IconClipboardCheck aria-hidden />
          </AlertDialogMedia>
          <AlertDialogTitle>Values copied</AlertDialogTitle>
          <AlertDialogDescription>{target.note}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 text-left">
          <p className="max-w-prose text-sm/relaxed text-pretty text-muted-foreground">
            Open <code className={codeClass}>{target.file}</code> and replace{' '}
            {target.format === 'object' ? (
              <code className={codeClass}>{target.symbol}</code>
            ) : (
              <>
                the props on <code className={codeClass}>{`<${target.symbol} />`}</code>
              </>
            )}{' '}
            with the clipboard contents:
          </p>
          <ScrollArea
            className="rounded-md border border-border bg-muted/40"
            viewportClassName="max-h-64"
          >
            <pre className="p-3 font-mono text-xs/relaxed text-foreground">
              <code>{snippet}</code>
            </pre>
          </ScrollArea>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStopShowing}>Stop showing this</AlertDialogCancel>
          <AlertDialogAction>Done</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
