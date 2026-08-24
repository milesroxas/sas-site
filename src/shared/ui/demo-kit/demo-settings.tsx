'use client'

import { IconAdjustmentsHorizontal } from '@tabler/icons-react'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const STORAGE_KEY = 'sas.immersive-demo.settings'

export type DemoSettings = {
  /** Open the paste guide after the copy button puts values on the clipboard. */
  guideOnCopy: boolean
}

const DEFAULTS: DemoSettings = { guideOnCopy: true }

type DemoSettingsValue = DemoSettings & {
  set: <K extends keyof DemoSettings>(key: K, value: DemoSettings[K]) => void
}

/** Defaults keep sections usable outside the provider (e.g. in isolation). */
const DemoSettingsContext = createContext<DemoSettingsValue>({ ...DEFAULTS, set: () => {} })

export function useDemoSettings() {
  return useContext(DemoSettingsContext)
}

/**
 * Holds the demo-wide GUI preferences and mirrors them to localStorage, so a
 * reload keeps the paste guide where you left it.
 */
export function DemoSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULTS)

  // Read after mount — the server render has no localStorage, and seeding
  // state from it directly would hydrate mismatched.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as Partial<DemoSettings>
      setSettings({ ...DEFAULTS, guideOnCopy: parsed.guideOnCopy ?? DEFAULTS.guideOnCopy })
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const value = useMemo<DemoSettingsValue>(
    () => ({
      ...settings,
      set: (key, next) => {
        const updated = { ...settings, [key]: next }
        setSettings(updated)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      },
    }),
    [settings],
  )

  return <DemoSettingsContext.Provider value={value}>{children}</DemoSettingsContext.Provider>
}

/** Page-level menu for the preferences every demo section reads. */
export function DemoSettingsMenu() {
  const { guideOnCopy, set } = useDemoSettings()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <IconAdjustmentsHorizontal aria-hidden />
          GUI settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Applies to every section</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={guideOnCopy}
          onCheckedChange={(checked) => set('guideOnCopy', checked)}
        >
          Show paste guide after copying
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
