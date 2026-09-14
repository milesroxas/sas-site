'use client'

import { SelectInput, useField } from '@payloadcms/ui'
import type { OptionObject, TextFieldClientProps } from 'payload'
import { useMemo } from 'react'
import { isStreakLookId, STREAK_LOOK_OPTIONS, STREAK_LOOKS } from '@/features/immersive/visual'

/**
 * Picker for a Streak Field look. The stored value is a text id (no enum in
 * every parent and version table), the options are the shipped looks, and
 * the server `validate` on the field is the allowlist. An id no longer in
 * the table is kept in the list, marked, so the editor sees what the
 * document holds instead of a blank.
 */
export const StreakLookSelect = ({ field, path, readOnly }: TextFieldClientProps) => {
  const { setValue, showError, value } = useField<string | null>({ path })
  const options = useMemo<OptionObject[]>(() => {
    const shipped: OptionObject[] = STREAK_LOOK_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    }))
    if (value && !isStreakLookId(value)) {
      shipped.push({ label: `${value} (no longer available)`, value })
    }
    return shipped
  }, [value])
  const selected = isStreakLookId(value) ? STREAK_LOOKS[value] : null

  return (
    <SelectInput
      description={selected?.description ?? field.admin?.description}
      isClearable={false}
      label={field.label}
      name={field.name}
      onChange={(option) => {
        if (Array.isArray(option)) return
        setValue(option?.value ?? null)
      }}
      options={options}
      path={path}
      placeholder="Choose a look"
      readOnly={readOnly}
      showError={showError}
      value={value || undefined}
    />
  )
}
