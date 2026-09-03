'use client'

import type { ComponentType } from 'react'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { FieldGroup } from '@/components/ui/field'
import { fields as registry } from './registry'
import type { ResolvedFormField } from './types'

type FieldRendererProps = Record<string, unknown> & {
  control: Control
  errors: Partial<FieldErrorsImpl>
  register: UseFormRegister<FieldValues>
}

export type FormFieldsProps = {
  control: Control
  errors: Partial<FieldErrorsImpl>
  fields: ResolvedFormField[]
  register: UseFormRegister<FieldValues>
}

/**
 * A form's questions, laid out.
 *
 * Two columns from `md` up, because the CMS states a width per field and the
 * editorial form pairs name with email and company with site. Below that every
 * field spans: a half-width control on a phone is unusable.
 *
 * Rendered by `FormBody` — once for a flat form, once per step for a stepped
 * one — so a form composed onto an ordinary page and the same form on its own
 * page are the same form.
 */
export function FormFields({ control, errors, fields, register }: FormFieldsProps) {
  return (
    <FieldGroup className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
      {fields.map((field, index) => {
        const Field = registry[field.blockType as keyof typeof registry] as
          | ComponentType<FieldRendererProps>
          | undefined
        if (!Field) return null

        return (
          <Field
            key={field.name ?? index}
            {...(field as Record<string, unknown>)}
            control={control}
            errors={errors}
            register={register}
          />
        )
      })}
    </FieldGroup>
  )
}
