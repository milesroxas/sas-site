import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'

import { FieldError } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const props = register(name, { required: required })
  const { setValue } = useFormContext()
  const hasError = Boolean(errors[name])

  return (
    <Width width={width}>
      <Field data-invalid={hasError ? true : undefined} orientation="horizontal">
        <CheckboxUi
          aria-invalid={hasError || undefined}
          defaultChecked={defaultValue}
          id={name}
          {...props}
          onCheckedChange={(checked) => {
            setValue(props.name, checked)
          }}
        />
        <FieldLabel htmlFor={name}>
          {required && (
            <span className="text-destructive">
              * <span className="sr-only">(required)</span>
            </span>
          )}
          {label}
        </FieldLabel>
      </Field>
      {hasError && <FieldError name={name} />}
    </Width>
  )
}
