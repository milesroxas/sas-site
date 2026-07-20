import type { CollectionBeforeChangeHook } from 'payload'
import type { AssetLibrary, FolderInterface, Media } from '@/payload-types'

const relationId = (value: number | { id: number } | null | undefined): number | undefined =>
  typeof value === 'object' && value !== null ? value.id : (value ?? undefined)

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

// Media created from a library (join-field drawer, API) arrives with
// `assetLibrary` set but no `folder`, so it lands at the folder root. Default it
// to the library's root folder; an explicitly chosen folder always wins.
export const populateFolderFromAssetLibrary: CollectionBeforeChangeHook<Media> = async ({
  data,
  originalDoc,
  req,
}) => {
  const folder = data.folder !== undefined ? data.folder : originalDoc?.folder
  if (folder) return data

  const libraryId = relationId(
    data.assetLibrary !== undefined ? data.assetLibrary : originalDoc?.assetLibrary,
  )
  if (!libraryId) return data

  const library = await req.payload.findByID({
    collection: 'asset-libraries',
    id: libraryId,
    depth: 0,
    disableErrors: true,
    req,
  })

  const rootFolderId = relationId(library?.rootFolder)
  if (rootFolderId) data.folder = rootFolderId
  return data
}
