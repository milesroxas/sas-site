import type * as React from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export type FormSubmitProps = {
  children: React.ReactNode
  disabled?: boolean
  /** Id of the form element, for a button rendered outside the `<form>`. */
  form?: string
  /** Quiet line beside the button — what happens to what was just sent. */
  note?: React.ReactNode
  pending?: boolean
}

/**
 * The closing rule of a form: one action set left, one line of reassurance
 * right. Shared so the last thing a visitor reads before submitting is the
 * same shape on every form.
 */
export const FormSubmit: React.FC<FormSubmitProps> = ({
  children,
  disabled,
  form,
  note,
  pending,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border pt-4">
    <Button disabled={disabled || pending} form={form} size="xl" type="submit">
      {pending ? <Spinner /> : null}
      {children}
    </Button>
    {note ? (
      <p className="max-w-80 font-mono text-xs/relaxed text-muted-foreground sm:text-right">
        {note}
      </p>
    ) : null}
  </div>
)
