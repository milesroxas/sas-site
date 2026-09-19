import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { APIError, type Field, type FieldHook, type RichTextField } from 'payload'
import { hasRichTextContent } from '@/utilities/hasRichTextContent'

/**
 * Markdown in, Lexical stored. Lexical JSON is verbose and brittle for an
 * agent to write, so a rich text field can sit behind a write-only `markdown`
 * sibling: send Markdown, the server converts it with the field's own editor
 * config and stores Lexical. The Markdown itself is never stored (the fields
 * are virtual), so there is never a second source of truth to drift.
 *
 * Spread `markdownInputFields(name)` immediately BEFORE the rich text field it
 * feeds: Payload walks siblings in order, and the rich text field has to be
 * traversed after its value is set for its own hooks to see it.
 *
 * What the guard does and does not cover: `replace` protects the ordinary
 * update, where the rich text already has content for this row. A client that
 * resends a blocks array without row ids is creating new rows, which no
 * field-level check can tell from intent; the MCP authoring rules (find first,
 * edit from current state) and Payload versions cover that path.
 */

type EditorConfig = ReturnType<typeof editorConfigFactory.fromField>

/**
 * Markdown the converter would silently flatten to literal text, each with the
 * instruction that fixes it. Refusing beats storing a paragraph of pipes.
 * An entry with a `feature` only applies when the target editor lacks that
 * Lexical feature, so the guard follows the editor instead of restating it.
 */
const SYNTAX: { feature?: string; message: string; pattern: RegExp }[] = [
  {
    message: 'Fenced code is not converted. Put code in a `code` block beside this one.',
    pattern: /^\s*(```|~~~)/m,
  },
  {
    message: 'Tables are not converted. Use a `chart` block or prose.',
    pattern: /^\s*\|?[\s:-]*-{3,}[\s:-]*\|/m,
  },
  {
    message: 'Images are not converted. Reference media through a media block by id.',
    pattern: /!\[[^\]]*\]\(/,
  },
  { message: 'Raw HTML is not converted. Use Markdown only.', pattern: /<\/?[a-z][\s\S]*?>/i },
  {
    feature: 'unorderedList',
    message: 'Bulleted lists are not available in this field. Write sentences.',
    pattern: /^\s*[-*+]\s+\S/m,
  },
  {
    feature: 'orderedList',
    message: 'Numbered lists are not available in this field. Write sentences.',
    pattern: /^\s*\d+[.)]\s+\S/m,
  },
  {
    feature: 'blockquote',
    message: 'Block quotes are not available in this field.',
    pattern: /^\s*>\s?\S/m,
  },
  {
    feature: 'inlineCode',
    message: 'Inline code is not available in this field. Name the identifier in plain text.',
    pattern: /`[^`\n]+`/,
  },
]

const unsupportedHeading = (markdown: string, editor: EditorConfig): string | null => {
  const levels = [...markdown.matchAll(/^(#{1,6})\s/gm)].map((match) => match[1]?.length ?? 0)
  if (!levels.length) return null
  const props = editor.resolvedFeatureMap.get('heading')?.sanitizedServerFeatureProps as
    | { enabledHeadingSizes?: string[] }
    | undefined
  if (!editor.resolvedFeatureMap.has('heading')) return 'Headings are not available in this field.'
  // The feature's own default when no sizes are passed.
  const sizes = props?.enabledHeadingSizes ?? ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  const allowed = new Set(sizes.map((size) => Number(size.slice(1))))
  const bad = levels.find((level) => !allowed.has(level))
  if (bad === undefined) return null
  const marks = [...allowed].sort().map((level) => '#'.repeat(level))
  return `A level ${bad} heading is not available here. Use ${marks.join(' or ')}.`
}

const unsupportedSyntax = (markdown: string, editor: EditorConfig): string | null =>
  SYNTAX.find(
    ({ feature, pattern }) =>
      !(feature && editor.resolvedFeatureMap.has(feature)) && pattern.test(markdown),
  )?.message ?? unsupportedHeading(markdown, editor)

const convert =
  (target: string): FieldHook =>
  ({ previousSiblingDoc, siblingData, siblingFields, value }) => {
    if (typeof value !== 'string' || !value.trim()) return null

    const field = siblingFields.find(
      (sibling): sibling is RichTextField =>
        sibling.type === 'richText' && 'name' in sibling && sibling.name === target,
    )
    if (!field) throw new Error(`markdownInputFields: no rich text sibling named "${target}".`)
    const editorConfig = editorConfigFactory.fromField({ field })

    const problem = unsupportedSyntax(value, editorConfig)
    if (problem) throw new APIError(`${target}: ${problem}`, 400, undefined, true)

    if (hasRichTextContent(previousSiblingDoc?.[target]) && siblingData.replace !== true)
      throw new APIError(
        `${target} already has content, possibly edited by a person. Send "replace": true beside "markdown" to overwrite it, or leave it alone.`,
        409,
        undefined,
        true,
      )

    siblingData[target] = convertMarkdownToLexical({ editorConfig, markdown: value })
    return null
  }

/** The write-only pair for one rich text sibling. */
export const markdownInputFields = (target: string): Field[] => [
  {
    name: 'markdown',
    type: 'textarea',
    virtual: true,
    admin: {
      hidden: true,
      // Read by agents: the MCP tool schema carries field descriptions.
      description: `Write-only. Markdown for \`${target}\`: converted to rich text on save and never stored. Syntax the field cannot hold is refused with what to use instead.`,
    },
    hooks: { beforeValidate: [convert(target)] },
  },
  {
    name: 'replace',
    type: 'checkbox',
    virtual: true,
    admin: {
      hidden: true,
      description: `Write-only. Send true beside \`markdown\` to overwrite \`${target}\` when it already has content.`,
    },
    // Write-only: it authorizes one conversion and is never part of the document.
    hooks: { beforeValidate: [() => null] },
  },
]
