/**
 * Whether a Lexical editor state holds real content. A rich-text field the
 * editor merely focused (or cleared with select-all + delete) saves as a root
 * with one empty paragraph — truthy, but visually nothing. Fallback chains
 * (`written copy || canonical source`) must treat that state as empty or the
 * pulled copy can never win again once the field has been touched.
 */
type RichTextState = {
  root?: {
    children?: Array<{ type?: unknown; children?: unknown }> | null
  } | null
}

export const hasRichTextContent = (state: RichTextState | null | undefined): boolean =>
  Boolean(
    state?.root?.children?.some((node) => {
      if (node.type !== 'paragraph') return true
      const children = node.children
      return Array.isArray(children) && children.length > 0
    }),
  )
