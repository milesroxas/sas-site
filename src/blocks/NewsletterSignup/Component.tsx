'use client'

import { type FormEvent, useId, useState } from 'react'
import { Section } from '@/blocks/shared/section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { NewsletterSignupBlock as NewsletterSignupBlockProps } from '@/payload-types'

type Status =
  | { state: 'idle' | 'loading' }
  | { state: 'success'; message: string }
  | { state: 'error'; message: string }

export const NewsletterSignupBlock: React.FC<NewsletterSignupBlockProps> = ({
  eyebrow,
  heading,
  body,
  buttonLabel,
  audience,
  theme,
}) => {
  const emailId = useId()
  const [status, setStatus] = useState<Status>({ state: 'idle' })

  const audienceSlug = typeof audience === 'object' && audience !== null ? audience.slug : undefined

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setStatus({ state: 'loading' })

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          audience: audienceSlug,
          // Honeypot — humans never see this field, so it should always be empty.
          company: data.get('company'),
        }),
      })
      const result = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
      if (!res.ok) {
        setStatus({ state: 'error', message: result.error ?? 'Something went wrong. Try again.' })
        return
      }
      // The API owns the copy so every consumer of the endpoint shows the same instruction.
      setStatus({
        state: 'success',
        message: result.message ?? 'Almost there — check your inbox to confirm.',
      })
    } catch {
      setStatus({ state: 'error', message: 'Network error — please try again.' })
    }
  }

  return (
    <Section theme={theme}>
      <div className="container">
        <Card>
          <CardContent className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="text-stack max-w-xl">
              {eyebrow ? (
                <p className="text-xs tracking-widest text-muted-foreground uppercase">{eyebrow}</p>
              ) : null}
              <h2 className="text-heading-3">{heading}</h2>
              {body ? <p className="text-sm text-muted-foreground">{body}</p> : null}
            </div>

            <div className="w-full md:max-w-sm">
              {status.state === 'success' ? (
                <p className="text-sm" role="status">
                  {status.message}
                </p>
              ) : (
                <form onSubmit={onSubmit} noValidate={false}>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label htmlFor={emailId} className="sr-only">
                      Email address
                    </label>
                    <Input
                      id={emailId}
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      disabled={status.state === 'loading'}
                    />
                    <div aria-hidden="true" className="absolute top-auto left-[-9999px]">
                      <input name="company" type="text" tabIndex={-1} autoComplete="off" />
                    </div>
                    <Button type="submit" disabled={status.state === 'loading'}>
                      {status.state === 'loading' ? 'Subscribing…' : buttonLabel}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Double opt-in. Unsubscribe anytime.
                  </p>
                  {status.state === 'error' ? (
                    <p className="mt-2 text-xs text-destructive" role="alert">
                      {status.message}
                    </p>
                  ) : null}
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
