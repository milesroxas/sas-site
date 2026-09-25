'use client'

import {
  IconAlertCircle,
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconLock,
} from '@tabler/icons-react'
import Link from 'next/link'
import type React from 'react'
import {
  type Dispatch,
  type Ref,
  type SetStateAction,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { postInquiry } from '@/blocks/shared/form/post-inquiry'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useMessageScroller } from '@/components/ui/message-scroller'
import { Spinner } from '@/components/ui/spinner'
import { focusForKeyboard, lastInputWasKeyboard, trackInputModality } from '@/Header/Menu/focus'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { INQUIRY_EMAIL_INVALID } from '@/shared/content/inquiry'
import { SCROLL_REVEAL_SWAP, useRevealSwap } from '@/shared/ui/scroll-reveal'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'
import { cn } from '@/utilities/ui'
import { type AskFeedback, useAskFeedback } from './feedback'
import {
  ASK_HANDOFF_ACTION,
  ASK_HANDOFF_HREF,
  ASK_HANDOFFS,
  type AskHandoffDraft,
  type AskHandoffKind,
  type AskHandoffTerms,
  type AskUIMessage,
  askHandoffEmail,
  askHandoffForm,
  askHandoffMessage,
  askHandoffPromise,
  askInquiryFields,
  saveAskHandoff,
  userQuestions,
} from './handoff'

/** What the inquiries intake answered: where the reply goes, and the reference if it issued one. */
export type AskHandoffReceipt = { email: string; reference: string | null }

/** A handoff the visitor has sent, pinned to the reply it closed. */
export type AskHandoffSent = { messageId: string; receipt: AskHandoffReceipt }

const OFFER = 0
const FORM = 1
const SENT = 2

type Panel = typeof OFFER | typeof FORM | typeof SENT

const PANEL_NAME: Record<Panel, string> = { [OFFER]: 'offer', [FORM]: 'form', [SENT]: 'sent' }

/** A pointer that can aim: a mouse or trackpad, never a finger. */
const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

type HandoffProps = {
  kind: AskHandoffKind
  /** Site Info's promise, from the resolved handoff or the surface's own copy of it. */
  terms: AskHandoffTerms
  messages: AskUIMessage[]
  /** The transcript item this handoff sits in, so the form can be brought into view once it opens. */
  itemId: string
  /**
   * The item to align to when the form arrives open: the reply's lead line
   * when the card is the whole reply, so the words that introduce the form
   * are read first; otherwise the handoff itself.
   */
  arrivalId?: string
  /** The reply this handoff closes, where "Not now" keeps a form that opened by itself closed. */
  replyId: string
  /** The receipt, when this handoff was sent earlier in the conversation (a remount after later turns). */
  receipt?: AskHandoffReceipt | null
  onSent: (receipt: AskHandoffReceipt) => void
  /** The question this handoff closes (its user message id), or null for a reply with none. */
  turn: string | null
  /** The form is open here (`askHandoffOpen`): asked for, opened, or typed in. */
  open: boolean
  /** The form as the visitor left it, kept by the conversation. */
  draft: AskHandoffDraft
  onDraft: Dispatch<SetStateAction<AskHandoffDraft>>
}

/**
 * The way to a person under a finished reply, in three states on one surface:
 *
 * 1. **Offer.** A line and a chip, one quiet row. The reason picks the line
 *    (and, when the reply was only the handoff, the lead the transcript shows
 *    before it).
 * 2. **Form.** The chip opens the same element in place: the surface takes
 *    the transcript's muted ground and grows to a promise, Name and Email in
 *    one inset block that AutoFill fills in a tap, and "Send to the team".
 *    It opens by itself when the visitor asked for a person or shared their
 *    details, or when the card is the whole reply to a price or a project
 *    (`ASK_HANDOFFS[kind].opens`); "Not now" folds it back. What is typed is
 *    the conversation's draft, so it survives a new question and another
 *    surface, and it never reaches the model or the Ask log.
 * 3. **Receipt.** Sent, the form becomes its receipt on the same swap: where
 *    the reply goes, the reference, and "Book a call" after the commitment.
 *
 * Every state change rides `useRevealSwap` with `morphHeight`: the outgoing
 * copy fades, the surface resizes, the incoming copy fades in staggered, and
 * the ground fades in with it on the swap's own duration, so the offer reads
 * as becoming the form rather than being replaced by it. Keyboard users land
 * on the first field, then on the receipt; a finger is never handed a raised
 * keyboard it did not ask for.
 */
export function Handoff({
  kind,
  terms,
  messages,
  itemId,
  arrivalId = itemId,
  replyId,
  receipt: sentReceipt = null,
  onSent,
  turn,
  open,
  draft,
  onDraft,
}: HandoffProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [panel, setPanel] = useState<Panel>(() => (sentReceipt ? SENT : open ? FORM : OFFER))
  const [receipt, setReceipt] = useState<AskHandoffReceipt | null>(sentReceipt)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollToMessage } = useMessageScroller()
  /** Where the swap in flight is headed; `panel` still reads the outgoing state until it lands. */
  const headingTo = useRef<Panel>(panel)

  useEffect(() => trackInputModality(), [])

  /** Brought into view aligned to its top, so the promise line is read before the fields. */
  const bringIntoView = (id = itemId) =>
    scrollToMessage(id, { align: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })

  /**
   * Once the incoming panel has settled (its nodes are visible, its height
   * is final). Deferred a frame: under reduced motion the swap settles
   * synchronously, before the state it set has rendered.
   */
  const settle = () => {
    requestAnimationFrame(() => {
      if (headingTo.current === FORM) {
        const name = nameRef.current
        if (name && (lastInputWasKeyboard() || finePointer())) name.focus({ preventScroll: true })
        // Aligned to its top, not brought "nearest": on a short panel the form
        // is taller than the transcript, and the scroller's own pin to the end
        // would leave the promise line above the fold, which is the whole
        // reason the visitor is being asked for an address.
        bringIntoView()
      }
      if (headingTo.current === SENT) focusForKeyboard(rootRef.current, { preventScroll: true })
    })
  }

  const swapTo = useRevealSwap({
    rootRef,
    active: panel,
    // The swap deals in indices; only the three above are ever passed to it.
    onSwap: (index) => setPanel(index as Panel),
    onSettled: settle,
    morphHeight: true,
    scaleMedia: false,
  })

  const go = (next: Panel) => {
    headingTo.current = next
    swapTo(next)
  }

  // The draft decides: an offer the visitor opened (here, from the chat
  // header, or by typing their address into the chat) becomes the form, and
  // "Not now" folds it back. A sent handoff stays its receipt.
  useEffect(() => {
    if (headingTo.current === SENT) return
    if (open && headingTo.current === OFFER) go(FORM)
    if (!open && headingTo.current === FORM) go(OFFER)
  })

  // A form that arrives open (it opened by itself, or the visitor carried it
  // here from another reply or surface) is brought into view once; later
  // openings settle through the swap.
  const arrivedOpen = useRef(panel === FORM)
  useEffect(() => {
    if (!arrivedOpen.current) return
    arrivedOpen.current = false
    // Not cancelled on cleanup: this effect has no dependency list, so a
    // re-render in the same frame would cancel the only scroll it makes.
    requestAnimationFrame(() => bringIntoView(arrivalId))
  })

  // The chat header's "Email a partner" asks for the handoff again: the form,
  // or once sent, the receipt, comes back into view.
  const revealed = useRef(draft.reveal)
  useEffect(() => {
    if (draft.reveal === revealed.current) return
    revealed.current = draft.reveal
    requestAnimationFrame(() => bringIntoView())
  })

  return (
    <Card
      ref={rootRef}
      data-panel={PANEL_NAME[panel]}
      role={panel === SENT ? 'status' : undefined}
      tabIndex={panel === SENT ? -1 : undefined}
      variant="inset"
      className={cn(
        // The ground arrives on the swap's own beat, so the offer's transparent
        // row becomes the form's muted surface while the height morphs.
        'motion-safe:transition-colors motion-safe:ease-out-quint',
        // The offer is a row, not a card: no ground, no padding, and nothing
        // clipped (the chip's focus ring reaches past the row's box). `!` on
        // the two that the inset variant also sets through a data attribute
        // of its own, which would otherwise win on source order.
        'data-[panel=offer]:overflow-visible data-[panel=offer]:py-0 data-[panel=offer]:rounded-none! data-[panel=offer]:bg-transparent!',
      )}
      style={{ transitionDuration: `${SCROLL_REVEAL_SWAP.textDuration * 1000}ms` }}
    >
      {panel === OFFER && (
        <HandoffOffer
          kind={kind}
          onOpen={() => onDraft((current) => ({ ...current, open: true, closedUnder: null }))}
        />
      )}
      {panel === FORM && (
        <HandoffForm
          draft={draft}
          messages={messages}
          nameRef={nameRef}
          onClose={() => onDraft((current) => ({ ...current, open: false, closedUnder: replyId }))}
          onDraft={onDraft}
          onSent={(sent) => {
            setReceipt(sent)
            onSent(sent)
            go(SENT)
          }}
          terms={terms}
          turn={turn}
        />
      )}
      {panel === SENT && receipt && <HandoffReceipt receipt={receipt} terms={terms} />}
    </Card>
  )
}

/**
 * The line and the chip; the chip is the suggestion chips' shape, so it reads
 * as a next step to pick. The line is a statement, never a question, so the
 * chat box is never asked something only the chip can answer.
 */
function HandoffOffer({ kind, onOpen }: { kind: AskHandoffKind; onOpen: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2" data-swap="text">
      <p className="text-muted-foreground text-sm/relaxed md:text-xs/relaxed">
        {ASK_HANDOFFS[kind].offer}
      </p>
      <Button className="font-normal" onClick={onOpen} size="chat" type="button" variant="outline">
        {ASK_HANDOFF_ACTION}
      </Button>
    </div>
  )
}

/** "your message" or "your 3 messages": what the form sends, counted. */
const sendsLine = (count: number) =>
  `Sends ${count === 1 ? 'your message' : `your ${count} messages`} to our inbox, never the chat log.`

/**
 * An address the visitor already wrote in the chat starts the email field,
 * marked "From your message" until they change it. Send waits for both
 * fields; the address is checked with the intake's own rule and words before
 * anything is posted. The fields are the conversation's draft, so what is
 * typed here is still here after a new question or on another surface.
 */
function HandoffForm({
  draft,
  messages,
  nameRef,
  onClose,
  onDraft,
  onSent,
  terms,
  turn,
}: {
  draft: AskHandoffDraft
  messages: AskUIMessage[]
  nameRef: Ref<HTMLInputElement>
  onClose: () => void
  onDraft: Dispatch<SetStateAction<AskHandoffDraft>>
  onSent: (receipt: AskHandoffReceipt) => void
  terms: AskHandoffTerms
  turn: string | null
}) {
  const statusId = useId()
  const feedback = useAskFeedback()
  const suggestedEmail = askHandoffEmail(messages)
  const name = draft.name
  const email = draft.email ?? suggestedEmail ?? ''
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const address = normalizeEmailAddress(email)
    const message = askHandoffMessage(messages)
    if (!isValidEmailAddress(address)) return setError(INQUIRY_EMAIL_INVALID)
    if (!message) return
    setError(null)
    setSending(true)
    try {
      const { reference } = await postInquiry({
        name: name.trim(),
        email: address,
        message,
        type: askHandoffForm(messages),
        ...askInquiryFields({ conversation: feedback.conversation, turn }),
      })
      onSent({ email: address, reference })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    // `contents`, so the card's own stack spaces the form's parts.
    <form className="contents" noValidate onSubmit={send}>
      <CardHeader data-swap="text">
        {/* The form's own caption, not conversation body: it reads one step
            down from the transcript on a phone, where the panel is short and
            every line costs the send action its place above the fold. */}
        <CardDescription className="max-md:text-sm/5">
          {askHandoffPromise(terms.responseTime)}
        </CardDescription>
      </CardHeader>
      <CardContent data-swap="text">
        <ContactFields
          email={email}
          emailFromMessage={suggestedEmail !== null && email === suggestedEmail}
          invalidEmail={error === INQUIRY_EMAIL_INVALID}
          name={name}
          nameRef={nameRef}
          onEmail={(value) => {
            onDraft((current) => ({ ...current, email: value, open: true }))
            setError(null)
          }}
          onName={(value) => onDraft((current) => ({ ...current, name: value, open: true }))}
          statusId={statusId}
        />
      </CardContent>
      <CardContent data-swap="text">
        <SendRow
          disabled={!name.trim() || !email.trim()}
          error={error}
          sending={sending}
          sends={sendsLine(userQuestions(messages).length)}
          statusId={statusId}
        />
      </CardContent>
      <CardFooter data-swap="text">
        <span>Prefer the full form?</span>
        <Button asChild size="clear" variant="link">
          <HandoffLink feedback={feedback} href={ASK_HANDOFF_HREF} messages={messages} turn={turn}>
            Contact page
            <IconArrowRight data-icon="inline-end" />
          </HandoffLink>
        </Button>
        <Button className="ml-auto" onClick={onClose} size="clear" type="button" variant="link">
          Not now
        </Button>
      </CardFooter>
    </form>
  )
}

/** Name and address in one inset block, labelled for AutoFill. */
function ContactFields({
  email,
  emailFromMessage,
  invalidEmail,
  name,
  nameRef,
  onEmail,
  onName,
  statusId,
}: {
  email: string
  emailFromMessage: boolean
  invalidEmail: boolean
  name: string
  nameRef: Ref<HTMLInputElement>
  onEmail: (value: string) => void
  onName: (value: string) => void
  /** The status line under the block, which describes the address. */
  statusId: string
}) {
  const nameId = useId()
  const emailId = useId()
  return (
    <FieldGroup variant="inset">
      <Field orientation="horizontal">
        <FieldLabel htmlFor={nameId}>Name</FieldLabel>
        <Input
          autoComplete="name"
          id={nameId}
          maxLength={200}
          name="name"
          onChange={(event) => onName(event.target.value)}
          placeholder="Your name"
          ref={nameRef}
          required
          value={name}
          variant="bare"
        />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel htmlFor={emailId}>Email</FieldLabel>
        <Input
          aria-describedby={statusId}
          aria-invalid={invalidEmail || undefined}
          autoComplete="email"
          id={emailId}
          inputMode="email"
          name="email"
          onChange={(event) => onEmail(event.target.value)}
          placeholder="you@company.com"
          required
          type="email"
          value={email}
          variant="bare"
        />
        {emailFromMessage ? <FieldDescription>From your message</FieldDescription> : null}
      </Field>
    </FieldGroup>
  )
}

/** The one action, and beside it either where the note goes or what stopped it. */
function SendRow({
  disabled,
  error,
  sending,
  sends,
  statusId,
}: {
  disabled: boolean
  error: string | null
  sending: boolean
  /** What the form sends and where, so nothing leaves unseen. */
  sends: string
  statusId: string
}) {
  return (
    <Field orientation="horizontal">
      <Button disabled={disabled || sending} size="chat" type="submit">
        {sending ? <Spinner /> : null}
        Send to the team
      </Button>
      {error ? (
        <FieldError id={statusId}>
          <IconAlertCircle aria-hidden />
          {error}
        </FieldError>
      ) : (
        <FieldDescription id={statusId}>
          <IconLock aria-hidden />
          {sends}
        </FieldDescription>
      )}
    </Field>
  )
}

/** What was sent and when to expect a reply; the booking link, if the studio has one, after it. */
function HandoffReceipt({
  receipt,
  terms,
}: {
  receipt: AskHandoffReceipt
  terms: AskHandoffTerms
}) {
  return (
    <>
      <CardHeader data-swap="text">
        <CardIcon>
          <IconCheck />
        </CardIcon>
        <CardTitle>Sent to the team</CardTitle>
        <CardDescription>
          A partner will reply to {receipt.email} {terms.responseTime}. We&apos;ve emailed you a
          confirmation.
          {receipt.reference ? ` Reference ${receipt.reference}.` : null}
        </CardDescription>
      </CardHeader>
      {terms.scheduleUrl ? (
        <CardFooter data-swap="text">
          <span>Rather talk it through?</span>
          <Button asChild size="clear" variant="link">
            <a href={terms.scheduleUrl} rel="noopener noreferrer" target="_blank">
              Book a call
              <IconArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </>
  )
}

type HandoffLinkProps = Omit<React.ComponentProps<typeof Link>, 'href' | 'onClick' | 'prefetch'> & {
  href: string
  messages: AskUIMessage[]
  feedback: AskFeedback
  turn: string | null
}

/**
 * The fallback out of Ask to the contact page, with the visitor's questions
 * already in its message. A plain link like the transcript's source links,
 * so the menu closes on the route change as it does for those. Not
 * prefetched: it sits in a form that is often open without ever being used.
 * Already on the destination, a push to the same path would do nothing, so
 * it reloads to pick the handoff up. The click is the turn's handoff signal
 * until the contact form's own send replaces it.
 */
function HandoffLink({ href, messages, feedback, turn, ...props }: HandoffLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      onClick={(event) => {
        saveAskHandoff(messages, { conversation: feedback.conversation, turn })
        if (turn) feedback.handoff(turn, 'clicked')
        if (window.location.pathname === href) {
          event.preventDefault()
          window.location.reload()
        }
      }}
    />
  )
}
