import type { FilterOptions, UploadField } from 'payload'
import { publicApprovedMediaWhere } from './caseStudyScopedMedia'

type MenuPreviewArgs = {
  /** What the menu shows when this is empty, in the words of the collection. */
  description: string
  /** Defaults to the public-approved filter every picker starts from. */
  filterOptions?: FilterOptions
}

/**
 * Sidebar picker for the media the takeover menu shows while this page's
 * link is hovered (`src/Header/getMenuContent.ts`). Hover-only: the click
 * never hands it off onto the destination, unlike hero media. Factory, not a
 * literal: Payload mutates field configs while sanitizing them.
 */
export const menuPreviewField = ({
  description,
  filterOptions = publicApprovedMediaWhere,
}: MenuPreviewArgs): UploadField => ({
  name: 'menuPreview',
  type: 'upload',
  relationTo: 'media',
  label: 'Menu preview',
  filterOptions,
  admin: { position: 'sidebar', description },
})
