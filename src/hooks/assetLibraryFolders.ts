import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type PayloadRequest,
} from 'payload'
import type { AssetLibrary, FolderInterface, Media } from '@/payload-types'

const relationId = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const { id } = value as { id?: unknown }
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}

const resolvedRelation = (
  incoming: unknown,
  fallback: unknown,
): number | undefined => relationId(incoming !== undefined ? incoming : fallback)

// Payload folders and Asset Libraries are wired together only by convention (the
// library's `rootFolder`), so a library saved without one would leave its assets
// browsable only at the folder root. Create the folder up front instead.
export const ensureLibraryRootFolder: CollectionBeforeChangeHook<AssetLibrary> = async ({
  data,
  originalDoc,
  req,
}) => {
  const rootFolder = data.rootFolder !== undefined ? data.rootFolder : originalDoc?.rootFolder
  if (rootFolder) return data

  const name = data.name ?? originalDoc?.name
  if (!name) return data

  const folder = (await req.payload.create({
    collection: 'payload-folders',
    data: { name, folderType: ['media'] },
    req,
  })) as FolderInterface

  data.rootFolder = folder.id
  return data
}

const folderIsInsideLibrary = async (
  req: PayloadRequest,
  folderId: number,
  rootFolderId: number,
): Promise<boolean> => {
  if (folderId === rootFolderId) return true

  const seen = new Set<number>()
  let current: number | undefined = folderId

  while (current && !seen.has(current)) {
    if (current === rootFolderId) return true
    seen.add(current)
    const folder = await req.payload.findByID({
      collection: 'payload-folders',
      id: current,
      depth: 0,
      disableErrors: true,
      req,
    })
    current = relationId(folder?.folder)
  }

  return false
}

const applyLibraryOwnership = (
  data: Partial<Media>,
  originalDoc: Partial<Media> | undefined,
  library: AssetLibrary,
) => {
  if (!resolvedRelation(data.organization, originalDoc?.organization)) {
    const organizationId = relationId(library.organization)
    if (organizationId) data.organization = organizationId
  }
  if (!resolvedRelation(data.project, originalDoc?.project)) {
    const projectId = relationId(library.project)
    if (projectId) data.project = projectId
  }
}

// Creating from a library join sets `assetLibrary` but not `folder`. File the
// document in that library's tree (root unless a subfolder was chosen), copy
// client/project when missing, and refuse unfiled media.
export const ensureMediaFolder: CollectionBeforeValidateHook<Media> = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const libraryId = resolvedRelation(data.assetLibrary, originalDoc?.assetLibrary)
  const folderId = resolvedRelation(data.folder, originalDoc?.folder)

  if (libraryId) {
    const library = await req.payload.findByID({
      collection: 'asset-libraries',
      id: libraryId,
      depth: 0,
      disableErrors: true,
      req,
    })
    const rootFolderId = relationId(library?.rootFolder)
    if (!library || !rootFolderId) {
      throw new APIError(
        'This Asset Library has no root folder. Open the library, save it, then upload again.',
        400,
      )
    }

    applyLibraryOwnership(data, originalDoc, library)

    if (!folderId) {
      data.folder = rootFolderId
      return data
    }

    const inside = await folderIsInsideLibrary(req, folderId, rootFolderId)
    if (!inside) {
      throw new APIError(
        'Folder must be this Asset Library’s root or a subfolder inside it.',
        400,
      )
    }
    return data
  }

  if (folderId) return data

  throw new APIError(
    'Media must be in a folder. Create it from an Asset Library, or pick a folder in the header.',
    400,
  )
}
