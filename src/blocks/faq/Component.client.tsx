'use client'

import { Accordion as AccordionPrimitive } from 'radix-ui'
import type React from 'react'
import { useState } from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import RichText from '@/components/RichText'
import type { FaqBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

export type FaqItem = Pick<NonNullable<FaqBlock['items']>[number], 'answer' | 'question'> & {
  id: string
}

/** Two columns from `md`: the first half of the list (rounded up) leads. */
const splitColumns = (items: FaqItem[]): [FaqItem[], FaqItem[]] => {
  const half = Math.ceil(items.length / 2)
  return [items.slice(0, half), items.slice(half)]
}

const numberOf = (index: number) => String(index + 1).padStart(2, '0')

/**
 * Plus that becomes a minus: the vertical bar turns a quarter onto the
 * horizontal one while the row opens, on the site's ease. A transform on a
 * 12px glyph, nothing else moves in the trigger.
 */
const PlusMinus = () => (
  <span aria-hidden="true" className="flex w-5 shrink-0 justify-center pt-2">
    <svg
      aria-hidden="true"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeWidth={1.25}
      viewBox="0 0 12 12"
    >
      <path d="M1 6h10" />
      <path
        className="origin-center transition-transform duration-200 ease-(--ease-out-quint) group-data-[state=open]:rotate-90 motion-reduce:transition-none"
        d="M6 1v10"
      />
    </svg>
  </span>
)

/**
 * One question. The trigger is the whole row (index lane, question, glyph)
 * so the hit area matches what the eye reads as the row; the index lane and
 * glyph are fixed-width slots so the lanes line up across rows. The answer
 * collapses as a grid track (`disclosure-body`, globals.css), stays mounted
 * for the transition, and goes `inert` while closed so its links leave the
 * tab order.
 *
 * The answer re-enters the question lane with padding equal to the index
 * slot plus gap (3.5rem) and the glyph slot plus gap (2.75rem), so its
 * measure is the question's.
 */
const FaqRow: React.FC<{ index: number; item: FaqItem; open: boolean }> = ({
  index,
  item,
  open,
}) => (
  <AccordionPrimitive.Item className="border-b border-border" value={item.id}>
    <AccordionPrimitive.Header className="text-lg/relaxed">
      <AccordionPrimitive.Trigger className="group pressable pressable-subtle flex w-full items-start gap-6 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
        <span
          aria-hidden="true"
          className="w-8 shrink-0 pt-2 font-mono text-xs/none text-muted-foreground transition-colors group-hover:text-foreground"
        >
          {numberOf(index)}
        </span>
        <span className="min-w-0 grow">{item.question}</span>
        <PlusMinus />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
    <AccordionPrimitive.Content
      className="disclosure-body"
      data-open={open || undefined}
      forceMount
      inert={!open}
    >
      <div>
        <div className="ps-14 pe-11 pt-3 pb-7">
          <RichText
            className="text-base/relaxed text-muted-foreground"
            data={item.answer}
            enableGutter={false}
            enableProse={false}
          />
        </div>
      </div>
    </AccordionPrimitive.Content>
  </AccordionPrimitive.Item>
)

/**
 * The question columns: one accordion (single open item, the first open by
 * default, arrow keys move across both columns) laid out as two cells of
 * the composition grid. Each column carries its own heavy top rule; below
 * `md` the second column drops it and the grid's row gap is zeroed, so the
 * two columns read as one continuous list.
 */
export const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [open, setOpen] = useState(items[0]?.id ?? '')
  const [lead, trail] = splitColumns(items)
  const columns = [lead, trail]

  return (
    <AccordionPrimitive.Root collapsible onValueChange={setOpen} type="single" value={open}>
      <BlockGrid className="gap-y-0">
        {columns.map((column, columnIndex) =>
          column.length ? (
            <div
              className={cn(
                'border-t border-foreground md:col-span-4',
                columnIndex > 0 && 'max-md:border-t-0',
              )}
              data-reveal
              data-reveal-group="columns"
              key={columnIndex}
            >
              {column.map((item, index) => (
                <FaqRow
                  index={columnIndex === 0 ? index : lead.length + index}
                  item={item}
                  key={item.id}
                  open={open === item.id}
                />
              ))}
            </div>
          ) : null,
        )}
      </BlockGrid>
    </AccordionPrimitive.Root>
  )
}
