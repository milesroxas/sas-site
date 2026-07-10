import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { Control, FieldErrorsImpl } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { FieldError } from '../Error'
import { Width } from '../Width'

export const Select: React.FC<
  SelectField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, errors, label, options, required, width, defaultValue }) => {
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
        <Controller
          control={control}
          defaultValue={defaultValue}
          name={name}
          render={({ field: { onChange, value } }) => {
            const controlledValue = options.find((t) => t.value === value)

            return (
              <SelectComponent
                onValueChange={(val) => onChange(val)}
                value={controlledValue?.value}
              >
                <SelectTrigger aria-invalid={hasError || undefined} className="w-full" id={name}>
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {options.map(({ label, value }) => {
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </SelectComponent>
            )
          }}
          rules={{ required }}
        />
        {hasError && <FieldError name={name} />}
      </Field>
    </Width>
  )
}
