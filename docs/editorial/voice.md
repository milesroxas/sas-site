# Voice, tone and style

The house voice for every piece of copy that leaves this studio: pages, posts, Lab Pages, Work Pages, story beats, captions, alt text, labels, and the Ask assistant's replies. Whoever writes it, a person or an agent, this is the contract. Where a piece of copy goes and how a page is composed is a different question: for Lab Pages and articles over MCP that is the `article-authoring` skill; for service, audience and industry pages it is [editorial-guide.md](editorial-guide.md).

Part of this file is checked by code and by Jev at save time and in `pnpm editorial:voice`: see [What is checked](#what-is-checked). The lists under [Language to avoid](#language-to-avoid) and [Constructions to avoid](#constructions-to-avoid) are read by a test against `src/features/editorial/voice.ts`, so an edit here has to land there too, and the reverse.

## How it should feel

Clear. Confident. Editorial. Strategic. Product-literate. Specific. Composed. Human. Understated. Visually aware.

The voice sounds like experienced people who understand both the business problem and the creative work. It is confident enough to leave space around an idea.

- Strong, simple assertions.
- Short, controlled paragraphs.
- Clear ideas expressed without unnecessary explanation.
- Strategic language that still feels conversational.
- Specificity over hype.
- Restraint over persuasion theater.
- Occasional memorable lines, not a memorable line in every paragraph.

Do not imitate slogans or wording from another company. Apply the qualities.

## Sentences

Use a natural mix of short declarative sentences, medium explanatory sentences, and the occasional fragment for emphasis. Parallel structure only where it helps scanning.

- Do not make every sentence the same length.
- Do not make every heading follow the same grammatical formula.
- Do not make every paragraph end with a dramatic conclusion.

## Punctuation

- Never an em dash. Recast with a comma, a colon, parentheses or a period. Numeric ranges may keep an en or em dash (50—100K, 1–3 months).
- Periods more often than semicolons.
- Colons sparingly.
- Parentheses rarely.
- No quotation marks for emphasis or distance.
- Hyphens only where grammar needs them.

## Language to favor

Concrete. Direct. Relevant to the reader. Connected to a real problem. Easy to understand without sounding simplified.

- Make the difference visible.
- Give people somewhere to start.
- The depth stays. The order changes.
- Clear in the room. Unclear online.
- Put the brand to work.
- Build a system the company can keep using.

## Language to avoid

Generic marketing and agency language. Each of these is refused on an agent's save and listed by the check:

- elevate
- unlock
- transform your vision
- seamlessly
- seamless
- cutting-edge
- best-in-class
- holistic
- world-class
- innovative solutions
- meaningful impact
- at the intersection of
- in today's fast-paced world
- bring your vision to life
- take your brand to the next level
- tailored solutions
- unique needs
- end-to-end solutions
- drive engagement
- future-proof

## Constructions to avoid

Contrast frames that become the voice of a page when repeated. One is allowed when it is the clearest option; the check lists every instance so the count is visible:

- It is not just X. It is Y.
- More than X. It is Y.
- From X to Y.
- Whether you are X or Y.
- We do not just X. We Y.
- Not only X, but also Y.

## Do not flatten

A specific idea is never replaced by a broad statement that is true of any studio:

- We help brands stand out.
- We create impactful experiences.
- We help businesses grow.
- We combine strategy and creativity.
- We tell compelling stories.

Preserve what makes this studio's version of the idea specific.

## Claims

Do not invent capabilities, outcomes, metrics, proof, client results or strategic claims. A number is one the source holds, or it is not on the page. An estimate says "estimate". Build confidence with recognition, clarity and relevant proof, never with urgency, exaggerated pain or unsupported claims.

## Before it ships

- Does the writing feel confident without sounding inflated?
- Are the sentences clear and natural, and do they vary in length?
- Does the copy avoid formulaic AI patterns: contrast frames, triplets, a punchline on every paragraph, a rhetorical question and its answer?
- Are the strongest lines memorable without trying too hard?
- Does it sound like an experienced strategy and design firm?
- Are there any em dashes?

## What is checked

| Rule | Where | How |
| --- | --- | --- |
| Em dash | Save (MCP writes) and `pnpm editorial:voice` | Code, exact, by path |
| Language to avoid | Save (MCP writes) and the check | Code, exact, by path |
| Constructions to avoid | The check | Code lists every instance; more than one in a passage is flagged |
| Do not flatten | The check | Code, exact |
| Semicolons, long paragraphs, parentheses | The check | Code counts |
| Headings that share one grammatical form | The check | Jev names the form of each heading; code flags a run |
| Generic or specific | The check | Jev scores each passage |
| Composed or inflated | The check | Jev |
| Human or formulaic | The check | Jev |
| A punchline on every paragraph | The check | Jev per paragraph; code flags the pattern |
| Claims the record does not hold | `pnpm lab:journal:verify` | Code and Jev, against the journal |

The save-time gate refuses only what an API key writes. A team member editing in the admin is never blocked: a quotation or a client's own words may hold a phrase this file bans. Everything else is reported for a person or an agent to fix, never applied automatically: Jev judges, it does not write.
