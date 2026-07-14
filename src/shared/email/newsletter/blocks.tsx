import { Button, Heading, Hr, Img, Link, Section, Text } from 'react-email'
import type { Media, Newsletter, Post } from '@/payload-types'
import { EmailRichText } from './rich-text'
import { absoluteUrl } from './url'

/**
 * Newsletter content-block renderer (FSD: **shared**).
 *
 * Maps the `newsletters.content` blocks to email-safe React Email markup. Unpopulated
 * relationships and missing media are skipped rather than rendered broken — the preview route,
 * test sends and the send job all pass documents fetched with `depth: 2`.
 */

type NewsletterBlock = NonNullable<Newsletter['content']>[number]

/**
 * Width/height attributes for images, sized to the narrower (card) layout so Outlook — which
 * honors attributes over CSS — never overflows. Modern clients stretch to the column via
 * `w-full h-auto`.
 */
const CONTENT_WIDTH = 512

const asMedia = (value: number | Media | null | undefined): Media | null =>
  value && typeof value === 'object' ? value : null

const asPost = (value: number | Post): Post | null => (typeof value === 'object' ? value : null)

/** Pick a reasonably sized rendition for a ~600px column; fall back to the original upload. */
function mediaSource(media: Media): { url: string; width: number; height: number } | null {
  const candidate = media.sizes?.medium?.url
    ? media.sizes.medium
    : media.sizes?.large?.url
      ? media.sizes.large
      : media
  if (!candidate.url || !candidate.width || !candidate.height) return null
  return { url: candidate.url, width: candidate.width, height: candidate.height }
}

function EmailImage({ media, href, baseUrl }: { media: Media; href?: string; baseUrl: string }) {
  const source = mediaSource(media)
  if (!source) return null

  const height = Math.round(CONTENT_WIDTH * (source.height / source.width))
  const img = (
    <Img
      src={absoluteUrl(baseUrl, source.url)}
      alt={media.alt || (href ? 'Linked image' : '')}
      width={CONTENT_WIDTH}
      height={height}
      className="h-auto w-full rounded-[8px]"
    />
  )

  return (
    <Section className="my-6">
      {href ? <Link href={absoluteUrl(baseUrl, href)}>{img}</Link> : img}
    </Section>
  )
}

function FeaturedPost({ post, baseUrl }: { post: Post; baseUrl: string }) {
  const url = `${baseUrl}/posts/${post.slug}`
  const image = asMedia(post.meta?.image)

  return (
    <Section className="my-6">
      {image ? <EmailImage media={image} href={url} baseUrl={baseUrl} /> : null}
      <Heading
        as="h3"
        className="email-fg text-16 text-fg mt-0 mb-2 text-left font-sans font-semibold"
      >
        <Link href={url} className="email-fg text-fg no-underline">
          {post.title}
        </Link>
      </Heading>
      {post.meta?.description ? (
        <Text className="email-fg-2 text-14 text-fg-2 mt-0 mb-2 text-left font-sans">
          {post.meta.description}
        </Text>
      ) : null}
      <Text className="m-0 text-left">
        <Link href={url} className="email-fg text-13 text-fg underline">
          Read the article
        </Link>
      </Text>
    </Section>
  )
}

export function NewsletterBlocks({
  blocks,
  baseUrl,
}: {
  blocks: NewsletterBlock[] | null | undefined
  baseUrl: string
}) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'nlText':
            return <EmailRichText key={index} data={block.body} baseUrl={baseUrl} />
          case 'nlImage': {
            const media = asMedia(block.media)
            if (!media) return null
            return (
              <EmailImage
                key={index}
                media={media}
                href={block.link || undefined}
                baseUrl={baseUrl}
              />
            )
          }
          case 'nlButton':
            return (
              <Section key={index} className="my-8 text-center">
                <Button
                  href={absoluteUrl(baseUrl, block.url)}
                  className="email-btn bg-fg text-16 text-fg-inverted box-border inline-block rounded-lg px-7 py-4 text-center font-sans leading-6"
                >
                  {block.label}
                </Button>
              </Section>
            )
          case 'nlPosts': {
            const posts = (block.posts ?? [])
              .map(asPost)
              .filter((post): post is Post => post !== null)
            if (!posts.length) return null
            return (
              <Section key={index} className="my-2">
                {block.heading ? (
                  <Heading
                    as="h2"
                    className="email-fg text-24 text-fg mt-8 mb-2 text-left font-sans"
                  >
                    {block.heading}
                  </Heading>
                ) : null}
                {posts.map((post) => (
                  <FeaturedPost key={post.id} post={post} baseUrl={baseUrl} />
                ))}
              </Section>
            )
          }
          case 'nlDivider':
            return <Hr key={index} className="border-stroke my-8 border-t border-solid" />
          default:
            return null
        }
      })}
    </>
  )
}
