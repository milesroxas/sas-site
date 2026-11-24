import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { parseYouTube } from './video'

/**
 * A YouTube video, embedded as a facade: the poster and play button are the
 * whole page cost until someone clicks, and only then does the player load
 * (`LiteYouTube.tsx`). A plain iframe would pull roughly a megabyte of
 * YouTube script into every page carrying one, whether or not it is watched.
 *
 * The editor pastes whatever link YouTube gave them — watch, youtu.be,
 * shorts, live, embed, with or without a start time — and the id is read from
 * it (`video.ts`). There is no id field to get wrong.
 *
 * Sits in the Media group beside Caption, and is offered both in the
 * Section-nestable run and in the rich text toolbars, so a video can be a
 * section of its own or a beat inside an article.
 */
export const YouTube: Block = {
  slug: 'youtube',
  admin: { group: BLOCK_GROUPS.media },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_youtube`,
  interfaceName: 'YouTubeBlock',
  labels: { singular: 'YouTube', plural: 'YouTube' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      // Replaces the default required check, so it answers for an empty value
      // too. Draft saves skip field validation entirely (the same gap the
      // figures plugin covers), so the block renders nothing on an unreadable
      // link rather than trusting this.
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !value.trim()) return 'A YouTube link is required.'
        return parseYouTube(value)
          ? true
          : 'That is not a YouTube video link. Paste the watch, youtu.be, shorts or embed URL.'
      },
      admin: {
        description:
          'Paste any YouTube link. A start time in the link (the "Start at" box on YouTube\'s share panel) is kept.',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description:
          "Optional. Shown over the poster the way YouTube shows it, and read out as the play button's label.",
      },
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full width', value: 'full' },
        { label: 'Inset', value: 'inset' },
        { label: 'Small', value: 'small' },
      ],
      admin: { description: 'Presentation for this placement, matching the Caption block.' },
    },
    themeField(),
  ],
}
