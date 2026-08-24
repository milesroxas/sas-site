'use client'

import { IconCopy } from '@tabler/icons-react'
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDemoSettings } from './demo-settings'
import { formatSnippet, type PasteTarget } from './format-snippet'
import { PasteGuideDialog } from './paste-guide-dialog'

export type SnippetRegister = (values: Record<string, unknown>) => void

const SnippetContext = createContext<SnippetRegister | null>(null)

/**
 * Wires demo content to the surface owning the copy button (an inline
 * DemoSection or a DemoShell controls panel): content reports its applied
 * values here, the owner reads them when copy is pressed.
 */
export function DemoSnippetProvider({
  register,
  children,
}: {
  register: SnippetRegister
  children: ReactNode
}) {
  return <SnippetContext.Provider value={register}>{children}</SnippetContext.Provider>
}

/**
 * Registers the values the surrounding copy button emits. Demo content calls
 * this with the exact props it hands the feature component, so the snippet
 * carries applied units rather than raw GUI numbers.
 */
export function useDemoSnippet(values: Record<string, unknown>) {
  const register = useContext(SnippetContext)
  // Serialized so the effect only fires when a value actually changes — the
  // object identity is new on every render.
  const serialized = JSON.stringify(values)

  useEffect(() => {
    register?.(JSON.parse(serialized) as Record<string, unknown>)
  }, [register, serialized])
}

export type SnippetCopyController = {
  /** Hand to DemoSnippetProvider so demo content can report its values. */
  register: SnippetRegister
  copy: () => Promise<void>
  copyState: 'idle' | 'copied' | 'failed'
  resetCopyState: () => void
  guideOpen: boolean
  setGuideOpen: (open: boolean) => void
  snippet: string
  stopShowingGuide: () => void
}

/**
 * The whole copy-to-clipboard flow for one demo surface: collects the values
 * demo content registers, formats them for the paste target on copy, and
 * drives the copied/failed button state plus the paste guide dialog.
 */
export function useSnippetCopy(paste: PasteTarget | undefined): SnippetCopyController {
  const { guideOnCopy, set } = useDemoSettings()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [guideOpen, setGuideOpen] = useState(false)
  const [snippet, setSnippet] = useState('')
  const valuesRef = useRef<Record<string, unknown>>({})
  const registerRef = useRef<SnippetRegister>((values) => {
    valuesRef.current = values
  })

  const copy = async () => {
    if (!paste) return
    const code = formatSnippet(valuesRef.current, paste)
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      setCopyState('failed')
      return
    }
    setSnippet(code)
    setCopyState('copied')
    if (guideOnCopy) setGuideOpen(true)
  }

  return {
    register: registerRef.current,
    copy,
    copyState,
    resetCopyState: () => setCopyState('idle'),
    guideOpen,
    setGuideOpen,
    snippet,
    stopShowingGuide: () => set('guideOnCopy', false),
  }
}

/** Copy button reflecting the controller's copied/failed state. */
export function SnippetCopyButton({
  controller,
  variant = 'outline',
}: {
  controller: SnippetCopyController
  variant?: 'outline' | 'ghost'
}) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={controller.copy}
      onBlur={controller.resetCopyState}
    >
      <IconCopy aria-hidden />
      {controller.copyState === 'copied'
        ? 'Copied'
        : controller.copyState === 'failed'
          ? 'Copy failed'
          : 'Copy'}
    </Button>
  )
}

/** The controller's paste guide, shown after a copy when the setting is on. */
export function SnippetGuide({
  controller,
  paste,
}: {
  controller: SnippetCopyController
  paste: PasteTarget
}) {
  return (
    <PasteGuideDialog
      open={controller.guideOpen}
      onOpenChange={controller.setGuideOpen}
      target={paste}
      snippet={controller.snippet}
      onStopShowing={controller.stopShowingGuide}
    />
  )
}
