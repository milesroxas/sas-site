# Editorial Guide: Website

The website is a presentation layer. Website collections decide *how* content appears at a URL; the facts themselves live in the Content Hub (see [content-hub.md](content-hub.md)).

## The surfaces

| Admin section | URL | Purpose |
| --- | --- | --- |
| Website: Landing → **Home** | `/` | Homepage (hero + composition). Not a Pages document. |
| Website: Landing → **Insights Index** / **Works Index** | `/insights`, `/works` | Hero and SEO for those indexes; the lists themselves are automatic |
| Website: Pages → **Pages** | `/[slug]` | General pages built with layout blocks |
| Website: Pages → **Posts** | `/posts/[slug]` | Blog articles; topic hubs at `/insights/[topic]` |
| Website: Pages → **Work Pages** | `/works/[slug]` | Public case studies, composed from Case Study Content |
| Website: Pages → **Lab Pages** | `/lab/[slug]` | Public lab write-ups, composed from Lab Projects (works like Work Pages) |
| Website: Pages → **Expertise Pages** | `/expertise/[slug]` | What we do, organized by capability |
| Website: Pages → **Audience Pages** | `/who-we-help/[slug]` | Who we serve, organized by industry |
| Website: Pages → **Contact** | `/contact`, `/contact/[slug]` | Contact templates (intro + form + receipt). Not a block composition. See [inquiries.md](../inquiries.md) |

Site navigation is edited under Website: Globals → **Header** and **Footer**. Company facts (address, response time, booking link) live on **Site Info**.

Visitor messages land in **Inbox → Inquiries**. That collection is team-only.

## Pages

Build with a hero (none / low / medium / high impact; high impact uses the WebGL backdrop) and composition blocks (sections, media, statements, forms, and the rest of the shared run). Newsletter Signup is offered on Pages, not on Expertise or Audience pages.

## Posts and Insights

Posts take a hero image, rich text (with banner, code, and media blocks), categories, and authors. Categories double as topic hubs: every category gets `/insights/[slug]` (categories have no draft state — creating one creates the hub), using the category's description as intro copy.

## Work Pages

A Work Page turns one Case Study Content document into a public case study. It never copies content — blocks read from the linked study at render time, so canonical edits flow through automatically.

### Composing

1. **Content Source** — pick the Case Study Content. One Work Page per study; the title field is just an editorial label.
2. **Opening** — configure the hero and introduction. Leave override fields empty to inherit the canonical title and summary; fill them only when the web needs different phrasing.
3. **Composition** — add and order blocks to tell the website story:

| Block | What it does |
| --- | --- |
| Story Section | Selects a canonical section (context, challenge, strategy, approach, outcomes, learnings), then optionally one Story Beat within it; heading/body overrides remain website-only |
| Narrative + media blocks | Split content, full media, image pair, split image, and supported feature blocks use the same section-first, optional-beat source pattern |
| Media Showcase | A set of approved media in a chosen layout |
| Key Decisions | The study's key decisions — featured only, or all |
| Metrics | The study's metrics — only ever the publicly approved ones |
| Testimonial | One approved testimonial in a chosen layout |
| Rich Transition | Website-only narrative copy between sections |
| Related Work | Manual picks, or automatic matching by capability |

4. **Assets** — cover asset (used on `/works` cards) and optional downloadable assets. A sidebar **Featured** checkbox drives card treatment and ordering on `/works`.
5. **Related Work** — manual related pages, used by the Related Work block's document-settings mode.
6. **SEO** — meta title, description, image.

### Pairing narrative paragraphs with media

If each passage should have its own visual treatment, split the canonical section into Story Beats
on the related Case Study Content record. In each Work Page block:

1. Choose the canonical section in **Source**, such as `Approach`.
2. Choose one optional **Story beat** from that section.
3. Add the block's media and layout treatment.
4. Leave the body override empty unless the website genuinely needs different wording.

Use the same section in several blocks with different beat selections to create pacing without
copying prose. Leave Story beat empty when the block should render the complete section body and
all of its beats in canonical order.

### Publishing requirements

A Work Page will not publish unless:

- The linked Case Study Content is itself published and has at least one Asset Library.
- The layout has at least one block.
- Every image on the page (cover, hero, downloads, block media) is **public-approved** and belongs to one of the study's Asset Libraries.

If publishing fails, fix the named item in the Content Hub first — that's the approval system working, not an error.

## Lab Pages

Lab Pages work exactly like Work Pages, but present a **Lab Project** (Content Hub) at `/lab/[slug]`: same Content Source / Presentation / Assets pattern, one Lab Page per project, same title-as-editorial-label rule.

## Expertise and Audience Pages

Both work like Pages (hero + composition blocks, minus Newsletter Signup) plus a **Positioning** tab:

- Expertise Pages require **capabilities**; Audience Pages require **industries**.
- Related work: pick Work Pages manually, or leave empty to auto-match published work sharing the same capability/industry.

## Contact Pages

Contact is a fixed template, not a layout of blocks. Edit **Intro** (the column beside the form), pick the **Form** (questions live on Forms), and write **After sending** (the in-place receipt). The page slugged `contact` is `/contact`; every other slug is `/contact/[slug]`. Response-time copy and the default booking link come from Site Info → Inquiries. Full detail: [inquiries.md](../inquiries.md).

## Previewing and publishing

- **Autosave** runs continuously while you edit; drafts are invisible to the public.
- **Preview / Live Preview** — use the admin preview to see the real page at mobile, tablet, and desktop widths, including unpublished changes.
- **Publish** makes the page live and refreshes it, its index page where one exists (`/works`, `/lab`, `/expertise`, `/who-we-help`), the sitemap, and search engines' view within moments. Scheduled publishing is available on every surface.
- **Slug changes** — the old URL stops working. Add a redirect (System → Redirects) from the old path to the new one whenever you change a published slug. Redirects cover Pages, Posts, Work, Lab, Expertise, and Audience; Contact slug changes need a manual redirect if you still want the old URL.
- **Version history** keeps the last 50 versions of each document; you can restore any of them.
