'use client'

import type { ReactNode, Ref } from 'react'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FieldMeta } from '@/components/ui/field'
import { FORM_STEP_COPY } from '@/shared/content/inquiry'
import { cn } from '@/utilities/ui'
import { answered, isQuestion, readable } from './answers'
import { FormFields } from './form-fields.client'
import { FormActions } from './form-submit'
import { type FormStep, questionCount } from './steps'
import type { FormStepsCopy } from './types'

type StepState = 'active' | 'done' | 'upcoming'

export type FormStepsProps = {
  /** Index of the step being asked. */
  active: number
  /** The active step's heading, so the body can move focus to it on a change. */
  activeHeadingRef: Ref<HTMLHeadingElement>
  /** Closing content of the last step: the submit rule and whatever sits above it. */
  children: ReactNode
  control: Control
  copy?: FormStepsCopy
  errors: Partial<FieldErrorsImpl>
  onEdit: (index: number) => void
  /** Highest step reached so far; every step up to it shows its answers. */
  reached: number
  register: UseFormRegister<FieldValues>
  steps: FormStep[]
  /** Current answers, read for the summaries of finished steps. */
  values: FieldValues
}

/**
 * A form asked one step at a time, as a ruled list.
 *
 * Every step stays in the list, so the visitor always sees where they are,
 * what they have said, and what is left: a finished step collapses to its
 * title, a one-line summary of its answers and an Edit link; the active step
 * carries its questions; a step still ahead shows its title and how many
 * questions it holds. Nothing else stands in for progress.
 *
 * Every step's fields stay mounted (collapsed bodies are `inert`), so answers
 * survive a walk back through Edit without any bookkeeping, and the closing
 * validation still sees every field. Which step is open, and what Continue
 * does, is `FormBody`'s business.
 */
export function FormSteps({
  active,
  activeHeadingRef,
  children,
  control,
  copy,
  errors,
  onEdit,
  reached,
  register,
  steps,
  values,
}: FormStepsProps) {
  const last = steps.length - 1

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-6 pb-4">
        <FieldMeta>{`${steps.length} steps`}</FieldMeta>
        {copy?.estimatedTime ? <FieldMeta>{copy.estimatedTime}</FieldMeta> : null}
      </div>

      <ol className="flex flex-col border-t border-t-foreground">
        {steps.map((step, index) => {
          const state: StepState =
            index === active ? 'active' : index <= reached ? 'done' : 'upcoming'
          return (
            <FormStepItem
              activeHeadingRef={activeHeadingRef}
              copy={copy}
              index={index}
              key={index}
              onEdit={onEdit}
              state={state}
              step={step}
              summary={state === 'done' ? summarize(step, values) : ''}
            >
              <FormFields
                control={control}
                errors={errors}
                fields={step.fields}
                register={register}
              />
              {index === last ? (
                children
              ) : (
                <FormActions note={copy?.note ?? FORM_STEP_COPY.note}>
                  {/* Only the open step's Continue is a submit button. Enter in
                      a field activates the form's first submit button in tree
                      order, so a collapsed step's button must not be one. */}
                  <Button size="xl" type={index === active ? 'submit' : 'button'}>
                    {copy?.continueLabel ?? FORM_STEP_COPY.continueLabel}
                  </Button>
                </FormActions>
              )}
            </FormStepItem>
          )
        })}
      </ol>
    </div>
  )
}

/** A finished step's answers on one line, in the form's own words. */
const summarize = (step: FormStep, values: FieldValues): string =>
  step.fields
    .filter(isQuestion)
    .filter((field) => answered(values[field.name]))
    .map((field) => readable(field, values[field.name]))
    .join(' · ')

/** Title treatment per state: one size step marks the open step, ink marks what is done. */
const TITLE_CLASS: Record<StepState, string> = {
  // A step title is a legend, not a section heading: one size step above the
  // collapsed rows marks the open one without reaching the heading scale of
  // the page's own copy.
  active: 'text-2xl/8',
  done: 'text-lg/relaxed',
  upcoming: 'text-lg/relaxed text-muted-foreground',
}

const questionsLabel = (count: number) => `${count} ${count === 1 ? 'question' : 'questions'}`

/** The far end of a step's title row: Edit once done, the question count while ahead. */
function StepAside({
  editLabel,
  onEdit,
  state,
  step,
}: {
  editLabel: string
  onEdit: () => void
  state: StepState
  step: FormStep
}) {
  if (state === 'done') {
    return (
      <Button onClick={onEdit} size="clear" type="button" variant="mono">
        {editLabel}
      </Button>
    )
  }
  if (state === 'upcoming') return <FieldMeta>{questionsLabel(questionCount(step))}</FieldMeta>
  return null
}

function FormStepItem({
  activeHeadingRef,
  children,
  copy,
  index,
  onEdit,
  state,
  step,
  summary,
}: {
  activeHeadingRef: Ref<HTMLHeadingElement>
  children: ReactNode
  copy?: FormStepsCopy
  index: number
  onEdit: (index: number) => void
  state: StepState
  step: FormStep
  summary: string
}) {
  const open = state === 'active'

  return (
    <li className="flex flex-col border-b border-border py-6">
      <div className="flex items-baseline justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <FieldMeta className="w-6">{String(index + 1).padStart(2, '0')}</FieldMeta>
          <h2
            className={cn('scroll-mt-(--header-height)', TITLE_CLASS[state])}
            ref={open ? activeHeadingRef : undefined}
            tabIndex={open ? -1 : undefined}
          >
            {step.title}
          </h2>
        </div>
        <StepAside
          editLabel={copy?.editLabel ?? FORM_STEP_COPY.editLabel}
          onEdit={() => onEdit(index)}
          state={state}
          step={step}
        />
      </div>

      {summary ? (
        <p className="truncate pt-2 pl-10 text-base/6 text-muted-foreground">{summary}</p>
      ) : null}

      <div className="form-step-body" data-open={open || undefined} inert={!open}>
        <div>
          <div className="flex flex-col gap-8 pt-6 pb-2 pl-10">{children}</div>
        </div>
      </div>
    </li>
  )
}
