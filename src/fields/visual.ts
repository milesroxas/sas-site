import type {
  CheckboxField,
  Condition,
  Field,
  FilterOptions,
  GroupField,
  NumberField,
  PayloadRequest,
  SelectField,
  TextField,
  UploadField,
  Validate,
} from 'payload'
import {
  DEFAULT_EFFECT,
  EFFECT_IDS,
  EFFECT_OPTIONS,
  EFFECTS,
  type EffectId,
  effectOf,
  isEffectId,
  LEAK_ORIGINS,
  LEAK_SECTION_HOVER_RANGE,
} from '@/features/immersive/visual'
import { publicApprovedMediaWhere } from './caseStudyScopedMedia'
import {
  randomStreakSeed,
  shaderSlotOf,
  slotEffect,
  validateHoverTargetsValue,
  validateIntensityValue,
  validatePosterMediaValue,
  validatePresetValue,
  validateSectionHoverValue,
  validateSeedValue,
  validateSpeedValue,
} from './visual-validate'

/**
 * A visual slot: the existing media upload plus a choice between it and a
 * code-defined effect (`@/features/immersive/studio/effects`), from a shipped
 * look or one authored in Studio, with bounded per-entry art direction. Field
 * names are stable across every parent (`visualType`, `shader`), so one
 * resolver (`@/features/immersive/visual`) reads them all; the upload keeps
 * its name and relation, so nothing renames or migrates.
 *
 * Editorial rules (docs/streak-field-media-plan.md): a missing choice keeps
 * legacy media behavior; an explicit effect wins over a retained upload;
 * editors set look, seed, bounded speed and intensity, pointer interaction,
 * an optional approved poster image, and the placement controls the effect
 * declares (`Effect.slot`). Particle counts, sample counts, DPR, backend and
 * transitions are code-owned and never stored.
 *
 * A slot offers the effects its renderer can draw. A slot rendered through the
 * `Visual` adapter can offer all of them; one with a bespoke renderer (the home
 * hero, an index ground) names the ones it handles.
 */

const and =
  (...conditions: (Condition | undefined)[]): Condition =>
  (data, siblingData, ctx) =>
    conditions.every((condition) => !condition || Boolean(condition(data, siblingData, ctx)))

const effectChosen: Condition = (_, siblingData) => isEffectId(siblingData?.visualType)

/** The upload shows for a media slot, and under an effect whose editor asked for it. */
const uploadShown: Condition = (_, siblingData) =>
  !isEffectId(siblingData?.visualType) ||
  (EFFECTS[siblingData.visualType as EffectId].slot.media &&
    siblingData?.shader?.showMedia === true)

/**
 * The effect the parent slot chose, from inside the group. The field's `path`
 * is the reliable route: `siblingData` here is the group.
 */
const chosenFromPath = (args: { data?: unknown; path?: (string | number)[] }) =>
  slotEffect(shaderSlotOf(args.data, args.path))

/** Shows a group field only for an effect that declares the capability. */
const slotOffers =
  (capability: keyof (typeof EFFECTS)[EffectId]['slot']): Condition =>
  (data, _, { path }) => {
    const effect = chosenFromPath({ data, path })
    return effect !== null && EFFECTS[effect].slot[capability]
  }

/** `media` was `required`; it stays required unless the slot chose an effect. */
export const requiredUnlessEffect: Validate = (value, args) => {
  if (value !== null && value !== undefined && value !== '') return true
  const siblingData = (args as { siblingData?: { visualType?: unknown } }).siblingData
  return isEffectId(siblingData?.visualType) ? true : 'This field is required.'
}

const visualTypeField = ({
  effects,
  condition,
  description = 'Leave empty to use the media upload. An effect renders a code-defined look with its own poster; a media upload left in place is kept but not shown unless the effect offers to show it.',
}: {
  effects: readonly EffectId[]
  condition?: Condition
  description?: string
}): SelectField => ({
  name: 'visualType',
  type: 'select',
  label: 'Visual',
  options: [
    { label: 'Media upload', value: 'media' },
    ...EFFECT_OPTIONS.filter((option) => effects.includes(option.value)),
  ],
  admin: { description, condition },
})

const presetField = (): TextField => ({
  name: 'preset',
  type: 'text',
  label: 'Look',
  // The look picker (the `studio` field's component) writes this one too, so
  // the editor chooses from one place: a shipped look or one of their own.
  admin: { hidden: true },
  validate: (value, args) => {
    const effect = chosenFromPath(args)
    const studio = (args.siblingData as { studio?: unknown })?.studio
    return validatePresetValue(value, effect && !studio ? EFFECTS[effect] : null)
  },
})

const seedField = (): NumberField => ({
  name: 'seed',
  type: 'number',
  min: 0,
  admin: {
    step: 1,
    condition: slotOffers('seed'),
    description:
      'Lays out the field. The same seed always draws the same composition; leave empty to have one assigned when saved.',
  },
  validate: (value) => validateSeedValue(value),
  hooks: {
    beforeChange: [
      ({ value, data, path }) => {
        if (value !== null && value !== undefined) return value
        const effect = chosenFromPath({ data, path })
        const group = shaderSlotOf(data, path)[path?.[path.length - 2] ?? 'shader']
        return effect && EFFECTS[effect].slot.seed && !(group as { studio?: unknown })?.studio
          ? randomStreakSeed()
          : value
      },
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
    description:
      'Let the pointer move and light the effect on devices that run it live. Off, nothing below runs and the effect never listens.',
  },
})

/** The pointer has to be on before anything it drives is worth showing. */
const pointerOn: Condition = (_, siblingData) => siblingData?.pointerInteraction === true

/**
 * What a light leak flares at, inside its own band: the section it sits in,
 * the hero it fills, the closing band. A leak never answers hover outside
 * that band, so two leaks on one page respond to their own content only.
 */
const hoverTargetsField = (): SelectField => ({
  name: 'hoverTargets',
  type: 'select',
  label: 'Flares at',
  // One enum for every slot that carries this field, named rather than
  // derived: the generated name is `enum_<table>_shader_hover_targets`, and
  // the deepest table (a work page's version of a feature tab's row) puts that
  // one character past Postgres' 63-character identifier limit. The options
  // are identical everywhere, so a single shared type is also the honest shape.
  enumName: 'enum_leak_hover_targets',
  options: [
    { label: 'Links and buttons', value: 'interactive' },
    { label: 'Only marked elements', value: 'marked' },
  ],
  admin: {
    condition: and(slotOffers('hover'), pointerOn),
    description:
      'What lights the effect on hover, within the section it sits in. Links and buttons need no marking; marked elements are the ones the design calls out in code. Empty is the look as shipped.',
  },
  validate: (value: unknown) => validateHoverTargetsValue(value),
})

const sectionHoverField = (): NumberField => ({
  name: 'sectionHover',
  type: 'number',
  min: LEAK_SECTION_HOVER_RANGE.min,
  max: LEAK_SECTION_HOVER_RANGE.max,
  admin: {
    step: 0.05,
    condition: and(slotOffers('hover'), pointerOn),
    description:
      'How far the effect answers the pointer merely crossing the section, as a fraction of a full flare. 0 waits for a link or a marked element. Empty is the look as shipped.',
  },
  validate: (value: unknown) => validateSectionHoverValue(value),
})

const posterMediaField = (filterOptions: FilterOptions): UploadField => ({
  name: 'posterMedia',
  type: 'upload',
  relationTo: 'media',
  label: 'Poster image',
  filterOptions,
  admin: {
    description:
      'Optional still shown before the effect runs, and wherever it cannot (reduced motion, no WebGL, menus, social). Images only. Empty uses the look’s built-in poster.',
  },
  validate: (value, { req }) => validatePosterMediaValue(value, req),
})

const showMediaField = (): CheckboxField => ({
  name: 'showMedia',
  type: 'checkbox',
  defaultValue: false,
  label: 'Show the media under the effect',
  admin: {
    condition: slotOffers('media'),
    description: 'Off, the effect fills the frame on its own. On, the media upload shows under it.',
  },
})

const bleedField = (hosted: boolean): CheckboxField => ({
  name: 'bleed',
  type: 'checkbox',
  defaultValue: false,
  label: 'Bleed across the block',
  admin: {
    // A slot with no block root to wash across keeps the column, so the group
    // stays one shape, and never shows the control.
    condition: hosted ? slotOffers('bleed') : () => false,
    description:
      'Off, the effect is clipped to the media frame. On, it leaves the frame and washes across the whole block, edge to edge of the browser.',
  },
})

const originField = (): SelectField => ({
  name: 'origin',
  type: 'select',
  defaultValue: LEAK_ORIGINS[0],
  label: 'Light enters from',
  options: LEAK_ORIGINS.map((origin) => ({
    value: origin,
    label: origin.replace('-', ' ').replace(/^./, (character) => character.toUpperCase()),
  })),
  admin: {
    condition: slotOffers('bleed'),
    description: 'The corner the light is pinned to, of the frame or, bleeding, of the block.',
  },
})

export type ShaderFieldArgs = {
  name?: string
  label?: string
  /** The effects this slot's renderer can draw. */
  effects?: readonly EffectId[]
  /** Whether the slot sits in a block root a bleeding effect can wash across (`VISUAL_HOST`). */
  hosted?: boolean
  /** When the group shows; defaults to the sibling `visualType` being an effect. */
  condition?: Condition
  /** Poster picker filter; the public gate by default, scoped on Work Pages. */
  posterFilterOptions?: FilterOptions
}

/**
 * The shader group. It carries the placement controls only where one of the
 * slot's effects declares them, so a slot that cannot draw a light leak stores
 * no columns for one; the interface name follows, one per shape.
 */
export const shaderField = ({
  name = 'shader',
  label = 'Effect',
  effects = [DEFAULT_EFFECT],
  hosted = true,
  condition = effectChosen,
  posterFilterOptions = publicApprovedMediaWhere,
}: ShaderFieldArgs = {}): GroupField => {
  const offers = (capability: keyof (typeof EFFECTS)[EffectId]['slot']) =>
    effects.some((effect) => EFFECTS[effect].slot[capability])
  const placed = offers('media') || offers('bleed')
  return {
    name,
    type: 'group',
    label,
    interfaceName: placed ? 'PlacedVisualConfig' : 'StreakVisualConfig',
    admin: { condition },
    fields: [
      {
        name: 'studio',
        type: 'relationship',
        relationTo: 'streak-looks',
        // Never populated: the Studio plugin hydrates the id with the published
        // look's snapshot and posters, for every reader alike.
        maxDepth: 0,
        index: true,
        label: 'Look',
        admin: {
          components: { Field: '@/plugins/streak-studio/components/FieldPicker#FieldPicker' },
        },
        // Runs when the page is published (draft saves skip validation): a look
        // with nothing published has no poster and no snapshot to render from,
        // and one filed under another effect cannot be drawn here at all.
        validate: async (
          value: unknown,
          { req, data, path }: { req: PayloadRequest; data?: unknown; path?: (string | number)[] },
        ) => {
          if (!value) return true
          const id = typeof value === 'object' && 'id' in value ? value.id : value
          const look = await req.payload.findByID({
            collection: 'streak-looks',
            id: String(id),
            draft: false,
            depth: 0,
            disableErrors: true,
            select: { snapshot: true, effect: true },
            req,
          })
          if (!look) return 'Choose an available look.'
          const effect = chosenFromPath({ data, path })
          if (effect && effectOf(look.effect).id !== effect)
            return `This look is a ${effectOf(look.effect).label}. Choose a ${EFFECTS[effect].label} look.`
          return look.snapshot ? true : 'Publish this look in Studio first, or use a shipped look.'
        },
      },
      presetField(),
      {
        type: 'row',
        // A look made in Studio is tuned in Studio, where its poster is rendered
        // from the same numbers. These adjust a shipped look, which has no editor.
        admin: { condition: (_, siblingData) => !siblingData?.studio },
        fields: [seedField(), speedField(), intensityField()],
      },
      // The earlier pinned-release reference. Nothing reads it; the column stays
      // until the follow-up migration drops the release tables.
      {
        name: 'release',
        type: 'relationship',
        relationTo: 'streak-releases',
        maxDepth: 0,
        index: true,
        admin: { hidden: true },
      },
      ...(offers('bleed') ? [bleedField(hosted), originField()] : []),
      ...(offers('media') ? [showMediaField()] : []),
      pointerField(),
      ...(offers('hover')
        ? [{ type: 'row' as const, fields: [hoverTargetsField(), sectionHoverField()] }]
        : []),
      posterMediaField(posterFilterOptions),
    ],
  }
}

export type VisualSlotArgs = Pick<ShaderFieldArgs, 'effects' | 'hosted' | 'posterFilterOptions'> & {
  /** Extra condition on the whole slot (a hero `type` gate). */
  condition?: Condition
  visualTypeDescription?: string
}

/**
 * Wrap an existing upload into a visual slot: the upload (hidden once an
 * effect is chosen, unless it shows under the effect), the choice, and the
 * shader group. A `required` upload becomes required-unless-effect, since
 * hiding does not relax `required`.
 */
export const visualSlotFields = (
  media: UploadField,
  {
    condition,
    effects = [DEFAULT_EFFECT],
    hosted,
    visualTypeDescription,
    posterFilterOptions,
  }: VisualSlotArgs = {},
): Field[] => {
  const { required, ...rest } = media
  const upload = {
    ...rest,
    ...(required ? { validate: requiredUnlessEffect } : {}),
    admin: { ...media.admin, condition: and(media.admin?.condition, condition, uploadShown) },
  } as UploadField
  return [
    upload,
    visualTypeField({ effects, condition, description: visualTypeDescription }),
    shaderField({ effects, hosted, condition: and(condition, effectChosen), posterFilterOptions }),
  ]
}

/**
 * The slot of a composition block. A block renders through the `Visual`
 * adapter inside a `Section`, so it can draw every effect, and a bleeding one
 * has a block root to wash across.
 */
export const blockVisualSlotFields = (media: UploadField, args: VisualSlotArgs = {}): Field[] =>
  visualSlotFields(media, { effects: EFFECT_IDS, ...args })

/**
 * The slot of a hero drawn through the `Visual` adapter (page, segment, work
 * and lab heroes), so it can draw every effect. A hero has no block root to
 * wash across: the effect stays in the hero's frame and offers no bleed.
 */
export const heroVisualSlotFields = (media: UploadField, args: VisualSlotArgs = {}): Field[] =>
  visualSlotFields(media, { effects: EFFECT_IDS, hosted: false, ...args })
