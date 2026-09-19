'use client'

import './studio.css'

import { toast, useDocumentDrawer, useDocumentInfo, useField } from '@payloadcms/ui'
import { IconPlus } from '@tabler/icons-react'
import type { RelationshipFieldClientComponent } from 'payload'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { STUDIO_GROUND } from '@/features/immersive'
import { emptyRecipe, starterRecipe } from '@/features/immersive/studio/recipe'
import {
  isStreakLookId,
  STREAK_LOOK_OPTIONS,
  type StreakLookId,
  streakPosterSrc,
  type VisualPlacement,
} from '@/features/immersive/visual'
import type { Media, StreakLook } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { LOOKS_SLUG } from './paths'
import { sessionKey, studioStore } from './store'

const idOf = (value: unknown): number | null =>
  value && typeof value === 'object' && 'id' in value
    ? Number(value.id)
    : value
      ? Number(value)
      : null

const posterOf = (look: StreakLook) =>
  look.thumbnail && typeof look.thumbnail === 'object'
    ? ((look.thumbnail as Media).sizes?.thumbnail?.url ?? (look.thumbnail as Media).url)
    : null

/** Where in the document the slot sits, read from the field's path: the new field's name and its stage. */
const slotOf = (path: string): { label: string; placement: VisualPlacement } =>
  path.includes('menuPreview')
    ? { label: 'Menu preview', placement: 'menu' }
    : /(^|\.)hero\./.test(path)
      ? { label: 'Hero', placement: 'hero' }
      : { label: 'Block', placement: 'block' }

function Card({
  src,
  title,
  caption,
  selected,
  disabled,
  onClick,
  children,
}: {
  src?: string | null
  title: string
  caption?: string
  selected?: boolean
  disabled?: boolean
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'pressable flex cursor-pointer flex-col gap-1.5 rounded-md border p-1.5 text-left transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-60',
        selected ? 'border-primary' : 'border-input',
      )}
    >
      <span
        className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-sm text-muted-foreground"
        style={{ backgroundColor: STUDIO_GROUND.dark }}
      >
        {src ? (
          // biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin
          <img src={src} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          children
        )}
      </span>
      <span className="flex min-w-0 flex-col px-0.5 pb-0.5">
        <span className="truncate text-xs/4 font-medium">{title}</span>
        {caption && <span className="truncate text-[11px]/4 text-muted-foreground">{caption}</span>}
      </span>
    </button>
  )
}

/**
 * The visual slot's one picker. A Streak Field is used like a media file: the
 * slot holds the field, the site shows what is published, and editing happens
 * in Studio, opened here in a drawer so the editor never leaves the page. A
 * shipped look and a field of your own are chosen from the same grid; the
 * grid writes the sibling `preset` field for the first and this field for the
 * second, and the slot never shows a version.
 */
export const FieldPicker: RelationshipFieldClientComponent = ({ path, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<number | null>({ path })
  const preset = useField<string | null>({ path: path.replace(/studio$/, 'preset') })
  const { title: pageTitle } = useDocumentInfo()
  const id = idOf(value)
  const slot = slotOf(path)

  const [selected, setSelected] = useState<StreakLook | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [search, setSearch] = useState('')
  const [looks, setLooks] = useState<StreakLook[]>([])
  const [busy, setBusy] = useState(false)
  const [opening, setOpening] = useState<number | null>(null)
  const [DocumentDrawer, , { openDrawer, isDrawerOpen }] = useDocumentDrawer({
    collectionSlug: LOOKS_SLUG,
    id: id ?? undefined,
  })

  // The published document: its title and poster are what the site shows. A
  // field that was never published answers with its draft and no poster.
  const loadSelected = useCallback(async () => {
    if (!id) return setSelected(null)
    const response = await fetch(`/api/${LOOKS_SLUG}/${id}?draft=false&depth=1`)
    setSelected(response.ok ? await response.json() : null)
  }, [id])
  // Closing the drawer is the moment the field may have been published.
  useEffect(() => {
    if (!isDrawerOpen) void loadSelected().catch(() => {})
  }, [isDrawerOpen, loadSelected])

  // A field made here opens in Studio as soon as the slot holds it.
  useEffect(() => {
    if (opening !== null && opening === id) {
      setOpening(null)
      openDrawer()
    }
  }, [opening, id, openDrawer])

  useEffect(() => {
    if (!choosing) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({
        depth: '1',
        limit: '24',
        sort: '-updatedAt',
        'where[archived][not_equals]': 'true',
      })
      if (search) params.set('where[title][like]', search)
      const response = await fetch(`/api/${LOOKS_SLUG}?${params}`, { signal: controller.signal })
      if (response.ok) setLooks((await response.json()).docs)
    }, 200)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [choosing, search])

  const create = async () => {
    setBusy(true)
    try {
      // Start from the shipped look the slot shows now, so "make it mine" begins where the page is.
      const recipe = isStreakLookId(preset.value) ? starterRecipe(preset.value) : emptyRecipe()
      const response = await fetch(`/api/${LOOKS_SLUG}?draft=true&depth=0`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: [pageTitle, slot.label].filter(Boolean).join(' · '),
          recipe,
          _status: 'draft',
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.errors?.[0]?.message ?? 'Could not create a field.')
      studioStore.patch(sessionKey(result.doc.id), { placement: slot.placement })
      setValue(result.doc.id)
      setChoosing(false)
      setOpening(result.doc.id)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const edit = () => {
    if (id) studioStore.patch(sessionKey(id), { placement: slot.placement })
    openDrawer()
  }

  const error = (showError && errorMessage) || (preset.showError && preset.errorMessage)
  const live = Boolean(selected?.snapshot)

  return (
    <div data-streak-studio="picker" className="mb-6 flex flex-col gap-3">
      <span className="text-[13px]/5 text-foreground">Streak field</span>

      {id && !choosing ? (
        <div className="flex flex-wrap items-center gap-4 rounded-md border border-input p-2">
          <span
            className="block aspect-video w-36 shrink-0 overflow-hidden rounded-sm"
            style={{ backgroundColor: STUDIO_GROUND.dark }}
          >
            {selected && posterOf(selected) && (
              // biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin
              <img src={posterOf(selected) ?? ''} alt="" className="size-full object-cover" />
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[13px]/5 font-medium">
              {selected?.title ?? `Field #${id}`}
            </span>
            <span className="text-xs/4 text-muted-foreground">
              {live
                ? 'The page shows what is published. Edit it in Studio and publish to change it here.'
                : 'Not published yet, so the page shows the shipped look. Open it in Studio and publish.'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="sm" onClick={edit}>
              Edit field
            </Button>
            {!readOnly && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setChoosing(true)}>
                Change
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2">
            {STREAK_LOOK_OPTIONS.map((look) => (
              <Card
                key={look.value}
                src={streakPosterSrc(look.value as StreakLookId, 'dark')}
                title={look.label}
                caption="Shipped look"
                selected={!id && preset.value === look.value}
                disabled={readOnly}
                onClick={() => {
                  preset.setValue(look.value)
                  setValue(null)
                  setChoosing(false)
                }}
              />
            ))}
            {choosing &&
              looks.map((look) => (
                <Card
                  key={look.id}
                  src={posterOf(look)}
                  title={look.title}
                  caption={look.snapshot ? 'Your field' : 'Your field, not published'}
                  selected={look.id === id}
                  disabled={readOnly}
                  onClick={() => {
                    setValue(look.id)
                    setChoosing(false)
                  }}
                />
              ))}
            {!readOnly && (
              <Card
                title={busy ? 'Creating…' : 'New field'}
                caption={`For this ${slot.label.toLowerCase()}`}
                disabled={busy}
                onClick={create}
              >
                <IconPlus aria-hidden className="size-5" />
              </Card>
            )}
          </div>
          {choosing ? (
            <Input
              aria-label="Search your fields"
              placeholder="Search your fields"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 max-w-xs text-xs"
            />
          ) : (
            !readOnly && (
              <button
                type="button"
                className="pressable w-fit cursor-pointer text-xs/4 text-muted-foreground underline hover:text-foreground"
                onClick={() => setChoosing(true)}
              >
                Use a field made in Studio
              </button>
            )
          )}
        </>
      )}

      {error && (
        <p role="alert" className="text-xs/4 text-destructive">
          {error}
        </p>
      )}
      <DocumentDrawer />
    </div>
  )
}
