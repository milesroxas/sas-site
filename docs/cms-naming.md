# CMS naming standards

Conventions for naming tabs, groups, fields, blocks, and admin copy across the Payload admin. Written after the WorkPages restructure (Opening / Composition tabs, shared overrides toggle); use it to audit the rest of the CMS.

## Principles

1. **Name by editorial role, not by field name.** A tab or group label answers "what am I doing here?", not "what is this field called". `Opening` and `Composition` over `Hero` and `Layout`. A label that merely repeats the field name inside it (`Layout` tab holding the `layout` field) adds zero information — rename it.
2. **One meaning per word.** Never let the same word mean different things at different levels. Reserved vocabulary below.
3. **Canonical vs. website is always explicit.** Content Hub collections hold canonical content; website collections hold presentation. Any field that shadows canonical content is an override, follows the override pattern, and its description names the canonical source it falls back to.
4. **Descriptions state behavior, not intent.** "Leave empty to use the canonical title." beats "The title for this page." If a field resolves against another source, the description says what wins.
5. **Labels may diverge from schema names freely.** Schema names are the developer/API contract; labels are editor language. A schema rename requires the name to be *wrong*, *colliding at the same level*, or *breaking extraction* (TEXT_KEYS) — never just label drift. When a label diverges, set `label` on the field and keep the name.

## Reserved vocabulary

| Word | Only ever means | Never means |
|------|-----------------|-------------|
| `layout` | An arrangement-variant select on a block or hero (`centered-media`, `text-left`, `grid`) — and the page-level blocks field named `layout` | A tab or group label |
| Composition | The tab holding the page's `layout` blocks field | — |
| Opening | The tab holding the full-screen sections before the composition (hero, intro) | — |
| Closing | The tab holding the full-screen band above the footer bar | — |
| `theme` | Section surface select (`light`, `dark`, `neutral`, `brand`) within the visitor's site theme | Light/dark mode |
| `source` | Which complete canonical section a block pulls from (`context`, `challenge`, …, `custom`) | A Story Beat (use `storyBeatKey`) or attribution/credit (use `credit`) |
| `*Override` | Website-only value that wins over canonical content when set; never copies it | A default or fallback |
| `internal*` | Team-only content, excluded from every public surface (RAG, llms.txt, API) | — |
| Canonical | The Content Hub record (case study, project, …) | The website page |

## Tabs

Standard tab set for website page collections (in order; omit tabs a collection doesn't need):

`Content Source` → `Opening` → `Composition` → `Assets` → `Related Work` → `Closing` → `SEO`

- **Content Source** — the relationship to the canonical Content Hub record.
- **Opening** — full-screen sections before the composed body (hero group, intro group). Give the tab a `description` naming its sections.
- **Composition** — the `layout` blocks field. Website composition only; canonical narrative stays in the hub.
- **Closing** — the full-screen band above the footer bar. Inherits the Footer global; the page may hide it or override fields. Never copy Footer content onto the page.
- Content Hub collections name tabs by content role instead. Case Studies use `Overview`, `Narrative`, `Objectives & Decisions`, `Evidence`, and `Asset Libraries`; don't force the website tab set onto hub collections.
- Tabs are label-only unless they have a `name` — keep them unnamed so labels can change freely without schema impact.

## Groups and collapsibles

- **Named `group`** only when the data shape should nest (`hero.eyebrow`, `intro.title`). Renaming a group renames DB columns and types — pick the name once, carefully. Give reusable groups an `interfaceName` (e.g. `WorkIntro`).
- **`collapsible`** for pure visual organization inside a group or tab (`Content`, `Media & layout` inside `hero`). Label-only, no schema impact — prefer it when in doubt.

## Fields

- camelCase names; select option values in kebab-case (`centered-media`, `outcome-summary`) with auto-derived labels.
- Reader-facing plain-text fields must use a name in `TEXT_KEYS` (`src/shared/content/extract.ts`) or be `<key>Override` of one, or the copy is invisible to RAG/llms.txt. richText fields are picked up automatically. `internal*` is always excluded.
- Boolean admin toggles read as verbs or states: `showOverrides`, `featured`, `browseAllMedia` — never `isX`/`hasX`.
- A Story Beat is always owned by a canonical narrative section. Presentation records store the section in `source` and the optional stable beat key in `storyBeatKey`; never add a global `story-beat` source value.

## Overrides

One pattern everywhere (`src/fields/overrides.ts`):

- `showOverridesField()` — checkbox labeled "Show override fields". Visibility only; hiding never clears values, and saved overrides still apply while hidden (the description says so).
- `overridesVisible` — the `admin.condition` on every sibling override field.
- Override fields are named `<canonicalKey>Override` (`titleOverride`, `summaryOverride`, `bodyOverride`) and resolve at render time with `override || canonical`. Content is never copied between records.

## Blocks

- Slug: camelCase with a domain prefix (`caseStudyStorySection`, `featureStatementGrid`); `interfaceName`: PascalCase slug + `Block` suffix (`CaseStudyStorySectionBlock`).
- Labels: `Domain: thing` for shared families (`Feature: statement grid`), plain nouns for collection-specific blocks (`Story section`).
- `dbName`: short static name (`wp_story`) when the block has one parent collection; a **function** `dbName` when reused across parents (see `src/blocks/split-content/config.ts`) — a static name would collapse every parent into one table.

## Sidebar groups

`admin.group` is one level deep; Payload has no nested nav groups (open requests since 2024, nothing shipped as of 3.88). Split by editorial role instead, with a shared prefix so related groups read as one family:

| Group | Holds |
|-------|-------|
| `Website: Pages` | Publishing surfaces with public URLs (Pages, Posts, Work, Lab, Expertise, Audience, Contact) |
| `Website: Landing` | Editor-configured entry points (Home, Insights Index, Works Index) |
| `Website: Globals` | Site-wide chrome and identity (Header, Footer, Site Info) |

Ordering rule: groups appear in first-appearance order over `[...collections, ...globals]`, so a group holding only globals always sits below every collection-only group. Renaming a group label resets each user's collapsed state for it once (preferences are keyed by label).

## Cleanup status (swept 2026-07-31)

Applied across the CMS:

- [x] `WorkPages` — Opening / Composition tabs; hero collapsibles + overrides toggle; `label: 'Composition'` on the `layout` field.
- [x] `LabPages` — `Presentation` split into Opening / Composition / Assets; hero collapsibles + overrides toggle.
- [x] `Pages`, `Home`, `ExpertisePages`, `AudiencePages` — `Hero` → `Opening`, `Content` → `Composition` (+ field label). `Positioning` kept (content-role name).
- [x] `Posts` — `Meta` tab relabeled `Related & Categories` (collided with the SEO tab's `meta` name). `Content` tab kept — it holds the actual post body, not a composition.
- [x] Content Hub collections (`CaseStudies`, `LabProjects`) — tabs are organized by editorial role; Case Study narrative and structured records are separated.

Still open (schema decisions, not label drift — decide before removing):

- [ ] `WorkPages.hero.theme` / `mediaTreatment` / `summaryOverride` and `LabPages.hero.theme` / `mediaTreatment` — config no hero component currently reads (Lab reads `summaryOverride`; Work does not). Wire up or remove.
