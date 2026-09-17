'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export function Usage() {
  const { id } = useDocumentInfo()
  const [rows, setRows] = useState<
    { content: string; title: string; historical: boolean; url: string }[]
  >([])
  const [error, setError] = useState('')
  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    fetch(`/api/streak-releases/${id}/usage`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load usage references.')
        setRows((await response.json()).usages)
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(String(error))
      })
    return () => controller.abort()
  }, [id])
  return (
    <section>
      <h3>Used by</h3>
      <p>Includes saved page versions. Releases remain available when a page is restored.</p>
      {error && <p role="alert">{error}</p>}
      {!rows.length && !error && <p>No page references yet.</p>}
      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Content</th>
              <th>Page</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.url}:${row.historical}`}>
                <td>{row.content}</td>
                <td>
                  <a href={row.url}>{row.title}</a>
                </td>
                <td>{row.historical ? 'Version history' : 'Current document'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
