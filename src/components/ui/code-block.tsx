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
 */

/**
 * Prism token types mapped onto the site's tokens. Structural ink (plain text,
 * comments, punctuation) reads the band's own --foreground / --muted-foreground
 * so the listing stays part of the surface; only the four --syntax-* steps are
 * specific to code.
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
    {
      types: ['punctuation', 'operator'],
      style: { color: 'var(--muted-foreground)' },
    },
    {
      types: ['keyword', 'builtin', 'atrule', 'important', 'tag', 'selector'],
      style: { color: 'var(--syntax-keyword)' },
    },
    {
      types: ['function', 'class-name', 'attr-name', 'property', 'variable'],
      style: { color: 'var(--syntax-entity)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'regex', 'url'],
      style: { color: 'var(--syntax-string)' },
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol', 'unit'],
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
            orientation="horizontal"
            type="auto"
            viewportClassName="scroll-fade-x scroll-fade-16"
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
