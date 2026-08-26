import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'

import { FieldShell } from '../FieldShell'

export type TextInputProps = TextField & {
  errors: Partial<FieldErrorsImpl>
  register: UseFormRegister<FieldValues>
}

/**
 * Single-line input field. The text, email, and number form blocks differ only
 * in their HTML input type and whether the value has to match a pattern, so
 * this binds those two and returns the component the field registry stores.
 */
export const createTextInput = (
  type: 'number' | 'text',
  pattern?: RegExp,
): React.FC<TextInputProps> =>
  function TextInput({ name, defaultValue, errors, label, register, required, width }) {
    const hasError = Boolean(errors[name])

    return (
      <FieldShell hasError={hasError} label={label} name={name} required={required} width={width}>
        <Input
          aria-invalid={hasError || undefined}
          defaultValue={defaultValue}
          id={name}
          type={type}
          {...register(name, { pattern, required })}
        />
      </FieldShell>
    )
  }
