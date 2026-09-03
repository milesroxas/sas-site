'use client'

import { IconExclamationCircle } from '@tabler/icons-react'
import { useCallback, useRef, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { answered, isQuestion, readable } from '@/blocks/shared/form/answers'
import { FormBody } from '@/blocks/shared/form/form-body.client'
import { FormSubmit } from '@/blocks/shared/form/form-submit'
import { submitForm } from '@/blocks/shared/form/submit'
import type {
  FormDelivery,
  FormInquiryType,
  FormStepsCopy,
  ResolvedFormField,
} from '@/blocks/shared/form/types'
import { Container } from '@/components/Container'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DetailList, DetailRow } from '@/components/ui/detail-list'
import { useRevealSwap } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

export type ContactTemplateContent = {
  eyebrow?: string | null
  heading: string
  lead?: string | null
  details: { term: string; value: string }[]
  nextStepsTitle?: string | null
  nextSteps: string[]
  altCta?: { body?: string | null; label?: string | null; url?: string | null } | null
  submitNote?: string | null
  sentEyebrow?: string | null
  sentHeading: string
  sentBody?: string | null
  sentReferenceLabel: string
  sentSentLabel: string
  sentCopyLabel: string
  sentSummaryTitle: string
  sentEditLabel: string
  sentAltBody?: string | null
  /** From Site Info, so the promise is made in one place. */
  responseTime: string
}

export type ContactTemplateProps = {
  content: ContactTemplateContent
  delivery: FormDelivery
  fields: ResolvedFormField[]
  formId: number | string
  inquiryType?: FormInquiryType
  /** The form's Steps copy; read only when its fields carry step dividers. */
  steps?: FormStepsCopy
  submitLabel: string
}

type Receipt = {
  reference: string | null
  submittedAt: string
  values: FieldValues
}

const MONO_LABEL = 'font-mono text-xs/4 tracking-widest text-muted-foreground uppercase'

const formatSentAt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

/**
 * The contact template.
 *
 * Two panels on one page: the form, and the receipt of what was just sent.
 * They swap in place rather than navigating, because the visitor has not
 * finished the task until they have seen their own words read back — and a
 * page load would throw that away along with everything they typed. The swap
 * runs on the shared panel choreography (`useRevealSwap`), so it plays the
 * same beat as every other in-place surface switch on the site and collapses
 * to a straight state change under reduced motion.
 *
 * "Edit and resend" swaps back. React Hook Form keeps its values across the
 * unmount, so the form comes back exactly as it was left.
 *
 * The copy column is short on purpose and sticks from `lg` up: the heading,
 * the facts, and the alternative to writing at all stay in view for the whole
 * length of the form. What happens after sending sits above the send button,
 * where that reassurance is read.
 */
export function ContactTemplate({
  content,
  delivery,
  fields,
  formId,
  inquiryType,
  steps,
  submitLabel,
}: ContactTemplateProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [panel, setPanel] = useState(0)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [isSending, setIsSending] = useState(false)

  const formMethods = useForm()

  const swapTo = useRevealSwap({
    rootRef,
    active: panel,
    onSwap: setPanel,
    scaleMedia: false,
  })

  const onSubmit = useCallback(
    async (values: FieldValues) => {
      setError(undefined)
      setIsSending(true)
      try {
        const result = await submitForm({ delivery, fields, formId, inquiryType, values })
        setReceipt({ ...result, values })
        swapTo(1)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Network error. Your words are still here, try sending again.',
        )
      } finally {
        setIsSending(false)
      }
    },
    [delivery, fields, formId, inquiryType, swapTo],
  )

  const scheduleUrl = content.altCta?.url
  const isSent = panel === 1 && receipt

  return (
    <Container>
      <div className="flex flex-col gap-16 lg:flex-row lg:gap-24" ref={rootRef}>
        <div className="flex flex-col gap-16 lg:sticky lg:top-(--header-height) lg:w-130 lg:shrink-0 lg:self-start">
          {isSent ? (
            <SentIntro
              content={content}
              fields={fields}
              receipt={receipt}
              scheduleUrl={scheduleUrl}
            />
          ) : (
            <FormIntro content={content} scheduleUrl={scheduleUrl} />
          )}
        </div>

        <div className="min-w-0 grow" data-swap="text">
          {isSent ? (
            <SentSummary
              content={content}
              fields={fields}
              onEdit={() => swapTo(0)}
              receipt={receipt}
            />
          ) : (
            <FormProvider {...formMethods}>
              <FormBody fields={fields} onSubmit={onSubmit} steps={steps}>
                {content.nextSteps.length > 0 ? (
                  <NextSteps steps={content.nextSteps} title={content.nextStepsTitle} />
                ) : null}

                {error ? (
                  <Alert variant="destructive">
                    <IconExclamationCircle />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                ) : null}

                <FormSubmit note={content.submitNote} pending={isSending}>
                  {submitLabel}
                </FormSubmit>
              </FormBody>
            </FormProvider>
          )}
        </div>
      </div>
    </Container>
  )
}

function Eyebrow({ children, marker }: { children: React.ReactNode; marker: 'dot' | 'rule' }) {
  return (
    <p className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          'shrink-0',
          marker === 'dot' ? 'size-2 rounded-full bg-active' : 'h-px w-4 bg-muted-foreground',
        )}
      />
      <span className={MONO_LABEL}>{children}</span>
    </p>
  )
}

function ScheduleButton({ label, url }: { label?: string | null; url?: string | null }) {
  if (!url || !label) return null
  return (
    <Button asChild size="xl" variant="outline">
      <a href={url}>{label}</a>
    </Button>
  )
}

function FormIntro({
  content,
  scheduleUrl,
}: {
  content: ContactTemplateContent
  scheduleUrl?: string | null
}) {
  return (
    <>
      <div className="flex flex-col items-start gap-6" data-swap="text">
        {content.eyebrow ? <Eyebrow marker="rule">{content.eyebrow}</Eyebrow> : null}
        <h1 className="text-heading-1">{content.heading}</h1>
        {content.lead ? (
          <p className="max-w-110 text-lead text-muted-foreground">{content.lead}</p>
        ) : null}
      </div>

      {content.details.length > 0 ? (
        <DetailList data-swap="text">
          {content.details.map((detail) => (
            <DetailRow key={detail.term} term={detail.term}>
              {detail.value}
            </DetailRow>
          ))}
        </DetailList>
      ) : null}

      {content.altCta?.body && scheduleUrl ? (
        <div className="flex flex-col items-start gap-4" data-swap="text">
          <p className="max-w-105 text-base/relaxed text-muted-foreground">{content.altCta.body}</p>
          <ScheduleButton label={content.altCta.label} url={scheduleUrl} />
        </div>
      ) : null}
    </>
  )
}

/**
 * What happens after sending, read right before it: the first line in full
 * contrast, the rest quiet. Sits above the send rule inside the form column
 * (and inside the last step of a stepped form), never in the copy column.
 */
function NextSteps({ steps, title }: { steps: string[]; title?: string | null }) {
  return (
    <div className="flex flex-col gap-6">
      {title ? <p className={MONO_LABEL}>{title}</p> : null}
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <li
            className={cn('max-w-105 text-base/relaxed', index > 0 && 'text-muted-foreground')}
            key={step}
          >
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The address the receipt was copied to, taken from whichever field is the email. */
const emailFrom = (fields: ResolvedFormField[], values: FieldValues): string | undefined => {
  const field = fields.find((f) => f.mapsTo === 'email' || f.blockType === 'email')
  const value = field?.name ? values[field.name] : undefined
  return typeof value === 'string' ? value : undefined
}

const nameFrom = (fields: ResolvedFormField[], values: FieldValues): string => {
  const field = fields.find((f) => f.mapsTo === 'name')
  const value = field?.name ? values[field.name] : undefined
  return typeof value === 'string' ? value : ''
}

function SentIntro({
  content,
  fields,
  receipt,
  scheduleUrl,
}: {
  content: ContactTemplateContent
  fields: ResolvedFormField[]
  receipt: Receipt
  scheduleUrl?: string | null
}) {
  const fullName = nameFrom(fields, receipt.values)
  const firstName = fullName.split(' ')[0] ?? fullName
  const body = (content.sentBody ?? '')
    .replaceAll('{name}', firstName)
    .replaceAll('{responseTime}', content.responseTime)
  const email = emailFrom(fields, receipt.values)

  return (
    <>
      <div className="flex flex-col items-start gap-6" data-swap="text">
        {content.sentEyebrow ? <Eyebrow marker="dot">{content.sentEyebrow}</Eyebrow> : null}
        <h1 className="text-heading-1">{content.sentHeading}</h1>
        {body ? <p className="max-w-110 text-lead text-muted-foreground">{body}</p> : null}
      </div>

      <DetailList data-swap="text">
        {receipt.reference ? (
          <DetailRow term={content.sentReferenceLabel}>{receipt.reference}</DetailRow>
        ) : null}
        <DetailRow term={content.sentSentLabel}>{formatSentAt(receipt.submittedAt)}</DetailRow>
        {email ? <DetailRow term={content.sentCopyLabel}>{email}</DetailRow> : null}
      </DetailList>

      {content.sentAltBody && scheduleUrl ? (
        <div className="flex flex-col items-start gap-4" data-swap="text">
          <p className="max-w-105 text-base/relaxed text-muted-foreground">{content.sentAltBody}</p>
          <ScheduleButton label={content.altCta?.label} url={scheduleUrl} />
        </div>
      ) : null}
    </>
  )
}

/**
 * What was sent, read back in the form's own words.
 *
 * The rows come from the form rather than from a second set of CMS labels, so
 * renaming a question renames it here too. Name and email are left out: they
 * are already stated beside it as who the copy went to.
 */
function SentSummary({
  content,
  fields,
  onEdit,
  receipt,
}: {
  content: ContactTemplateContent
  fields: ResolvedFormField[]
  onEdit: () => void
  receipt: Receipt
}) {
  const rows = fields.filter(
    (field) =>
      isQuestion(field) &&
      field.mapsTo !== 'name' &&
      field.mapsTo !== 'email' &&
      answered(receipt.values[field.name]),
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between gap-6 border-b border-b-foreground pb-4">
        <p className={MONO_LABEL}>{content.sentSummaryTitle}</p>
        <Button onClick={onEdit} size="clear" type="button" variant="mono">
          {content.sentEditLabel}
        </Button>
      </div>

      <DetailList className="border-t-0" size="lg">
        {rows.map((field) => (
          <DetailRow key={field.name} term={field.label || field.name}>
            <span
              className={cn(
                field.blockType === 'textarea' && 'text-base/relaxed text-muted-foreground',
              )}
            >
              {readable(field, receipt.values[field.name as string])}
            </span>
          </DetailRow>
        ))}
      </DetailList>
    </div>
  )
}
