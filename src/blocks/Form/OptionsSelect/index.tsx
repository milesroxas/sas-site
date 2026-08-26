import type React from 'react'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import { FieldShell } from '../FieldShell'
import { SelectInput, type SelectInputOption } from '../SelectInput'

export type OptionsSelectProps = {
  control: Control
  errors: Partial<FieldErrorsImpl>
  label?: string | null
  name: string
  required?: boolean | null
  width?: number
}

/**
 * Select field over a fixed option list. The country and state form blocks are
 * exactly that, differing only in which list they render, so this binds the
 * list and returns the component the field registry stores.
 */
export const createOptionsSelect = (options: SelectInputOption[]): React.FC<OptionsSelectProps> =>
  function OptionsSelect({ control, errors, label, name, required, width }) {
    const hasError = Boolean(errors[name])

    return (
      <FieldShell hasError={hasError} label={label} name={name} required={required} width={width}>
        <SelectInput
          control={control}
          hasError={hasError}
          label={label}
          name={name}
          options={options}
          required={required}
        />
      </FieldShell>
    )
  }
