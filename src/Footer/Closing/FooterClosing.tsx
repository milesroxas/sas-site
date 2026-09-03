import type { ChatTransport, UIMessage } from 'ai'
import { fullViewportSectionClassName } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { CMSLink } from '@/components/Link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AskWidget } from '@/features/ask/AskWidget'
import { leakExcite } from '@/features/immersive'
import type { Footer, Media } from '@/payload-types'
import { SCROLL_REVEAL_CURTAIN_ENTER_OFFSET, ScrollReveal } from '@/shared/ui/scroll-reveal'
import { populatedDoc } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'
import { ClosingLightLeak } from './ClosingLightLeak'
import { ClosingMedia } from './ClosingMedia'
import { FOOTER_CLOSING_GATE_SELECTOR } from './curtain'

type FooterClosingProps = {
  closing: Footer['closing']
  /**
   * Site Info › Ask › Hide Ask. The address panel takes the composer's place
   * in the right-hand column; the band's composition does not change.
   */
  askHidden?: boolean
  /** Postal lines from Site Info › Address (see `./address`). */
  address?: string[]
  /**
   * Chat transport passthrough to the embedded AskWidget — Storybook and tests
   * inject a scripted transport; real pages omit it and POST /api/ask.
   */
  askTransport?: ChatTransport<UIMessage>
}

/**
 * Panel height on `lg`, published as a variable because the copy column
 * reads it too: its bottom padding lifts the button row so it lands just past
 * the panel's top edge, per the design. The ask card holds room for the
 * transcript the widget mounts above its composer; the address panel is a
 * note over a postal block and sits lower, so a shorter card reads as sized
 * to its content rather than emptied of a composer.
 */
const panelMinHeight = {
  ask: 'lg:[--closing-panel-min-h:26rem]',
  address: 'lg:[--closing-panel-min-h:14rem]',
} as const

const ClosingCopy = ({ closing }: { closing: Footer['closing'] }) => {
  const links = closing?.links ?? []

  return (
    <div
      className="flex flex-col items-start gap-4 lg:pb-[calc(var(--closing-panel-min-h)-2rem)]"
      data-reveal
    >
      {closing?.eyebrow ? <p className="text-sm text-foreground/80">{closing.eyebrow}</p> : null}
      {closing?.heading ? (
        <h2 className="max-w-3xl text-balance text-heading-2">{closing.heading}</h2>
      ) : null}
      {links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {links.map(({ id, link }) => (
            // `contents` wrapper, not the button itself: CMSLink renders
            // its own element and forwards no arbitrary props, and the
            // leak delegates from the document — so an ancestor carrying
            // the marker excites on button hover with no layout box of
            // its own (the button stays the flex item, gap unchanged).
            <span className="contents" key={id} {...leakExcite()}>
              <CMSLink {...link} size="lg" />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const ClosingAskPanel = ({
  ask,
  askTransport,
}: {
  ask: NonNullable<Footer['closing']>['ask']
  askTransport?: ChatTransport<UIMessage>
}) => (
  <Card
    className="gap-10 bg-card/75 backdrop-blur-md lg:min-h-(--closing-panel-min-h) [--card-spacing:--spacing(6)]"
    data-reveal="panel"
    {...leakExcite()}
  >
    {ask?.title || ask?.body ? (
      <CardHeader className="gap-4">
        {ask?.title ? <CardTitle className="text-base font-normal">{ask.title}</CardTitle> : null}
        {ask?.body ? (
          <CardDescription className="text-base/relaxed">{ask.body}</CardDescription>
        ) : null}
      </CardHeader>
    ) : null}
    <CardContent className="mt-auto">
      <AskWidget placeholder="Ask anything…" transport={askTransport} />
    </CardContent>
  </Card>
)

/**
 * The composer's stand-in while Ask is hidden: the same translucent card, so
 * flipping the flag never re-composes the band, holding a note in the site's
 * voice over the studio address set as a postal block. The block borrows the
 * footer bar's location vernacular (mono, uppercase, the size of the bar's
 * own line) so the two read as one register of place facts, and a hairline
 * separates it from the note the way an address line sits on letterhead. It
 * is `<address>` for real: the studio's contact address, not a quotation.
 * Static content, so no `leakExcite()` — a panel that gathers light on hover
 * promises an interaction this one does not have.
 */
const ClosingAddressPanel = ({ note, lines }: { note?: string | null; lines: string[] }) => (
  <Card
    className="gap-8 bg-card/75 backdrop-blur-md lg:min-h-(--closing-panel-min-h) [--card-spacing:--spacing(6)]"
    data-reveal="panel"
  >
    {note ? (
      <CardHeader>
        <CardDescription className="max-w-prose text-base/relaxed">{note}</CardDescription>
      </CardHeader>
    ) : null}
    {lines.length > 0 ? (
      <CardContent className="mt-auto">
        <address className="border-t border-foreground/10 pt-4 font-mono text-xs/relaxed uppercase not-italic">
          {lines.map((line) => (
            <span className="block" key={line}>
              {line}
            </span>
          ))}
        </address>
      </CardContent>
    ) : null}
  </Card>
)

/**
 * Full-screen closing band that rests above the fixed footer bar. Every
 * surface here is a semantic token (`bg-background`, `text-foreground`,
 * `bg-card`), so the band follows the visitor's site theme rather than
 * forcing a palette — light mode reads light, dark mode reads dark. The
 * background upload sits under a `--background` vignette, so the copy keeps
 * its contrast against the photo either way.
 *
 * **The curtain.** The band parks at the bottom of the viewport and the page
 * article — opaque, `z-10`, on every surface that renders this — scrolls up
 * off it, so the closing screen is uncovered in place rather than travelling
 * in from below. That unmask is the entrance; the copy only settles into a
 * screen the page has already started to open (see `./curtain`). It costs the
 * band its own scrollability, so it holds only where the viewport can fit the
 * whole thing: below the `tall` breakpoint the band stays in normal flow.
 *
 * Last on the page: the frame already pads by `--footer-height` so ordinary
 * content clears the bar. This band is itself the last screen, so it eats
 * that offset and pads by the live `--footer-bar-height` plus the shared
 * section rhythm (`py-16` / `md:py-24`) — otherwise a light strip of frame
 * background shows between the media and the bar once the bar has shrunk
 * on scroll, and the panel would sit flush against the bar.
 */
export const FooterClosing = ({
  closing,
  askHidden = false,
  address = [],
  askTransport,
}: FooterClosingProps) => {
  const media = populatedDoc<Media>(closing?.media)
  const note = closing?.address?.note
  // With Ask hidden and nothing to say in its place, the column is simply
  // empty: no panel, and no variable, so the copy's lift falls away with it.
  const panel = askHidden ? (note || address.length > 0 ? 'address' : null) : 'ask'

  return (
    <>
      {/* The band's flow position, marked in normal flow: a sticky box cannot
          report its own scroll, so the reveal gate and the background parallax
          both read this line instead. Its own height is cancelled out. */}
      <div aria-hidden className="-mb-px h-px" data-footer-closing-gate />
      <ScrollReveal
        as="section"
        className={cn(
          fullViewportSectionClassName,
          'relative isolate z-0 justify-end bg-background text-foreground',
          // The curtain: pinned to the bottom of the viewport so the article
          // above (z-10, opaque) uncovers it on the way down. Sticky pins the
          // *margin* box, and the negative bottom margin below is what eats
          // the frame's footer padding — so the offset adds exactly that back,
          // or the band would park that far under the fold.
          'tall:sticky tall:bottom-(--footer-height)',
          '-mb-(--footer-height)',
          // Shared band uses `py-16 md:py-24`. Bottom must clear the live
          // fixed bar *and* keep that rhythm, or the panel sits flush
          // against the footer. `!` so the calc wins over `py-*` at both
          // breakpoints (arbitrary `pb-*` does not merge with `py-*`).
          'pb-[calc(var(--footer-bar-height)+--spacing(16))]! md:pb-[calc(var(--footer-bar-height)+--spacing(24))]!',
        )}
        enterOffset={SCROLL_REVEAL_CURTAIN_ENTER_OFFSET}
        gateSelector={FOOTER_CLOSING_GATE_SELECTOR}
        variant="underMedia"
      >
        {/* Background comes from the CMS upload only — with nothing set the band
            renders on the plain section surface. It carries no reveal marker:
            the curtain already uncovers this whole screen from the bottom edge
            up, and a second mask wiping down over the same pixels reads as two
            edges fighting. ClosingMedia keeps the scrubbed parallax layer. */}
        {media ? <ClosingMedia media={media} /> : null}

        <Container
          className={cn(
            'grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-16',
            panel && panelMinHeight[panel],
          )}
        >
          {/* Copy sits above the panel: bottom padding lifts it so the button
              row lands just past the panel's top edge, per the design. */}
          <ClosingCopy closing={closing} />

          {/* Right-hand panel from the design, translucent so the background
              media reads through. Ask: intro copy over the site's ask
              composer, with the min-height holding the composer low in the
              card and leaving room for the transcript the widget mounts above
              it. Ask hidden: the studio's address panel in the same place. */}
          {panel === 'ask' ? (
            <ClosingAskPanel ask={closing?.ask} askTransport={askTransport} />
          ) : null}
          {panel === 'address' ? <ClosingAddressPanel lines={address} note={note} /> : null}
        </Container>

        {/* Film light leak over the whole band — last child, so it composites
            above the copy and the panel as well as the media, the way light
            striking the frame would. The wrapper's `isolate` is load-bearing:
            it keeps the screen-like blend inside this band instead of letting
            it reach the page above. Interaction is unaffected (the overlay is
            pointer-events-none), and it renders nothing without a GPU or under
            prefers-reduced-motion. The shipped look *is* LightLeak's defaults;
            the wrapper only decides when the pinned band is uncovered enough
            to be worth rendering. The CTA buttons and the ask panel carry
            `leakExcite()`, so hovering any of them gathers light under the
            pointer and widens the spectrum. */}
        <ClosingLightLeak />
      </ScrollReveal>
    </>
  )
}
