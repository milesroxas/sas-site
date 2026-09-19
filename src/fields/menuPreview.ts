import type { Condition, Field, FilterOptions, SelectField, UploadField } from 'payload'
import { publicApprovedMediaWhere } from './caseStudyScopedMedia'
import { shaderField } from './visual'

type MenuPreviewArgs = {
  /** What the menu shows when this is empty, in the words of the collection. */
  description: string
  /** Defaults to the public-approved filter every picker starts from. */
  filterOptions?: FilterOptions
}

const MENU_PREVIEW_TYPE_OPTIONS = [
  { label: 'Automatic', value: 'automatic' },
  { label: 'Media upload', value: 'media' },
  { label: 'Streak Field', value: 'streakField' },
]

const previewIsMedia: Condition = (_, siblingData) => {
  const type = siblingData?.menuPreviewType
  // Legacy documents have no type: their explicit upload still previews.
  return type === undefined || type === null || type === 'media'
}
const previewIsShader: Condition = (_, siblingData) =>
  siblingData?.menuPreviewType === 'streakField'

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
  admin: { position: 'sidebar', description, condition: previewIsMedia },
})

/**
 * The preview's kind, `automatic` by default: new documents inherit their
 * own visual until an editor picks one. Missing (a legacy row the backfill
 * did not reach) resolves as before: an explicit upload, else the
 * destination's own visual. `automatic` inherits even when an old upload is
 * still stored; `streakField` previews a look's poster, hover only.
 */
export const menuPreviewTypeField = (): SelectField => ({
  name: 'menuPreviewType',
  type: 'select',
  label: 'Menu preview kind',
  options: MENU_PREVIEW_TYPE_OPTIONS,
  defaultValue: 'automatic',
  admin: {
    position: 'sidebar',
    description:
      'Automatic follows this page’s own visual. Media upload and Streak Field set an independent, hover-only preview.',
  },
})

/** Kind, upload and shader for the menu preview, in sidebar order. */
export const menuPreviewFields = (args: MenuPreviewArgs): Field[] => [
  menuPreviewTypeField(),
  menuPreviewField(args),
  {
    ...shaderField({
      name: 'menuPreviewShader',
      label: 'Menu preview Streak Field',
      condition: previewIsShader,
      posterFilterOptions: args.filterOptions ?? publicApprovedMediaWhere,
    }),
    admin: { position: 'sidebar', condition: previewIsShader },
  },
]
