'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utilities/ui'

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'mb-2 font-medium data-[variant=label]:text-xs/relaxed data-[variant=legend]:text-sm',
        className,
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-4 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4',
        className,
      )}
      {...props}
    />
  )
}

const fieldVariants = cva('group/field flex w-full gap-2 data-[invalid=true]:text-destructive', {
  variants: {
    orientation: {
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
      horizontal:
        'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: upstream shadcn uses a div with role="group"; <fieldset> carries different default rendering and would diverge from the registry component
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn('group/field-content flex flex-1 flex-col gap-0.5 leading-snug', className)}
      {...props}
    />
  )
}

/**
 * `mono` is the site's editorial field label: small uppercase mono, quiet
 * until the field takes focus, when it turns primary alongside the `line`
 * input's rule. Stated here, not at call sites, so every form that uses the
 * editorial treatment reads the same.
 */
const fieldLabelVariants = cva(
  'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border *:data-[slot=field]:p-2 dark:has-data-checked:bg-primary/10',
  {
    variants: {
      variant: {
        default: '',
        mono: 'font-mono text-xs/4 font-normal tracking-widest text-muted-foreground uppercase group-has-[:focus-visible]/field:text-primary group-data-[invalid=true]/field:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function FieldLabel({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof Label> & VariantProps<typeof fieldLabelVariants>) {
  return (
    <Label
      data-slot="field-label"
      data-variant={variant ?? 'default'}
      className={cn(fieldLabelVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * Trailing counterpart to a `mono` label, set on the same baseline at the far
 * end of the field's header row: the unit, the selection rule, the character
 * count ("SELECT ANY", "USD", "0 / 1200").
 */
function FieldMeta({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="field-meta"
      className={cn(
        'shrink-0 font-mono text-xs/4 tracking-widest text-muted-foreground uppercase tabular-nums',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Framed writing surface: one border around a `bare` control and a footer rail
 * beneath it, so the counter and helper line read as part of the field rather
 * than as loose text under it.
 */
function FieldPanel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-panel"
      className={cn(
        'flex w-full flex-col rounded-md border border-input bg-input/20 transition-colors focus-within:border-ring group-data-[invalid=true]/field:border-destructive dark:bg-input/30',
        className,
      )}
      {...props}
    />
  )
}

function FieldPanelFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-panel-footer"
      className={cn(
        'flex items-center justify-between gap-4 border-t border-input px-5 py-3',
        className,
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-2 text-xs/relaxed font-medium group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-left text-xs/relaxed leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5',
        'last:mt-0 nth-last-2:-mt-1',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        'relative -my-2 h-5 text-xs/relaxed group-data-[variant=outline]/field-group:-mb-2',
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

    if (uniqueErrors?.length === 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-xs/relaxed font-normal text-destructive', className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldMeta,
  FieldPanel,
  FieldPanelFooter,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  fieldLabelVariants,
}
