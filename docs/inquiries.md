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

## The contact block

One block, `contactBlock`, with a `variant`:

- **Project inquiry** asks for scope, budget, timeline, and a brief.
- **General message** drops the scoping questions and keeps the rest.

Everything on the page is CMS content, on three tabs: **Intro** (the column
beside the form), **Form** (labels and the offered options), **After sending**
(the receipt). The project-only groups hide themselves when the variant is
`general`, so a general contact form opens as a short list of fields.

Two values are deliberately *not* on the block. `Site Info → Inquiries` holds
the response-time promise and the booking link, because the page, the receipt,
and the confirmation email all state them and they must agree. The block can
override the booking link; it never has to.

Capability chips come from the `capabilities` taxonomy, so the studio's service
list is edited once. Leaving the selection empty offers all of them.

Sending does not navigate: the form swaps in place for a receipt of what was
just sent, on the shared panel choreography (`useRevealSwap`), and **Edit and
resend** swaps back with every value intact.

## The collection

`inquiries` (admin group **Inbox**) holds both templates' submissions.

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
