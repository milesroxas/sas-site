import { describe, expect, it } from 'vitest'
import { groupFormSteps, questionCount } from './steps'
import type { ResolvedFormField } from './types'

const text = (name: string): ResolvedFormField => ({ blockType: 'text', name })
const step = (title: string): ResolvedFormField => ({ blockType: 'step', title })
const copy: ResolvedFormField = { blockType: 'message' }

describe('groupFormSteps', () => {
  it('keeps a form without dividers as one step', () => {
    const fields = [text('name'), text('email')]
    expect(groupFormSteps(fields)).toEqual([{ fields }])
  })

  it('opens a titled step at each divider', () => {
    const steps = groupFormSteps([
      step('About you'),
      text('name'),
      step('The brief'),
      text('brief'),
    ])
    expect(steps).toEqual([
      { title: 'About you', fields: [text('name')] },
      { title: 'The brief', fields: [text('brief')] },
    ])
  })

  it('makes an untitled first step of fields above the first divider', () => {
    const steps = groupFormSteps([text('name'), step('The brief'), text('brief')])
    expect(steps[0]).toEqual({ fields: [text('name')] })
    expect(steps[1]?.title).toBe('The brief')
  })

  it('drops a divider with nothing under it', () => {
    const steps = groupFormSteps([step('Empty'), step('The brief'), text('brief')])
    expect(steps.map((entry) => entry.title)).toEqual(['The brief'])
  })

  it('returns nothing for an empty form', () => {
    expect(groupFormSteps([])).toEqual([])
  })
})

describe('questionCount', () => {
  it('counts answerable fields only', () => {
    expect(questionCount({ fields: [text('name'), copy, text('email')] })).toBe(2)
  })
})
