'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Adds an "All / <group>" segmented filter to Payload's blocks drawer.
 *
 * Payload exposes no extension point for the drawer itself (only the block
 * row), so this augments the rendered drawer from the outside via an admin
 * `providers` component — an officially supported API. It relies solely on
 * Payload's public `.blocks-drawer__*` class names: if an upgrade changes
 * that markup, the filter simply never mounts and the drawer falls back to
 * its default grouped list. Nothing here touches data or save behavior.
 *
 * Tab labels are read from the group headings Payload renders (driven by
 * each block's `admin.group` — see `src/blocks/shared/groups.ts`), so new
 * groups appear automatically with zero wiring.
 */

const WRAPPER_SELECTOR = '.blocks-drawer__blocks-wrapper'
const GROUP_SELECTOR = '.blocks-drawer__block-group'
const GROUP_LABEL_SELECTOR = '.blocks-drawer__block-group-label'
const MOUNTED_FLAG = 'blocksDrawerTabs'

const ALL = '__all__'

type Mount = { container: HTMLElement; id: number; wrapper: HTMLElement }

const styles = `
  .blocks-drawer-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--base) * 0.25);
    margin-bottom: var(--base);
    margin-top: var(--base);
  }
  .blocks-drawer-tabs__tab {
    appearance: none;
    border: 1px solid var(--theme-elevation-150);
    border-radius: 2rem;
    background: var(--theme-elevation-0);
    color: var(--theme-elevation-800);
    font: inherit;
    font-size: 1rem;
    line-height: 1;
    padding: calc(var(--base) * 0.3) calc(var(--base) * 0.6);
    cursor: pointer;
  }
  .blocks-drawer-tabs__tab:hover {
    background: var(--theme-elevation-100);
  }
  .blocks-drawer-tabs__tab[aria-pressed='true'] {
    background: var(--theme-elevation-800);
    border-color: var(--theme-elevation-800);
    color: var(--theme-elevation-0);
  }
`

const DrawerTabs: React.FC<{ wrapper: HTMLElement }> = ({ wrapper }) => {
  // Captured once while the drawer shows its full list; search later removes
  // empty groups from the DOM, so live reads would drop tabs mid-typing.
  const [groups] = useState<string[]>(() =>
    Array.from(wrapper.querySelectorAll(GROUP_LABEL_SELECTOR), (el) => el.textContent ?? '').filter(
      Boolean,
    ),
  )
  const [active, setActive] = useState(ALL)

  const applyFilter = useCallback(() => {
    for (const group of wrapper.querySelectorAll<HTMLElement>(GROUP_SELECTOR)) {
      const label = group.querySelector(GROUP_LABEL_SELECTOR)?.textContent
      group.style.display = active === ALL || label === active ? '' : 'none'
    }
  }, [wrapper, active])

  useEffect(() => {
    applyFilter()
    // Search re-renders the group list; re-apply the filter when it does.
    // Toggling `display` is attribute-only, so a childList observer can't loop.
    const observer = new MutationObserver(applyFilter)
    observer.observe(wrapper, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [wrapper, applyFilter])

  if (groups.length < 2) return null

  return (
    <div className="blocks-drawer-tabs">
      {[ALL, ...groups].map((group) => (
        <button
          key={group}
          type="button"
          className="blocks-drawer-tabs__tab"
          aria-pressed={active === group}
          onClick={() => setActive(group)}
        >
          {group === ALL ? 'All' : group}
        </button>
      ))}
    </div>
  )
}

export const BlocksDrawerTabs: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mounts, setMounts] = useState<Mount[]>([])

  useEffect(() => {
    let nextId = 0

    const scan = () => {
      setMounts((current) => {
        let changed = false
        const alive = current.filter((mount) => {
          if (mount.wrapper.isConnected) return true
          mount.container.remove()
          changed = true
          return false
        })
        for (const wrapper of document.querySelectorAll<HTMLElement>(WRAPPER_SELECTOR)) {
          if (wrapper.dataset[MOUNTED_FLAG]) continue
          wrapper.dataset[MOUNTED_FLAG] = 'true'
          const container = document.createElement('div')
          wrapper.parentElement?.insertBefore(container, wrapper)
          alive.push({ container, id: nextId++, wrapper })
          changed = true
        }
        return changed ? alive : current
      })
    }

    scan()
    const observer = new MutationObserver(scan)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      setMounts((current) => {
        for (const mount of current) {
          mount.container.remove()
          delete mount.wrapper.dataset[MOUNTED_FLAG]
        }
        return []
      })
    }
  }, [])

  return (
    <>
      {children}
      <style>{styles}</style>
      {mounts.map((mount) => (
        <React.Fragment key={mount.id}>
          {createPortal(<DrawerTabs wrapper={mount.wrapper} />, mount.container)}
        </React.Fragment>
      ))}
    </>
  )
}
