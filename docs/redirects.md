# Redirects

Legacy paths (the Webflow site's `/blog/*`, `/portfolio-work/*`, `/services` and friends) redirect to their new homes with a 308. The team keeps the list in the CMS; Vercel serves it at the CDN before any route runs, so a redirect never invokes a function, never touches Postgres and never needs a deploy.

## Where the list lives

The `redirects` collection (admin: System, Redirects; MCP: `findRedirects`, `createRedirects`, `updateRedirects`, `deleteRedirects`). Each rule has:

- `from`: the old path on this site, starting with a slash. Exact match only: `/blog` catches `/blog` and nothing under it; an old article needs its own rule. Vercel ignores any query string in `from`.
- `to`: a document (the path comes from `CONTENT_SURFACES`, so a work page resolves to `/works/<slug>`) or a custom URL (a site path or an absolute URL).

## How it reaches the site

`src/hooks/syncVercelRedirects.ts`, on every save and delete:

1. Reads the whole collection through the saving request (so the row being saved is included).
2. Maps it to Vercel's rule shape: `permanent: true` (308), `preserveQueryParams: true`. A rule it cannot serve is skipped with a warning in the logs (a `from` without a leading slash, a destination that does not resolve, a rule pointing at itself).
3. Stages the list as a new Bulk Redirects version (`PUT /v1/bulk-redirects`, `overwrite: true`) and promotes it (`POST /v1/bulk-redirects/versions`, `action: promote`).

The rule is live when the save returns. A failed push logs an error and keeps the save; re-save any redirect to push the full list again.

Bulk redirects are project-level: one list serves production and every preview deployment. That is why the sync runs only on the production deployment (`VERCEL_ENV === 'production'`); a preview branch's table must never replace production's rules. Local and preview saves log `Redirects: Vercel sync is off` and do nothing.

## Environment

Set in Vercel, Production environment only:

| Variable | Value |
|----------|-------|
| `VERCEL_TOKEN` | A Vercel access token scoped to the SAS team (Account, Tokens). |
| `VERCEL_TEAM_ID` | `team_N0o3Vd8BS5Xi2133Jvs2EAfy` |

`VERCEL_PROJECT_ID` is a Vercel system variable and needs no setting. Leave the token and team id unset in preview and locally.

## Verifying

```sh
curl -sI https://www.suits-sandals.com/blog | grep -i -E '^(HTTP|location)'
```

Expect `HTTP/2 308` and `location: /insights`. The response carries no `x-vercel-cache` header: it never reached the app.

Vercel, Project, Settings, Redirects lists every version with its rule count; an older version can be restored there or with `vercel redirects` (CLI 50.1.0 or newer).

## Limits

- Pro includes 1,000 rules per project; more is $0.002 a month per extra 25,000.
- API rate limits: 30 stages and 20 promotes a minute. A bulk import over MCP at one rule a second stays under both.
- No wildcard or header matching. A pattern rule belongs in `redirects.ts` (Next config), which still carries the Internet Explorer rule.
- `skipTrailingSlashRedirect` is on in `next.config.ts`, so `/blog/` is not `/blog`. The old site published paths without trailing slashes.
