'use client'

import { IconExclamationCircle } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { addTransitionType, startTransition, useCallback, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { FormFields } from '@/blocks/shared/form/form-fields.client'
import { FormSubmit } from '@/blocks/shared/form/form-submit'
import { submitForm } from '@/blocks/shared/form/submit'
import type { FormDelivery, ResolvedFormField } from '@/blocks/shared/form/types'
import RichText from '@/components/RichText'
import { Alert, AlertTitle } from '@/components/ui/alert'
import type { Form as FormDoc } from '@/payload-types'
import { NAV_LATERAL } from '@/shared/lib/view-transition/constants'

export type FormRendererProps = {
  confirmationMessage?: FormDoc['confirmationMessage']
  confirmationType?: FormDoc['confirmationType']
  delivery: FormDelivery
  fields: ResolvedFormField[]
  formId: number | string
  inquiryType?: FormDoc['inquiryType']
  redirectUrl?: string | null
  submitLabel: string
}

/**
 * A form-builder form, rendered in the site's form language.
 *
 * Where the answers go is the form's business, not this component's — see
 * `submitForm`. All this owns is the three states a visitor sees: the
 * questions, the failure, and the confirmation.
 */
export function FormRenderer({
  confirmationMessage,
  confirmationType,
  delivery,
  fields,
  formId,
  inquiryType,
  redirectUrl,
  submitLabel,
}: FormRendererProps) {
  const formMethods = useForm()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isSending, setIsSending] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    async (values: FieldValues) => {
      setError(undefined)
      setIsSending(true)
      try {
        await submitForm({ delivery, fields, formId, inquiryType, values })
        setHasSubmitted(true)

        if (confirmationType === 'redirect' && redirectUrl) {
          // Tag the redirect so it plays the default transition instead of
          // hard-cutting (see docs/route-transitions-roadmap.md, Stage 1).
          startTransition(() => {
            addTransitionType(NAV_LATERAL)
            router.push(redirectUrl)
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setIsSending(false)
      }
    },
    [confirmationType, delivery, fields, formId, inquiryType, redirectUrl, router],
  )

  if (hasSubmitted && confirmationType === 'message' && confirmationMessage) {
    return <RichText data={confirmationMessage} />
  }

  return (
    <FormProvider {...formMethods}>
      <form className="flex flex-col gap-12" onSubmit={handleSubmit(onSubmit)}>
        <FormFields control={control} errors={errors} fields={fields} register={register} />

        {error ? (
          <Alert variant="destructive">
            <IconExclamationCircle />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : null}

        <FormSubmit pending={isSending}>{submitLabel}</FormSubmit>
      </form>
    </FormProvider>
  )
}
