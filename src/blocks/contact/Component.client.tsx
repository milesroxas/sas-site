'use client'

import { IconExclamationCircle } from '@tabler/icons-react'
import { useCallback, useRef, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { ChipsField, FormSubmit, TextareaField, TextField } from '@/blocks/shared/form'
import { Container } from '@/components/Container'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DetailList, DetailRow } from '@/components/ui/detail-list'
import { INQUIRY_MESSAGE_MAX_LENGTH } from '@/shared/content/inquiry'
import { useRevealSwap } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

/**
 * Chip value standing in for "I don't know yet". It rides in the same chip
 * group as the capabilities so the escape hatch sits where a visitor looks for
 * it, and is split back out before the request is sent. Real options are
 * numeric ids, so it can never collide with one.
 */
const UNSURE = 'unsure'

export type ContactOption = { label: string; value: string }

export type ContactFormContent = {
  variant: 'general' | 'project'
  /** Intro column. */
  eyebrow?: string | null
  heading: string
  lead?: string | null
  details: { term: string; value: string }[]
  nextStepsTitle?: string | null
  nextSteps: string[]
  altCta?: { body?: string | null; label?: string | null; url?: string | null } | null
  /** Form. */
  nameLabel: string
  emailLabel: string
  companyLabel?: string | null
  websiteLabel?: string | null
  capabilities?: {
    label: string
    hint?: string | null
    options: ContactOption[]
    unsureLabel?: string | null
  } | null
  budgetLabel?: string | null
  budgetHint?: string | null
  budgetOptions: ContactOption[]
  timelineLabel?: string | null
  timelineOptions: ContactOption[]
  messageLabel: string
  messagePlaceholder?: string | null
  messageHelper?: string | null
  submitLabel: string
  submitNote?: string | null
  /** Receipt. */
  sentEyebrow?: string | null
  sentHeading: string
  sentBody?: string | null
  sentReferenceLabel: string
  sentSentLabel: string
  sentCopyLabel: string
  sentSummaryTitle: string
  sentEditLabel: string
  /** Shorter row labels for the narrow receipt column; each falls back to its form label. */
  sentScopeLabel?: string | null
  sentBudgetLabel?: string | null
  sentTimelineLabel?: string | null
  sentBriefLabel?: string | null
  sentAltBody?: string | null
  /** From Site Info, so the promise is made in one place. */
  responseTime: string
}

type FormValues = {
  budget?: string
  capabilities?: string[]
  company?: string
  email: string
  message: string
  name: string
  role?: string
  timeline?: string
  website?: string
}

type Receipt = {
  reference: string | null
  submittedAt: string
  values: FormValues
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

const labelFor = (options: ContactOption[], value?: string) =>
  options.find((option) => option.value === value)?.label

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
 */
export function ContactFormClient({ content }: { content: ContactFormContent }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [panel, setPanel] = useState(0)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [isSending, setIsSending] = useState(false)

  // Untyped like every other form on the site: the shared field components
  // take `UseFormRegister<FieldValues>`, and the one place the shape matters
  // is the submit handler, which names it there.
  const formMethods = useForm()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const swapTo = useRevealSwap({
    rootRef,
    active: panel,
    onSwap: setPanel,
    scaleMedia: false,
  })

  const isProject = content.variant === 'project'
  const capabilityOptions = content.capabilities?.options ?? []
  const unsureLabel = content.capabilities?.unsureLabel
  const chipOptions = unsureLabel
    ? [...capabilityOptions, { label: unsureLabel, value: UNSURE }]
    : capabilityOptions

  const onSubmit = useCallback(
    async (raw: FieldValues) => {
      const values = raw as FormValues
      setError(undefined)
      setIsSending(true)

      const picked = values.capabilities ?? []

      try {
        const res = await fetch('/api/inquiries/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: content.variant,
            name: values.name,
            email: values.email,
            company: values.company,
            website: values.website,
            message: values.message,
            // Honeypot — a human never sees this field, so it is always empty.
            role: values.role,
            sourceUrl: typeof window === 'undefined' ? undefined : window.location.href,
            ...(isProject
              ? {
                  budget: values.budget,
                  timeline: values.timeline,
                  capabilities: picked.filter((value) => value !== UNSURE),
                  capabilitiesUnsure: picked.includes(UNSURE),
                }
              : {}),
          }),
        })

        const body = (await res.json().catch(() => ({}))) as {
          error?: string
          reference?: string | null
          submittedAt?: string
        }

        if (!res.ok) {
          setError(body.error ?? 'Something went wrong. Try again.')
          return
        }

        setReceipt({
          reference: body.reference ?? null,
          submittedAt: body.submittedAt ?? new Date().toISOString(),
          values,
        })
        swapTo(1)
      } catch {
        setError('Network error. Your words are still here, try sending again.')
      } finally {
        setIsSending(false)
      }
    },
    [content.variant, isProject, swapTo],
  )

  const scheduleUrl = content.altCta?.url
  const isSent = panel === 1 && receipt

  return (
    <Container>
      <div className="flex flex-col gap-16 lg:flex-row lg:gap-24" ref={rootRef}>
        <div className="flex flex-col gap-16 lg:w-130 lg:shrink-0">
          {isSent ? (
            <SentIntro content={content} receipt={receipt} scheduleUrl={scheduleUrl} />
          ) : (
            <FormIntro content={content} scheduleUrl={scheduleUrl} />
          )}
        </div>

        <div className="min-w-0 grow" data-swap="text">
          {isSent ? (
            <SentSummary
              content={content}
              onEdit={() => swapTo(0)}
              receipt={receipt}
              chipOptions={chipOptions}
            />
          ) : (
            <FormProvider {...formMethods}>
              <form className="flex flex-col gap-12" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
                  <TextField
                    autoComplete="name"
                    errors={errors}
                    label={content.nameLabel}
                    name="name"
                    register={register}
                    required
                    width={50}
                  />
                  <TextField
                    autoComplete="email"
                    errors={errors}
                    inputType="email"
                    label={content.emailLabel}
                    name="email"
                    register={register}
                    required
                    width={50}
                  />
                  {content.companyLabel ? (
                    <TextField
                      autoComplete="organization"
                      errors={errors}
                      label={content.companyLabel}
                      name="company"
                      register={register}
                      width={50}
                    />
                  ) : null}
                  {content.websiteLabel ? (
                    <TextField
                      autoComplete="url"
                      errors={errors}
                      inputType="url"
                      label={content.websiteLabel}
                      name="website"
                      register={register}
                      width={50}
                    />
                  ) : null}

                  {isProject && chipOptions.length > 0 && content.capabilities ? (
                    <ChipsField
                      errors={errors}
                      label={content.capabilities.label}
                      meta={content.capabilities.hint}
                      multiple
                      name="capabilities"
                      options={chipOptions}
                      register={register}
                    />
                  ) : null}

                  {isProject && content.budgetOptions.length > 0 ? (
                    <ChipsField
                      errors={errors}
                      label={content.budgetLabel}
                      meta={content.budgetHint}
                      name="budget"
                      options={content.budgetOptions}
                      register={register}
                    />
                  ) : null}

                  {isProject && content.timelineOptions.length > 0 ? (
                    <ChipsField
                      errors={errors}
                      label={content.timelineLabel}
                      name="timeline"
                      options={content.timelineOptions}
                      register={register}
                    />
                  ) : null}

                  <TextareaField
                    errors={errors}
                    footer={
                      content.messageHelper ? (
                        <span className={MONO_LABEL}>{content.messageHelper}</span>
                      ) : null
                    }
                    label={content.messageLabel}
                    maxLength={INQUIRY_MESSAGE_MAX_LENGTH}
                    name="message"
                    placeholder={content.messagePlaceholder ?? undefined}
                    register={register}
                    required
                  />

                  {/* Honeypot. Off-screen rather than hidden so bots that skip
                      display:none fields still fill it in. */}
                  <div aria-hidden="true" className="absolute left-[-9999px]">
                    <input tabIndex={-1} autoComplete="off" {...register('role')} />
                  </div>
                </div>

                {error ? (
                  <Alert variant="destructive">
                    <IconExclamationCircle />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                ) : null}

                <FormSubmit note={content.submitNote} pending={isSending}>
                  {content.submitLabel}
                </FormSubmit>
              </form>
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
  content: ContactFormContent
  scheduleUrl?: string | null
}) {
  return (
    <>
      <div className="flex flex-col items-start gap-6" data-swap="text">
        {content.eyebrow ? <Eyebrow marker="rule">{content.eyebrow}</Eyebrow> : null}
        <h2 className="text-heading-1">{content.heading}</h2>
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

      {content.nextSteps.length > 0 ? (
        <div className="flex flex-col gap-6" data-swap="text">
          {content.nextStepsTitle ? <p className={MONO_LABEL}>{content.nextStepsTitle}</p> : null}
          <ol className="flex flex-col gap-3">
            {content.nextSteps.map((step, index) => (
              <li
                className={cn('max-w-105 text-base/relaxed', index > 0 && 'text-muted-foreground')}
                key={step}
              >
                {step}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {content.altCta?.body && scheduleUrl ? (
        <div
          className="flex flex-col items-start gap-4 border-t border-border pt-6"
          data-swap="text"
        >
          <p className="max-w-105 text-base/relaxed text-muted-foreground">{content.altCta.body}</p>
          <ScheduleButton label={content.altCta.label} url={scheduleUrl} />
        </div>
      ) : null}
    </>
  )
}

function SentIntro({
  content,
  receipt,
  scheduleUrl,
}: {
  content: ContactFormContent
  receipt: Receipt
  scheduleUrl?: string | null
}) {
  const firstName = receipt.values.name.split(' ')[0] ?? receipt.values.name
  const body = (content.sentBody ?? '')
    .replaceAll('{name}', firstName)
    .replaceAll('{responseTime}', content.responseTime)

  return (
    <>
      <div className="flex flex-col items-start gap-6" data-swap="text">
        {content.sentEyebrow ? <Eyebrow marker="dot">{content.sentEyebrow}</Eyebrow> : null}
        <h2 className="text-heading-1">{content.sentHeading}</h2>
        {body ? <p className="max-w-110 text-lead text-muted-foreground">{body}</p> : null}
      </div>

      <DetailList data-swap="text">
        {receipt.reference ? (
          <DetailRow term={content.sentReferenceLabel}>{receipt.reference}</DetailRow>
        ) : null}
        <DetailRow term={content.sentSentLabel}>{formatSentAt(receipt.submittedAt)}</DetailRow>
        <DetailRow term={content.sentCopyLabel}>{receipt.values.email}</DetailRow>
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

function SentSummary({
  chipOptions,
  content,
  onEdit,
  receipt,
}: {
  chipOptions: ContactOption[]
  content: ContactFormContent
  onEdit: () => void
  receipt: Receipt
}) {
  const { values } = receipt
  const scope = (values.capabilities ?? [])
    .map((value) => labelFor(chipOptions, value))
    .filter(Boolean)
    .join(', ')

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between gap-6 border-b border-b-foreground pb-4">
        <p className={MONO_LABEL}>{content.sentSummaryTitle}</p>
        <button
          className="pressable font-mono text-xs/4 tracking-widest text-foreground uppercase underline underline-offset-4 hover:text-primary"
          onClick={onEdit}
          type="button"
        >
          {content.sentEditLabel}
        </button>
      </div>

      <DetailList className="border-t-0" size="lg">
        {scope ? (
          <DetailRow term={content.sentScopeLabel || content.capabilities?.label}>
            {scope}
          </DetailRow>
        ) : null}
        {values.budget ? (
          <DetailRow term={content.sentBudgetLabel || content.budgetLabel}>
            {[labelFor(content.budgetOptions, values.budget), content.budgetHint]
              .filter(Boolean)
              .join(' ')}
          </DetailRow>
        ) : null}
        {values.timeline ? (
          <DetailRow term={content.sentTimelineLabel || content.timelineLabel}>
            {labelFor(content.timelineOptions, values.timeline)}
          </DetailRow>
        ) : null}
        <DetailRow term={content.sentBriefLabel || content.messageLabel}>
          <span className="text-base/relaxed text-muted-foreground">{values.message}</span>
        </DetailRow>
      </DetailList>
    </div>
  )
}
