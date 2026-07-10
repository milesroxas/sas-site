'use client'

import { useFormContext } from 'react-hook-form'
import { FieldError as FieldErrorUi } from '@/components/ui/field'

export const FieldError = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()

  return (
    <FieldErrorUi>{(errors[name]?.message as string) || 'This field is required'}</FieldErrorUi>
  )
}
