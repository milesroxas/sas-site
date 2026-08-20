# AEO — answer-engine optimization

How this site stays visible and citable in AI answers (ChatGPT, Claude, Perplexity, Microsoft
Copilot, Google AI Overviews), what is automated, and what editors and operators still own.

Implementation lives in the in-repo Payload plugin: [src/plugins/aeo](../src/plugins/aeo/README.md).

## What the research says (July 2026, condensed)

Ranked by evidence strength:

1. **Server-rendered content is non-negotiable.** AI crawlers (except Google's) do not execute
   JavaScript. Our pages are server components, so this holds by construction — keep it that way:
   copy that only exists inside a client component is invisible to AI engines.
2. **Classic indexing still gates citations.** Google's index feeds AI Overviews; Bing's index
   fully gates Copilot and partially feeds ChatGPT (its Bing dependence declined through
   2025–26 in favor of OpenAI's own crawler and Google-derived data); Perplexity runs its own
   index; Claude search rides Brave's. Practical consequence: be indexed everywhere, allow the
   AI search bots in robots.txt (we do — explicit allow-list in `next-sitemap.config.cjs`).
3. **Content structure measurably moves citation rates.** The only peer-reviewed causal study
   (Princeton GEO, KDD 2024): adding cited sources, statistics, and expert quotations lifted
   generative-engine visibility 30–115%. Fluency alone gained ~28%. Keyword stuffing did nothing.
4. **Freshness is a retrieval filter.** ~half of AI citations go to content under ~13 weeks old.
   Update cornerstone pages quarterly, with honest dates.
5. **Third-party presence often beats your own site.** Marketing pages are ~3% of cited URLs for
   recommendation queries; listicles, directories (Clutch, G2), Reddit, LinkedIn dominate.
   Entity consistency matters: identical name/description across those profiles.
6. **Structured data helps comprehension, not directly citations.** Microsoft confirms its LLMs
   use schema markup; a matched-control study found no direct citation lift. We ship it because
   it's cheap entity disambiguation.
7. **llms.txt is a hedge.** ~97% of llms.txt files receive zero AI-bot requests; Google says it
   won't use it. Ours is generated for free from the CMS, so we serve it — expect nothing.
   Markdown alternates are the more real agent surface: coding/browsing agents send
   `Accept: text/markdown` today.

## What is automated (per collection, no per-page work)

For every collection listed in `AEO_CONTENT_SECTIONS` (pages, posts, work-pages,
expertise-pages, audience-pages, lab-pages):

- Published docs appear in **/llms.txt** (and posts' full bodies in **/llms-full.txt**).
- Publish/unpublish/delete/slug-change triggers cache revalidation and an **IndexNow** ping
  (production only) so Bing/Copilot and friends re-crawl quickly.
- Posts get **markdown alternates**: `/posts/[slug].md` and `Accept: text/markdown`.
- Detail routes render **JSON-LD** (BlogPosting / Service / CreativeWork + BreadcrumbList) and a
  **canonical URL**; the root layout renders Organization + WebSite from the **Site Info** global.

Adding a new public collection: see the checklist in the
[plugin README](../src/plugins/aeo/README.md#adding-a-new-public-collection).

## What editors own (the part automation can't do)

The research is blunt: structure and citations in the content itself move AI visibility more
than any technical plumbing. When writing or updating pages:

- **Answer first.** Open each section with a direct 40–80-word answer, then elaborate. Question-
  format H2s that match how people actually ask. Each section should stand alone — retrieval
  systems quote chunks, not pages.
- **Make Story Beats retrieval-sized.** In Case Study Content, a beat should carry one
  self-contained idea with an honest heading. Work Pages render these server-side, and the Ask
  corpus hydrates them from the canonical record, so the same unit can support a web section and
  a future answer, deck, or proposal without copied text.
- **Every cornerstone page carries at least one named-source statistic and one attributable
  quote.** This is the single strongest proven lever.
- **Keep dates honest and content genuinely fresh** — quarterly passes over money pages.
- **Keep the entity consistent off-site**: same company name, one-line description, and address
  on LinkedIn, Clutch, Crunchbase, Google Business Profile; add every profile URL to the Site
  Info global's social profiles (it becomes the `sameAs` entity anchor).
- **Meta descriptions matter beyond SERPs** — they're the per-page description in llms.txt and
  JSON-LD.

## Operator runbook

One-time setup:

1. `INDEXNOW_KEY` in Vercel production env (`openssl rand -hex 16`). Key is served at
   `/indexnow.txt`; pings only fire on production deployments.
2. Fill the **Site Info** global in `/admin` (Website group).
3. Verify the site in **Bing Webmaster Tools** (one-click GSC import) + submit sitemap. Bing's
   index gates Copilot entirely, and BWT's **AI Performance** report (2026) is the only
   first-party dashboard of AI citations — track Citation Share there.
4. Google Search Console: already standard; AI Overviews need nothing extra.

Monitoring:

- BWT → AI Performance (citations, grounding queries) and IndexNow Insights (submission →
  crawl → index funnel).
- GA4: add a custom "AI traffic" channel group (`chatgpt|openai|perplexity|claude|gemini|
  copilot` referrer regex) above Referral; expect low volume, ~10–20× conversion.
- Server logs / Vercel firewall: AI user-agent hits confirm crawlers actually reach the site.

## Boundaries and gotchas

- **robots.txt** is generated at postbuild by `next-sitemap` from `next-sitemap.config.cjs`;
  don't hand-edit `public/robots.txt`. Policy: explicit allow for AI search, user-triggered, and
  training bots — training-bot access is a business decision that does not affect search-citation
  eligibility, revisit if content-licensing posture changes.
- **Lexical → markdown must use the plugin's pure walker**, never
  `convertLexicalToMarkdown` in server code — see the
  [plugin README](../src/plugins/aeo/README.md#markdown-conversion--important-constraint).
- **Deliberately skipped** (evaluated and rejected July 2026): Bing URL Submission API (legacy),
  Google Indexing API (job postings only), WebSub (no engine consumes it), `llms-full.txt`
  bodies for block-built pages (blocks don't flatten honestly), paid AI-visibility tooling
  (revisit if AI referral volume warrants).
