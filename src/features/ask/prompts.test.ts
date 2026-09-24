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

  it('withholds the tool when the judge routed the turn, whatever the handoff state', () => {
    for (const grounded of [true, false]) {
      for (const handoff of ['none', 'offered', 'sent'] as const) {
        const prompt = askSystemPrompt({ grounded, handoff, tool: false })
        expect(prompt.toLowerCase(), `${grounded}/${handoff}`).not.toContain('handoff tool')
        expect(prompt, `${grounded}/${handoff}`).not.toContain('no_answer')
        expect(prompt).toContain('Never repeat')
      }
    }
    expect(askSystemPrompt({ grounded: true, handoff: 'offered', tool: false })).toContain(
      'that offer is on screen. Answer in words.',
    )
    // `tool: true` cannot bring the tool back once the visitor has sent.
    expect(askSystemPrompt({ grounded: true, handoff: 'sent', tool: true })).not.toContain(
      'handoff tool',
    )
  })

  it('never lets a turn without the tool claim to send anything to the team', () => {
    for (const grounded of [true, false]) {
      for (const handoff of ['none', 'offered', 'sent'] as const) {
        const prompt = askSystemPrompt({ grounded, handoff, tool: false })
        const label = `${grounded ? 'grounded' : 'chat'}/${handoff}`
        expect(prompt, label).toContain(
          'This chat cannot send, forward, or pass anything to the team',
        )
        expect(prompt, label).toContain('Never offer to send anything or ask whether to.')
        if (handoff === 'sent') {
          expect(prompt, label).not.toContain('Talk to the team')
          expect(prompt.toLowerCase(), label).not.toContain('handoff')
        } else {
          expect(prompt, label).toContain('the "Talk to the team" button under this reply')
        }
      }
    }
    // A card follows: the rule stays, but the prompt never describes the offer.
    const card = askSystemPrompt({
      grounded: true,
      handoff: 'none',
      tool: false,
      cardFollows: true,
    })
    expect(card).toContain('This chat cannot send')
    expect(card).not.toContain('Talk to the team')
    // With the tool, only the tool call reaches the team.
    for (const grounded of [true, false]) {
      expect(askSystemPrompt({ grounded, handoff: 'none' })).toContain(
        'without the tool call, nothing reaches them',
      )
    }
  })

  it('stops at the answer when code appends the card', () => {
    const prompt = askSystemPrompt({
      grounded: true,
      handoff: 'none',
      tool: false,
      cardFollows: true,
    })
    expect(prompt).toContain('An offer to take this to the team follows your reply')
    expect(prompt).toContain('Do not invite the visitor to share details')
    expect(prompt).not.toContain("what we don't publish and name the page path")
    // With the tool on offer the model words the partial answer itself, as before.
    expect(askSystemPrompt({ grounded: true, handoff: 'none', cardFollows: true })).toContain(
      'call the handoff tool after your answer',
    )
  })

  it('keeps the grounding and length rules in every variant', () => {
    for (const handoff of ['none', 'offered', 'sent'] as const) {
      const prompt = askSystemPrompt({ grounded: true, handoff })
      expect(prompt).toContain('Use only the sources below.')
      expect(prompt).toContain('Under 120 words.')
      expect(prompt).toContain('Never say "browse the site".')
    }
  })

  describe('the journey', () => {
    const journey = {
      current: {
        path: '/works/interchecks',
        title: 'Interchecks',
        section: 'Work',
        subject: true,
        engagement: 'read' as const,
      },
      read: [
        {
          path: '/expertise/webflow',
          title: 'Webflow development',
          section: 'Expertise',
          subject: true,
          engagement: 'read' as const,
        },
      ],
    }

    it('gives "this" a subject and names what was read, without licence to mention it', () => {
      const prompt = askSystemPrompt({ grounded: true, handoff: 'none', tool: false, journey })
      expect(prompt).toContain('This conversation:')
      expect(prompt).toContain('"Interchecks" (Work)')
      expect(prompt).toContain('"Webflow development" (Expertise)')
      expect(prompt).toContain('Never say or hint that you know which pages they viewed.')
    })

    it('stays out of a chat-only turn, which may state no facts', () => {
      const prompt = askSystemPrompt({ grounded: false, handoff: 'none', tool: false, journey })
      expect(prompt).not.toContain('Interchecks')
    })

    it('changes nothing when empty', () => {
      const empty = { current: null, read: [] }
      expect(askSystemPrompt({ grounded: true, handoff: 'none', journey: empty })).toBe(
        askSystemPrompt({ grounded: true, handoff: 'none' }),
      )
    })
  })

  it('answers a thin case study from its outline, and lets the card say it is unfinished', () => {
    const withCard = askSystemPrompt({
      grounded: true,
      handoff: 'none',
      tool: false,
      cardFollows: true,
      thinStory: 'GentleBeast',
    })
    expect(withCard).toContain('our work on "GentleBeast"')
    expect(withCard).toContain('names every capability')
    expect(withCard).toContain('Do not say the case study is unfinished')

    // Once the visitor has sent there is no card, so the reply says it.
    const noCard = askSystemPrompt({
      grounded: true,
      handoff: 'sent',
      tool: false,
      thinStory: 'GentleBeast',
    })
    expect(noCard).toContain('saying the full case study is still being written')
    expect(
      askSystemPrompt({ grounded: false, handoff: 'none', thinStory: 'GentleBeast' }),
    ).not.toContain('GentleBeast')
  })
})
