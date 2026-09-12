import { ConsentDialogLink } from '@c15t/nextjs/components/consent-dialog-link'
import { Fragment } from 'react'
import { CMSLink } from '@/components/Link'
import { buttonVariants } from '@/components/ui/button'
import type { SiteInfo } from '@/payload-types'

export type ClosingLegalLinks = NonNullable<SiteInfo['legalLinks']>

type ClosingLegalProps = {
  links: ClosingLegalLinks
  /** Site Info › Cookie settings label. Empty drops the trigger from the row. */
  cookieSettingsLabel?: string | null
}

/** The one look this row wears, so the link and the trigger cannot drift. */
const legalItemClassName = buttonVariants({ size: 'clear', variant: 'fineprint' })

/** Hairline between two items on one line; it goes away when the row stacks. */
const Rule = () => <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />

/**
 * Small print closing the band: the site's legal pages, set once in Site Info
 * › Legal links, and the cookie settings trigger. The row picks the
 * `fineprint` button, so the destination and the label are the only things an
 * editor sets: appearance is off on the field, and nothing here styles a call
 * site.
 *
 * Cookie settings is a control, not a link. It reopens c15t's preference
 * dialog in place (`ConsentDialogLink`, which renders an unstyled button for
 * exactly this), so there is no page to point it at and no way for an editor
 * to point it somewhere wrong. It wears the row's class rather than the
 * `Button` component because the trigger owns its own element.
 *
 * Hairlines separate the items from `sm`, where all three fit on one line. On
 * a phone the row stacks and the rules go with it: a divider between stacked
 * items reads as a bullet, and a lone one stranded at the end of a wrapped
 * line reads as a mistake. Stacked, each item stands on the 44px row the
 * button variant carries, so a thumb cannot land between two of them.
 */
export const ClosingLegal = ({ links, cookieSettingsLabel }: ClosingLegalProps) => {
  if (links.length === 0 && !cookieSettingsLabel) return null

  return (
    <nav
      aria-label="Legal"
      className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-3"
      data-reveal
    >
      {links.map(({ id, link }, index) => (
        <Fragment key={id}>
          {index > 0 ? <Rule /> : null}
          <CMSLink {...link} appearance="fineprint" size="clear" />
        </Fragment>
      ))}
      {cookieSettingsLabel ? (
        <>
          {links.length > 0 ? <Rule /> : null}
          <ConsentDialogLink className={legalItemClassName}>
            {cookieSettingsLabel}
          </ConsentDialogLink>
        </>
      ) : null}
    </nav>
  )
}
