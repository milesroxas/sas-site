import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, use } from 'react'
import { cn } from '@/utilities/ui'

/**
 * Ruled label/value table — the site's editorial way of stating facts that
 * are read, not scanned: the studio's response time and addresses beside a
 * form, and the receipt of what a visitor just sent.
 *
 * A heavier rule opens the list and a hairline closes each row, so the block
 * reads as one object rather than a stack of pairs. `lg` is the same table at
 * reading scale, for a row whose value is a sentence rather than a phrase.
 */
const detailListVariants = cva('flex w-full flex-col border-t border-t-foreground', {
  variants: {
    size: {
      sm: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

const detailRowVariants = cva('flex w-full border-b border-b-border', {
  variants: {
    size: {
      sm: 'items-center gap-6 py-4',
      lg: 'items-start gap-8 py-5',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

const detailTermVariants = cva(
  'shrink-0 font-mono text-xs tracking-widest text-muted-foreground uppercase',
  {
    variants: {
      size: {
        sm: 'w-28 leading-4',
        lg: 'w-34 leading-6',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)

const detailValueVariants = cva('grow', {
  variants: {
    size: {
      sm: 'text-base/6',
      lg: 'text-lg/relaxed',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

type DetailSize = NonNullable<VariantProps<typeof detailListVariants>['size']>

const DetailListContext = createContext<DetailSize>('sm')

function DetailList({
  className,
  size = 'sm',
  ...props
}: React.ComponentProps<'dl'> & VariantProps<typeof detailListVariants>) {
  return (
    <DetailListContext value={size ?? 'sm'}>
      <dl
        data-slot="detail-list"
        data-size={size}
        className={cn(detailListVariants({ size }), className)}
        {...props}
      />
    </DetailListContext>
  )
}

function DetailRow({
  children,
  className,
  term,
  ...props
}: React.ComponentProps<'div'> & { term: React.ReactNode }) {
  const size = use(DetailListContext)

  return (
    <div data-slot="detail-row" className={cn(detailRowVariants({ size }), className)} {...props}>
      <dt className={detailTermVariants({ size })}>{term}</dt>
      <dd className={detailValueVariants({ size })}>{children}</dd>
    </div>
  )
}

export { DetailList, DetailRow }
