## How to build with this design system

This is the component library behind **Suits & Sandals** (suits-sandals.com) — a
Next.js + Payload CMS site. The components below are the real compiled ones from
that codebase.

### Styling idiom: Tailwind CSS v4 utilities over semantic tokens

Style with Tailwind utility classes. Colors come from **semantic token
utilities**, never raw palette values. These are verified present in the
stylesheet: `bg-background`, `text-foreground`, `bg-primary`,
`text-primary-foreground`, `bg-card`, `text-card-foreground`, `bg-muted`,
`text-muted-foreground`, `bg-secondary`, `text-secondary-foreground`,
`bg-destructive`, `bg-popover`, `border-border`, and `bg-success` / `bg-error`
for status. The pattern is a surface plus its `-foreground` partner for text on
that surface. Both light and dark are defined; dark is driven by
`data-theme="dark"` on `<html>` rather than a `.dark` class, so `dark:` variants
work as usual and the attribute switches them.

Radii: `rounded-sm | rounded-md | rounded-lg`, derived from a single
`--radius: 0.45rem`. Prefer them over pixel values.

Type: `font-sans` (Geist Sans) is the default and also the heading face;
`font-mono` is Geist Mono. Size and weight use stock Tailwind scale utilities.

Spacing and layout: stock Tailwind scale (`p-4`, `gap-6`, `max-w-3xl`). Avoid
arbitrary values like `p-[13px]` — the scale is the design language.

**Important constraint:** the stylesheet here is a *pre-compiled* Tailwind
build, not a live JIT compiler. Only classes already present in it apply; a
class you invent (including arbitrary-value syntax like `bg-[#123456]` or
`p-[13px]`) will silently do nothing. Stay within the utilities you can find in
`_ds_bundle.css`, and when you genuinely need something outside that set, use an
inline `style` with a token variable — e.g.
`style={{ background: 'var(--accent)' }}` — since the full token set is defined
as CSS variables even where a matching utility wasn't compiled. The variables
are unprefixed semantic names: `--background`, `--foreground`, `--primary`,
`--primary-foreground`, `--secondary`, `--muted`, `--muted-foreground`,
`--accent`, `--accent-foreground`, `--card`, `--popover`, `--border`, `--ring`,
`--destructive`, `--success`, `--error`, and `--radius`.

### Setup

No provider is required for the UI primitives — import and render them directly.
Theming is attribute-driven: set `data-theme="light"` or `"dark"` on the root
element. Surfaces should be painted with `bg-background text-foreground` rather
than left transparent, since the page itself carries no default.

```jsx
import { Button, Card, CardHeader, CardTitle, CardContent, Field, FieldLabel, Input } from '<ds>'

<div className="bg-background text-foreground p-8">
  <Card className="max-w-md">
    <CardHeader>
      <CardTitle>Start a project</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="email">Work email</FieldLabel>
        <Input id="email" type="email" placeholder="you@company.com" />
      </Field>
      <Button className="w-full">Request intro</Button>
    </CardContent>
  </Card>
</div>
```

### Two kinds of components here

**UI primitives** (`ui/` group — Button, Card, Field, Input, Textarea, Select,
Checkbox, Label, Alert, Separator, Spinner, Pagination, Bubble, Message,
MessageScroller, InputGroup) plus `PostCard`. These take ordinary props and are
what you should compose interfaces from.

**Blocks** (`blocks/` and `feature/` groups — ContentBlock, CallToActionBlock,
BannerBlock, MediaBlock, CodeBlock, FormBlock, RelatedPosts, and the Feature*
blocks). These are CMS-driven page sections whose props are Payload data shapes,
including Lexical rich-text JSON. Treat them as reference for the brand's
page-level composition and rhythm; build new layouts from the primitives instead
of trying to author their data props by hand.

### Where the truth is

Read `styles.css` and the `_ds_bundle.css` it imports for the full token set and
every utility actually available. Each component directory carries its own
`.d.ts` (the real prop contract) and `.prompt.md` (usage notes) — check those
before guessing at an API.
