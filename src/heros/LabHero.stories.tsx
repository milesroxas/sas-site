import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  labTechnologiesFixture,
  mediaFixture,
  paragraph,
  richText,
  text,
  videoFixture,
} from '@/blocks/fixtures'
import type { LabPage, LabProject } from '@/payload-types'
import { LabHero } from './LabHero'

/** Enough narrative for the meta row's read figure to be a real number. */
const section = (body: string) => ({ body: richText(paragraph(text(body))) })

const project = {
  id: 1,
  title: 'Payload CMS Shader Plugin',
  kind: 'tool',
  status: 'active',
  thesis: 'Can an editor tune a WebGL shader the way they already manage an image?',
  summaries: {
    oneLine: 'A Payload plugin for authoring and publishing WebGL looks.',
    short:
      'A plugin that lets an editor create, tune, and publish a WebGL shader the way they already manage an image.',
  },
  technologies: labTechnologiesFixture,
  populatedAuthors: [{ id: '1', name: 'Miles Roxas, Design Engineering' }],
  publishedAt: '2026-09-09T00:00:00.000Z',
  context: section(
    'Shaders shipped as code, so every look needed a release. Editors could not try one.',
  ),
  approach: section(
    'The plugin puts the tuning behind the same slot an image already uses, and renders the poster from the same numbers the runtime draws.',
  ),
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as LabProject

const page = {
  id: 1,
  title: 'Payload CMS Shader Plugin',
  slug: 'payload-cms-shader-plugin',
  labProject: project,
  coverAsset: mediaFixture,
  hero: { media: mediaFixture },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as LabPage

const meta = {
  title: 'Heroes/Lab',
  component: LabHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    page,
    project,
  },
} satisfies Meta<typeof LabHero>

export default meta

type Story = StoryObj<typeof meta>

/** The media variant: copy low on the left, a 16:9 plate holding the right half. */
export const Default: Story = {}

/**
 * The opening paints in the visitor's theme (`HeroBand` `theme="site"`), so
 * every story follows the toolbar; this one holds the dark side for review.
 */
export const DarkTheme: Story = {
  globals: { theme: 'dark' },
}

/** No upload and no effect: the copy column alone on an open field. */
export const NoMedia: Story = {
  args: {
    page: { ...page, coverAsset: null, hero: {} },
  },
}

export const Video: Story = {
  args: {
    page: { ...page, coverAsset: videoFixture, hero: { media: videoFixture } },
  },
}

/** The Streak Field grounding the whole band, with the plate still in place. */
export const StreakFieldWithMedia: Story = {
  args: {
    page: {
      ...page,
      hero: { media: mediaFixture, visualType: 'streakField', shader: { preset: 'backdrop-v1' } },
    },
  },
}

/** An effect alone: the shader is the opening, no plate beside the copy. */
export const StreakFieldOnly: Story = {
  args: {
    page: {
      ...page,
      coverAsset: null,
      hero: { visualType: 'streakField', shader: { preset: 'backdrop-v1' } },
    },
  },
}

/** A light leak grounding the band behind the copy and the plate. */
export const LightLeak: Story = {
  args: {
    page: {
      ...page,
      hero: { media: mediaFixture, visualType: 'lightLeak', shader: { preset: 'film-v1' } },
    },
  },
}
