'use client'

import { Chat } from '@ai-sdk/react'
import { DefaultChatTransport, generateId } from 'ai'
import { usePathname } from 'next/navigation'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AskFeedback } from './feedback'
import type { AskHandoffSent } from './HandoffPanel'
import { ASK_HANDOFF_DRAFT_EMPTY, type AskHandoffDraft, type AskUIMessage } from './handoff'
import {
  type AskJourneyOpenVisit,
  type AskJourneyVisit,
  journeyDigest,
  openVisitSeconds,
} from './journey'

/**
 * One Ask conversation for the whole site. The takeover menu, the closing
 * band and the /ask page each used to mount their own chat, so a question
 * asked in the menu was unknown to the band under the same page. They now
 * read this session: one transcript, one chat id in the log, one handoff, one
 * set of ratings, whichever surface the visitor picks up next. It sits in the
 * root providers, above the header and every page, so it survives client-side
 * navigation; a full reload starts a new conversation, as before.
 *
 * It also keeps the visitor's journey (journey.ts) and sends it beside every
 * question, with the page the question was asked on, so the endpoint knows
 * where the visitor is and what they have been reading.
 */
type AskSession = {
  chat: Chat<AskUIMessage>
  sent: AskHandoffSent | null
  setSent: (sent: AskHandoffSent | null) => void
  ratings: AskFeedback['ratings']
  setRatings: React.Dispatch<React.SetStateAction<AskFeedback['ratings']>>
  /** The handoff form as the visitor left it, whichever surface they typed it in. */
  draft: AskHandoffDraft
  setDraft: React.Dispatch<React.SetStateAction<AskHandoffDraft>>
  /** A new conversation: a new chat id, an empty transcript, nothing sent, rated, or drafted. The journey stays. */
  reset: () => void
}

const AskSessionContext = createContext<AskSession | null>(null)

/** The site's one conversation, or null outside the provider (stories, tests, the admin). */
export const useAskSession = (): AskSession | null => use(AskSessionContext)

const scrollDepth = (): number => {
  const { scrollHeight } = document.documentElement
  if (scrollHeight <= 0) return 0
  return Math.min(100, ((window.scrollY + window.innerHeight) / scrollHeight) * 100)
}

/**
 * The journey, kept in refs: it changes on every scroll and must never render
 * anything. Time counts only while the tab is visible.
 */
function useAskJourney(): () => AskJourneyVisit[] {
  const pathname = usePathname()
  const closed = useRef(new Map<string, AskJourneyVisit>())
  const open = useRef<AskJourneyOpenVisit | null>(null)

  useEffect(() => {
    const visible = document.visibilityState === 'visible'
    open.current = { path: pathname, seconds: 0, depth: 0, since: visible ? Date.now() : null }
    return () => {
      const visit = open.current
      if (!visit) return
      const earlier = closed.current.get(visit.path)
      // Re-inserted so the map's order is the order pages were last seen in.
      closed.current.delete(visit.path)
      closed.current.set(visit.path, {
        path: visit.path,
        seconds: (earlier?.seconds ?? 0) + openVisitSeconds(visit, Date.now()),
        depth: Math.max(earlier?.depth ?? 0, visit.depth),
      })
      open.current = null
    }
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      const visit = open.current
      if (visit) visit.depth = Math.max(visit.depth, scrollDepth())
    }
    const onVisibility = () => {
      const visit = open.current
      if (!visit) return
      const now = Date.now()
      if (document.visibilityState === 'visible') {
        visit.since ??= now
      } else {
        visit.seconds = openVisitSeconds(visit, now)
        visit.since = null
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return useCallback(() => journeyDigest(closed.current.values(), open.current, Date.now()), [])
}

export function AskSessionProvider({ children }: { children: React.ReactNode }) {
  const journey = useAskJourney()
  const transport = useMemo(
    () =>
      new DefaultChatTransport<AskUIMessage>({
        api: '/api/ask',
        // Resolved per request, so it is the page the question was asked on
        // even after client-side navigation, and the journey up to that moment.
        body: () => ({ pagePath: window.location.pathname, journey: journey() }),
      }),
    [journey],
  )
  const newChat = useCallback(
    () => new Chat<AskUIMessage>({ id: generateId(), transport }),
    [transport],
  )
  const [chat, setChat] = useState(newChat)
  const [sent, setSent] = useState<AskHandoffSent | null>(null)
  const [ratings, setRatings] = useState<AskFeedback['ratings']>({})
  const [draft, setDraft] = useState<AskHandoffDraft>(ASK_HANDOFF_DRAFT_EMPTY)

  const reset = useCallback(() => {
    setChat(newChat())
    setSent(null)
    setRatings({})
    setDraft(ASK_HANDOFF_DRAFT_EMPTY)
  }, [newChat])

  const session = useMemo<AskSession>(
    () => ({ chat, sent, setSent, ratings, setRatings, draft, setDraft, reset }),
    [chat, sent, ratings, draft, reset],
  )

  return <AskSessionContext value={session}>{children}</AskSessionContext>
}
