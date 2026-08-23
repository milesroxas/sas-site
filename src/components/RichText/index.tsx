import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CodeBlock, type CodeBlockProps } from '@/blocks/Code/Component'
import { FeatureStatementLinksBlock } from '@/blocks/feature/StatementLinks/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  FeatureStatementLinksBlock as FeatureStatementLinksBlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | CTABlockProps
      | MediaBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | FeatureStatementLinksBlockProps
    >

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
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
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
