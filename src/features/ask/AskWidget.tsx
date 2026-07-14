'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

type AskResult = {
  answer: string
  sources: { title: string; url: string }[]
}

export function AskWidget() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<AskResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = question.trim()
    if (trimmed.length < 3 || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })
      const data = (await res.json()) as AskResult & { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong — try again.')
        return
      }
      setResult(data)
    } catch {
      setError('Something went wrong — try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask something about our work, services, or insights…"
          maxLength={500}
          rows={3}
          required
        />
        <Button type="submit" disabled={loading || question.trim().length < 3}>
          {loading ? (
            <>
              <Spinner /> Thinking…
            </>
          ) : (
            'Ask'
          )}
        </Button>
      </form>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="whitespace-pre-wrap">{result.answer}</p>
            {result.sources.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm font-medium">Sources</p>
                <ul className="flex flex-col gap-1">
                  {result.sources.map((source) => (
                    <li key={source.url}>
                      <Link href={source.url} className="text-sm underline underline-offset-4">
                        {source.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
