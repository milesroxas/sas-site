'use client'

import './studio.css'

import { Link, useDocumentInfo } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useLook } from './look-store'

/** Where the field is used. A field in use cannot be deleted; remove it there first. */
export const Usage: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const { uses, loaded } = useLook(id)
  const current = uses.filter((use) => !use.historical)
  if (!id || !loaded) return null
  return (
    <section data-streak-studio="panel" className="flex flex-col gap-2 text-xs/5">
      <h3 className="text-xs/4 font-semibold tracking-[0.02em]">Used on</h3>
      {current.length ? (
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {current.map((use) => (
            <li key={use.url} className="flex items-center gap-3 py-2">
              <span className="w-28 shrink-0 text-muted-foreground">{use.content}</span>
              <Link href={use.url} prefetch={false} className="truncate underline">
                {use.title}
              </Link>
              {use.draft && <span className="text-muted-foreground">in its draft</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">
          Nowhere yet. Choose it in a page's Visual slot, or make one from there.
        </p>
      )}
    </section>
  )
}
