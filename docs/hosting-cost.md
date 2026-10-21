# Hosting cost and the database wake budget

What the site spends on Vercel and Neon, what drives it, and how to check. Reviewed 2026-10-21. Numbers below are from that review; re-measure before acting on them.

## Where the money goes

| Line | Then (Oct 2026) | Driver |
|------|-----------------|--------|
| Neon compute | about 173 CU-hours a month, about $18 | The production compute was awake 91% of the month |
| Vercel usage | about $0.20 a day | Function Storage (retained Payload bundles), Fluid Active CPU, Deployment Storage, ISR Writes |
| Vercel Pro seat | fixed | |

Neon is on the Launch plan through the Vercel marketplace: $0.106 per CU-hour, $0.35 per GB-month, no included hours. Every hour the database is awake is billed, so the cost question is "how often does it wake, and for how long", not "how many queries".

The production endpoint is `ep-holy-breeze-ambjqnk9`: 0.25 to 2 CU, suspends after 300 s idle. One wake therefore costs at least 5 minutes of 0.25 CU, and anything that touches Postgres more often than every 5 minutes keeps it on around the clock.

## What wakes it

Measured over 24 hours before the fixes, function invocations by route:

| Route | Invocations | Touches Postgres | Shape |
|-------|-------------|------------------|-------|
| `/api/[...slug]` (Payload REST: admin, MCP, Ask, forms, cron) | 676 | yes | daytime, the team |
| `/[slug]` (root catch-all) | 205 | before the fix, every unknown slug | night bursts, crawlers probing paths nobody owns |
| sitemaps | about 460 | no, data cache | crawlers |
| `/` | 39 | on regeneration only | |

Compute starts on the production endpoint ran at about 85 a day, flat across every hour, which is the signature of machines, not people.

Things that do not wake it: static pages served from the CDN, the sitemaps (`unstable_cache`, tag-purged), the PostHog proxy (`/ingest`), the Sentry tunnel (`/monitoring`), media (R2).

## The rules that keep it asleep

1. **Unknown slugs never reach Postgres.** `src/utilities/publishedSlugs.ts` holds the published slugs of each slug-addressed collection in the data cache under that collection's sitemap tag. `createSlugQuery` (`src/utilities/slugRoute.ts`), the root `[slug]` page and `posts/[slug]` check it before querying. The publish hooks (`slugPageRevalidation`) purge the tag on publish, unpublish, delete and slug change, so a page published over MCP is reachable on its next request. Draft mode bypasses the check. A new slug route must use `createSlugQuery` or call `isPublishedSlug` itself.
2. **Index pages regenerate on publish, not on a timer.** `revalidate` on `/posts`, `/insights`, `/insights/[topic]`, `/lab`, `/works` and `/post` is 86400 and on `/` is 3600. The collection hooks purge those paths on publish (`revalidateIndex`, `consumerPaths`). A short window there only lets crawlers regenerate the page all night. Do not lower these to "keep content fresh": fix the hook instead.
3. **The hourly cron is the only clock.** `vercel.json` calls `/api/payload-jobs/run` at the top of each hour. That is the one scheduled wake. Scheduled publishes and newsletter retries land within the hour by design (see README, Deployment).
4. **GraphQL is off** (`graphQL: { disable: true }` in `payload.config.ts`). The site uses the Local API, MCP uses REST. Do not turn it back on for one query.
5. **Ask is bot-gated.** `/api/ask` is in `BOT_PROTECTED_ROUTES` and the handler refuses unverified bots after the rate limit. Every call spends OpenAI tokens; the in-memory limiter is per warm instance and is a fuse, not a wall.
6. **Preview branches are small and expire.** Neon's project default for new endpoints is 0.25 to 2 CU. The standing `preview` branch (the canary created from the dashboard, see README) carries a 30-day expiry; the Neon action recreates it on the next preview deploy. Delete `preview/*` branches you no longer need: each one holds its own compute endpoint.
7. **Migrations use the direct host.** `pnpm ci` runs `payload migrate` with `POSTGRES_URL_NON_POOLING` (the adapter switches on `PAYLOAD_MIGRATING`). Runtime stays on the pooler.

## How to check

Read the Neon side with the project-scoped API key (`NEON_API_KEY` in `.env`, key name `sas-site-conductor-readonly`, created in the SAS org's Neon console from Vercel, Storage, Open in Neon):

```bash
export NEON_API_KEY=$(grep '^NEON_API_KEY=' .env | cut -d= -f2-)
neonctl projects get ancient-glade-63337246 -o json      # compute_time_seconds, active_time_seconds this cycle
neonctl branches list --project-id ancient-glade-63337246
```

Compute starts per day come from the operations log (the CLI does not list endpoints; use the API):

```bash
python3 - <<'PY'
import os,json,urllib.request,collections
P='ancient-glade-63337246'; H={'Authorization':'Bearer '+os.environ['NEON_API_KEY']}
ops=json.load(urllib.request.urlopen(urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{P}/operations?limit=1000',headers=H)))['operations']
days=collections.Counter(o['created_at'][:10] for o in ops if o['action']=='start_compute' and o.get('endpoint_id')=='ep-holy-breeze-ambjqnk9')
for d,c in sorted(days.items()): print(d,c)
PY
```

Target after the fixes: starts near the hourly cron plus real edits, so a few dozen a day at most, and `active_time_seconds` well under half the elapsed cycle. If starts stay high and flat around the clock, find the route: `vercel metrics vercel.function_invocation.count --project sas-site --scope sas-team --group-by route --prod --since 24h -g 1h --json`. Only `route` works as a dimension.

Vercel usage by service: the Vercel MCP `list_billing_charges` tool with a one-day window (`result.byService`). Neon charges are not in that export; they are on the marketplace invoice.

The personal `neonctl` login cannot see this project: it lives in the SAS team's Vercel-managed Neon org. Org-level and consumption-history endpoints answer 404 to the project-scoped key; that is expected.

## Settings that live outside the repo

- Vercel, Project Settings, Deployments, Deployment Retention: Production 7 days, Preview 7 days, keep the last 10. Not settable over the API. Function Storage is the largest Vercel usage line and is the retained bundles.
- Vercel, Project Settings, Build: build machine pinned to basic. Vercel suggests upsizing for sustained CPU; builds are 2 to 5 minutes, leave it.
- Vercel, Storage, Neon: the deployment action creates `preview/<git-branch>`. Git deploys are `main` only (`vercel.json`); previews are created from the dashboard.
- PostHog project settings: session replay sampling. Replay chunks were about 5,500 requests a day on `/ingest/s/`; check the replay quota there, not in code.
- Neon console (from Vercel, Storage, Open in Neon): compute size, suspend timeout, history retention (6 hours), branch list.
