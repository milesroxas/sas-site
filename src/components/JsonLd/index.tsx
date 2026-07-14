import type { Thing, WithContext } from 'schema-dts'

/**
 * Renders schema.org structured data. `<` is escaped so document content can
 * never break out of the script element (see Next.js JSON-LD guide).
 */
export const JsonLd = ({ data }: { data: WithContext<Thing> | WithContext<Thing>[] }) => (
  <script
    type="application/ld+json"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires a raw script payload; content is JSON.stringify-escaped above any HTML context.
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    }}
  />
)
