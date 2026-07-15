# Editorial Guide: Website

The website is a presentation layer. Website collections decide *how* content appears at a URL; the facts themselves live in the Content Hub (see [content-hub.md](content-hub.md)).

## The surfaces

| Admin section (Website) | URL | Purpose |
| --- | --- | --- |
| Pages | `/[slug]` | General pages (home, contact, about) built with layout blocks |
| Posts | `/posts/[slug]` | Blog articles; topic hubs at `/insights/[topic]` |
| Work Pages | `/works/[slug]` | Public case studies, composed from Case Study Content |
| Lab Pages | `/lab/[slug]` | Public lab write-ups, composed from Lab Projects (works like Work Pages) |
| Expertise Pages | `/expertise/[slug]` | What we do, organized by capability |
| Audience Pages | `/who-we-help/[slug]` | Who we serve, organized by industry |

Site navigation is edited under Website → **Header** and **Footer**.

## Pages

Build with a hero (none / low / medium / high impact — high impact uses the WebGL backdrop) and layout blocks: Call to Action, Content, Media, Archive, Form, Newsletter Signup.

## Posts and Insights

Posts take a hero image, rich text (with banner, code, and media blocks), categories, and authors. Categories double as topic hubs: every category gets `/insights/[slug]` (categories have no draft state — creating one creates the hub), using the category's description as intro copy.

## Work Pages

A Work Page turns one Case Study Content document into a public case study. It never copies content — blocks read from the linked study at render time, so canonical edits flow through automatically.

### Composing

1. **Content Source** — pick the Case Study Content. One Work Page per study; the title field is just an editorial label.
2. **Presentation → Hero** — layout (editorial-split, centered, immersive, media-led), theme (light / dark / neutral / brand), media treatment (contained / full-bleed / floating / background), optional eyebrow and media. Leave override fields empty to inherit the canonical title and summary; fill them only when the web needs different phrasing.
3. **Presentation → Layout blocks** — order tells the story:

| Block | What it does |
| --- | --- |
| Story Section | Renders one canonical section (context, challenge, strategy, approach, outcome summary, learnings) with optional heading/body override, or fully custom copy |
| Media Showcase | A set of approved media in a chosen layout |
| Key Decisions | The study's key decisions — featured only, or all |
| Metrics | The study's metrics — only ever the publicly approved ones |
| Testimonial | One approved testimonial in a chosen layout |
| Rich Transition | Website-only narrative copy between sections |
| Related Work | Manual picks, or automatic matching by capability |

4. **Assets** — cover asset (used on `/works` cards) and optional downloadable assets. A sidebar **Featured** checkbox drives card treatment and ordering on `/works`.
5. **Related Work** — manual related pages, used by the Related Work block's document-settings mode.
6. **SEO** — meta title, description, image.

### Publishing requirements

A Work Page will not publish unless:

- The linked Case Study Content is itself published and has at least one Asset Library.
- The layout has at least one block.
- Every image on the page (cover, hero, downloads, block media) is **public-approved** and belongs to one of the study's Asset Libraries.

If publishing fails, fix the named item in the Content Hub first — that's the approval system working, not an error.

## Lab Pages

Lab Pages work exactly like Work Pages, but present a **Lab Project** (Content Hub) at `/lab/[slug]`: same Content Source / Presentation / Assets pattern, one Lab Page per project, same title-as-editorial-label rule.

## Expertise and Audience Pages

Both work like Pages (hero + the same layout blocks, minus Newsletter Signup) plus a **Positioning** tab:

- Expertise Pages require **capabilities**; Audience Pages require **industries**.
- Related work: pick Work Pages manually, or leave empty to auto-match published work sharing the same capability/industry.

## Previewing and publishing

- **Autosave** runs continuously while you edit; drafts are invisible to the public.
- **Preview / Live Preview** — use the admin preview to see the real page at mobile, tablet, and desktop widths, including unpublished changes.
- **Publish** makes the page live and refreshes it, its index page where one exists (`/works`, `/lab`, `/expertise`, `/who-we-help`), the sitemap, and search engines' view within moments. Scheduled publishing is available on every surface.
- **Slug changes** — the old URL stops working. Add a redirect (System → Redirects) from the old path to the new one whenever you change a published slug.
- **Version history** keeps the last 50 versions of each document; you can restore any of them.
