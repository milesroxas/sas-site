import { isQuestion, STEP_BLOCK } from './answers'
import type { ResolvedFormField } from './types'

/** One step of a form: its title, and the questions asked together. */
export type FormStep = { title?: string | null; fields: ResolvedFormField[] }

/**
 * Split a form's fields at its step dividers.
 *
 * Fields above the first divider form an untitled first step; a divider with
 * nothing under it is dropped. A form with no dividers is one step, which the
 * renderer lays out flat — a form only walks its visitor step by step once it
 * has two or more.
 */
export function groupFormSteps(fields: ResolvedFormField[]): FormStep[] {
  const steps: FormStep[] = []
  let current: FormStep = { fields: [] }

  for (const field of fields) {
    if (field.blockType !== STEP_BLOCK) {
      current.fields.push(field)
      continue
    }
    if (current.fields.length > 0) steps.push(current)
    current = { title: field.title, fields: [] }
  }
  if (current.fields.length > 0) steps.push(current)

  return steps
}

/** How many of a step's fields the visitor answers (copy blocks aside). */
export const questionCount = (step: FormStep): number => step.fields.filter(isQuestion).length
