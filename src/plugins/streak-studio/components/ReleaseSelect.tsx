'use client'

import { useField } from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'
import type { StreakRelease } from '@/payload-types'

export const ReleaseSelect: RelationshipFieldClientComponent = ({ path }) => {
  const { value, setValue, errorMessage } = useField<number | null>({ path })
  const [releases, setReleases] = useState<StreakRelease[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          depth: '0',
          limit: '20',
          page: String(page),
          sort: '-createdAt',
          'where[title][like]': search,
          'where[look.archived][not_equals]': 'true',
        })
        const response = await fetch(`/api/streak-releases?${params}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Could not load the release library.')
        const result = await response.json()
        setReleases(result.docs)
        setHasNext(result.hasNextPage)
        setError('')
      } catch (error) {
        if (!controller.signal.aborted) setError(String(error))
      }
    }, 200)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [search, page])
  return (
    <div style={{ marginBottom: 24 }}>
      <label htmlFor={`${path}-search`}>Published Studio release</label>
      <input
        id={`${path}-search`}
        placeholder="Search published looks"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
        }}
        style={{ display: 'block', width: '100%', padding: 10, marginTop: 8 }}
      />
      <select
        aria-label="Pinned release"
        value={value ?? ''}
        onChange={(event) => setValue(event.target.value ? Number(event.target.value) : null)}
        style={{ width: '100%', padding: 10, marginTop: 8 }}
      >
        <option value="">Use built-in look</option>
        {value && !releases.some((release) => release.id === value) && (
          <option value={value}>Pinned release #{value}</option>
        )}
        {releases.map((release) => (
          <option key={release.id} value={release.id}>
            {release.title}
          </option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button type="button" disabled={page === 1} onClick={() => setPage((n) => n - 1)}>
          Previous
        </button>
        <button type="button" disabled={!hasNext} onClick={() => setPage((n) => n + 1)}>
          Next
        </button>
        <a href="/admin/collections/streak-looks/create" target="_blank" rel="noreferrer">
          Create a look
        </a>
        {value && (
          <a href={`/admin/collections/streak-releases/${value}`} target="_blank" rel="noreferrer">
            View pinned release
          </a>
        )}
      </div>
      <small>
        Existing pages keep this version when a newer release is published. Clear the seed to
        inherit the look’s composition.
      </small>
      {(error || errorMessage) && <p role="alert">{error || errorMessage}</p>}
    </div>
  )
}
