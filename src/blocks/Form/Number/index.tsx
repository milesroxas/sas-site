import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { FieldError } from '../Error'
import { Width } from '../Width'

export const NumberField: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const hasError = Boolean(errors[name])

  return (
    <Width width={width}>
      <Field data-invalid={hasError ? true : undefined}>
        <FieldLabel htmlFor={name}>
          {label}
          {required && (
            <span className="text-destructive">
              * <span className="sr-only">(required)</span>
            </span>
          )}
        </FieldLabel>
        <Input
          aria-invalid={hasError || undefined}
          defaultValue={defaultValue}
          id={name}
          type="number"
          {...register(name, { required })}
        />
        {hasError && <FieldError name={name} />}
      </Field>
    </Width>
  )
}
