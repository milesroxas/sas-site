import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { linkGroup } from '@/fields/linkGroup'

/**
 * Full-viewport statement beside a stacked column of ruled navigation links.
 */
export const FeatureStatementLinks: Block = {
  slug: 'featureStatementLinks',
  // Shortened per-parent table name: the default
  // `<parent>_blocks_feature_statement_links_links` overruns Postgres'
  // 63-character identifier limit once index suffixes are appended.
  dbName: ({ tableName }) => `${tableName}_stmt_links`,
  interfaceName: 'FeatureStatementLinksBlock',
  labels: { singular: 'Feature: statement links', plural: 'Feature: statement links' },
  fields: [
    {
      name: 'statement',
      type: 'richText',
      admin: {
        description:
          'Renders in muted ink at regular weight. Bold a word or phrase to emphasize it — emphasized text renders in foreground ink.',
      },
    },
    linkGroup({
      appearances: false,
      overrides: {
        admin: { description: 'Stacked in order beside the statement, in the right-hand column.' },
      },
    }),
    themeField(),
  ],
}
