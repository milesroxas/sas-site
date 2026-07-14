# AEO plugin

In-repo Payload plugin for answer-engine optimization (AEO/GEO): making the site's content
discoverable, comprehensible, and citable by AI engines (ChatGPT, Claude, Perplexity, Copilot,
Google AI Overviews). Built in-repo because no maintained community plugin exists (evaluated
July 2026: `payload-plugin-llms` is pre-1.0 with an unreachable repo; `payload-plugin-scrape-ai`
is unpublished).

Overview and editorial guidance: [docs/aeo.md](../../../docs/aeo.md).

## What the plugin does

`aeoPlugin()` (registered in [src/plugins/index.ts](../index.ts)) transforms the Payload config:

1. **Adds the `site-info` global** ([siteInfo.ts](./siteInfo.ts)) — editable company identity:
   name, tagline, description, founding year, contact, logo, postal address, social profile URLs
   (`sameAs`), and optional llms.txt notes. Public read. Consumed by JSON-LD, llms.txt, and
   default metadata.
2. **Injects hooks into the public content collections** (`afterChange` + `afterDelete`):
   - revalidates the `llms-txt` cache tag so /llms.txt and /llms-full.txt refresh on
     publish/unpublish/delete;
   - pings [IndexNow](https://www.indexnow.org) ([indexNow.ts](./indexNow.ts)) on publish,
     unpublish, and slug change (the old URL is submitted so engines drop it). Production only.

Which collections participate — and how they render in llms.txt — is defined in one place:
[`AEO_CONTENT_SECTIONS`](./sections.ts).

## Serving surfaces (route handlers, not part of the config transform)

| URL | Source | Notes |
| --- | --- | --- |
| `/llms.txt` | [buildLlms.ts](./buildLlms.ts) `buildLlmsTxt` | Spec-compliant index (llmstxt.org): H1, blockquote tagline, H2 link sections of published docs. Cached with tag `llms-txt`. |
| `/llms-full.txt` | `buildLlmsFullTxt` | Same header; sections with `fullContent` include each doc's body as markdown. |
| `/posts/[slug].md` and `Accept: text/markdown` on `/posts/[slug]` | `buildPostMarkdown` via rewrites in [next.config.ts](../../../next.config.ts) | Markdown alternate for agents. Direct handler lives at `/md/posts/[slug]`. |
| `/indexnow.txt` | [route](../../app/(frontend)/(ai)/indexnow.txt/route.ts) | IndexNow key file, served from `INDEXNOW_KEY`. 404 when unset. |

Route handlers live in `src/app/(frontend)/(ai)/`.

JSON-LD is a sibling concern wired per route, not by the plugin: builders in
[src/utilities/schema.ts](../../utilities/schema.ts) (typed with `schema-dts`), rendered by
[`<JsonLd>`](../../components/JsonLd/index.tsx). Organization + WebSite render site-wide from the
root layout; BlogPosting / Service / CreativeWork / BreadcrumbList render in the detail routes.

## Options

```ts
aeoPlugin({
  disabled?: boolean            // keep the site-info schema, skip hooks
  content?: AeoContentSection[] // override AEO_CONTENT_SECTIONS
})
```

## Adding a new public collection

1. Add a line to `AEO_CONTENT_SECTIONS` (`collection`, section `title`, `urlPrefix`; set
   `fullContent: { richTextField }` only if the body is a single richText field). This enrolls it
   in llms.txt, cache revalidation, and IndexNow simultaneously.
2. Render `<JsonLd>` in its detail route (pick the schema.org type in `schema.ts`) and pass
   `pathname` to `generateMeta` for the canonical URL.

## Markdown conversion — important constraint

Do **not** use `convertLexicalToMarkdown` from `@payloadcms/richtext-lexical` inside Next route
handlers or server components. It instantiates a headless Lexical editor whose node classes must
be identity-equal with the field's — and the Next server bundle can carry two copies of `lexical`
(esm/cjs dual-package hazard), which makes conversion fail with errors like
`HorizontalRuleServerNode … does not subclass LexicalNode` or silently degrade. It works under
`payload run` (single module graph), which makes the failure look intermittent.

Use [`lexicalToMarkdownString`](./lexicalToMarkdown.ts) instead: a pure serializer over the
Lexical JSON tree — no editor instantiation, no module coupling. It covers the node types this
site's editors enable (headings, lists, quotes, links, horizontal rules, inline formatting, code
blocks, and blocks carrying a nested richText `content` field). If an editor gains a new node
type, extend the walker.

## IndexNow behavior

- Fires only when `INDEXNOW_KEY` is set **and** `VERCEL_ENV === 'production'` — previews and
  local dev never ping engines, so the key is safe to set in every environment.
- Batch POST to `https://api.indexnow.org/indexnow`; propagation to all participating engines
  (Bing/Copilot, Yandex, Naver, Seznam, Amazonbot, Internet Archive) is automatic. Google does
  not consume IndexNow.
- Submission is a hint, not a transaction: 200/202 are success, anything else is logged and
  dropped. No retries. Runs after the response via Next `after()` so publishing is never delayed.
- Respects `context.disableRevalidate` (seed scripts and bulk operations skip pings).
- Verify submissions in Bing Webmaster Tools → IndexNow Insights.

## Operational setup (one-time, manual)

1. Set `INDEXNOW_KEY` in Vercel production env (`openssl rand -hex 16`).
2. Fill the **Site Info** global in `/admin` — social profile URLs especially: the `sameAs`
   array is the entity anchor AI engines use to reconcile the brand across the web.
3. Verify the site in Bing Webmaster Tools (one-click Google Search Console import) and submit
   the sitemap. The **AI Performance** report there is the only first-party AI-citation
   analytics available anywhere.
4. robots.txt policy (explicit allow for AI crawlers) lives in
   [next-sitemap.config.cjs](../../../next-sitemap.config.cjs) and regenerates at postbuild.
