'use client'

import { useConfig, useField } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'
import { numericRelationshipId as relationId } from '@/utilities/relationshipId'

type LibraryDoc = {
  organization?: unknown
  project?: unknown
  rootFolder?: unknown
}

/** Fill a header field from the library, leaving an editor's own choice alone. */
const assignIfEmpty = (
  next: number | undefined,
  current: number | undefined,
  set: (value: number) => void,
) => {
  if (next && !current) set(next)
}

/**
 * Creating from an Asset Library join sets `assetLibrary` but leaves the
 * folder chip on "No Folder". Fill folder / client / project from the library
 * so the header matches ownership; the editor can still switch to a subfolder.
 */
export function AssignLibraryFolder() {
  const { config } = useConfig()
  const { value: library } = useField({ path: 'assetLibrary' })
  const { value: folder, setValue: setFolder } = useField({ path: 'folder' })
  const { value: organization, setValue: setOrganization } = useField({ path: 'organization' })
  const { value: project, setValue: setProject } = useField({ path: 'project' })
  const assignedFor = useRef<number | undefined>(undefined)

  const libraryId = relationId(library)
  const folderId = relationId(folder)
  const organizationId = relationId(organization)
  const projectId = relationId(project)

  useEffect(() => {
    if (!libraryId) return
    if (assignedFor.current === libraryId && folderId) return

    let cancelled = false
    const api = config.routes?.api || '/api'

    const run = async () => {
      const response = await fetch(`${api}/asset-libraries/${libraryId}?depth=0`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok || cancelled) return
      const doc = (await response.json()) as LibraryDoc
      if (cancelled) return

      assignedFor.current = libraryId
      assignIfEmpty(relationId(doc.rootFolder), folderId, setFolder)
      assignIfEmpty(relationId(doc.organization), organizationId, setOrganization)
      assignIfEmpty(relationId(doc.project), projectId, setProject)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [
    config.routes?.api,
    folderId,
    libraryId,
    organizationId,
    projectId,
    setFolder,
    setOrganization,
    setProject,
  ])

  return null
}
