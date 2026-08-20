# PRD: Structured Case Study Content Hub and Website Composer

## Document status

**Status:** Ready for technical planning and implementation
**Repository:** `milesroxas/sas-site`
**Primary application:** Suits & Sandals website and Payload CMS
**Target public route:** `/works/[slug]`
**Implementation approach:** Extend the existing Payload and Next.js application. Do not introduce a monorepo or separate CMS service.

> **Architecture amendment — July 13, 2026:** The Website is a publishing surface, not a tab on a canonical Case Study. The implemented model therefore keeps reusable source material in `case-studies`, creates website presentations in the separate `work-pages` collection under the Website admin group, and manages project media through `asset-libraries` under the Assets admin group. Each Work Page has exactly one canonical Case Study, and each Case Study has at most one Work Page within the Website surface; future surfaces such as pitch decks or lead-generation experiences should use their own presentation collections. Media used by a published Work Page must be public-approved and belong to one of its Case Study's Asset Libraries. Any later requirement in this document that colocates website presentation fields on `case-studies`, or models assets as an ad hoc selected-image list, is superseded by this amendment.

> **Narrative amendment — August 20, 2026:** Canonical Case Study narrative is hierarchical and
> section-owned. `context`, `challenge`, `strategy`, `approach`, `outcomeSummary`, and `learnings`
> each contain an optional section body plus ordered Story Beats. Story Beats are not a global
> bucket and are not a website-only block type. A presentation selects a canonical section in
> `source`, then may select one stable beat within that section using `storyBeatKey`; an empty beat
> selection means the complete section. The Case Study admin separates `Narrative` from structured
> `Objectives & Decisions` and from `Evidence`. Any later flat rich-text or global Story Beat
> requirement is superseded by this amendment.

---

## 1. Instructions for Codex

Before implementing:

1. Read the repository root `AGENTS.md`.
2. Inspect the existing implementations for:

   * `src/collections/Pages`
   * `src/collections/Posts`
   * `src/collections/Media.ts`
   * `src/blocks/RenderBlocks.tsx`
   * `src/utilities/generatePreviewPath.ts`
   * `src/plugins/index.ts`
   * `src/app/(frontend)/[slug]/page.tsx`
3. Follow existing naming, import, access-control, preview, revalidation, and folder conventions.
4. Do not remove or substantially refactor the existing Pages, Posts, Media, Categories, Users, Header, or Footer implementations unless required for compatibility.
5. Use TypeScript and generated Payload types throughout.
6. After schema changes, run:

   * `pnpm generate:types`
   * `pnpm generate:importmap` when admin components or import paths change
   * `pnpm migrate:create` only with explicit user approval (agents must not auto-run it)
   * `pnpm lint`
   * `pnpm exec tsc --noEmit`
   * Relevant integration and end-to-end tests
   * `pnpm build`
7. Do not silently introduce fields, collections, dependencies, or architectural abstractions outside this PRD. Document any necessary deviations.

---

## 2. Product summary

Create a structured content system for Suits & Sandals client work, projects, case studies, evidence, and website presentation.

Content editors must be able to:

1. Create a client organization.
2. Create a project related to that client.
3. Add approved project media and testimonials.
4. Create a reusable case-study narrative related to the project.
5. Creatively compose a public case-study page from the reusable content.
6. Preview the page inside Payload.
7. Publish it at `/works/[slug]`.
8. Make the same structured case-study content available through Payload’s API for future pitch-deck, proposal, email, collateral, and sales applications.

The case study must not be modeled as a generic website page.

The reusable content and the website presentation should live in one Case Study document for the initial implementation, but they must be separated into clearly labeled field groups or tabs.

---

## 3. Product principles

### 3.1 Model business meaning before presentation

Canonical fields should describe the actual engagement:

* Client
* Project
* Context section body and Story Beats
* Challenge section body and Story Beats
* Objectives
* Strategy section body and Story Beats
* Approach section body and Story Beats
* Decisions
* Outcomes section body and Story Beats
* Metrics
* Testimonials
* Assets

Website-specific fields should describe how those facts are presented:

* Section order
* Layout treatment
* Theme
* Media treatment
* Display heading
* Transition copy
* Featured evidence
* Related work

### 3.2 Do not make the website page the source of truth

Other applications must not need to parse website blocks to find:

* The client
* The challenge
* The project capabilities
* The result
* The metrics
* The testimonial
* Approved assets

These must be accessible as explicit Payload fields and relationships.

### 3.3 Support creative website composition

Case-study pages should not be forced into one rigid template.

Editors should be able to create different narrative pacing and section sequences while still sourcing most content from canonical fields.

### 3.4 Avoid premature platform complexity

This phase does not include:

* A separate CMS deployment
* A monorepo
* A pitch-deck application
* A CRM
* Email campaign management
* AI-generated adaptations
* Advanced approval workflows
* Custom user roles
* Confidential digital asset management

The schema should make future consumers possible without building them now.

---

## 4. Current repository context

The repository currently includes:

* Payload CMS 3.85
* Next.js 16 App Router
* React 19
* PostgreSQL
* Vercel Blob storage
* Lexical rich text
* SEO, redirects, search, nested documents, and form-builder plugins
* Drafts, autosave, scheduled publishing, and Live Preview
* Existing collections:

  * `pages`
  * `posts`
  * `media`
  * `categories`
  * `users`
* Existing page layout blocks:

  * Call to Action
  * Content
  * Media
  * Archive
  * Form
* Existing generic route rendering for Pages
* Existing post routes and rich-text rendering
* Existing migration, generated-type, Vitest, and Playwright workflows

The new system should extend these patterns.

---

## 5. Scope

### 5.1 New collections

Create the following collections:

1. `organizations`
2. `projects`
3. `case-studies`
4. `testimonials`
5. `capabilities`
6. `industries`

Extend the existing:

7. `media`

### 5.2 New frontend functionality

Create:

* A public case-study detail route at `/works/[slug]`
* Case-study-specific page composition blocks
* A typed case-study block renderer
* Static parameter generation
* Metadata generation
* Draft and Live Preview support
* On-demand revalidation
* Redirect support
* Related-work rendering

### 5.3 Existing systems that must remain working

* Generic Payload Pages
* Blog Posts
* Existing media rendering
* Header and Footer globals
* Existing preview routes
* Existing page blocks
* Existing site search unless intentionally extended
* Existing sitemap generation
* Existing immersive/WebGL infrastructure

---

## 6. Editorial workflow

### Step 1: Create an organization

An editor creates an Organization representing a client.

Example:

* Name: Northstar Health
* Short name: Northstar
* Industry: Healthcare
* Website
* Logo
* Public description
* Internal notes

### Step 2: Create a project

The editor creates a Project and relates it to the Organization.

Example:

* Internal title
* Public title
* Organization
* Engagement status
* Engagement type
* Start and end dates
* Capabilities
* Scope summary
* Deliverables
* Public summary
* Internal notes

### Step 3: Add project assets and testimonials

The editor uploads Media and tags it with:

* Related project
* Related organization
* Asset purpose
* Usage approval
* Description
* Alt text
* Caption

The editor may also create approved Testimonials related to the Organization and Project.

### Step 4: Create a case study

The editor creates a Case Study and selects its Project.

The Case Study contains the reusable narrative:

* Title
* Thesis
* Summaries
* Context, with optional ordered Story Beats
* Challenge, with optional ordered Story Beats
* Objectives
* Strategy, with optional ordered Story Beats
* Approach, with optional ordered Story Beats
* Key decisions
* Outcomes, with optional ordered Story Beats
* Metrics
* Testimonials
* Selected assets

### Step 5: Compose the website page

Within the separate Work Page presentation, the editor:

* Sets the slug and SEO fields.
* Configures the website hero.
* Adds and reorders website composition blocks.
* Selects canonical narrative sections and, where useful, individual Story Beats.
* Adds optional website-specific headings or transition copy.
* Selects visual layouts and media treatments.
* Previews the final page.

### Step 6: Publish

Publishing the Case Study should:

* Make it available at `/works/[slug]`.
* Trigger route revalidation.
* Make approved structured fields accessible through Payload’s API.
* Preserve previous versions.
* Support future scheduled publishing.

---

## 7. Content model

## 7.1 Organizations

**Slug:** `organizations`
**Admin group:** `Content Hub`
**Use as title:** `name`

### Fields

* `name`

  * Text
  * Required
* `shortName`

  * Text
  * Optional
* `slug`

  * Payload slug field based on `name`
  * Required and unique
* `website`

  * Text
* `logo`

  * Upload relationship to `media`
* `industries`

  * Relationship to `industries`
  * Has many
* `description`

  * Rich text
  * Intended for approved public description
* `internalNotes`

  * Rich text or textarea
  * Authenticated read and update only
* `publishedAt`

  * Follow existing Pages/Posts convention

### Access and versions

* Create, update, and delete: authenticated
* Anonymous read: published documents only
* Authenticated read: all
* Enable drafts and versions
* Enable scheduled publishing if consistent with existing collections

### Default population

When referenced, populate only safe summary fields:

* `name`
* `shortName`
* `slug`
* `logo`
* `industries`

Do not include `internalNotes`.

---

## 7.2 Capabilities

**Slug:** `capabilities`
**Admin group:** `Taxonomy`
**Use as title:** `name`

### Fields

* `name`
* `slug`
* `description`
* `order`

### Access

* Anonymous read
* Authenticated create, update, and delete

Examples:

* Brand strategy
* Digital strategy
* UX design
* Product design
* Design systems
* Web development
* Content strategy

Do not reuse the generic blog `categories` collection for capabilities.

---

## 7.3 Industries

**Slug:** `industries`
**Admin group:** `Taxonomy`
**Use as title:** `name`

### Fields

* `name`
* `slug`
* `description`
* `order`

### Access

* Anonymous read
* Authenticated create, update, and delete

---

## 7.4 Projects

**Slug:** `projects`
**Admin group:** `Content Hub`
**Use as title:** `internalTitle`

### Fields

#### Identity

* `internalTitle`

  * Required
* `publicTitle`

  * Optional
* `organization`

  * Required relationship to `organizations`
* `status`

  * Select:

    * planned
    * active
    * completed
    * archived
* `engagementType`

  * Select or text
* `startDate`
* `endDate`

#### Classification

* `capabilities`

  * Relationship to `capabilities`
  * Has many
* `industries`

  * Relationship to `industries`
  * Has many
  * May default conceptually from the organization but should remain editable
* `platforms`

  * Array of text values for v1
  * Do not create a Platforms collection unless an existing need is found

#### Project facts

* `publicSummary`

  * Rich text or textarea
* `scope`

  * Rich text
* `deliverables`

  * Array:

    * title
    * description
* `constraints`

  * Rich text
* `projectLinks`

  * Array:

    * label
    * URL
    * visibility
* `internalNotes`

  * Authenticated read and update only

#### Relationships

* Optional join or relationship visibility for associated:

  * Case studies
  * Testimonials
  * Media

Use Payload Join fields if they fit the existing version and do not create duplicate relationship ownership. Otherwise omit reverse relationships from v1.

### Access and versions

* Create, update, and delete: authenticated
* Anonymous read: published documents only
* Authenticated read: all
* Drafts and versions enabled

A Project is the factual engagement record. It must not contain website page layout fields.

---

## 7.5 Testimonials

**Slug:** `testimonials`
**Admin group:** `Content Hub`
**Use as title:** use a generated or explicit internal label

### Fields

* `internalTitle`

  * Required
  * Example: “Northstar testimonial — Jane Smith”
* `organization`

  * Required relationship
* `project`

  * Optional relationship
* `speakerName`

  * Required
* `speakerRole`
* `speakerOrganization`

  * Optional override
* `quote`

  * Rich text or textarea
  * Required
* `portrait`

  * Optional Media relationship
* `approvalStatus`

  * Select:

    * unverified
    * client-review
    * approved-public
    * internal-only
* `source`

  * Optional text
* `approvedAt`

  * Date
* `internalNotes`

  * Authenticated only

### Access

Anonymous users may read only published Testimonials with:

* `_status = published`
* `approvalStatus = approved-public`

Authenticated users may read all.

Enable drafts and versions.

---

## 7.6 Media extensions

Extend the existing `media` collection without removing:

* Upload configuration
* Image sizes
* Focal points
* Existing `alt`
* Existing `caption`
* Folder support

### Add fields

* `title`

  * Text
* `description`

  * Textarea
* `organization`

  * Optional relationship to `organizations`
* `project`

  * Optional relationship to `projects`
* `purpose`

  * Select:

    * overview
    * research
    * process
    * strategy
    * wireframe
    * design-system
    * interface
    * environment
    * team
    * result
    * before
    * after
    * motion
    * other
* `usageStatus`

  * Select:

    * internal
    * client-review
    * public-approved
  * Required
* `credit`

  * Text
* `sourceUrl`

  * Text
* `approvedChannels`

  * Select, has many:

    * website
    * pitch-deck
    * proposal
    * email
    * social
* `assetDate`

  * Date

### Important media constraint

The existing implementation uses publicly readable media and Vercel Blob. This phase is not a private or confidential DAM.

Therefore:

* Do not promise file-level confidentiality.
* Do not upload legally sensitive or truly confidential files as part of this implementation.
* Anonymous CMS queries should return only `public-approved` media.
* Existing media must be migrated to a safe compatibility value, most likely `public-approved`, so existing site assets do not disappear.
* Document the limitation that direct public Blob URLs may remain accessible.

### Alt-text handling

* Preserve compatibility with existing records.
* Require alt text for newly uploaded raster or vector images when feasible without breaking non-image uploads.
* Do not make `alt` globally required without considering existing data and non-image media.

---

## 7.7 Case Studies

**Slug:** `case-studies`
**Admin group:** `Content Hub`
**Use as title:** `title`

This is the primary collection for the feature.

### Top-level fields

* `title`

  * Required
* `project`

  * Required relationship to `projects`
* `slug`

  * Generated from title
  * Required and unique
* `publishedAt`

  * Follow the existing publishing convention

### Admin tabs

Use Payload tabs with the following organization:

1. Overview
2. Narrative
3. Objectives & Decisions
4. Evidence
5. Asset Libraries

Website composition, assets, and SEO live on the related `work-pages` presentation collection per
the architecture amendment.

### Overview tab

* `title`
* `project`
* `thesis`

  * Textarea or rich text
* `summaries`

  * Group:

    * `oneLine`
    * `short`
    * `medium`
* `primaryAudience`

  * Select:

    * prospective-client
    * existing-client
    * design-community
    * development-community
    * general
* `featuredCapabilities`

  * Relationship to `capabilities`
  * Has many
* `featured`

  * Checkbox
  * Sidebar is acceptable

### Narrative tab

* `context`

  * Group: optional `body` rich text plus ordered `storyBeats`
* `challenge`

  * Group: optional `body` rich text plus ordered `storyBeats`
* `strategy`

  * Group: optional `body` rich text plus ordered `storyBeats`
* `approach`

  * Group: optional `body` rich text plus ordered `storyBeats`
* `outcomeSummary`

  * Group: optional `body` rich text plus ordered `storyBeats`
* `learnings`

  * Group: optional `body` rich text plus ordered `storyBeats`

Every Story Beat contains:

* `key` — stable within its parent section
* `label` — internal selector label
* `heading` — optional public, channel-neutral heading
* `body` — self-contained rich text

Whole-section consumers compose the section body followed by its beats in order. A body should
not duplicate beat copy.

### Objectives & Decisions tab

* `objectives`

  * Array:

    * title
    * description
* `keyDecisions`

  * Array:

    * `key`

      * Required stable identifier such as `organize-around-user-intent`
    * `title`
    * `problem`
    * `decision`
    * `rationale`
    * `impact`
    * `featured`
The `key` must remain stable so a future presentation system can identify a decision without depending on its array index.

### Evidence tab

* `qualitativeOutcomes`

  * Array:

    * title
    * description
    * featured
* `metrics`

  * Array:

    * `key`
    * `label`
    * `value`
    * `unit`
    * `direction`

      * increase
      * decrease
      * neutral
      * not-applicable
    * `qualifier`
    * `comparisonBaseline`
    * `timeframe`
    * `source`
    * `approvedForPublic`
    * `featured`
* `testimonials`

  * Relationship to `testimonials`
  * Has many
* `approvedClaims`

  * Array:

    * claim
    * source
    * approved
* `reviewDate`

  * Date

Do not store every metric as a preformatted sentence. Preserve the structured value and its context.

### Assets tab

* `coverAsset`

  * Upload relationship to Media
* `selectedAssets`

  * Relationship or upload relationship to Media
  * Has many
* `downloadableAssets`

  * Relationship to Media
  * Has many

Filter Media options where practical to:

* The selected Project
* `usageStatus = public-approved`

Do not prevent editors from intentionally selecting a valid approved asset associated with another record.

### Website tab

#### Website settings

* `websiteEnabled`

  * Checkbox
  * Default true
* `websiteHero`

  * Group:

    * `eyebrow`
    * `titleOverride`
    * `summaryOverride`
    * `media`
    * `layout`

      * editorial-split
      * centered
      * immersive
      * media-led
    * `theme`

      * light
      * dark
      * neutral
      * brand
    * `mediaTreatment`

      * contained
      * full-bleed
      * floating
      * background
* `websiteLayout`

  * Blocks field
  * Required only when `websiteEnabled` is true
  * Use case-study-specific blocks defined below
  * `initCollapsed: true`
* `relatedCaseStudies`

  * Relationship to `case-studies`
  * Has many
  * Exclude the current document
* `websiteNotes`

  * Textarea
  * Authenticated/editorial only

### SEO tab

Reuse the existing Payload SEO field patterns:

* Overview
* Meta title
* Meta description
* Meta image
* Preview

Generate public URLs using:

`/works/[slug]`

### Admin and publishing

* Live Preview URL should use `/works/[slug]`.
* Preview should use the existing preview endpoint and secret pattern.
* Drafts, autosave, versions, and scheduled publishing should follow Pages and Posts.
* Default columns:

  * title
  * project
  * featured
  * _status
  * updatedAt
* Default population:

  * title
  * slug
  * summaries
  * coverAsset
  * project
  * featuredCapabilities

### Access

* Create, update, and delete: authenticated
* Anonymous read:

  * `_status = published`
  * `websiteEnabled = true` for public website usage
* Authenticated read: all

Do not introduce custom roles in this phase.

---

## 8. Website composition blocks

Create case-study-specific blocks. Place them using repository conventions, preferably under either:

* `src/blocks/CaseStudy...`
* Or a clearly grouped `src/blocks/case-study/` structure if this does not conflict with current conventions

Do not mix them into the generic Page block renderer.

Create a dedicated:

`RenderCaseStudyBlocks`

It must be typed from the generated `CaseStudy` type.

### 8.1 Story Section block

**Block slug:** `caseStudyStorySection`

Purpose: Render one canonical narrative section with optional website-specific presentation.

Fields:

* `source`

  * context
  * challenge
  * strategy
  * approach
  * outcome-summary
  * learnings
  * custom
* `storyBeatKey`

  * Optional stable key from the selected canonical section
  * Empty means the complete section
* `eyebrow`
* `headingOverride`
* `bodyOverride`

  * Rich text
  * Optional
* `customBody`

  * Rich text
  * Shown only when source is custom
* `media`

  * Optional Media relationship
* `layout`

  * text-only
  * text-left
  * text-right
  * centered
  * sticky-media
* `theme`

  * light
  * dark
  * neutral
  * brand
* `width`

  * narrow
  * standard
  * wide

Rendering behavior:

1. Use the selected canonical section by default.
2. When `storyBeatKey` is selected, use only that beat from the selected section.
3. Use `bodyOverride` only when supplied.
4. Use `customBody` only for custom website-specific transitions.
5. Never overwrite canonical content when an override is edited.

### 8.2 Media Showcase block

**Block slug:** `caseStudyMediaShowcase`

Fields:

* `heading`
* `introduction`
* `media`

  * Has many
* `layout`

  * single
  * grid
  * horizontal
  * stacked
  * full-bleed
  * comparison
* `theme`
* `showCaptions`
* `showCredits`

### 8.3 Key Decisions block

**Block slug:** `caseStudyKeyDecisions`

Fields:

* `heading`
* `introduction`
* `source`

  * featured
  * all
* `layout`

  * list
  * cards
  * editorial
  * sticky
* `theme`

For v1, selection may be `featured` or `all`.

Do not create a fragile array-index selector. Individual decision selection can be added later using stable decision keys and a purpose-built admin component.

### 8.4 Metrics block

**Block slug:** `caseStudyMetrics`

Fields:

* `heading`
* `introduction`
* `source`

  * featured-public
  * all-public
* `layout`

  * grid
  * row
  * statement
  * editorial
* `theme`

Only render metrics where `approvedForPublic = true`.

### 8.5 Testimonial block

**Block slug:** `caseStudyTestimonial`

Fields:

* `testimonial`

  * Relationship to `testimonials`
* `layout`

  * editorial
  * centered
  * split
  * compact
* `theme`
* `showPortrait`

Only publicly approved Testimonials may render on the public site.

### 8.6 Rich Transition block

**Block slug:** `caseStudyTransition`

Purpose: Allow website-only narrative or creative transitions without polluting canonical case-study fields.

Fields:

* `eyebrow`
* `heading`
* `body`
* `layout`
* `theme`

This is intentionally channel-specific content.

### 8.7 Related Work block

**Block slug:** `caseStudyRelatedWork`

Fields:

* `heading`
* `selectionMode`

  * document-settings
  * automatic-capability-match
* `limit`
* `layout`

  * grid
  * list
  * feature

For `document-settings`, use `relatedCaseStudies` from the parent document.

Automatic selection may be implemented only if it remains simple and deterministic. Manual selection is sufficient for the initial release.

---

## 9. Frontend route

Create:

`src/app/(frontend)/works/[slug]/page.tsx`

Follow the existing Pages route patterns.

### Required behavior

* `generateStaticParams`
* Decode URL-safe slugs
* Read draft mode
* Query the `case-studies` collection
* Render only website-enabled documents publicly
* Support draft preview
* Render the configured website hero
* Render `websiteLayout`
* Include `LivePreviewListener` in draft mode
* Generate metadata from the SEO fields
* Handle missing records with the existing redirect or not-found patterns
* Revalidate after publishing, updating, deleting, or changing the slug
* Preserve React caching patterns where appropriate

### Query behavior

Use Payload’s Local API.

For public requests:

* Enforce collection access.
* Do not use an unconditional access override.
* Request enough depth or explicit selections to resolve:

  * Project
  * Organization
  * Media
  * Testimonials
  * Capabilities
  * Related case studies

Avoid requesting unrestricted internal fields.

For authenticated draft preview:

* Follow the repository’s established preview behavior.

### Presentation structure

Suggested component organization:

```text
src/
├── app/(frontend)/works/[slug]/
│   ├── page.tsx
│   └── page.client.tsx only if needed
├── blocks/
│   ├── CaseStudyStorySection/
│   ├── CaseStudyMediaShowcase/
│   ├── CaseStudyKeyDecisions/
│   ├── CaseStudyMetrics/
│   ├── CaseStudyTestimonial/
│   ├── CaseStudyTransition/
│   ├── CaseStudyRelatedWork/
│   └── RenderCaseStudyBlocks.tsx
└── heros/
    └── case-study components or variants
```

Do not force these components to share the generic `Page['layout']` type.

---

## 10. Preview integration

Extend:

`src/utilities/generatePreviewPath.ts`

Add the collection mapping:

```ts
'case-studies': '/works'
```

Update the type constraints so `case-studies` is accepted.

Confirm that the preview endpoint can resolve the new collection and target route. Update preview endpoint logic if it currently assumes only Pages and Posts.

The Payload Case Studies collection must support:

* Admin preview
* Live Preview
* Mobile breakpoint
* Tablet breakpoint
* Desktop breakpoint

Reuse the global Payload breakpoints already configured.

---

## 11. SEO and plugin integration

Update `src/plugins/index.ts`.

### SEO

* Include the generated `CaseStudy` type in relevant SEO generics.
* Generate case-study URLs as:

  * `${serverURL}/works/${slug}`
* Use the Suits & Sandals site title rather than retaining starter-template branding where encountered.
* Do not break Pages or Posts URL generation.

### Redirects

Add `case-studies` to redirects if supported by the plugin and existing redirect workflow.

A case-study slug change should support redirects from:

`/works/old-slug`

to:

`/works/new-slug`

### Search

Public site search support for case studies is desirable but not required for the first implementation.

Implement only if it fits the current search plugin cleanly.

When included, index:

* Title
* Summaries
* Organization name
* Project title
* Capability names
* Challenge
* Outcome summary

Do not index internal notes, sources, or unapproved claims.

---

## 12. Revalidation

Create Case Study revalidation hooks based on the existing Pages and Posts implementations.

Required behavior:

* Revalidate `/works/[slug]` after a published change.
* Revalidate the previous route when a published slug changes.
* Revalidate relevant index surfaces such as `/works` when:

  * A case study is published
  * A case study is unpublished
  * Featured status changes
  * Title or cover asset changes
* Revalidate after deletion.
* Respect context flags used to avoid redundant work where applicable.

Do not introduce nested Payload operations in hooks without passing `req`.

---

## 13. Public works index

A complete `/works` redesign is outside the core scope, but the data model and query must support it.

At minimum, expose a reusable server-side query capable of returning published case-study cards with:

* Title
* Slug
* One-line or short summary
* Client name
* Cover asset
* Featured capabilities
* Featured status

If `/works` does not already exist in the repository, create a minimal index page only if needed to validate navigation. Do not invent a full design system or portfolio redesign.

---

## 14. API and future-channel requirements

The purpose of the content model is to support future applications.

A future API consumer must be able to retrieve a Case Study without reading a Work Page's `layout`.

Canonical API data should expose:

* Case-study title
* Project
* Organization
* Summaries
* Context
* Challenge
* Objectives
* Strategy
* Approach
* Key decisions
* Outcomes
* Approved public metrics
* Approved Testimonials
* Public-approved selected assets
* Capabilities
* Public URL

Website presentation data remains available separately in the `work-pages` collection.

Do not create a separate content API package in this phase.

Do not create service accounts or API keys until an external application exists.

---

## 15. Data safety and migrations

### Requirements

* Create an explicit Payload migration.
* Do not rely on production schema push.
* Preserve existing Page, Post, Media, User, and Category records.
* Backfill newly required Media fields before enforcing constraints.
* Avoid destructive renames.
* Prefer additive schema changes.

### Media migration

Existing Media records should receive a compatible `usageStatus`.

Default existing assets to `public-approved` unless repository context indicates a safer migration strategy.

Document this choice in the migration.

### Generated files

Regenerate:

* `src/payload-types.ts`
* Payload admin import map when applicable

Commit generated outputs according to existing repository conventions.

---

## 16. Validation rules

Add useful validation without making authoring unnecessarily rigid.

### Case Study

* Title required
* Project required
* Slug required and unique
* At least one summary required before publication
* Challenge required before publication
* Outcome summary required before publication
* Public metrics must include:

  * Label
  * Value
  * Source or qualifier where applicable
* Key decision keys must be unique within the Case Study
* Metric keys must be unique within the Case Study
* Story Beat keys must be unique within their parent narrative section
* A published presentation's `storyBeatKey` must exist inside its selected canonical `source`

### Work Page

* A website layout is required before publication
* The related Case Study Content record must already be published
* Every selected `storyBeatKey` must exist within the selected canonical `source`

Validation may use collection hooks when field-level validation does not have enough document context.

Do not block saving incomplete drafts.

Prefer publish-time validation rather than draft-time validation for completeness requirements.

---

## 17. Admin experience

Use native Payload Admin functionality first.

### Required

* Admin grouping
* Clear labels and descriptions
* Tabs
* Conditional website fields
* Collapsed block rows
* Sensible default columns
* Relationship filtering where reliable
* Helpful field descriptions distinguishing:

  * Canonical content
  * Website override
  * Website-only content
  * Complete narrative sections and section-owned Story Beats
* Preview and Live Preview
* Draft status visibility

### Desired labels

Use language editors understand:

* Clients rather than Organizations in navigation labels if Payload supports singular/plural labels while retaining the `organizations` slug
* Projects
* Case Studies
* Testimonials
* Capabilities
* Industries

### Avoid in v1

* Custom visual page-builder interfaces
* Drag-and-drop canvas editing beyond Payload Blocks
* Complex custom field components
* Inline creation workflows that introduce unstable behavior
* Automated copying between Project and Case Study fields

Relationships should display related facts, but Project values should not be silently duplicated into the Case Study.

---

## 18. Access-control requirements

Follow the existing authenticated and published access patterns.

### Public content

Anonymous users may access:

* Published Organizations
* Published Projects
* Published, website-enabled Case Studies
* Published, approved Testimonials
* Public taxonomies
* Public-approved Media metadata

### Internal content

Anonymous users must not receive:

* Internal notes
* Unverified Testimonials
* Internal-only claims
* Draft case studies
* Draft organizations or projects
* Non-public metrics through purpose-built public queries
* Internal or client-review Media through the CMS API

### Important limitation

Do not claim that current Vercel Blob files are private merely because Media document access is filtered.

---

## 19. Testing requirements

## 19.1 Integration tests

Add tests covering:

1. An authenticated user can create an Organization.
2. An authenticated user can create a Project related to the Organization.
3. An authenticated user can create a Case Study related to the Project.
4. An anonymous user cannot read a draft Case Study.
5. An anonymous user can read a published, website-enabled Case Study.
6. A published but website-disabled Case Study is not treated as a public website page.
7. Internal fields are not returned anonymously.
8. Only approved public Testimonials can be read anonymously.
9. Public Media queries exclude non-public usage statuses.
10. Key decision keys cannot be duplicated.
11. Metric keys cannot be duplicated.
12. Public metrics require appropriate approval.
13. Preview path generation produces `/works/[slug]`.

## 19.2 Frontend or end-to-end tests

Add focused tests covering:

1. `/works/[slug]` renders a published Case Study.
2. A missing Case Study results in the expected redirect or not-found behavior.
3. The hero renders canonical content when no override exists.
4. The hero renders website overrides when provided.
5. Story blocks resolve canonical content.
6. Custom transition blocks render website-only content.
7. Unapproved metrics are not rendered publicly.
8. Unapproved Testimonials are not rendered publicly.
9. Draft preview renders an unpublished Case Study for an authenticated editor.
10. Existing generic Pages still render.

Avoid brittle visual assertions tied to animation timing.

---

## 20. Performance requirements

* Use server components by default.
* Keep case-study fetching server-side.
* Avoid client-side fetching for canonical content.
* Use Payload `select` where practical to avoid returning unnecessary internal fields.
* Use appropriate relationship depth without uncontrolled recursive population.
* Preserve optimized Payload Media rendering.
* Do not load WebGL or immersive components unless selected by the case-study presentation.
* Ensure static generation and revalidation continue to work.
* Avoid adding a global state dependency for case-study rendering.

---

## 21. Accessibility requirements

* Preserve semantic heading order.
* Do not use layout selections to determine semantic heading levels automatically without safeguards.
* Render Media alt text.
* Decorative images should use empty alt text intentionally.
* Galleries and horizontal sequences must remain keyboard-accessible.
* Testimonial attribution must be understandable to assistive technology.
* Metrics must include textual labels and units.
* Motion treatments must respect reduced-motion preferences.
* Do not hide canonical narrative content exclusively inside WebGL.

---

## 22. Non-goals

The first implementation must not include:

* A monorepo conversion
* A separate Payload deployment
* A new `sas-studio` integration
* A pitch-deck builder
* Proposal generation
* Email marketing
* Sales pipeline management
* AI summarization
* Localization
* Multi-tenant workspaces
* Granular editorial roles
* Client login or approval portal
* Private Blob storage
* Automatic migration of existing hardcoded portfolio case studies
* Complete website visual design for every block
* A universal omnichannel composition engine

---

## 23. Suggested implementation phases

### Phase 1: Schema foundation

* Add taxonomies
* Add Organizations
* Add Projects
* Add Testimonials
* Extend Media
* Add Case Studies
* Register collections
* Generate types
* Create migration
* Add integration tests

### Phase 2: Website delivery

* Add Case Study preview path
* Add `/works/[slug]`
* Add hero rendering
* Add composition blocks
* Add typed renderer
* Add SEO
* Add revalidation
* Add redirects
* Add frontend tests

### Phase 3: Editorial refinement

* Improve admin descriptions
* Add relationship filters
* Add publish-time validation
* Add minimal `/works` query or index
* Confirm Live Preview behavior
* Test a complete real case study from end to end

Do not combine all work into one unreviewable change if it can be divided into coherent commits or pull requests.

---

## 24. Definition of done

The work is complete when:

* Editors can create a Client, Project, Testimonial, and Case Study in Payload.
* The Case Study clearly separates reusable content from website presentation.
* Editors can creatively reorder and configure website sections.
* Canonical content can be retrieved without parsing website blocks.
* A published Case Study renders at `/works/[slug]`.
* Draft and Live Preview work from Payload Admin.
* SEO metadata works.
* Slug changes and publication changes revalidate correctly.
* Public queries do not expose internal notes or unapproved evidence.
* Existing Pages and Posts continue to work.
* Existing Media records remain functional.
* Generated Payload types are current.
* A production-safe migration exists.
* Lint, TypeScript, tests, and build pass.
* The implementation follows `AGENTS.md`.
* No monorepo or separate CMS service has been introduced.

---

## 25. Required implementation summary

At the end of implementation, provide:

1. A list of files created.
2. A list of files modified.
3. The final collection relationship diagram.
4. Migration details.
5. Any schema decisions that differ from this PRD.
6. Commands run and their results.
7. Tests added.
8. Known limitations.
9. Recommended next steps, without implementing future applications.
