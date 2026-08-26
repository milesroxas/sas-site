import { Checkbox } from './Checkbox'
import { Country } from './Country'
import { Message } from './Message'
import { Select } from './Select'
import { State } from './State'
import { Textarea } from './Textarea'
import { createTextInput } from './TextInput'

const Text = createTextInput('text')
const Email = createTextInput('text', /^\S[^\s@]*@\S+$/)
const NumberField = createTextInput('number')

export const fields = {
  checkbox: Checkbox,
  country: Country,
  email: Email,
  message: Message,
  number: NumberField,
  select: Select,
  state: State,
  text: Text,
  textarea: Textarea,
}
