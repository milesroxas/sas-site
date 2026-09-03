import type * as React from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/utilities/ui'

export type FormActionsProps = {
  children: React.ReactNode
  /** Quiet line beside the action — what happens to what was just sent. */
  note?: React.ReactNode
  /**
   * Close the form with a rule above the row. Off inside a step list, whose
   * own hairlines already close each step.
   */
  ruled?: boolean
}

/**
 * A form's action row: one action set left, one line of reassurance right.
 * The same shape closes a whole form and ends each step of a stepped one, so
 * the last thing a visitor reads before pressing is always laid out alike.
 */
export const FormActions: React.FC<FormActionsProps> = ({ children, note, ruled }) => (
  <div
    className={cn(
      'flex flex-wrap items-center justify-between gap-6',
      ruled && 'border-t border-border pt-4',
    )}
  >
    {children}
    {note ? (
      <p className="max-w-80 font-mono text-xs/relaxed text-muted-foreground sm:text-right">
        {note}
      </p>
    ) : null}
  </div>
)

export type FormSubmitProps = {
  children: React.ReactNode
  disabled?: boolean
  /** Id of the form element, for a button rendered outside the `<form>`. */
  form?: string
  /** Quiet line beside the button — what happens to what was just sent. */
  note?: React.ReactNode
  pending?: boolean
}

/** The closing rule of a form: the submit button on a ruled `FormActions` row. */
export const FormSubmit: React.FC<FormSubmitProps> = ({
  children,
  disabled,
  form,
  note,
  pending,
}) => (
  <FormActions note={note} ruled>
    <Button disabled={disabled || pending} form={form} size="xl" type="submit">
      {pending ? <Spinner /> : null}
      {children}
    </Button>
  </FormActions>
)
