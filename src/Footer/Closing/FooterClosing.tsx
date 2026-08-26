import type { ChatTransport, UIMessage } from 'ai'
import { fullViewportSectionClassName } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { CMSLink } from '@/components/Link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AskWidget } from '@/features/ask/AskWidget'
import type { Footer } from '@/payload-types'
import { SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD, ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import { ClosingMedia } from './ClosingMedia'

type FooterClosingProps = {
  closing: Footer['closing']
  /**
   * Chat transport passthrough to the embedded AskWidget — Storybook and tests
   * inject a scripted transport; real pages omit it and POST /api/ask.
   */
  askTransport?: ChatTransport<UIMessage>
}

/**
 * Full-screen closing band that rests above the fixed footer bar. The
 * background is always dark imagery, so the section scopes the dark palette
 * locally (`data-theme`) and every token inside resolves to dark ink in both
 * site themes.
 *
 * Last on the page: the frame already pads by `--footer-height` so ordinary
 * content clears the bar. This band is itself the last screen, so it eats
 * that offset and pads by the live `--footer-bar-height` plus the shared
 * section rhythm (`py-16` / `md:py-24`) — otherwise a light strip of frame
 * background shows between the media and the bar once the bar has shrunk
 * on scroll, and the ask card would sit flush against the bar.
 */
export const FooterClosing = ({ closing, askTransport }: FooterClosingProps) => {
  const media = typeof closing?.media === 'object' ? closing.media : null
  const links = closing?.links ?? []
  const ask = closing?.ask

  return (
    <section className="-mb-(--footer-height)" data-theme="dark">
      <ScrollReveal
        as="div"
        className={cn(
          fullViewportSectionClassName,
          'relative isolate justify-end bg-background text-foreground',
          // Shared band uses `py-16 md:py-24`. Bottom must clear the live
          // fixed bar *and* keep that rhythm, or the ask card sits flush
          // against the footer. `!` so the calc wins over `py-*` at both
          // breakpoints (arbitrary `pb-*` does not merge with `py-*`).
          'pb-[calc(var(--footer-bar-height)+--spacing(16))]! md:pb-[calc(var(--footer-bar-height)+--spacing(24))]!',
        )}
        enterThreshold={SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD}
        variant="underMedia"
      >
        {/* Background comes from the CMS upload only — with nothing set the band
            renders on the plain section surface. ClosingMedia owns the wipe
            window and the scroll-scrubbed parallax layer. */}
        {media ? <ClosingMedia media={media} /> : null}

        <Container className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-16 lg:[--ask-card-min-h:26rem]">
          {/* Copy sits above the ask card: bottom padding lifts it so the button
              row lands just past the card's top edge, per the design. */}
          <div
            className="flex flex-col items-start gap-4 lg:pb-[calc(var(--ask-card-min-h)-2rem)]"
            data-reveal
          >
            {closing?.eyebrow ? (
              <p className="text-sm text-foreground/80">{closing.eyebrow}</p>
            ) : null}
            {closing?.heading ? (
              <h2 className="max-w-3xl text-balance text-heading-2">{closing.heading}</h2>
            ) : null}
            {links.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {links.map(({ id, link }) => (
                  <CMSLink {...link} key={id} size="lg" />
                ))}
              </div>
            ) : null}
          </div>

          {/* Ask panel from the design: intro copy over the site's ask composer,
              translucent so the background media reads through. The min-height
              holds the composer low in the card and leaves room for the
              transcript the widget mounts above it. */}
          <Card
            className="gap-10 bg-card/75 backdrop-blur-md lg:min-h-(--ask-card-min-h) [--card-spacing:--spacing(6)]"
            data-reveal="panel"
          >
            {ask?.title || ask?.body ? (
              <CardHeader className="gap-4">
                {ask?.title ? (
                  <CardTitle className="text-base font-normal">{ask.title}</CardTitle>
                ) : null}
                {ask?.body ? (
                  <CardDescription className="text-base/relaxed">{ask.body}</CardDescription>
                ) : null}
              </CardHeader>
            ) : null}
            <CardContent className="mt-auto">
              <AskWidget placeholder="Ask anything…" transport={askTransport} />
            </CardContent>
          </Card>
        </Container>
      </ScrollReveal>
    </section>
  )
}
