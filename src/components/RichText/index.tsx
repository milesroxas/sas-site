import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  type JSXConverter,
  type JSXConverterArgs,
  type JSXConvertersFunction,
  LinkJSXConverter,
  type SerializedLexicalNodeWithParent,
} from '@payloadcms/richtext-lexical/react'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'
import { FeatureStatementLinksBlock } from '@/blocks/feature/StatementLinks/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { RichTextActions } from '@/blocks/rich-text/actions/Component'
import { RichTextInsights } from '@/blocks/rich-text/insights/Component'
import { RichTextPillList } from '@/blocks/rich-text/pill-list/Component'
import type {
  BannerBlock as BannerBlockProps,
  CarouselBlock as CarouselBlockProps,
  CallToActionBlock as CTABlockProps,
  FeatureStatementLinksBlock as FeatureStatementLinksBlockProps,
  MediaBlock as MediaBlockProps,
  RichTextActionsBlock as RichTextActionsBlockProps,
  RichTextInsightsBlock as RichTextInsightsBlockProps,
  RichTextPillListBlock as RichTextPillListBlockProps,
} from '@/payload-types'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import { cn } from '@/utilities/ui'
import { isTextStyle, TEXT_STYLE_STATE_KEY, TEXT_STYLES, type TextStyle } from './text-styles'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | CTABlockProps
      | MediaBlockProps
      | BannerBlockProps
      | CarouselBlockProps
      | CodeBlockProps
      | FeatureStatementLinksBlockProps
      | RichTextActionsBlockProps
      | RichTextInsightsBlockProps
      | RichTextPillListBlockProps
    >

type ParagraphNode = Extract<DefaultNodeTypes, { type: 'paragraph' }>
type TextNode = Extract<DefaultNodeTypes, { type: 'text' }>

/**
 * The text style the content-column editor stored on a text node
 * (`text-styles.ts`): Lexical node state, under the one key the styles share.
 */
const textStyleOf = (node: SerializedLexicalNodeWithParent | undefined): TextStyle | undefined => {
  const value = (node as { $?: Record<string, unknown> } | undefined)?.$?.[TEXT_STYLE_STATE_KEY]
  return isTextStyle(value) ? value : undefined
}

/**
 * The one style every text child of a paragraph carries, if they all do.
 * Line breaks and blank runs do not count; anything else without the style
 * (a link, unstyled text) means the paragraph is mixed.
 */
const paragraphTextStyle = (node: ParagraphNode): TextStyle | undefined => {
  let style: TextStyle | undefined
  for (const child of node.children) {
    if (child.type === 'linebreak') continue
    if (child.type === 'text' && !(child as TextNode).text.trim()) continue
    const own = child.type === 'text' ? textStyleOf(child) : undefined
    if (!own || (style && own !== style)) return undefined
    style = own
  }
  return style
}

const isParagraph = (node: SerializedLexicalNodeWithParent | undefined): node is ParagraphNode =>
  node?.type === 'paragraph'

const runConverter = <TNode extends SerializedLexicalNodeWithParent>(
  converter: JSXConverter<TNode> | undefined,
  args: JSXConverterArgs<TNode>,
) => (typeof converter === 'function' ? converter(args) : converter)

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc
  if (!doc) {
    throw new Error('Expected link fields.doc for internal document link')
  }
  const { value, relationTo } = doc
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  const surface = surfaceByCollection.get(relationTo)
  return surface && typeof slug === 'string' ? surfaceDocPath(surface, slug) : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  /**
   * Text styles (`text-styles.ts`). A paragraph styled throughout carries the
   * style itself, so its line-height and the flow rhythm around it follow
   * the style; a styled run inside a mixed paragraph is a span. Neither is
   * ever both.
   */
  paragraph: ({ node, nodesToJSX }) => {
    const style = paragraphTextStyle(node)
    const children = nodesToJSX({ nodes: node.children })
    return (
      <p className={style ? TEXT_STYLES[style].className : undefined}>
        {children.length ? children : <br />}
      </p>
    )
  },
  text: (args) => {
    const rendered = runConverter(defaultConverters.text, args)
    const style = textStyleOf(args.node)
    if (!style) return rendered
    if (isParagraph(args.parent) && paragraphTextStyle(args.parent) === style) return rendered
    return <span className={TEXT_STYLES[style].className}>{rendered}</span>
  },
  blocks: {
    actions: ({ node }) => <RichTextActions links={node.fields.links} />,
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    carousel: ({ node }) => (
      <CarouselBlock
        className="col-start-1 col-span-3"
        {...node.fields}
        disableInnerContainer
        enableGutter={false}
      />
    ),
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    featureStatementLinks: ({ node }) => <FeatureStatementLinksBlock {...node.fields} />,
    // The Rich text block splits its own blocks out onto its grid before
    // converting (rich-text/Component.tsx); these converters are the inline
    // fallback for any other editor that enables them.
    insights: ({ node }) => (
      <RichTextInsights group={node.fields.id ?? 'insights'} items={node.fields.items} />
    ),
    pillList: ({ node }) => (
      <RichTextPillList eyebrow={node.fields.eyebrow} items={node.fields.items} />
    ),
  },
})

/**
 * Rich text ink variants, owned once here so every block reads the same
 * treatment.
 *
 * - `default`: inherit the surrounding ink.
 * - `emphasis`: body copy renders muted; words the editor bolds are the
 *   emphasis and restore foreground ink. Pair with `enableProse={false}` so
 *   Tailwind Typography's own ink colors don't compete.
 */
const variantClasses = {
  default: '',
  emphasis: 'text-muted-foreground [&_strong]:font-normal [&_strong]:text-foreground',
} as const

export type RichTextVariant = keyof typeof variantClasses

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  variant?: RichTextVariant
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, variant = 'default', ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          /* Article scale: bridge Tailwind Typography to the fluid type
             tokens. h1/h2 step down one visual level inside a reading column
             (380 via the token weight companions, matching body); h3/h4 take
             medium — at near-body sizes weight, not size, carries hierarchy. */
          'mx-auto prose dark:prose-invert': enableProse,
          'prose-h1:text-heading-2 prose-h2:text-heading-3 prose-h3:text-lead prose-h3:leading-snug prose-h3:font-medium prose-h4:font-medium':
            enableProse,
        },
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  )
}
