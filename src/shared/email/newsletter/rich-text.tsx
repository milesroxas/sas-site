import type { CollectionSlug } from 'payload'
import type { ReactNode } from 'react'
import { Heading, Link, Text } from 'react-email'
import { collectionPrefixMap } from '@/utilities/generatePreviewPath'

/**
 * Lexical → React Email serializer (FSD: **shared**).
 *
 * Renders the node types enabled on the newsletter rich-text editor (paragraphs, h2/h3, inline
 * formatting, links, lists) as email-safe React Email components. Kept hand-rolled so output
 * stays limited to markup that renders correctly across email clients — the site's HTML
 * converters are not email-safe. Unknown node types degrade gracefully to their children.
 */

/** Lexical inline-format bitmask (see `@lexical/rich-text` TextNode). */
const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3

interface LexicalNode {
  type?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

interface EmailRichTextProps {
  data: unknown
  /** Absolute origin used to resolve internal links (emails need absolute URLs). */
  baseUrl: string
}

const PARAGRAPH_CLASS = 'email-fg-2 text-16 text-fg-2 mt-0 mb-5 text-left font-sans'
const LINK_CLASS = 'email-fg text-fg underline'

function renderText(node: LexicalNode, key: number): ReactNode {
  let content: ReactNode = typeof node.text === 'string' ? node.text : ''
  const format = typeof node.format === 'number' ? node.format : 0

  if (format & IS_BOLD) content = <strong>{content}</strong>
  if (format & IS_ITALIC) content = <em>{content}</em>
  if (format & IS_UNDERLINE) content = <u>{content}</u>
  if (format & IS_STRIKETHROUGH) content = <s>{content}</s>

  return <span key={key}>{content}</span>
}

/** Resolve a Lexical link node to an absolute href, or null when it can't be resolved. */
function resolveLinkHref(node: LexicalNode, baseUrl: string): string | null {
  const fields = (node.fields ?? {}) as {
    linkType?: string
    url?: string
    doc?: { relationTo?: string; value?: unknown }
  }

  if (fields.linkType === 'internal') {
    const value = fields.doc?.value
    const slug =
      typeof value === 'object' && value !== null ? (value as { slug?: string }).slug : undefined
    if (typeof slug !== 'string') return null
    const prefix = collectionPrefixMap[fields.doc?.relationTo as CollectionSlug] ?? ''
    return `${baseUrl}${prefix}/${slug}`
  }

  if (typeof fields.url !== 'string' || fields.url.length === 0) return null
  return fields.url.startsWith('/') ? `${baseUrl}${fields.url}` : fields.url
}

function renderInlineChildren(nodes: LexicalNode[] | undefined, baseUrl: string): ReactNode[] {
  return (nodes ?? []).map((node, i) => {
    switch (node.type) {
      case 'text':
        return renderText(node, i)
      case 'linebreak':
        return <br key={i} />
      case 'link':
      case 'autolink': {
        const href = resolveLinkHref(node, baseUrl)
        const children = renderInlineChildren(node.children, baseUrl)
        if (!href) return <span key={i}>{children}</span>
        return (
          <Link key={i} href={href} className={LINK_CLASS}>
            {children}
          </Link>
        )
      }
      default:
        return node.children ? (
          <span key={i}>{renderInlineChildren(node.children, baseUrl)}</span>
        ) : null
    }
  })
}

function renderBlockNode(node: LexicalNode, key: number, baseUrl: string): ReactNode {
  switch (node.type) {
    case 'paragraph': {
      const children = renderInlineChildren(node.children, baseUrl)
      // Preserve intentional blank lines between paragraphs.
      return (
        <Text key={key} className={PARAGRAPH_CLASS}>
          {children.length > 0 ? children : ' '}
        </Text>
      )
    }
    case 'heading': {
      const tag = node.tag === 'h3' ? 'h3' : 'h2'
      const className =
        tag === 'h2'
          ? 'email-fg text-24 text-fg mt-8 mb-4 text-left font-sans'
          : 'email-fg text-16 text-fg mt-6 mb-3 text-left font-sans font-semibold'
      return (
        <Heading key={key} as={tag} className={className}>
          {renderInlineChildren(node.children, baseUrl)}
        </Heading>
      )
    }
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return (
        <Tag key={key} className={`${PARAGRAPH_CLASS} pl-6`}>
          {(node.children ?? []).map((item, i) => renderBlockNode(item, i, baseUrl))}
        </Tag>
      )
    }
    case 'listitem':
      return (
        <li key={key} className="mb-1">
          {(node.children ?? []).map((child, i) =>
            child.type === 'list'
              ? renderBlockNode(child, i, baseUrl)
              : renderInlineChildren([child], baseUrl),
          )}
        </li>
      )
    default:
      // Unknown block-level node: fall back to its inline children so content never vanishes.
      return node.children ? (
        <Text key={key} className={PARAGRAPH_CLASS}>
          {renderInlineChildren(node.children, baseUrl)}
        </Text>
      ) : null
  }
}

export function EmailRichText({ data, baseUrl }: EmailRichTextProps) {
  const root = (data as { root?: LexicalNode } | null | undefined)?.root
  if (!root?.children?.length) return null
  return <>{root.children.map((node, i) => renderBlockNode(node, i, baseUrl))}</>
}
