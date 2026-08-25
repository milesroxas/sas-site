import type { ChatTransport, UIMessage } from 'ai'
import { fullViewportSectionClassName } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AskWidget } from '@/features/ask/AskWidget'
import type { Footer } from '@/payload-types'
import { cn } from '@/utilities/ui'

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
 */
export const FooterClosing = ({ closing, askTransport }: FooterClosingProps) => {
  const media = typeof closing?.media === 'object' ? closing.media : null
  const links = closing?.links ?? []
  const ask = closing?.ask

  return (
    <section
      className={cn(
        fullViewportSectionClassName,
        'relative isolate justify-end bg-background text-foreground',
      )}
      data-theme="dark"
    >
      {/* Background comes from the CMS upload only — with nothing set the band
          renders on the plain section surface. */}
      {media ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 select-none">
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover"
            resource={media}
            size="100vw"
          />
          {/* Vignette from the design: edges fall toward the section surface so
              the band reads as one piece with the footer bar and arbitrary
              uploads stay legible under the ink. */}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-background/60" />
        </div>
      ) : null}

      <Container className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-16 lg:[--ask-card-min-h:26rem]">
        {/* Copy sits above the ask card: bottom padding lifts it so the button
            row lands just past the card's top edge, per the design. */}
        <div className="flex flex-col items-start gap-4 lg:pb-[calc(var(--ask-card-min-h)-2rem)]">
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
        <Card className="gap-10 bg-card/75 backdrop-blur-md lg:min-h-(--ask-card-min-h) [--card-spacing:--spacing(6)]">
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
    </section>
  )
}
