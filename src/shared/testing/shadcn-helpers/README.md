# @shadcn/helpers (vendored)

Vendored from [shadcn-ui/ui `packages/helpers`](https://github.com/shadcn-ui/ui/tree/main/packages/helpers)
at commit `bc0705384b51252af26dcc65425b216bf5eb063c` (v0.1.0), because the
`@shadcn/helpers` package is documented (https://ui.shadcn.com/docs/helpers/ai-sdk)
but not yet published to npm.

Dev-only: used by Storybook stories and tests to script deterministic
`useChat` conversations with realistic streaming — no model, API route, or
API key involved. Do not import from production code.

Contents mirror the upstream `src/` layout minus tests:

- `ai-sdk/` — `createChat()` builder + AI SDK `ChatTransport` implementation
- `core/` — format-agnostic chat runtime the ai-sdk adapter lowers to

Once `@shadcn/helpers` lands on npm: `pnpm add -D @shadcn/helpers`, swap
imports of `@/shared/testing/shadcn-helpers/ai-sdk` to `@shadcn/helpers/ai-sdk`,
and delete this directory.
