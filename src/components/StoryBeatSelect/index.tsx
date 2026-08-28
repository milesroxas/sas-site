'use client'

import { SelectInput, useConfig, useField } from '@payloadcms/ui'
import type { OptionObject, TextFieldClientComponent } from 'payload'
import { useEffect, useMemo, useState } from 'react'
import {
  CASE_STUDY_STORY_SECTION_DEFINITIONS,
  type CaseStudyStorySection,
  isStoryBeatKey,
} from '@/collections/CaseStudies/story'

type StoryBeatOption = {
  key: string
  label: string
}

type StorySectionResponse = {
  storyBeats?: StoryBeatOption[] | null
}

type CaseStudyResponse = Partial<
  Record<(typeof CASE_STUDY_STORY_SECTION_DEFINITIONS)[number]['field'], StorySectionResponse>
>

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
  CASE_STUDY_STORY_SECTION_DEFINITIONS.find((definition) => definition.source === source)

export const StoryBeatSelect: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { config } = useConfig()
  const { value: caseStudy } = useField({ path: 'caseStudy' })
  const { value: source } = useField<CaseStudyStorySection | 'custom'>({
    path: sourcePathFor(path),
  })
  const { setValue, showError, value } = useField<string | null>({ path })
  const [study, setStudy] = useState<CaseStudyResponse>({})
  const [loading, setLoading] = useState(false)
  const [loadedCaseStudyId, setLoadedCaseStudyId] = useState<number | string>()
  const caseStudyId = relationId(caseStudy)
  const definition = definitionFor(source)

  useEffect(() => {
    if (!caseStudyId) {
      setStudy({})
      setLoadedCaseStudyId(undefined)
      return
    }

    let cancelled = false
    const api = config.routes?.api || '/api'
    const selectedFields = CASE_STUDY_STORY_SECTION_DEFINITIONS.map(
      ({ field: sectionField }) => `select[${sectionField}]=true`,
    ).join('&')
    setStudy({})
    setLoadedCaseStudyId(undefined)
    setLoading(true)

    const run = async () => {
      try {
        const response = await fetch(
          `${api}/case-studies/${encodeURIComponent(caseStudyId)}?depth=0&draft=true&${selectedFields}`,
          { credentials: 'include', headers: { 'Content-Type': 'application/json' } },
        )
        if (!response.ok || cancelled) return
        const doc = (await response.json()) as CaseStudyResponse
        if (!cancelled) {
          setStudy(doc)
          setLoadedCaseStudyId(caseStudyId)
        }
      } catch {
        if (!cancelled) setStudy({})
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [caseStudyId, config.routes?.api])

  const beats = definition ? study[definition.field]?.storyBeats || [] : []
  const options = useMemo<OptionObject[]>(
    () => beats.map((beat) => ({ label: beat.label, value: beat.key })),
    [beats],
  )

  useEffect(() => {
    if (
      !loading &&
      loadedCaseStudyId === caseStudyId &&
      isStoryBeatKey(value) &&
      !beats.some((beat) => beat.key === value)
    ) {
      setValue(null)
    }
  }, [beats, caseStudyId, loadedCaseStudyId, loading, setValue, value])

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
      readOnly={readOnly || !caseStudyId || !definition}
      showError={showError}
      value={value || undefined}
    />
  )
}
