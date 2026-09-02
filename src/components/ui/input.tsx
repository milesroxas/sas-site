import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Two input treatments, stated once.
 *
 * - `default`: the boxed admin/utility control (filters, inline forms).
 * - `line`: the site's editorial form control — no box, a single hairline
 *   under a mono label. Its three states are pure CSS so no call site has to
 *   track them: empty rests on `--input`, a filled value darkens the rule to
 *   `--foreground`, and focus takes it to `--primary` (the label follows via
 *   `FieldLabel variant="mono"`, which reads the field's focus with `has`).
 *
 * `text-base` below md in both: iOS Safari zooms the page when a focused
 * control is under 16px, and the zoom outlives the form.
 */
const inputVariants = cva(
  'w-full min-w-0 transition-colors outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'h-7 rounded-md border border-input bg-input/20 px-2 py-0.5 text-base file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        line: 'h-auto rounded-none border-0 border-b border-input bg-transparent px-0 pb-3 text-base not-placeholder-shown:border-b-foreground focus-visible:border-b-primary aria-invalid:border-b-destructive md:text-lg/relaxed',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant ?? 'default'}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
