import {
  type CollectionBeforeChangeHook,
  type Field,
  type PayloadRequest,
  type Plugin,
  ValidationError,
} from 'payload'
import { BespokeFigure } from '@/blocks/figures/bespoke/config'
import { Chart } from '@/blocks/figures/chart/config'
import { Diagram } from '@/blocks/figures/diagram/config'
import {
  BESPOKE_FIGURES,
  bespokePropsSchema,
  chartSpecSchema,
  currentLayout,
  describeIssues,
  diagramSpecSchema,
  isBespokeFigureId,
  LayoutBudgetError,
  layoutDiagram,
  readSpec,
} from '@/features/figures'

/**
 * Figures at the document boundary (docs/figures.md). The blocks are declared
 * where every other block is; this plugin finds the collections that offer
 * them and does the two jobs a field cannot:
 *
 * 1. Validation that answers on drafts. Payload skips field `validate` on a
 *    draft save, and a draft is the only thing an agent is allowed to write.
 *    So every full save checks every figure here, and reports every problem in
 *    one error. The detail rides in the error message itself because the MCP
 *    tools relay `error.message` and nothing else.
 * 2. Save-time diagram layout: compute once, store beside the spec as
 *    `geometry`, which is never read from the request. It is reused from the saved document when
 *    the spec is unchanged and recomputed otherwise, so it cannot be forged or
 *    hand-placed.
 *
 * Autosave is exempt from (1): a person mid-edit in the JSON editor passes
 * through states that parse but do not validate, and failing a save every
 * 800ms would fight them. An autosaved diagram with a broken spec keeps its
 * last good layout; the page renders it defensively either way.
 */

const FIGURE_SLUGS: ReadonlySet<string> = new Set([Chart.slug, Diagram.slug, BespokeFigure.slug])

type FigureBlock = Record<string, unknown> & { blockType: string; id?: string }
type Found = { block: FigureBlock; path: string }
type FieldError = { message: string; path: string }

const hostsFigures = (fields: Field[]): boolean =>
  fields.some((field) => {
    if (field.type === 'tabs') return field.tabs.some((tab) => hostsFigures(tab.fields))
    if (field.type === 'blocks')
      return field.blocks.some(
        (block) => FIGURE_SLUGS.has(block.slug) || hostsFigures(block.fields),
      )
    return 'fields' in field && hostsFigures(field.fields)
  })

/** Every figure block in a document, at any depth, with the data path Payload reports errors on. */
const findFigures = (value: unknown, path = '', found: Found[] = []): Found[] => {
  if (!value || typeof value !== 'object') return found
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      findFigures(item, path ? `${path}.${index}` : String(index), found)
    })
    return found
  }
  const { blockType } = value as { blockType?: unknown }
  if (typeof blockType === 'string' && FIGURE_SLUGS.has(blockType)) {
    found.push({ block: value as FigureBlock, path })
    return found
  }
  for (const [key, child] of Object.entries(value))
    findFigures(child, path ? `${path}.${key}` : key, found)
  return found
}

const isBlank = (value: unknown): boolean => typeof value !== 'string' || !value.trim()

const requireTextAlternative = ({ block, path }: Found, errors: FieldError[]) => {
  if (isBlank(block.textAlternative))
    errors.push({
      message: 'is required: say what the figure shows and the takeaway, in plain sentences',
      path: `${path}.textAlternative`,
    })
}

const processChart = (found: Found, errors: FieldError[]) => {
  requireTextAlternative(found, errors)
  const { issues, spec } = readSpec(chartSpecSchema, found.block.spec)
  if (issues) errors.push({ message: describeIssues(issues), path: `${found.path}.spec` })
  // Stored as parsed: a spec sent as a JSON string becomes the object it means.
  else found.block.spec = spec
}

const processDiagram = async (
  found: Found,
  previous: ReadonlyMap<string, FigureBlock>,
  errors: FieldError[],
) => {
  requireTextAlternative(found, errors)
  const { block, path } = found
  const saved = block.id ? previous.get(block.id)?.geometry : undefined
  const { issues, spec } = readSpec(diagramSpecSchema, block.spec)
  if (issues) {
    errors.push({ message: describeIssues(issues), path: `${path}.spec` })
    block.geometry = saved ?? null
    return
  }
  block.spec = spec
  try {
    block.geometry = (await currentLayout(spec, saved)) ?? (await layoutDiagram(spec))
  } catch (error) {
    if (!(error instanceof LayoutBudgetError)) throw error
    errors.push({ message: error.message, path: `${path}.spec` })
    block.geometry = saved ?? null
  }
}

const processBespoke = ({ block, path }: Found, errors: FieldError[]) => {
  if (!isBespokeFigureId(block.figure)) {
    errors.push({
      message: `is not a registered figure. Available: ${Object.keys(BESPOKE_FIGURES).join(', ')}`,
      path: `${path}.figure`,
    })
    return
  }
  if (block.props !== null && block.props !== undefined) {
    const { issues, spec } = readSpec(bespokePropsSchema(block.figure), block.props)
    if (issues) errors.push({ message: describeIssues(issues), path: `${path}.props` })
    else block.props = spec
  }
  // Stored, so the walk that feeds search and Ask reads it like any other copy.
  if (isBlank(block.textAlternative))
    block.textAlternative = BESPOKE_FIGURES[block.figure].textAlternative
}

const isAutosave = (req: PayloadRequest): boolean => req.query?.autosave === 'true'

const processFigures: CollectionBeforeChangeHook = async ({
  collection,
  data,
  originalDoc,
  req,
}) => {
  const figures = findFigures(data)
  if (!figures.length) return data

  const previous = new Map(
    findFigures(originalDoc).flatMap(({ block }) => (block.id ? [[block.id, block] as const] : [])),
  )
  const errors: FieldError[] = []
  for (const found of figures) {
    if (found.block.blockType === Chart.slug) processChart(found, errors)
    else if (found.block.blockType === Diagram.slug) await processDiagram(found, previous, errors)
    else processBespoke(found, errors)
  }

  if (errors.length && !isAutosave(req))
    throw new ValidationError({
      collection: collection.slug,
      // `label` is what Payload joins into the message; the path alone would
      // tell an agent where, never what.
      errors: errors.map(({ message, path }) => ({
        label: `${path} (${message})`,
        message,
        path,
      })),
      req,
    })
  return data
}

export const figuresPlugin = (): Plugin => (config) => ({
  ...config,
  collections: config.collections?.map((collection) =>
    hostsFigures(collection.fields)
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            beforeChange: [...(collection.hooks?.beforeChange ?? []), processFigures],
          },
        }
      : collection,
  ),
})
