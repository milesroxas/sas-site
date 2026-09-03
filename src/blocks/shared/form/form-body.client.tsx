'use client'

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { FieldErrors, FieldValues, SubmitHandler } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import { isQuestion } from './answers'
import { FormFields } from './form-fields.client'
import { FormSteps } from './form-steps.client'
import { groupFormSteps } from './steps'
import type { FormStepsCopy, ResolvedFormField } from './types'

export type FormBodyProps = {
  /** What closes the form: the failure notice, the submit rule, anything above them. */
  children: ReactNode
  fields: ResolvedFormField[]
  onSubmit: SubmitHandler<FieldValues>
  /** Copy for a stepped walk-through, from the form's Steps group. */
  steps?: FormStepsCopy
}

/** Where focus lands once a step change has rendered. */
type FocusTarget = 'heading' | 'error'

/**
 * The `<form>` element every form on the site renders, and the one place that
 * decides how a form is asked: all at once, or one step at a time when its
 * fields carry step dividers.
 *
 * Stepped, the submit event is the step's Continue: Enter in a field and the
 * button do the same thing, the open step is validated alone, and only the
 * last step's submit sends. A closing validation that fails inside a finished
 * step reopens that step and puts focus on the field, so no error is ever
 * raised where it cannot be seen. Expects a surrounding `FormProvider`.
 */
export function FormBody({ children, fields, onSubmit, steps: copy }: FormBodyProps) {
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    trigger,
  } = useFormContext()

  const steps = useMemo(() => groupFormSteps(fields), [fields])
  const stepped = steps.length > 1
  const last = steps.length - 1

  const [activeStep, setActiveStep] = useState(0)
  const [reached, setReached] = useState(0)
  const active = Math.min(activeStep, Math.max(last, 0))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusRef = useRef<FocusTarget | null>(null)

  const namesOf = useCallback(
    (index: number) => (steps[index]?.fields ?? []).filter(isQuestion).map((field) => field.name),
    [steps],
  )

  const goTo = useCallback((index: number, focus: FocusTarget) => {
    focusRef.current = focus
    setActiveStep(index)
    setReached((current) => Math.max(current, index))
  }, [])

  const advance = useCallback(async () => {
    if (await trigger(namesOf(active), { shouldFocus: true })) goTo(active + 1, 'heading')
  }, [active, goTo, namesOf, trigger])

  /** The closing submit found an error inside a collapsed step: reopen it there. */
  const onInvalid = useCallback(
    (invalid: FieldErrors) => {
      const first = steps.findIndex((step) =>
        step.fields.some((field) => isQuestion(field) && invalid[field.name]),
      )
      if (first >= 0 && first !== active) goTo(first, 'error')
    },
    [active, goTo, steps],
  )

  const submit = handleSubmit(onSubmit, stepped ? onInvalid : undefined)

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (stepped && active < last) {
      event.preventDefault()
      void advance()
      return
    }
    void submit(event)
  }

  // After a step change: the heading takes focus so the new step is announced
  // and the next Tab lands on its first field, or the field that failed takes
  // it. Focus never scrolls on its own; the heading is brought into view only
  // if it is not already there.
  useEffect(() => {
    const focus = focusRef.current
    if (!focus) return
    focusRef.current = null
    if (focus === 'error') {
      void trigger(namesOf(active), { shouldFocus: true })
      return
    }
    const heading = headingRef.current
    if (!heading) return
    heading.focus({ preventScroll: true })
    heading.scrollIntoView({ block: 'nearest' })
  }, [active, namesOf, trigger])

  return (
    <form className="flex flex-col gap-12" noValidate onSubmit={onFormSubmit}>
      {stepped ? (
        <FormSteps
          active={active}
          activeHeadingRef={headingRef}
          control={control}
          copy={copy}
          errors={errors}
          onEdit={(index) => goTo(index, 'heading')}
          reached={reached}
          register={register}
          steps={steps}
          values={getValues()}
        >
          {children}
        </FormSteps>
      ) : (
        <>
          <FormFields control={control} errors={errors} fields={fields} register={register} />
          {children}
        </>
      )}

      {/* Honeypot. Off-screen rather than display:none, because bots that skip
          hidden fields still fill this one in. Once per form, whatever its shape. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <input autoComplete="off" tabIndex={-1} {...register('role')} />
      </div>
    </form>
  )
}
