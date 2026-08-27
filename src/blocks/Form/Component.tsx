'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { IconExclamationCircle } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import type { ComponentType } from 'react'
import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { type SectionTheme, ThemeBand } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { getClientSideURL } from '@/utilities/getURL'
import { fields } from './fields'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
  theme?: SectionTheme | null
}

/** Props passed to each form field component (field config + react-hook-form + form meta). */
type FormFieldRendererProps = FormFieldBlock & Record<string, unknown> & { form: FormType }

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    theme,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <ThemeBand theme={theme}>
      <Container width="narrow">
        {enableIntro && introContent && !hasSubmitted && (
          <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
        )}
        <Card>
          <CardContent className="flex flex-col gap-6">
            <FormProvider {...formMethods}>
              {!isLoading && hasSubmitted && confirmationType === 'message' && (
                <RichText data={confirmationMessage} />
              )}
              {isLoading && !hasSubmitted && (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <p>Loading, please wait...</p>
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <IconExclamationCircle />
                  <AlertTitle>{`${error.status || '500'}: ${error.message || ''}`}</AlertTitle>
                </Alert>
              )}
              {!hasSubmitted && (
                <form className="flex flex-col gap-6" id={formID} onSubmit={handleSubmit(onSubmit)}>
                  <FieldGroup>
                    {formFromProps?.fields?.map((field, index) => {
                      const Field = fields?.[field.blockType as keyof typeof fields] as
                        | ComponentType<FormFieldRendererProps>
                        | undefined
                      if (Field) {
                        return (
                          <Field
                            key={index}
                            form={formFromProps}
                            {...field}
                            {...formMethods}
                            control={control}
                            errors={errors}
                            register={register}
                          />
                        )
                      }
                      return null
                    })}
                  </FieldGroup>

                  <Button className="self-start" form={formID} type="submit">
                    {submitButtonLabel}
                  </Button>
                </form>
              )}
            </FormProvider>
          </CardContent>
        </Card>
      </Container>
    </ThemeBand>
  )
}
