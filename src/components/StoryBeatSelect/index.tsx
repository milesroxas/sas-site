'use client'

import { SelectInput, useConfig, useField } from '@payloadcms/ui'
import type { OptionObject, TextFieldClientProps } from 'payload'
import { useEffect, useMemo, useState } from 'react'
import {
  CANONICAL_STORY_FIELDS,
  type StoryPresentationCollection,
} from '@/collections/story/canonical'
import {
  isStoryBeatKey,
  STORY_SECTION_DEFINITIONS,
  type StoryField,
  type StorySource,
} from '@/collections/story/narrative'

type StoryBeatOption = {
  key: string
  label: string
}

type StorySectionResponse = {
  storyBeats?: StoryBeatOption[] | null
}

type StoryRecordResponse = Partial<Record<StoryField, StorySectionResponse>>

const relationId = (value: unknown): number | string | undefined => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return undefined
}

const sourcePathFor = (path: string) => path.replace(/\.storyBeatKey$/, '.source')

const definitionFor = (source: unknown) =>
  STORY_SECTION_DEFINITIONS.find((definition) => definition.source === source)

const selectedSections = STORY_SECTION_DEFINITIONS.map(({ field }) => `select[${field}]=true`).join(
  '&',
)

/**
 * Story Beat picker for a presentation block. `presentation` (from
 * `withStoryBeatSource`) names the page collection, which decides the
 * relationship that points at the canonical story record and the collection
 * the beats are read from.
 */
export const StoryBeatSelect = ({
  field,
  path,
  presentation,
  readOnly,
}: TextFieldClientProps & { presentation: StoryPresentationCollection }) => {
  const { config } = useConfig()
  const canonical = CANONICAL_STORY_FIELDS[presentation]
  const { value: relation } = useField({ path: canonical.name })
  const { value: source } = useField<StorySource>({ path: sourcePathFor(path) })
  const { setValue, showError, value } = useField<string | null>({ path })
  const [record, setRecord] = useState<StoryRecordResponse>({})
  const [loading, setLoading] = useState(false)
  const [loadedRecordId, setLoadedRecordId] = useState<number | string>()
  const recordId = relationId(relation)
  const definition = definitionFor(source)

  useEffect(() => {
    if (!recordId) {
      setRecord({})
      setLoadedRecordId(undefined)
      return
    }

    let cancelled = false
    const api = config.routes?.api || '/api'
    setRecord({})
    setLoadedRecordId(undefined)
    setLoading(true)

    const run = async () => {
      try {
        const response = await fetch(
          `${api}/${canonical.collection}/${encodeURIComponent(recordId)}?depth=0&draft=true&${selectedSections}`,
          { credentials: 'include', headers: { 'Content-Type': 'application/json' } },
        )
        if (!response.ok || cancelled) return
        const doc = (await response.json()) as StoryRecordResponse
        if (!cancelled) {
          setRecord(doc)
          setLoadedRecordId(recordId)
        }
      } catch {
        if (!cancelled) setRecord({})
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [canonical.collection, config.routes?.api, recordId])

  const beats = definition ? record[definition.field]?.storyBeats || [] : []
  const options = useMemo<OptionObject[]>(
    () => beats.map((beat) => ({ label: beat.label, value: beat.key })),
    [beats],
  )

  useEffect(() => {
    if (
      !loading &&
      loadedRecordId === recordId &&
      isStoryBeatKey(value) &&
      !beats.some((beat) => beat.key === value)
    ) {
      setValue(null)
    }
  }, [beats, loadedRecordId, loading, recordId, setValue, value])

  return (
    <SelectInput
      description={field.admin?.description}
      isClearable={false}
      label={field.label}
      name={field.name}
      onChange={(selected) => {
        if (Array.isArray(selected)) return
        setValue(selected?.value || null)
      }}
      options={options}
      path={path}
      placeholder={
        loading
          ? 'Loading Story Beats…'
          : definition
            ? `Choose a ${definition.label} Story Beat`
            : 'Choose a canonical section first'
      }
      readOnly={readOnly || !recordId || !definition}
      showError={showError}
      value={value || undefined}
    />
  )
}
