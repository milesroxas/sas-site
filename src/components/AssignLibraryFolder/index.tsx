'use client'

import { useConfig, useField } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

const relationId = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const { id } = value as { id?: unknown }
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}

type LibraryDoc = {
  organization?: unknown
  project?: unknown
  rootFolder?: unknown
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
      const rootId = relationId(doc.rootFolder)
      if (cancelled) return

      assignedFor.current = libraryId
      if (rootId && !folderId) setFolder(rootId)

      const nextOrganization = relationId(doc.organization)
      if (nextOrganization && !organizationId) setOrganization(nextOrganization)

      const nextProject = relationId(doc.project)
      if (nextProject && !projectId) setProject(nextProject)
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
