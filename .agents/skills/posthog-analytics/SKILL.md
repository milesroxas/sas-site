---
name: posthog-analytics
description: How PostHog is wired in this repo and how to extend it. Use when a new feature or change should be measured (a conversion, a funnel step, a new form or endpoint), when adding, renaming, or removing a PostHog event or property, when touching consent, the analytics providers, the /ingest proxy, session replay, or PostHog env vars, and when building or updating PostHog dashboards and insights for this site.
---

# PostHog in sas-site

PostHog is the only product analytics and session replay tool. Sentry owns errors. Reb2b is a separate marketing tool, not analytics. Do not add a second tracker or recorder (GA4, Clarity, GTM, Sentry Replay were removed on purpose).

## Map

| Piece | File | Owns |
|-------|------|------|
| Browser client | `src/providers/Analytics/PostHog.tsx` | Consent gate, idle dynamic import, `posthog.init` options, replay config, opt in/out on consent change |
| Scope rules | `src/utilities/analyticsScope.ts` | `environment` value, dev capture switch, `sas_internal` team cookie. Shared by client and server |
| Server capture | `src/utilities/posthog.ts` | `captureServerEvent`: the only way conversions are sent |
| Proxy | `next.config.ts` rewrites | `/ingest/*` to PostHog (ad-blocker safe). Needs `skipTrailingSlashRedirect: true` |
| Consent categories | `src/providers/Consent/index.tsx` | c15t `necessary` / `measurement` / `marketing` |
| Env | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_CAPTURE_DEV` | See README env table |

Project: PostHog US cloud, project id `512227`.

## Invariants

- **Consent:** analytics loads only when `useConsentManager().has('measurement')` is true. Never gate on `hasConsented()` (it breaks consent-exempt regions).
- **Never import `posthog-js` statically.** The provider dynamic-imports it after consent and idle so it stays out of first-load JS. A static import anywhere pulls it into the page graph.
- **Replay:** `captureCanvas.recordCanvas: false` stays. WebGL heroes would re-encode and upload canvas frames. Sampling lives in PostHog project settings, not code.
- **No exception capture** on either SDK. Sentry already hooks errors; enabling it double-bills.
- **`person_profiles: 'identified_only'`** and no `identify()`: the site has no public login, so visitors stay anonymous.
- **Scope:** every event gets `environment` (production / preview / development) automatically. Local dev sends nothing unless `NEXT_PUBLIC_POSTHOG_CAPTURE_DEV=true`. A browser that visited `?internal=on` is never captured, client or server.

## Adding a conversion (the common case)

Conversions are captured on the server, at the point the action is known to have succeeded, not from a button click.

```ts
import { captureServerEvent } from '@/utilities/posthog'

captureServerEvent({
  headers: req.headers,
  fallbackDistinctId: `inquiry:${created.id}`,
  event: 'inquiry_submitted',
  properties: { inquiry_type: type, from_ask: Boolean(askConversation) },
})
```

1. Call it after the write succeeds, in the endpoint or an `afterChange` hook (`operation === 'create'`). It returns void and flushes after the response via `afterResponse`, so it is safe inside a Payload transaction. Never `await` it or wrap it in your own try/catch.
2. Always pass `req.headers`: they carry `x-posthog-distinct-id` and `x-posthog-session-id`, which tie the event to the visitor, their session, and their replay.
3. `fallbackDistinctId` is `<entity>:<doc id>` (or `<entity>:${crypto.randomUUID()}` when there is no row). It is used only when the browser sent no id (email links, server-to-server).
4. Add the event to the registry below in the same change.

### Naming and properties

- Event: snake_case, `object_verb` in past tense: `newsletter_signup_confirmed`, `ask_handoff_clicked`. Reuse an existing event with a new property before inventing a near-duplicate.
- Properties: snake_case, **metadata only**: enums, booleans, counts, lengths, durations (`latency_ms`), CMS document ids, `page_path`.
- **Never send free text or contact data:** no emails, names, phone numbers, message bodies, Ask question text. PostHog cannot hold them to the site's retention window and they would sit next to a visitor id. Use `question_length`, not the question.
- Do not set `environment`, `$session_id`, or `$process_person_profile` yourself; the helper does.
- Renaming an event or property breaks every insight that uses it. Prefer adding the new one, update the dashboards, then remove the old one.

### Client-side events

There are no client `capture` call sites today: pageviews, `$pageleave`, autocapture, and replay cover browsing. If something purely client-side must be counted (no request reaches the server), that is a new pattern: it has to reuse the provider's consent-gated instance without a static import. Propose the approach before building it.

## Event registry

| Event | Properties | Source |
|-------|------------|--------|
| `inquiry_submitted` | `inquiry_type`, `from_ask`, `capability_count` | `src/collections/Inquiries/endpoints.ts` |
| `form_submitted` | `form_id` | `src/plugins/form-builder.ts` (afterChange) |
| `newsletter_signup_started` | `audience`, `returning` | `src/endpoints/newsletter.ts` |
| `newsletter_signup_confirmed` | none | `src/endpoints/newsletter.ts` |
| `newsletter_unsubscribed` | none | `src/endpoints/newsletter.ts` |
| `ask_questioned` | `is_follow_up`, `source_count`, `question_length`, `handoff_reason`, `outcome`, `retrieval`, `latency_ms`, `page_path`, plus the judge's facts about the turn (see below) | `src/endpoints/ask.ts` |
| `ask_rated` | `rating`, `reason`, `outcome`, `source_count` | `src/endpoints/ask.ts` (`captureAskFeedback`) |
| `ask_handoff_clicked` | `rating`, `reason`, `outcome`, `source_count` | `src/endpoints/ask.ts` (`captureAskFeedback`) |

Verify against code with `grep -rn "captureServerEvent(" src` before relying on this table.

### `ask_questioned`: the judge's properties

Ask's judge (Jev, `src/features/ask/judge.ts`, mode from `ASK_JEV`) adds facts about the turn to the same event. Metadata only: never the question, and never a probability beside text. `latency_ms` measures request start to stream finish; `first_output_ms` is what the visitor feels.

| Property | Type | Meaning |
|----------|------|---------|
| `judge_mode` | `off` / `shadow` / `on` | The mode the turn ran under. Split every latency tile by it |
| `judge_ms` | number, null | Wall time of the turn judgment; null when Jev was not asked |
| `judge_failed` | boolean | Jev was asked and returned nothing (timeout, 429, error) |
| `judge_request` | string, null | The `request` Choice's pick: `information`, `estimate`, `project`, `person`, `conversation`, `other` |
| `judge_confidence` | number, null | That Choice's confidence |
| `judge_agrees` | boolean, null | Shadow only: the card Jev would have shown equals the writing model's. Null when Jev had no decision |
| `chunks_candidates`, `chunks_kept` | number | Retrieved chunks before and after the passage check (equal when no check ran) |
| `passages_ms` | number, null | Wall time of the passage check |
| `first_output_ms` | number, null | Server time to the first text or card chunk |
| `model_skipped` | boolean | The turn was answered with no writing-model call |
| `fell_back` | boolean | Mode `on`, but the turn took the writing model's own path (unsure or failed judgment) |
| `answer_model` | string, null | The writing model's id; null when skipped |
| `journey_pages` | number | Pages of the visitor's journey the index knew and the turn could read: the page asked on plus the pages read before it. 0 in mode `off`, which reads no journey. A count, never the paths |
| `page_leaned` | boolean, null | Jev read the question as pointing at something it does not name (`open_reference`), on a page about one thing. Null when there was no such page |
| `page_attached` | boolean | Mode `on`: the search also ran under the page's title |

## Verifying a change

- Local: set `NEXT_PUBLIC_POSTHOG_CAPTURE_DEV=true`, grant measurement consent, trigger the action, and check the event in PostHog Activity with `environment = development`. Turn the flag back off.
- Or deploy a preview: preview always captures (`environment = preview`).
- Make sure your own browser has not been marked internal (`?internal=off` clears it), or nothing will show up.
- `src/utilities/posthog.test.ts` covers the helper (vitest; CI does not run it, so run it yourself when you touch the helper).

## Dashboards and insights

Dashboards are tagged `sas-analytics`: Leads and acquisition, UX friction, Content engagement, Ask, Data health. Tiles filter `environment = production` and "filter out internal users".

When a new event matters to the business, add or update a tile on the matching dashboard in the same piece of work. With the PostHog MCP server connected (`claude mcp add --transport http --scope local posthog https://mcp.posthog.com/mcp --header "x-posthog-project-id: 512227"`, then authenticate via `/mcp` and start a new session):

- Internal-user filters must use exclusive operators (`is_not`, `not_icontains`). Inclusive ones silently zero every filtered insight.
- Insight queries return cached results; pass a date range override to force a fresh run.
- Ask before changing project settings (sampling, ingestion filters, retention). Those are billing and data decisions.
- Internal filtering is query-time only: server events come from Vercel IPs, so only the `sas_internal` cookie keeps team traffic out of quota.
