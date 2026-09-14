import type {
  Condition,
  Field,
  FilterOptions,
  GroupField,
  NumberField,
  SelectField,
  TextField,
  UploadField,
  Validate,
} from 'payload'
import { publicApprovedMediaWhere } from './caseStudyScopedMedia'
import {
  randomStreakSeed,
  shaderSlotOf,
  slotChoseShader,
  validateIntensityValue,
  validatePosterMediaValue,
  validatePresetValue,
  validateSeedValue,
  validateSpeedValue,
} from './visual-validate'

/**
 * A visual slot: the existing media upload plus a choice between it and a
 * code-defined Streak Field look with bounded per-entry art direction. Field
 * names are stable across every parent (`visualType`, `shader`), so one
 * resolver (`@/features/immersive/visual`) reads them all; the upload keeps
 * its name and relation, so nothing renames or migrates.
 *
 * Editorial rules (docs/streak-field-media-plan.md): a missing choice keeps
 * legacy media behavior; an explicit shader wins over a retained upload;
 * editors set look, seed, bounded speed and intensity, pointer interaction
 * and an optional approved poster image. Particle counts, DPR, backend and
 * transitions are code-owned and never stored.
 */

const VISUAL_TYPE_OPTIONS = [
  { label: 'Media upload', value: 'media' },
  { label: 'Streak Field', value: 'streakField' },
]

const and =
  (...conditions: (Condition | undefined)[]): Condition =>
  (data, siblingData, ctx) =>
    conditions.every((condition) => !condition || Boolean(condition(data, siblingData, ctx)))

const shaderChosen: Condition = (_, siblingData) => siblingData?.visualType === 'streakField'
const shaderNotChosen: Condition = (_, siblingData) => siblingData?.visualType !== 'streakField'

/**
 * Whether the parent slot chose the shader, from inside the group. The
 * field's `path` is the reliable route: `siblingData` here is the group.
 */
const chosenFromPath = (args: { data?: unknown; path?: (string | number)[] }) =>
  slotChoseShader(shaderSlotOf(args.data, args.path))

/** `media` was `required`; it stays required unless the slot chose the shader. */
export const requiredUnlessStreak: Validate = (value, args) => {
  if (value !== null && value !== undefined && value !== '') return true
  const siblingData = (args as { siblingData?: { visualType?: unknown } }).siblingData
  return siblingData?.visualType === 'streakField' ? true : 'This field is required.'
}

export const visualTypeField = ({
  condition,
  description = 'Leave empty to use the media upload. Streak Field renders a code-defined look with its own poster; a media upload left in place is kept but not shown.',
}: {
  condition?: Condition
  description?: string
} = {}): SelectField => ({
  name: 'visualType',
  type: 'select',
  label: 'Visual',
  options: VISUAL_TYPE_OPTIONS,
  admin: { description, condition },
})

const presetField = (): TextField => ({
  name: 'preset',
  type: 'text',
  label: 'Look',
  admin: {
    description: 'A shipped Streak Field look. Tuning lives in code; pick the closest look.',
    components: { Field: '@/components/StreakLookSelect#StreakLookSelect' },
  },
  validate: (value, args) => validatePresetValue(value, chosenFromPath(args)),
})

const seedField = (): NumberField => ({
  name: 'seed',
  type: 'number',
  min: 0,
  admin: {
    step: 1,
    description:
      'Lays out the field. The same seed always draws the same composition; leave empty to have one assigned when saved.',
  },
  validate: (value) => validateSeedValue(value),
  hooks: {
    beforeChange: [
      ({ value, data, path }) =>
        value ?? (chosenFromPath({ data, path }) ? randomStreakSeed() : value),
    ],
  },
})

const speedField = (): NumberField => ({
  name: 'speed',
  type: 'number',
  min: 0,
  max: 1,
  admin: {
    step: 0.05,
    placeholder: '1',
    description: 'Playback rate as a fraction of the look, 0 to 1. Empty is the look as shipped.',
  },
  validate: (value) => validateSpeedValue(value),
})

const intensityField = (): NumberField => ({
  name: 'intensity',
  type: 'number',
  min: 0.5,
  max: 1.25,
  admin: {
    step: 0.05,
    placeholder: '1',
    description: 'Brightness multiplier, 0.5 to 1.25. Empty is the look as shipped.',
  },
  validate: (value) => validateIntensityValue(value),
})

const pointerField = (): Field => ({
  name: 'pointerInteraction',
  type: 'checkbox',
  defaultValue: false,
  label: 'Respond to the pointer',
  admin: {
    description: 'Let the pointer push and light the field on devices that run it live.',
  },
})

const posterMediaField = (filterOptions: FilterOptions): UploadField => ({
  name: 'posterMedia',
  type: 'upload',
  relationTo: 'media',
  label: 'Poster image',
  filterOptions,
  admin: {
    description:
      'Optional still shown before the field runs, and wherever it cannot (reduced motion, no WebGL, menus, social). Images only. Empty uses the look’s built-in poster.',
  },
  validate: (value, { req }) => validatePosterMediaValue(value, req),
})

export type StreakShaderFieldArgs = {
  name?: string
  label?: string
  /** When the group shows; defaults to the sibling `visualType` being the shader. */
  condition?: Condition
  /** Poster picker filter; the public gate by default, scoped on Work Pages. */
  posterFilterOptions?: FilterOptions
}

/** The shader group. One interface (`StreakVisualConfig`) across every parent. */
export const streakShaderField = ({
  name = 'shader',
  label = 'Streak Field',
  condition = shaderChosen,
  posterFilterOptions = publicApprovedMediaWhere,
}: StreakShaderFieldArgs = {}): GroupField => ({
  name,
  type: 'group',
  label,
  interfaceName: 'StreakVisualConfig',
  admin: { condition },
  fields: [
    presetField(),
    {
      type: 'row',
      fields: [seedField(), speedField(), intensityField()],
    },
    pointerField(),
    posterMediaField(posterFilterOptions),
  ],
})

export type VisualSlotArgs = {
  /** Extra condition on the whole slot (a hero `type` gate). */
  condition?: Condition
  visualTypeDescription?: string
  posterFilterOptions?: FilterOptions
}

/**
 * Wrap an existing upload into a visual slot: the upload (hidden once the
 * shader is chosen), the choice, and the shader group. A `required` upload
 * becomes required-unless-shader, since hiding does not relax `required`.
 */
export const visualSlotFields = (
  media: UploadField,
  { condition, visualTypeDescription, posterFilterOptions }: VisualSlotArgs = {},
): Field[] => {
  const { required, ...rest } = media
  const upload = {
    ...rest,
    ...(required ? { validate: requiredUnlessStreak } : {}),
    admin: { ...media.admin, condition: and(media.admin?.condition, condition, shaderNotChosen) },
  } as UploadField
  return [
    upload,
    visualTypeField({ condition, description: visualTypeDescription }),
    streakShaderField({ condition: and(condition, shaderChosen), posterFilterOptions }),
  ]
}
