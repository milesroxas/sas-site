import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { Textarea as TextAreaComponent } from '@/components/ui/textarea'

import { FieldShell } from '../FieldShell'

export const Textarea: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({ name, defaultValue, errors, label, register, required, rows = 3, width }) => {
  const hasError = Boolean(errors[name])

  return (
    <FieldShell hasError={hasError} label={label} name={name} required={required} width={width}>
      <TextAreaComponent
        aria-invalid={hasError || undefined}
        defaultValue={defaultValue}
        id={name}
        rows={rows}
        {...register(name, { required })}
      />
    </FieldShell>
  )
}
