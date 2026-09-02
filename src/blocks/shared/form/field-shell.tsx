import type * as React from 'react'
import { Field, FieldLabel, FieldMeta } from '@/components/ui/field'

import { FieldError } from './field-error'
import { Width } from './width'

/**
 * Inline required marker.
 *
 * Only the `default` (boxed) label wears one. The editorial form marks the
 * *optional* fields in their own labels instead — a column of asterisks down a
 * form whose fields are nearly all required tells the reader nothing, and the
 * one thing worth flagging is what they can skip.
 */
export const RequiredMark: React.FC = () => (
  <span className="text-destructive">
    * <span className="sr-only">(required)</span>
  </span>
)

/**
 * Id of a field's label element. A control set (chips) points at it with
 * `aria-labelledby`, since `htmlFor` can only name a single control.
 */
export const fieldLabelId = (name: string) => `${name}-label`

export type FieldShellProps = {
  children: React.ReactNode
  /**
   * `input` (default) binds the label to one control with `htmlFor`. `group`
   * is for a set of controls that share the label — the caller points the set
   * at `fieldLabelId(name)`.
   */
  control?: 'group' | 'input'
  hasError: boolean
  label?: React.ReactNode
  /**
   * Trailing hint set on the label's baseline at the far end of the row — the
   * unit, the selection rule, a character count.
   */
  meta?: React.ReactNode
  name: string
  required?: boolean | null
  /**
   * Label treatment. `mono` is the site's editorial form voice and the default
   * for every field a visitor sees; `default` keeps the compact boxed label
   * for utility forms inside chrome.
   */
  variant?: 'default' | 'mono'
  width?: number | string
}

/**
 * Shared chrome for every form field: width column, invalid state, the label
 * row with its required marker and optional trailing hint, and the error
 * message. Each field supplies only its own control as `children`.
 *
 * Every visual decision in the row lives in the `field` primitives, so a field
 * component never restates the label's type, color, or focus behaviour.
 */
export const FieldShell: React.FC<FieldShellProps> = ({
  children,
  control = 'input',
  hasError,
  label,
  meta,
  name,
  required,
  variant = 'mono',
  width,
}) => (
  <Width width={width}>
    <Field className="gap-3" data-invalid={hasError ? true : undefined}>
      <div className="flex items-baseline justify-between gap-6">
        <FieldLabel
          htmlFor={control === 'input' ? name : undefined}
          id={fieldLabelId(name)}
          variant={variant}
        >
          {label}
          {required && variant === 'default' ? <RequiredMark /> : null}
        </FieldLabel>
        {meta ? <FieldMeta>{meta}</FieldMeta> : null}
      </div>
      {children}
      {hasError ? <FieldError name={name} /> : null}
    </Field>
  </Width>
)
