'use client'

import { IconCopy } from '@tabler/icons-react'
import { LevaPanel, LevaStoreProvider, useControls, useCreateStore, useStoreContext } from 'leva'
import type { Schema } from 'leva/dist/declarations/src/types'
import type { CSSProperties, ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDemoSettings } from './demo-settings'
import { formatSnippet, type PasteTarget } from './format-snippet'
import { PasteGuideDialog } from './paste-guide-dialog'

export type DemoSectionProps = {
  title: string
  description?: string
  /** Enables the copy button and tells the guide where the values belong. */
  paste?: PasteTarget
  children: ReactNode
}

/**
 * leva ships fixed px radii (xs 2 / sm 3 / lg 10) and a heavy root shadow;
 * remap them to the site's radius tokens so the GUI reads as part of the
 * design system — panel corners match sibling inner surfaces (rounded-md),
 * controls match the smallest site radius.
 */
const levaTheme = {
  radii: {
    xs: 'var(--radius-sm)',
    sm: 'var(--radius-sm)',
    lg: 'var(--radius-md)',
  },
  shadows: {
    level1: 'none',
  },
}

/** Panel column width — shared by the open grid track and the closed measuring box. */
const GUI_WIDTH = '280px'

type SnippetRegister = (values: Record<string, unknown>) => void

const SnippetContext = createContext<SnippetRegister | null>(null)

/**
 * Registers the values the section's copy button emits. Demo content calls
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

/**
 * Shell for one demo on the immersive route: header with a GUI toggle and a
 * copy button, an isolated leva store, and an inline panel that reveals on
 * demand. Demo content declares its controls with `useDemoControls`, which
 * binds to this section's store — so any number of sections coexist without
 * their GUIs or values colliding.
 */
export function DemoSection({ title, description, paste, children }: DemoSectionProps) {
  const store = useCreateStore()
  const { guideOnCopy, panelsOpen, set } = useDemoSettings()
  const [guiOpen, setGuiOpen] = useState(panelsOpen)
  const [defaultOpen, setDefaultOpen] = useState(panelsOpen)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [guideOpen, setGuideOpen] = useState(false)
  const [snippet, setSnippet] = useState('')
  const valuesRef = useRef<Record<string, unknown>>({})

  // The GUI settings menu drives every section at once. Adjusted during
  // render rather than in an effect — an effect would land after the browser
  // had already painted the toggled panel, so switching the setting (or any
  // remount, Fast Refresh included) made the panel flash open and collapse.
  if (defaultOpen !== panelsOpen) {
    setDefaultOpen(panelsOpen)
    setGuiOpen(panelsOpen)
  }

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

  return (
    <section className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-6 space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="space-y-2">
          <h2 className="text-balance text-xl font-medium tracking-tight">{title}</h2>
          {description ? (
            <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {paste ? (
            <Button variant="outline" size="sm" onClick={copy} onBlur={() => setCopyState('idle')}>
              <IconCopy aria-hidden />
              {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy'}
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            aria-expanded={guiOpen}
            onClick={() => setGuiOpen((open) => !open)}
          >
            {guiOpen ? 'Hide GUI' : 'Show GUI'}
          </Button>
        </div>
      </header>

      <div
        className={
          guiOpen
            ? 'relative grid gap-4 md:grid-cols-[minmax(0,1fr)_var(--demo-gui-width)]'
            : 'relative'
        }
        style={{ '--demo-gui-width': GUI_WIDTH } as CSSProperties}
      >
        <div className="min-w-0 space-y-4">
          <SnippetContext.Provider value={registerRef.current}>
            <LevaStoreProvider store={store}>{children}</LevaStoreProvider>
          </SnippetContext.Provider>
        </div>
        {/* Mounted once and never remounted on toggle: leva paints its folders
            open and animates them closed on mount, which reads as the panel
            flashing open and snapping shut every time it is revealed.
            Hidden with visibility rather than `display: none`: leva pins the
            panel height from a measurement it takes in an effect, and a
            subtree with no layout box measures 0 — the panel then paints its
            rows over a collapsed, background-less box until a nested folder
            transition bubbles up and clears the pinned height. Out of flow at
            the panel's real width so the closed state keeps one column and
            still measures true. */}
        <aside
          aria-label={`${title} controls`}
          inert={!guiOpen}
          className={
            guiOpen
              ? undefined
              : 'invisible pointer-events-none absolute top-0 right-0 w-(--demo-gui-width)'
          }
        >
          <LevaPanel store={store} theme={levaTheme} fill titleBar={false} hideCopyButton />
        </aside>
      </div>

      {paste ? (
        <PasteGuideDialog
          open={guideOpen}
          onOpenChange={setGuideOpen}
          target={paste}
          snippet={snippet}
          onStopShowing={() => set('guideOnCopy', false)}
        />
      ) : null}
    </section>
  )
}

/**
 * `useControls` bound to the surrounding DemoSection's leva store. leva's own
 * hook ignores the store context and falls back to the global store, so demo
 * content must use this wrapper for its controls to land in the section panel.
 */
export function useDemoControls<S extends Schema>(folderName: string, schema: S) {
  const store = useStoreContext()
  // Folders start collapsed so dense panels stay scannable.
  return useControls(folderName, schema, { collapsed: true }, { store })
}
