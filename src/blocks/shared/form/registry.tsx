import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import type { Control, FieldValues, UseFormRegister } from 'react-hook-form'
import RichText from '@/components/RichText'
import { UNSURE } from './answers'
import {
  type BaseFieldProps,
  CheckboxField,
  ChipsField,
  SelectField,
  TextareaField,
  TextField,
} from './fields'
import { stateOptions } from './state-options'
import type { FormFieldOption } from './types'
import { Width } from './width'

/**
 * Adapters from a form-builder field document to the site's shared form
 * controls, and the registry the block renders them through.
 *
 * This file is the only place that knows the plugin's block-type names.
 * Everything visual lives in `@/blocks/shared/form`, so a form authored in the
 * CMS and the hand-built contact templates speak the same language.
 */
type PluginFieldProps = BaseFieldProps & {
  control: Control
  defaultValue?: boolean | string
  /** Trailing note on the label row. */
  hint?: string | null
  /** Character cap on a long-form field; drives the counter. */
  maxLength?: number | null
  options?: FormFieldOption[]
  placeholder?: string | null
  register: UseFormRegister<FieldValues>
  unsureLabel?: string | null
}

const asText = (value: PluginFieldProps['defaultValue']) =>
  typeof value === 'string' ? value : undefined

/** `text`, `email`, and `number` differ only in input type and pattern. */
const textFieldFor = (
  inputType: 'email' | 'number' | 'text',
  pattern?: RegExp,
): React.FC<PluginFieldProps> =>
  function PluginTextField({ defaultValue, placeholder, ...props }) {
    return (
      <TextField
        {...props}
        defaultValue={asText(defaultValue)}
        inputType={inputType}
        pattern={pattern}
        placeholder={placeholder ?? undefined}
      />
    )
  }

/**
 * Chips over the Capabilities taxonomy, plus the "not sure yet" escape hatch.
 * The sentinel rides in the same group so it sits where a visitor looks for
 * it, and is split back out at submit time (`submit.ts`).
 */
const PluginCapabilities: React.FC<PluginFieldProps> = ({
  hint,
  options = [],
  unsureLabel,
  ...props
}) => (
  <ChipsField
    {...props}
    meta={hint}
    multiple
    options={unsureLabel ? [...options, { label: unsureLabel, value: UNSURE }] : options}
  />
)

/** Menu-backed field over a fixed list. `state` is the only one left. */
const optionsSelectFor = (options: FormFieldOption[]): React.FC<PluginFieldProps> =>
  function PluginOptionsSelect({ defaultValue, placeholder, ...props }) {
    return (
      <SelectField
        {...props}
        defaultValue={asText(defaultValue)}
        options={options}
        placeholder={placeholder ?? undefined}
      />
    )
  }

/**
 * A CMS-authored select renders as chips when the list is short enough to read
 * at a glance and as a menu when it is not — the same rule the contact
 * templates follow, applied automatically so editors never pick a control.
 */
const CHIP_THRESHOLD = 6

const PluginSelect: React.FC<PluginFieldProps> = ({
  defaultValue,
  hint,
  options = [],
  placeholder,
  ...props
}) =>
  options.length <= CHIP_THRESHOLD ? (
    <ChipsField {...props} meta={hint} options={options} />
  ) : (
    <SelectField
      {...props}
      defaultValue={asText(defaultValue)}
      meta={hint}
      options={options}
      placeholder={placeholder ?? undefined}
    />
  )

/** Static rich text between fields — copy, not a control. */
const PluginMessage: React.FC<{ message: DefaultTypedEditorState }> = ({ message }) => (
  <Width width="100">{message ? <RichText data={message} /> : null}</Width>
)

export const fields = {
  capabilities: PluginCapabilities,
  checkbox: ({ defaultValue, ...props }: PluginFieldProps) => (
    <CheckboxField {...props} defaultValue={Boolean(defaultValue)} />
  ),
  email: textFieldFor('text', /^\S[^\s@]*@\S+$/),
  message: PluginMessage,
  number: textFieldFor('number'),
  select: PluginSelect,
  state: optionsSelectFor(stateOptions),
  text: textFieldFor('text'),
  textarea: ({ defaultValue, hint, maxLength, placeholder, ...props }: PluginFieldProps) => (
    <TextareaField
      {...props}
      defaultValue={asText(defaultValue)}
      maxLength={maxLength ?? undefined}
      meta={hint}
      placeholder={placeholder ?? undefined}
    />
  ),
}
