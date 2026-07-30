'use client'

import { LevaPanel, LevaStoreProvider, useControls, useCreateStore, useStoreContext } from 'leva'
import type { Schema } from 'leva/dist/declarations/src/types'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export type DemoSectionProps = {
  title: string
  description?: string
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

/**
 * Shell for one demo on the immersive route: header with a GUI toggle button,
 * an isolated leva store, and an inline panel that reveals on demand. Demo
 * content declares its controls with `useDemoControls`, which binds to this
 * section's store — so any number of sections coexist without their GUIs or
 * values colliding.
 */
export function DemoSection({ title, description, children }: DemoSectionProps) {
  const store = useCreateStore()
  const [guiOpen, setGuiOpen] = useState(false)

  return (
    <section className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6 space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-xl font-medium">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          aria-expanded={guiOpen}
          onClick={() => setGuiOpen((open) => !open)}
        >
          {guiOpen ? 'Hide GUI' : 'Show GUI'}
        </Button>
      </header>

      <div className={guiOpen ? 'grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]' : undefined}>
        <div className="min-w-0 space-y-4">
          <LevaStoreProvider store={store}>{children}</LevaStoreProvider>
        </div>
        {guiOpen && (
          <aside aria-label={`${title} controls`}>
            <LevaPanel store={store} theme={levaTheme} fill titleBar={false} hideCopyButton />
          </aside>
        )}
      </div>
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
