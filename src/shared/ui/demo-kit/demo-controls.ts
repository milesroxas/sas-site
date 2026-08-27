'use client'

import { button, useControls, useStoreContext } from 'leva'
import type { Schema } from 'leva/dist/declarations/src/types'
import { useRef } from 'react'

/**
 * leva ships fixed px radii (xs 2 / sm 3 / lg 10) and a heavy root shadow;
 * remap them to the site's radius tokens so the GUI reads as part of the
 * design system — panel corners match sibling inner surfaces (rounded-md),
 * controls match the smallest site radius.
 */
export const levaTheme = {
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
 * `useControls` bound to the surrounding demo surface's leva store. leva's own
 * hook ignores the store context and falls back to the global store, so demo
 * content must use this wrapper for its controls to land in the local panel.
 */
export function useDemoControls<S extends Schema>(folderName: string, schema: S) {
  const store = useStoreContext()
  // Folders start collapsed so dense panels stay scannable.
  return useControls(folderName, schema, { collapsed: true }, { store })
}

/**
 * `useDemoControls` that also hands back leva's setter, for demos that write
 * values *into* the panel — loading a preset, say. The panel, what's on screen
 * and the emitted snippet then stay one truth, instead of the demo applying a
 * look behind the GUI's back.
 *
 * leva only returns a setter when the schema arrives as a function, and it
 * reads that function exactly once, so the schema is static here just as it is
 * in the plain form. The setter takes plain schema keys — leva maps them onto
 * the folder's paths itself.
 */
export function useSettableDemoControls<S extends Schema>(folderName: string, schema: S) {
  const store = useStoreContext()
  const schemaRef = useRef(schema)
  return useControls<S, string, () => S>(
    folderName,
    () => schemaRef.current,
    { collapsed: true },
    { store },
  )
}

/**
 * The demo's play/replay trigger, pinned at the top of the panel: a
 * root-level input with a negative order sorts above every folder (default 0)
 * and can never be collapsed away.
 */
export function useDemoAction(label: string, onClick: () => void) {
  const store = useStoreContext()
  // leva captures the schema on first render; route the click through a ref so
  // the button always fires the latest callback.
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick
  useControls({ [label]: { ...button(() => onClickRef.current()), order: -1 } }, { store })
}
