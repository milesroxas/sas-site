'use client'

import type * as React from 'react'
import type { Control, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { useFormContext, useWatch } from 'react-hook-form'
import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { ChoiceChip, ChoiceChips } from '@/components/ui/choice-chips'
import { Field, FieldLabel, FieldPanel, FieldPanelFooter } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldError } from './field-error'
import { FieldShell, fieldLabelId, RequiredMark } from './field-shell'
import { SelectInput, type SelectInputOption } from './select-input'
import { Width } from './width'

/**
 * The site's form controls, in one place.
 *
 * Every form on the site — the CMS form-builder blocks and the contact
 * templates — renders these, so the editorial treatment (mono label on a
 * hairline, chips instead of a menu, the framed brief) is defined once. The
 * consumers differ only in where the field definitions come from: a
 * form-builder document, or a block's own CMS fields.
 *
 * All of them are react-hook-form bound and expect a surrounding
 * `FormProvider`.
 */
export type BaseFieldProps = {
  errors: Partial<FieldErrorsImpl>
  label?: string | null
  /** Trailing hint on the label row (unit, selection rule, counter). */
  meta?: React.ReactNode
  name: string
  required?: boolean | null
  width?: number | string
}

export type TextFieldProps = BaseFieldProps & {
  autoComplete?: string
  defaultValue?: string
  /** HTML input type; `email` and `number` differ from `text` only here. */
  inputType?: 'email' | 'number' | 'tel' | 'text' | 'url'
  pattern?: RegExp
  placeholder?: string
  register: UseFormRegister<FieldValues>
}

/**
 * Single-line field. `placeholder` doubles as the resting hint AND as what
 * makes the "filled" rule work: the `line` input darkens its rule with
 * `:not(:placeholder-shown)`, so a field without a hint still carries a blank
 * one.
 */
export const TextField: React.FC<TextFieldProps> = ({
  autoComplete,
  defaultValue,
  errors,
  inputType = 'text',
  label,
  meta,
  name,
  pattern,
  placeholder,
  register,
  required,
  width,
}) => {
  const hasError = Boolean(errors[name])

  return (
    <FieldShell
      hasError={hasError}
      label={label}
      meta={meta}
      name={name}
      required={required}
      width={width}
    >
      <Input
        aria-invalid={hasError || undefined}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        id={name}
        placeholder={placeholder ?? ' '}
        type={inputType}
        variant="line"
        {...register(name, { pattern, required: Boolean(required) })}
      />
    </FieldShell>
  )
}

export type TextareaFieldProps = BaseFieldProps & {
  defaultValue?: string
  /** Turns the label's trailing hint into a live "used / limit" counter. */
  maxLength?: number
  placeholder?: string
  register: UseFormRegister<FieldValues>
  rows?: number
  /** Extra content on the panel's footer rail (helper copy, an action). */
  footer?: React.ReactNode
}

/**
 * Live "used / limit" count.
 *
 * Its own component on purpose: watching the field is what makes this text
 * update, and anything that watches re-renders on every keystroke. Kept as a
 * leaf, that cost is one `<span>` — put it in `TextareaField` and every
 * character retyped the label row, the panel, and the control itself.
 */
const CharacterCount: React.FC<{ maxLength: number; name: string }> = ({ maxLength, name }) => {
  const { control } = useFormContext()
  const value = useWatch({ control, name })

  return <>{`${typeof value === 'string' ? value.length : 0} / ${maxLength}`}</>
}

/**
 * Long-form field. The control sits inside a `FieldPanel` so the counter and
 * any helper line share one frame with the writing area instead of floating
 * beneath it.
 */
export const TextareaField: React.FC<TextareaFieldProps> = ({
  defaultValue,
  errors,
  footer,
  label,
  maxLength,
  meta,
  name,
  placeholder,
  register,
  required,
  rows = 6,
  width,
}) => {
  const hasError = Boolean(errors[name])

  return (
    <FieldShell
      hasError={hasError}
      label={label}
      meta={
        typeof maxLength === 'number' ? <CharacterCount maxLength={maxLength} name={name} /> : meta
      }
      name={name}
      required={required}
      width={width}
    >
      <FieldPanel>
        <Textarea
          aria-invalid={hasError || undefined}
          defaultValue={defaultValue}
          id={name}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={rows}
          variant="bare"
          {...register(name, { maxLength, required: Boolean(required) })}
        />
        {footer ? <FieldPanelFooter>{footer}</FieldPanelFooter> : null}
      </FieldPanel>
    </FieldShell>
  )
}

export type ChipsFieldProps = BaseFieldProps & {
  /** Pick any (checkbox) rather than pick one (radio). */
  multiple?: boolean
  options: SelectInputOption[]
  register: UseFormRegister<FieldValues>
}

/**
 * Answer set rendered as chips. Use it when the options are few enough that
 * reading them all is faster than opening a menu — which is every question on
 * the inquiry form.
 */
export const ChipsField: React.FC<ChipsFieldProps> = ({
  errors,
  label,
  meta,
  multiple = false,
  name,
  options,
  register,
  required,
  width,
}) => {
  const hasError = Boolean(errors[name])

  return (
    <FieldShell
      control="group"
      hasError={hasError}
      label={label}
      meta={meta}
      name={name}
      required={required}
      width={width}
    >
      <ChoiceChips
        aria-labelledby={fieldLabelId(name)}
        name={name}
        type={multiple ? 'checkbox' : 'radio'}
      >
        {options.map((option) => (
          <ChoiceChip
            key={option.value}
            value={option.value}
            {...register(name, { required: Boolean(required) })}
          >
            {option.label}
          </ChoiceChip>
        ))}
      </ChoiceChips>
    </FieldShell>
  )
}

export type SelectFieldProps = BaseFieldProps & {
  control: Control
  defaultValue?: string
  options: SelectInputOption[]
  placeholder?: string
}

/** Menu-backed field, for lists too long to read at a glance (country, state). */
export const SelectField: React.FC<SelectFieldProps> = ({
  control,
  defaultValue,
  errors,
  label,
  meta,
  name,
  options,
  placeholder,
  required,
  width,
}) => {
  const hasError = Boolean(errors[name])

  return (
    <FieldShell
      hasError={hasError}
      label={label}
      meta={meta}
      name={name}
      required={required}
      width={width}
    >
      <SelectInput
        control={control}
        defaultValue={defaultValue}
        hasError={hasError}
        label={label}
        name={name}
        options={options}
        placeholder={placeholder}
        required={required}
      />
    </FieldShell>
  )
}

export type CheckboxFieldProps = BaseFieldProps & {
  defaultValue?: boolean
  register: UseFormRegister<FieldValues>
}

/**
 * Single consent-style checkbox. Its label sits beside the control rather than
 * above it, so it keeps the boxed label voice instead of the mono one.
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  defaultValue,
  errors,
  label,
  name,
  register,
  required,
  width,
}) => {
  const props = register(name, { required: Boolean(required) })
  const { setValue } = useFormContext()
  const hasError = Boolean(errors[name])

  return (
    <Width width={width}>
      <Field data-invalid={hasError ? true : undefined} orientation="horizontal">
        <CheckboxUi
          aria-invalid={hasError || undefined}
          defaultChecked={defaultValue}
          id={name}
          {...props}
          onCheckedChange={(checked) => {
            setValue(props.name, checked)
          }}
        />
        <FieldLabel htmlFor={name}>
          {required ? <RequiredMark /> : null}
          {label}
        </FieldLabel>
      </Field>
      {hasError ? <FieldError name={name} /> : null}
    </Width>
  )
}
