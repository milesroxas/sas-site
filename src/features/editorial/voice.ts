/**
 * The house voice as code: the rules in docs/editorial/voice.md that a
 * program can check exactly. That file is the contract people read; this one
 * is what the save-time gate (`src/plugins/house-style`) and the voice check
 * (`scripts/editorial/voice.ts`) run. `voice.test.ts` reads the doc and holds
 * the two lists below identical to it, so an edit in either place fails the
 * test until it lands in both.
 *
 * What is here is the exact part: a phrase, a frame, a count. Whether a
 * passage is generic, inflated or formulaic is a judgment, and Jev makes it
 * in the check script; nothing in this file calls a model.
 */

/** Built from its code point so this file holds none. */
export const EM_DASH = String.fromCharCode(0x2014)

/** "Language to avoid" in voice.md, in the doc's order. Matched whole, case-insensitive; a single word in any inflection. */
export const AVOID_PHRASES = [
  'elevate',
  'unlock',
  'transform your vision',
  'seamlessly',
  'seamless',
  'cutting-edge',
  'best-in-class',
  'holistic',
  'world-class',
  'innovative solutions',
  'meaningful impact',
  'at the intersection of',
  "in today's fast-paced world",
  'bring your vision to life',
  'take your brand to the next level',
  'tailored solutions',
  'unique needs',
  'end-to-end solutions',
  'drive engagement',
  'future-proof',
] as const

/** "Do not flatten" in voice.md: the broad statement that replaces a specific idea. */
export const FLATTENED_CLAIMS = [
  'We help brands stand out.',
  'We create impactful experiences.',
  'We help businesses grow.',
  'We combine strategy and creativity.',
  'We tell compelling stories.',
] as const

/**
 * "Constructions to avoid": the contrast frames. One is allowed where it is
 * the clearest option, so the check lists instances and flags a passage that
 * holds more than one. Each pattern is held to its example line in the doc by
 * the test.
 */
export const AVOID_FRAMES: readonly { name: string; pattern: RegExp }[] = [
  { name: 'not just X, it is Y', pattern: /\b(?:is|are|was|were|'s)\s+not\s+just\b/i },
  {
    name: 'more than X, it is Y',
    pattern:
      /(?:^|[.!?]\s+)more\s+than\b[^.!?]{1,80}[.!?]\s+(?:it|they|this|that)\s+(?:is|are|was|were|'s)\b/i,
  },
  {
    name: 'from X to Y',
    pattern: /(?:^|[.!?]\s+)from\s+(?!\d)[^.!?,]{1,40}\s+to\s+(?!\d)[^.!?,]{1,40}[.!?]/i,
  },
  { name: 'whether you are X or Y', pattern: /\bwhether\s+you(?:\s+are|'re)\b[^.!?]{1,80}\bor\b/i },
  { name: 'we do not just X, we Y', pattern: /\bwe\s+(?:do\s+not|don't)\s+just\b/i },
  { name: 'not only X, but also Y', pattern: /\bnot\s+only\b[^.!?]{1,80}\bbut(?:\s+also)?\b/i },
]

export type VoiceRule =
  | 'em-dash'
  | 'avoid-phrase'
  | 'flattened-claim'
  | 'contrast-frame'
  | 'semicolons'
  | 'long-paragraph'
  | 'uniform-sentences'

export type VoiceFinding = {
  rule: VoiceRule
  /** The text that triggered it: the phrase, the frame's name, or the count. */
  match: string
  /** Character offset in the passage, where one applies. */
  index?: number
}

/** Counts the check reads. Untuned defaults; the calibration runs in the journal say what moved. */
export const VOICE_LIMITS = {
  /** Words in one paragraph before it is listed as long. Story beats run long; hero copy never should. */
  paragraphWords: 130,
  /** Semicolons in one paragraph before it is listed. The doc says periods more often than semicolons. */
  semicolons: 1,
  /** Contrast frames in one passage before it is listed. One is allowed. */
  frames: 1,
  /** Sentences a paragraph needs before its length spread is judged at all. */
  uniformSentences: 4,
  /**
   * Spread of sentence lengths (standard deviation over mean) below which they read as one length.
   * A deliberate run of short steps in approved copy measured 0.12; the limit sits under it.
   */
  uniformSpread: 0.1,
} as const

/** An em dash between two digits is a numeric range and is allowed. */
const RANGE_DASH = new RegExp(`\\d\\s?${EM_DASH}\\s?\\d`)

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** "unlock" also as unlocks, unlocked, unlocking; "elevate" also as elevates, elevated, elevating. */
const inflected = (phrase: string): string => {
  const literal = escapeRegExp(phrase).replace(/'/g, "['’]")
  if (!/^[a-z]+$/.test(phrase)) return literal
  return phrase.endsWith('e')
    ? `${literal.slice(0, -1)}(?:e|es|ed|ing)`
    : `${literal}(?:s|es|ed|ing)?`
}

const PHRASE_PATTERNS = AVOID_PHRASES.map((phrase) => ({
  phrase,
  // Word-bounded, and a single word is caught in every inflection: "unlocks
  // composable content areas" is the marketing verb the doc bans, whatever its
  // ending. Found in approved copy on 2026-09-22, past the first version of this
  // pattern, which stopped at the bare word.
  pattern: new RegExp(`(?<![\\w-])${inflected(phrase)}(?![\\w-])`, 'gi'),
}))

const FLATTENED_PATTERNS = FLATTENED_CLAIMS.map((claim) => ({
  claim,
  pattern: new RegExp(escapeRegExp(claim.replace(/\.$/, '')), 'i'),
}))

/** Positions of every em dash that is not a numeric range. */
export function emDashesIn(text: string): number[] {
  const found: number[] = []
  for (let index = text.indexOf(EM_DASH); index !== -1; index = text.indexOf(EM_DASH, index + 1)) {
    const around = text.slice(Math.max(0, index - 2), index + 3)
    if (!RANGE_DASH.test(around)) found.push(index)
  }
  return found
}

/**
 * The findings the save-time gate refuses: exact, and never right in copy.
 * Everything `lintVoice` adds on top is a matter of degree and is reported.
 */
export function gateFindings(text: string): VoiceFinding[] {
  const findings: VoiceFinding[] = emDashesIn(text).map((index) => ({
    rule: 'em-dash',
    match: EM_DASH,
    index,
  }))
  for (const { phrase, pattern } of PHRASE_PATTERNS) {
    for (const match of text.matchAll(pattern))
      findings.push({ rule: 'avoid-phrase', match: phrase, index: match.index })
  }
  return findings.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
}

/** Splits on a full stop, question mark or exclamation that ends a sentence. "1.5" and "lib.ts" do not. */
export const sentencesOf = (text: string): string[] =>
  text
    .split(/(?<=[.?!])\s+(?=[A-Z"'`(])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

const wordCount = (text: string) => (text.match(/\S+/g) ?? []).length

/** Standard deviation over mean of the sentence lengths, in words. Zero when there is one sentence. */
export function sentenceSpread(text: string): { count: number; spread: number } {
  const lengths = sentencesOf(text).map(wordCount)
  const count = lengths.length
  if (count < 2) return { count, spread: 0 }
  const mean = lengths.reduce((sum, length) => sum + length, 0) / count
  const variance = lengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) / count
  return { count, spread: mean === 0 ? 0 : Math.sqrt(variance) / mean }
}

/**
 * Every exact finding in one passage (a paragraph, a beat, a heading): what
 * the gate refuses, plus the counts and frames the doc asks a writer to keep
 * an eye on. The thresholds are `VOICE_LIMITS`.
 */
export function lintVoice(text: string, limits = VOICE_LIMITS): VoiceFinding[] {
  const findings = gateFindings(text)
  for (const { claim, pattern } of FLATTENED_PATTERNS) {
    const match = pattern.exec(text)
    if (match) findings.push({ rule: 'flattened-claim', match: claim, index: match.index })
  }
  const frames = AVOID_FRAMES.flatMap(({ name, pattern }) => {
    const match = pattern.exec(text)
    return match ? [{ rule: 'contrast-frame' as const, match: name, index: match.index }] : []
  })
  if (frames.length > limits.frames) findings.push(...frames)
  const semicolons = (text.match(/;/g) ?? []).length
  if (semicolons > limits.semicolons)
    findings.push({ rule: 'semicolons', match: `${semicolons} semicolons` })
  const words = wordCount(text)
  if (words > limits.paragraphWords)
    findings.push({ rule: 'long-paragraph', match: `${words} words` })
  const { count, spread } = sentenceSpread(text)
  if (count >= limits.uniformSentences && spread < limits.uniformSpread)
    findings.push({
      rule: 'uniform-sentences',
      match: `${count} sentences within ${Math.round(spread * 100)}% of one length`,
    })
  return findings
}

/**
 * The voice in one line, for a model that writes copy at run time (the Ask
 * assistant). The full contract is the doc; this is what fits a system prompt.
 */
export const VOICE_PROMPT_LINE = `Plain, specific, composed: short sentences of varied length, no hype, no superlatives, no em dashes (use a comma, colon or period). Never these words: ${AVOID_PHRASES.slice(0, 10).join(', ')}. Never a "not just X, it is Y" or "not only X but also Y" frame.`
