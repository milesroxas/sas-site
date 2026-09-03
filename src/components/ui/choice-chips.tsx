'use client'

import { IconCheck, IconPlus } from '@tabler/icons-react'
import { createContext, use } from 'react'
import { cn } from '@/utilities/ui'

type ChoiceChipsContextValue = {
  name: string
  type: 'checkbox' | 'radio'
}

const ChoiceChipsContext = createContext<ChoiceChipsContextValue | null>(null)

/**
 * Pill-shaped answer set: a row of wrapping chips that stands in for a select
 * when every option is worth reading at once (capabilities, budget bands,
 * timelines). One tap, no menu — the whole question and its answers stay on
 * screen, which is the point of the editorial form.
 *
 * Built on native `radio` / `checkbox` inputs, so it arrives keyboard- and
 * screen-reader-correct for free (arrow keys within a radio group, space to
 * toggle a checkbox) and registers with react-hook-form like any other input.
 * `type` is the only difference between "pick one" and "pick any".
 */
function ChoiceChips({
  className,
  name,
  type = 'radio',
  ...props
}: React.ComponentProps<'div'> & ChoiceChipsContextValue) {
  return (
    <ChoiceChipsContext value={{ name, type }}>
      {/* biome-ignore lint/a11y/useSemanticElements: the group's label is the field's own <label>, wired by aria-labelledby at the call site; a <fieldset> would need a <legend> and duplicate it */}
      <div
        role="group"
        data-slot="choice-chips"
        data-type={type}
        className={cn('flex w-full flex-wrap items-center gap-2', className)}
        {...props}
      />
    </ChoiceChipsContext>
  )
}

/**
 * One option. The input is visually hidden but still the focus target and the
 * thing that carries state, so selection styling reads off `:checked` and the
 * ring reads off `:focus-visible` — no JS state, nothing to keep in sync.
 *
 * A pick-any chip leads with a `+` that becomes a check once picked, so a row
 * of pills reads as things to add rather than tags to read; pick-one chips
 * stay plain, and their filled state alone says which one.
 */
function ChoiceChip({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const context = use(ChoiceChipsContext)

  if (!context) {
    throw new Error('ChoiceChip must be rendered inside ChoiceChips')
  }

  const additive = context.type === 'checkbox'

  return (
    <label
      data-slot="choice-chip"
      className={cn(
        'group/chip pressable inline-flex cursor-pointer items-center rounded-full border border-border px-4 py-2 font-mono text-xs/4 text-foreground select-none',
        'hover:border-foreground',
        'has-[input:checked]:border-foreground has-[input:checked]:bg-foreground has-[input:checked]:text-background',
        'has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/30',
        'has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-50',
        additive && 'gap-1.5 pl-3',
        className,
      )}
    >
      <input className="sr-only" name={context.name} type={context.type} {...props} />
      {additive ? (
        <span
          aria-hidden="true"
          className="size-3 shrink-0 text-muted-foreground group-has-[input:checked]/chip:text-background"
        >
          <IconPlus className="size-3 group-has-[input:checked]/chip:hidden" stroke={1.5} />
          <IconCheck className="hidden size-3 group-has-[input:checked]/chip:block" stroke={1.5} />
        </span>
      ) : null}
      {children}
    </label>
  )
}

export { ChoiceChip, ChoiceChips }
