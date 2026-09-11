'use client'

import {
  IconAlertCircle,
  IconArrowUpRight,
  IconCheck,
  IconLock,
  IconMessageCheck,
} from '@tabler/icons-react'
import { type Ref, useEffect, useId, useRef, useState } from 'react'
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
import { Spinner } from '@/components/ui/spinner'
import { focusForKeyboard, trackInputModality } from '@/Header/Menu/focus'
import { INQUIRY_EMAIL_INVALID } from '@/shared/content/inquiry'
import { useRevealSwap } from '@/shared/ui/scroll-reveal'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'
import {
  ASK_HANDOFFS,
  type AskHandoff,
  type AskUIMessage,
  askHandoffEmail,
  askHandoffMessage,
  askHandoffPromise,
  userQuestions,
} from './handoff'

type Receipt = { email: string; reference: string | null }

const COMPOSE = 0
const SENT = 1

type PanelProps = {
  cardRef: Ref<HTMLDivElement>
  handoff: AskHandoff
}

/**
 * The next step when a person should take it from here, finished where it
 * started: the card answers (a title per reason), promises a reply on Site
 * Info's clock, and takes a name and an address in one inset block that
 * AutoFill fills in a tap. "Send to the team" files the visitor's own
 * questions as an inquiry through the same intake as the contact forms, so
 * the lead lands in Inquiries (owned, notified, confirmed by email) and never
 * in the anonymous Ask log. The model never sees what is typed here.
 *
 * Sent, the card becomes its receipt in place on the site's panel swap
 * (`useRevealSwap`): the form fades out, the surface resizes to the receipt,
 * and the receipt fades in, which a transcript pinned to its end reads as the
 * conversation settling back down. Keyboard users land on the receipt; the
 * booking link waits there, after the commitment, not beside it.
 */
export function HandoffCard({
  handoff,
  messages,
}: {
  handoff: AskHandoff
  messages: AskUIMessage[]
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [panel, setPanel] = useState(COMPOSE)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  useEffect(() => trackInputModality(), [])

  // The send button leaves with the form; a keyboard user lands on the
  // receipt instead of the top of the page.
  useEffect(() => {
    if (panel === SENT) focusForKeyboard(cardRef.current, { preventScroll: true })
  }, [panel])

  const swapTo = useRevealSwap({
    rootRef: cardRef,
    active: panel,
    onSwap: setPanel,
    morphHeight: true,
    scaleMedia: false,
  })

  if (panel === SENT && receipt) {
    return <HandoffReceipt cardRef={cardRef} handoff={handoff} receipt={receipt} />
  }

  return (
    <HandoffForm
      cardRef={cardRef}
      handoff={handoff}
      messages={messages}
      onSent={(sent) => {
        setReceipt(sent)
        swapTo(SENT)
      }}
    />
  )
}

/**
 * An address the visitor already wrote in the chat starts the email field,
 * marked "From your message" until they change it. Send waits for both
 * fields; the address is checked with the intake's own rule and words before
 * anything is posted.
 */
function HandoffForm({
  cardRef,
  handoff,
  messages,
  onSent,
}: PanelProps & { messages: AskUIMessage[]; onSent: (receipt: Receipt) => void }) {
  const statusId = useId()
  const [suggestedEmail] = useState(() => askHandoffEmail(messages))
  const [name, setName] = useState('')
  const [email, setEmail] = useState(suggestedEmail ?? '')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const questions = userQuestions(messages)
  const latest = questions.at(-1)

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
        type: ASK_HANDOFFS[handoff.reason].form,
        fromAsk: true,
      })
      onSent({ email: address, reference })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form noValidate onSubmit={send}>
      <Card ref={cardRef} variant="inset">
        <CardHeader data-swap="text">
          <CardTitle>{ASK_HANDOFFS[handoff.reason].title}</CardTitle>
          <CardDescription>{askHandoffPromise(handoff.responseTime)}</CardDescription>
        </CardHeader>
        <CardContent data-swap="text">
          <ContactFields
            email={email}
            emailFromMessage={suggestedEmail !== null && email === suggestedEmail}
            invalidEmail={error === INQUIRY_EMAIL_INVALID}
            name={name}
            onEmail={(value) => {
              setEmail(value)
              setError(null)
            }}
            onName={setName}
            statusId={statusId}
          />
        </CardContent>
        <CardContent data-swap="text">
          <SendRow
            disabled={!name.trim() || !email.trim()}
            error={error}
            sending={sending}
            statusId={statusId}
          />
        </CardContent>
        {latest ? (
          <CardFooter data-swap="text">
            <IconMessageCheck aria-hidden />
            <span>
              {`${questions.length > 1 ? 'Sends your questions, including' : 'Sends your question:'} “${latest}”`}
            </span>
          </CardFooter>
        ) : null}
      </Card>
    </form>
  )
}

/** Name and address in one inset block, labelled for AutoFill. */
function ContactFields({
  email,
  emailFromMessage,
  invalidEmail,
  name,
  onEmail,
  onName,
  statusId,
}: {
  email: string
  emailFromMessage: boolean
  invalidEmail: boolean
  name: string
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
  statusId,
}: {
  disabled: boolean
  error: string | null
  sending: boolean
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
          Goes to our inbox, never the chat log.
        </FieldDescription>
      )}
    </Field>
  )
}

/** What was sent and when to expect a reply; the booking link, if the studio has one, after it. */
function HandoffReceipt({ cardRef, handoff, receipt }: PanelProps & { receipt: Receipt }) {
  return (
    <Card ref={cardRef} role="status" tabIndex={-1} variant="inset">
      <CardHeader data-swap="text">
        <CardIcon>
          <IconCheck />
        </CardIcon>
        <CardTitle>Sent to the team</CardTitle>
        <CardDescription>
          A partner will reply to {receipt.email} {handoff.responseTime}. We&apos;ve emailed you a
          confirmation.
          {receipt.reference ? ` Reference ${receipt.reference}.` : null}
        </CardDescription>
      </CardHeader>
      {handoff.scheduleUrl ? (
        <CardFooter data-swap="text">
          <span>Rather talk it through?</span>
          <Button asChild size="clear" variant="link">
            <a href={handoff.scheduleUrl} rel="noopener noreferrer" target="_blank">
              Book a call
              <IconArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
