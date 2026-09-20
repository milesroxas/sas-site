'use client'

import { IconCheck, IconCopy } from '@tabler/icons-react'
import { Highlight, type PrismTheme } from 'prism-react-renderer'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utilities/ui'
// Registers the grammars the bundled highlighter lacks (glsl, bash).
import './code-block-languages'

/**
 * The code surface, owned in one place so a listing reads the same wherever it
 * is used (the `code` block in rich text today, anything else later). Call
 * sites pass content and placement, never styling.
 *
 * The panel is a dark band (`data-band="dark"`, globals.css): its ground is
 * --tertiary, which is 0.22 inside the light theme and 0.08 inside the dark
 * one, and the band restates the whole surface set, so the chrome inside it
 * (the hairline, the language label, the copy button's hover plate) reads the
 * band's tokens rather than the page's. Nothing here hard-codes a color.
 *
 * Long lines scroll horizontally in a `ScrollArea`, so the bar matches every
 * other scroller on the site instead of the browser default, and the viewport
 * carries `scroll-fade-x`: the edge a line runs past softens instead of being
 * cut, and the fade is scroll-driven, so it only appears on a side there is
 * actually more content on.
 *
 * `data-lenis-prevent-horizontal` on that scroller is the same fix the rails
 * carry (sections/RelatedPosts/PostRail.client, blocks/TestimonialsMarquee):
 * root Lenis preventDefaults wheel and touchmove to drive the page itself, so
 * without it a sideways trackpad swipe never reaches the listing and its
 * vertical component scrolls the page instead. The attribute releases only
 * the gestures Lenis reads as horizontal, so panning the code is native while
 * an up/down gesture started over it still smooth-scrolls the page.
 */

/**
 * Prism token types mapped onto the site's tokens. Plain text, comments and
 * punctuation read the band's own --foreground / --muted-foreground so the
 * listing stays part of the surface; the six --syntax-* steps (globals.css,
 * where the palette and its contrast are argued) are specific to code.
 *
 * Grouped by the role a reader scans for rather than by grammar, so one ink
 * means one thing across all seven languages the block offers: a JSX tag, a
 * CSS selector and a function name are all things that are named or called,
 * and take --syntax-entity in each.
 *
 * Every type listed is one these grammars actually emit (typescript, tsx,
 * javascript, css, json, glsl, bash). Nested tokens inherit their parent's
 * style, so a `selector`'s `class` and a `regex`'s `regex-source` need no
 * entry of their own; `color` and `hexcode` do, because a CSS color literal
 * is the one leaf no ancestor reaches, and it rendered as plain text.
 *
 * These are the raw palette variables, not the `--color-*` theme names: the
 * theme map is `@theme inline` (styles/shadcn-theme.css), so `--color-*` is
 * resolved once at `:root` and a band's override of `--foreground` would never
 * reach an inline style that read it.
 */
const codeTheme: PrismTheme = {
  plain: { color: 'var(--foreground)' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--muted-foreground)' },
    },
    // Structure the eye steps over, and the glue it should not.
    {
      types: ['punctuation'],
      style: { color: 'var(--muted-foreground)' },
    },
    {
      types: ['operator', 'combinator'],
      style: { color: 'var(--syntax-operator)' },
    },
    // `boolean` sits with the keywords, not the literals, because Prism gives
    // `null` and `undefined` a `keyword` alias and an alias always wins over
    // the type it decorates. Ranking booleans as literals would leave
    // `"enabled": true` gold beside `"poster": null` blue, two words of the
    // same kind painted differently on adjacent lines. The rule that holds:
    // words the language defines are keywords, data is a literal.
    {
      types: ['keyword', 'builtin', 'atrule', 'important', 'boolean'],
      style: { color: 'var(--syntax-keyword)' },
    },
    // `tag` and `selector` sit here rather than with the keywords: both name a
    // thing, and both share a line with an attr-name or a property, which is
    // exactly the pair that has to stay told apart.
    {
      types: ['function', 'class-name', 'tag', 'selector'],
      style: { color: 'var(--syntax-entity)' },
    },
    {
      types: ['property', 'attr-name', 'variable', 'parameter'],
      style: { color: 'var(--syntax-property)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'url'],
      style: { color: 'var(--syntax-string)' },
    },
    // A `${...}` hole is code, not literal text, and it inherits the template
    // string's green without this. Its own `${` and `}` keep the punctuation
    // ink, which the accumulated types already resolve to last.
    {
      types: ['interpolation'],
      style: { color: 'var(--foreground)' },
    },
    {
      types: ['number', 'constant', 'symbol', 'unit', 'color', 'hexcode'],
      style: { color: 'var(--syntax-number)' },
    },
  ],
}

function CodeBlockCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)
  const timeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timeout.current), [])

  const copy = async () => {
    // The write rejects without clipboard permission or a secure context.
    // The label then stays "Copy", which is the truth.
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      return
    }
    setCopied(true)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      className="font-mono tracking-widest text-muted-foreground hover:text-foreground"
      data-slot="code-block-copy"
      onClick={copy}
      size="sm"
      type="button"
      variant="ghost"
    >
      {/* The label is the live region, so the state change is announced once
          rather than the whole bar being re-read. */}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      {copied ? <IconCheck data-icon="inline-end" /> : <IconCopy data-icon="inline-end" />}
    </Button>
  )
}

function CodeBlock({
  className,
  code,
  language,
  lineNumbers = true,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  code: string
  /** Prism language id. Also the label in the panel bar. */
  language?: string
  lineNumbers?: boolean
}) {
  if (!code) return null

  return (
    <div
      data-band="dark"
      data-slot="code-block"
      className={cn(
        // The hairline is what keeps the panel a surface when the page around
        // it is already a dark band and the two plates land on the same value.
        'not-prose overflow-hidden rounded-lg border border-border bg-background text-foreground',
        className,
      )}
      {...props}
    >
      <div
        data-slot="code-block-bar"
        className="flex items-center justify-between gap-4 border-b border-border py-2 pr-2 pl-4"
      >
        <span
          data-slot="code-block-language"
          className="font-mono text-xs/4 tracking-widest text-muted-foreground"
        >
          {language}
        </span>
        <CodeBlockCopyButton code={code} />
      </div>
      <Highlight code={code.trimEnd()} language={language ?? ''} theme={codeTheme}>
        {({ getLineProps, getTokenProps, tokens }) => (
          <ScrollArea
            data-lenis-prevent-horizontal
            orientation="horizontal"
            type="auto"
            // overscroll-x-contain: at either end of a long line the pan stops
            // there rather than chaining out to the page or the browser's
            // back gesture.
            viewportClassName="scroll-fade-x scroll-fade-16 overscroll-x-contain"
          >
            {/* No tabIndex here: the viewport is a scroll container with no
                focusable children, so the browser makes it keyboard-focusable
                itself, and ScrollArea's viewport already carries the focus
                ring. Forcing a tab stop onto the <pre> would add a second one
                that scrolls nothing. */}
            <pre
              data-slot="code-block-body"
              className="w-max min-w-full py-4 pr-4 font-mono text-code"
            >
              {tokens.map((line, index) => (
                <div
                  // Lines have no id of their own and never reorder.
                  key={index}
                  {...getLineProps({ className: 'flex', line })}
                >
                  {lineNumbers ? (
                    <span
                      aria-hidden
                      data-slot="code-block-gutter"
                      className="w-14 shrink-0 pr-4 text-right text-muted-foreground select-none"
                    >
                      {index + 1}
                    </span>
                  ) : null}
                  <span>
                    {line.map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          </ScrollArea>
        )}
      </Highlight>
    </div>
  )
}

export { CodeBlock }
