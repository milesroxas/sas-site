'use client'

import type { PluginComponent, ToolbarGroup, ToolbarGroupItem } from '@payloadcms/richtext-lexical'
import {
  createClientFeature,
  toolbarTextDropdownGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $getState,
  $isElementNode,
  $isRangeSelection,
  $setState,
  type BaseSelection,
  createState,
  type ElementNode,
  TextNode,
} from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $setBlocksType } from '@payloadcms/richtext-lexical/lexical/selection'
import type React from 'react'
import { useEffect } from 'react'
import {
  isTextStyle,
  TEXT_STYLE_STATE_KEY,
  TEXT_STYLES,
  type TextStyle,
} from '@/components/RichText/text-styles'

/** The one state every text node may carry: a style name, or nothing. */
const textStyleState = createState(TEXT_STYLE_STATE_KEY, {
  parse: (value?: unknown) => (isTextStyle(value) ? value : undefined),
})

/** The top-level blocks a selection touches, each once. */
const $selectedBlocks = (selection: BaseSelection | null): ElementNode[] => {
  if (!$isRangeSelection(selection)) return []
  const blocks = new Map<string, ElementNode>()
  for (const node of selection.getNodes()) {
    const block = node.getTopLevelElement()
    if ($isElementNode(block)) blocks.set(block.getKey(), block)
  }
  return [...blocks.values()]
}

/** The style a block carries throughout, if its text all agrees. */
const $blockStyle = (block: ElementNode): TextStyle | undefined => {
  const nodes = block.getAllTextNodes()
  const first = nodes[0] ? $getState(nodes[0], textStyleState) : undefined
  return first && nodes.every((node) => $getState(node, textStyleState) === first)
    ? first
    : undefined
}

const $isStyleActive = (style: TextStyle, selection: BaseSelection | null): boolean => {
  const blocks = $selectedBlocks(selection)
  return blocks.length > 0 && blocks.every((block) => $blockStyle(block) === style)
}

/**
 * Sets (or clears, with `undefined`) the style on every text node of every
 * selected block. A style is a paragraph treatment, so headings and list
 * items become paragraphs first.
 */
const $applyStyle = (style: TextStyle | undefined) => {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return
  if (style) $setBlocksType(selection, () => $createParagraphNode())
  for (const block of $selectedBlocks($getSelection())) {
    for (const node of block.getAllTextNodes()) $setState(node, textStyleState, style)
  }
}

/**
 * Paints the admin's approximation of each style on the text node's DOM
 * (`data-text-style` plus the registry's preview css), the way Payload's
 * TextStateFeature does. The site never sees this; it renders classes.
 */
const TextStylePlugin: PluginComponent = () => {
  const [editor] = useLexicalComposerContext()
  useEffect(
    () =>
      editor.registerMutationListener(
        TextNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            for (const [key, mutation] of mutations) {
              if (mutation === 'destroyed') continue
              const node = $getNodeByKey(key)
              const dom = editor.getElementByKey(key)
              if (!node || !dom) continue
              const style = $getState(node, textStyleState)
              dom.style.cssText = ''
              if (style) {
                dom.dataset.textStyle = style
                Object.assign(dom.style, TEXT_STYLES[style].adminCss)
              } else {
                delete dom.dataset.textStyle
              }
            }
          })
        },
        { skipInitialization: false },
      ),
    [editor],
  )
  return null
}

/** A glyph for the dropdown row: the style's initial in the registry's face. */
const styleIcon = (style: TextStyle): React.FC => {
  const Icon: React.FC = () => (
    <svg aria-hidden="true" height="20" viewBox="0 0 20 20" width="20">
      <title>{TEXT_STYLES[style].label}</title>
      <text
        fill="currentColor"
        fontSize={style === 'small' ? 10 : 12}
        style={TEXT_STYLES[style].adminCss}
        textAnchor="middle"
        x="10"
        y="14"
      >
        Aa
      </text>
    </svg>
  )
  return Icon
}

const items: ToolbarGroupItem[] = (Object.keys(TEXT_STYLES) as TextStyle[]).map((style, index) => ({
  ChildComponent: styleIcon(style),
  isActive: ({ selection }) => $isStyleActive(style, selection),
  key: `textStyle-${style}`,
  label: TEXT_STYLES[style].label,
  onSelect: ({ editor }) => {
    editor.update(() => {
      $applyStyle($isStyleActive(style, $getSelection()) ? undefined : style)
    })
  },
  // Ahead of Normal (1): the dropdown marks one row active, checking rows
  // in this order, and a styled paragraph is still a paragraph. Rows first
  // means the style wins the highlight and the trigger's label.
  order: (index + 1) / 10,
}))

/** The format dropdown (Normal, Heading 4, list), with the styles as rows. */
const toolbarGroups: ToolbarGroup[] = [toolbarTextDropdownGroupWithItems(items)]

export const TextStyleFeatureClient = createClientFeature({
  plugins: [{ Component: TextStylePlugin, position: 'normal' }],
  toolbarFixed: { groups: toolbarGroups },
  toolbarInline: { groups: toolbarGroups },
})
