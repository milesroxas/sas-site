import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type React from 'react'
import type { Control, FieldValues, UseFormRegister } from 'react-hook-form'
import {
  type BaseFieldProps,
  CheckboxField,
  ChipsField,
  SelectField,
  type SelectInputOption,
  TextareaField,
  TextField,
  Width,
} from '@/blocks/shared/form'
import { countryOptions } from '@/blocks/shared/form/country-options'
import { stateOptions } from '@/blocks/shared/form/state-options'
import RichText from '@/components/RichText'

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
  options?: SelectInputOption[]
  register: UseFormRegister<FieldValues>
}

const asText = (value: PluginFieldProps['defaultValue']) =>
  typeof value === 'string' ? value : undefined

/** `text`, `email`, and `number` differ only in input type and pattern. */
const textFieldFor = (
  inputType: 'email' | 'number' | 'text',
  pattern?: RegExp,
): React.FC<PluginFieldProps> =>
  function PluginTextField({ defaultValue, ...props }) {
    return (
      <TextField
        {...props}
        defaultValue={asText(defaultValue)}
        inputType={inputType}
        pattern={pattern}
      />
    )
  }

/** `country` and `state` differ only in which list they offer. */
const optionsSelectFor = (options: SelectInputOption[]): React.FC<PluginFieldProps> =>
  function PluginOptionsSelect({ defaultValue, ...props }) {
    return <SelectField {...props} defaultValue={asText(defaultValue)} options={options} />
  }

/**
 * A CMS-authored select renders as chips when the list is short enough to read
 * at a glance and as a menu when it is not — the same rule the contact
 * templates follow, applied automatically so editors never pick a control.
 */
const CHIP_THRESHOLD = 6

const PluginSelect: React.FC<PluginFieldProps> = ({ defaultValue, options = [], ...props }) =>
  options.length <= CHIP_THRESHOLD ? (
    <ChipsField {...props} options={options} />
  ) : (
    <SelectField {...props} defaultValue={asText(defaultValue)} options={options} />
  )

/** Static rich text between fields — copy, not a control. */
const PluginMessage: React.FC<{ message: DefaultTypedEditorState }> = ({ message }) => (
  <Width width="100">{message ? <RichText data={message} /> : null}</Width>
)

export const fields = {
  checkbox: ({ defaultValue, ...props }: PluginFieldProps) => (
    <CheckboxField {...props} defaultValue={Boolean(defaultValue)} />
  ),
  country: optionsSelectFor(countryOptions),
  email: textFieldFor('text', /^\S[^\s@]*@\S+$/),
  message: PluginMessage,
  number: textFieldFor('number'),
  select: PluginSelect,
  state: optionsSelectFor(stateOptions),
  text: textFieldFor('text'),
  textarea: ({ defaultValue, ...props }: PluginFieldProps) => (
    <TextareaField {...props} defaultValue={asText(defaultValue)} />
  ),
}
