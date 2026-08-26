import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type React from 'react'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import { FieldShell } from '../FieldShell'
import { SelectInput } from '../SelectInput'

export const Select: React.FC<
  SelectField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, errors, label, options, required, width, defaultValue }) => {
  const hasError = Boolean(errors[name])

  return (
    <FieldShell hasError={hasError} label={label} name={name} required={required} width={width}>
      <SelectInput
        control={control}
        defaultValue={defaultValue}
        hasError={hasError}
        label={label}
        name={name}
        options={options}
        required={required}
      />
    </FieldShell>
  )
}
