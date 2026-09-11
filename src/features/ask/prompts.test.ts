import { describe, expect, it } from 'vitest'
import { askSystemPrompt, offersAskHandoff } from './prompts'

describe('askSystemPrompt', () => {
  it('offers the handoff tool, with its rules, until the visitor has sent', () => {
    for (const grounded of [true, false]) {
      for (const handoff of ['none', 'offered'] as const) {
        const prompt = askSystemPrompt({ grounded, handoff })
        expect(prompt, `${grounded ? 'grounded' : 'chat'}/${handoff}`).toContain('handoff tool')
        expect(offersAskHandoff(handoff)).toBe(true)
      }
    }
    expect(askSystemPrompt({ grounded: true, handoff: 'none' })).toContain('Reaching a person:')
    expect(askSystemPrompt({ grounded: true, handoff: 'none' })).not.toContain('This conversation:')
  })

  it('tells the model an offer is already on screen', () => {
    const prompt = askSystemPrompt({ grounded: true, handoff: 'offered' })
    expect(prompt).toContain('This conversation:\n- You have already offered')
    expect(prompt).toContain('Reaching a person:')
  })

  it('drops every mention of the tool once the visitor has sent, and says why', () => {
    for (const grounded of [true, false]) {
      const prompt = askSystemPrompt({ grounded, handoff: 'sent' })
      expect(prompt.toLowerCase(), grounded ? 'grounded' : 'chat').not.toContain('handoff')
      expect(prompt, grounded ? 'grounded' : 'chat').not.toContain('no_answer')
      expect(prompt).toContain('This conversation:\n- The visitor has already sent their details')
      expect(prompt).toContain('Never repeat')
    }
    expect(offersAskHandoff('sent')).toBe(false)
  })

  it('keeps the grounding and length rules in every variant', () => {
    for (const handoff of ['none', 'offered', 'sent'] as const) {
      const prompt = askSystemPrompt({ grounded: true, handoff })
      expect(prompt).toContain('Use only the sources below.')
      expect(prompt).toContain('Under 120 words.')
      expect(prompt).toContain('Never say "browse the site".')
    }
  })
})
