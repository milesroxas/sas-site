'use client'

import { useRef, useState } from 'react'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import type {
  AudienceTabsBlock as AudienceTabsBlockProps,
  Media as MediaDoc,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section, type SectionTheme } from '../shared/section'
import { useAudienceTabsMotion } from './use-audience-tabs-motion'

const MEDIA_SIZES = '(max-width: 1024px) 100vw, 58vw'

export const AudienceTabsBlock: React.FC<AudienceTabsBlockProps> = ({ heading, tabs, theme }) => {
  const panels = tabs ?? []
  // Selection + media swap at click; the panel copy follows once its
  // fade-out finishes, so both transitions start on the same beat.
  const [active, setActive] = useState(0)
  const [textIndex, setTextIndex] = useState(0)
  // Outgoing image kept mounted under the incoming one while a swap wipes in.
  const [prevMedia, setPrevMedia] = useState<MediaDoc | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const selectTab = useAudienceTabsMotion({
    rootRef,
    active,
    textIndex,
    onSelect: (index) => {
      const outgoing = panels[active]?.media
      setPrevMedia(typeof outgoing === 'object' ? (outgoing as MediaDoc) : null)
      setActive(index)
    },
    onTextSwap: setTextIndex,
    onSettled: () => setPrevMedia(null),
  })

  if (panels.length === 0) return null

  const current = panels[textIndex] ?? panels[0]
  const activeMedia = panels[active]?.media
  const media = typeof activeMedia === 'object' ? (activeMedia as MediaDoc) : null

  return (
    <Section className="my-16" theme={(theme as SectionTheme | null) ?? 'dark'}>
      <Container
        width="default"
        className="flex flex-col items-center gap-10 md:gap-16"
        ref={rootRef}
      >
        <h2
          className="max-w-4xl text-center text-3xl/9 font-light text-foreground/80 md:text-4xl/10"
          data-entrance="heading"
        >
          {heading}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {panels.map((tab, index) => {
            const selected = index === active
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-lg/none transition-colors',
                  selected
                    ? 'border-transparent bg-foreground/15 text-foreground'
                    : 'border-foreground/25 text-muted-foreground hover:text-foreground',
                )}
                data-entrance="tab"
                key={tab.id ?? index}
                // Mouse/pen commit at press, not release; touch stays on
                // click so a scroll drag starting on a tab never selects it.
                // selectTab dedupes, so the follow-up click is a no-op.
                onClick={() => selectTab(index)}
                onPointerDown={(event) => {
                  if (event.pointerType !== 'touch') selectTab(index)
                }}
                type="button"
              >
                {selected ? (
                  <span aria-hidden className="size-1.75 rounded-full bg-green-600" />
                ) : null}
                {tab.title}
              </button>
            )
          })}
        </div>

        <div className="grid w-full grid-cols-1 items-stretch gap-8 md:gap-12 lg:grid-cols-12  lg:gap-x-12">
          <div className="flex w-full max-w-xl flex-col gap-8 md:gap-16 lg:col-span-5">
            <p
              className="max-w-md text-xl/7 font-light md:text-2xl/8"
              data-entrance="item"
              data-swap="text"
            >
              {current.intro}
            </p>
            {current.items?.length ? (
              <ul className="flex flex-col divide-y divide-foreground/20">
                {current.items.map((item, itemIndex) => (
                  <li
                    className="py-3 text-lg/6 first:pt-0 last:pb-0 md:text-lg"
                    data-entrance="item"
                    data-swap="text"
                    key={item.id ?? itemIndex}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div
            className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted lg:col-span-7"
            data-entrance="media"
          >
            {prevMedia ? (
              <div aria-hidden className="absolute inset-0">
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  resource={prevMedia}
                  size={MEDIA_SIZES}
                />
              </div>
            ) : null}
            <div className="absolute inset-0" data-swap="media">
              {media ? (
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  // Fresh element per image so the swap wipes a new node in
                  // over the underlay instead of mutating the old img's src.
                  key={media.id}
                  resource={media}
                  size={MEDIA_SIZES}
                />
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
