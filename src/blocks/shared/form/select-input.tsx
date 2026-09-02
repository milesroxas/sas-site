import type * as React from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SelectInputOption = { label: string; value: string }

export type SelectInputProps = {
  control: Control
  defaultValue?: string
  hasError: boolean
  label?: string | null
  name: string
  options: SelectInputOption[]
  placeholder?: string
  required?: boolean | null
  /** Matches the surrounding fields; `line` is the site's editorial treatment. */
  variant?: 'default' | 'line'
}

/**
 * Controlled shadcn select bound to react-hook-form. Used wherever a list is
 * long enough that a menu beats a row of chips (country, state), and by any
 * CMS-authored select field.
 */
export const SelectInput: React.FC<SelectInputProps> = ({
  control,
  defaultValue = '',
  hasError,
  label,
  name,
  options,
  placeholder,
  required,
  variant = 'line',
}) => (
  <Controller
    control={control}
    defaultValue={defaultValue}
    name={name}
    render={({ field: { onChange, value } }) => {
      const controlledValue = options.find((option) => option.value === value)

      return (
        <Select onValueChange={onChange} value={controlledValue?.value}>
          <SelectTrigger
            aria-invalid={hasError || undefined}
            className="w-full"
            id={name}
            variant={variant}
          >
            <SelectValue placeholder={placeholder ?? label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    }}
    rules={{ required: Boolean(required) }}
  />
)
