import type * as React from 'react'
import { Field, FieldLabel } from '@/components/ui/field'

import { FieldError } from '../Error'
import { Width } from '../Width'

/** Inline required marker shared by every form-builder field label. */
export const RequiredMark: React.FC = () => (
  <span className="text-destructive">
    * <span className="sr-only">(required)</span>
  </span>
)

export type FieldShellProps = {
  children: React.ReactNode
  hasError: boolean
  label?: string | null
  name: string
  required?: boolean | null
  width?: number | string
}

/**
 * Shared chrome for form-builder fields: width column, invalid state, label
 * with its required marker, and the error message. Each field supplies only
 * its own control as `children`.
 */
export const FieldShell: React.FC<FieldShellProps> = ({
  children,
  hasError,
  label,
  name,
  required,
  width,
}) => (
  <Width width={width}>
    <Field data-invalid={hasError ? true : undefined}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && <RequiredMark />}
      </FieldLabel>
      {children}
      {hasError && <FieldError name={name} />}
    </Field>
  </Width>
)
