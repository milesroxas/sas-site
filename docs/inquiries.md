# Inquiries — the contact templates and the inbox

Everything a visitor sends the studio lands in one place, arrives by email, and
is owned by a person. This is how those three pieces fit together.

## The one form language

Every form on the site renders the same controls, defined once:

| Piece | Lives in | What it owns |
|-------|----------|--------------|
| `line` input / `bare` textarea | `src/components/ui/input.tsx`, `textarea.tsx` | The editorial control: no box, a hairline that darkens when filled and turns primary on focus |
| `mono` label, `FieldMeta`, `FieldPanel` | `src/components/ui/field.tsx` | Small uppercase mono label, its trailing hint (unit, counter), and the framed writing surface |
| `ChoiceChips` / `ChoiceChip` | `src/components/ui/choice-chips.tsx` | Pill answer sets over native radio / checkbox inputs |
| `DetailList` / `DetailRow` | `src/components/ui/detail-list.tsx` | Ruled label/value table, at phrase scale (`sm`) or reading scale (`lg`) |
| `FieldShell` and the field set | `src/blocks/shared/form/` | Label row, invalid state, grid span, error message, submit rule — react-hook-form bound |
| `FormBody`, `FormSteps` | `src/blocks/shared/form/` | The `<form>` itself, and how it is asked: flat, or one step at a time when the fields carry step dividers |

Two consumers compose that set and nothing else:

- **`src/blocks/Form/`** renders a form-builder document. `fields.tsx` is the
  only file that knows the plugin's block-type names; a CMS `select` becomes
  chips when it has six options or fewer, and a menu when it has more.
- **`src/blocks/contact/`** renders the contact templates.

A field's visual decisions are never restated at a call site. If a control
looks wrong on one form, it is wrong on all of them, and the fix is in the
primitive.

The editorial label marks **optional** fields in their own words rather than
starring the required ones (`Current site (optional)`). The boxed `default`
label still shows an asterisk.

## The contact page

`Contact Pages` is its own collection, not a Pages composition, because the
layout is fixed and unlike anything else on the site: a column of editorial
copy standing beside a form, which the page replaces in situ with a receipt
once the form is sent. That is a template, not an arrangement of blocks.

It publishes at `/contact/[slug]`, and the page slugged `contact`
(`CONTACT_INDEX_SLUG`) renders at `/contact` itself. The collection owns three
tabs: **Intro** (the column beside the form), **Form** (which form to ask), and
**After sending** (the receipt).

The questions are deliberately not on it. They live on a form in `Forms`, so
one set of questions can serve several contact pages *and* be composed onto an
ordinary page through the Form block. Same fields, same renderer, same
language, wherever it appears.

Two values are not on the page either. `Site Info → Inquiries` holds the
response-time promise and the booking link, because the page, the receipt and
the confirmation email all state them and they must agree. A page can override
the booking link with the shared link field (a document, a site page, or a
custom URL); it never has to.

Sending does not navigate: the form swaps in place for a receipt of what was
just sent, on the shared panel choreography (`useRevealSwap`), and **Edit and
resend** swaps back with every value intact. The receipt's rows are the form's
own field labels, so renaming a question renames it there too.

## Forms, and where answers go

A form's `Delivery` decides what a submission becomes:

- **Form submissions** — a row in the generic log, as before.
- **Inquiries inbox** — a triaged inquiry with a reference, an owner and a
  status. Each field then gets a **maps to** select saying which part of an
  inquiry it becomes, and the form's sidebar gains an **Inquiry type** select
  (project or general) saying what the inbox files it as. Forms created before
  that select existed are treated as project inquiries.

The mapping is explicit rather than inferred from field names: an editor
renaming "email" to "Your email" must not silently empty a column. Anything
left unmapped is appended to the brief rather than dropped, so a question added
without a mapping still reaches a human.

One custom field type ships with this: **Capabilities**, chips drawn from the
Capabilities taxonomy, so the studio's service list is edited once and every
form asking "what do you need" follows. Leaving its picker empty offers all of
them.

## Steps

A form with two or more **Step** dividers is asked one step at a time, wherever
it renders. `groupFormSteps` splits the fields at the dividers (fields above the
first one form an untitled first step; a divider with nothing under it is
dropped), and `FormBody` walks them:

- Every step stays in a ruled list. A finished step collapses to its title, a
  one-line summary of its answers (`readable`, the same words the receipt uses)
  and an Edit link; the open step carries its questions; a step still ahead
  shows its title and how many questions it holds. A count and the form's
  estimated time sit above the list. No separate progress indicator.
- The submit event is the open step's Continue, so Enter in a field and the
  button do the same thing. Only the open step is validated on Continue, and
  only the last step's submit sends. If the closing validation fails inside a
  finished step, that step reopens with focus on the field.
- Collapsed bodies stay mounted and `inert`, so answers survive a walk back
  through Edit with no bookkeeping. The body opens and closes as a grid track
  (`.form-step-body` in `globals.css`); reduced motion switches instantly.
- The copy (Continue, Edit, the note beside Continue, the estimate) lives in
  the form's **Steps** group, seeded from `FORM_STEP_COPY`, which the stepper
  also falls back to.

The contact page's "What happens next" renders above the send button, inside
the last step, so the copy column stays short enough to stick beside the form.

## The collection

`inquiries` (admin group **Inbox**) holds every submission from a form set to deliver there.

- Team-only for every operation. The single public door is
  `POST /api/inquiries/submit`, which validates each value against the
  canonical vocabulary in `src/shared/content/inquiry.ts`, checks capability
  ids against the taxonomy, swallows honeypot hits, and collapses repeat
  submissions from one address inside a minute.
- `reference` is a short random handle (`SS-K4T9`) minted on create and quoted
  in the confirmation email. Random, not sequential: a sequential reference in
  an email leaks how much work comes in.
- The **Request** tab is read-only — it is the record of what was sent.
  Handling (owner, status, notes) lives beside it and moves freely.
- `repliedAt` follows the status rather than being typed.

## Notification

The submit endpoint sends two emails once the create has returned, and neither
can fail the request. Not an `afterChange` hook: Payload runs `afterChange` and
`afterOperation` *inside* the transaction and commits afterwards, so a hook
that emails would promise the sender a receipt for a row that could still roll
back. It also means an inquiry logged by hand in the admin (a phone call, say)
does not email that person a "thanks, it's in".

The two:

- **Team** (`InquiryNotificationEmail`) — who, the structured answers, and the
  first lines of the brief, so an inquiry can be triaged from a phone.
- **Sender** (`InquiryReceivedEmail`) — arrival, the reference, and when they
  will hear back.

Recipients are users with **Email notifications → New inquiries** ticked (with
an optional per-type filter), plus the assignee if one is already set. With
nobody subscribed, `Site Info → contactEmail` catches it and the log says so.

## The admin surfaces

| Component | Where | Why |
|-----------|-------|-----|
| `InquiriesDashboard` | `beforeDashboard` | Open / unpicked / yours, and the top of the pile. Goes quiet when the inbox is clear |
| `InboxNavBadge` | `beforeNavLinks` | Standing count of new requests on every admin screen. Renders nothing at zero |
| `InboxFilters` | Inquiries list | New / Open / Assigned to me, one click instead of four |
| `InquiryActions` | Inquiry sidebar | Reply by email with the reference in the subject, take ownership, record what happened — each writes and saves in one press |

Counts come from `limit=0` queries and poll every 60s, so a tab left open still
tells the truth.

## Not built

File attachments. The design offers "attach a deck or RFP", but `media` accepts
images and video only, and a public upload endpoint needs its own collection,
size and type limits, and a scanning story. The brief's footer rail is CMS
copy in the meantime.
