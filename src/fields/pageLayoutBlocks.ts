import type { Block } from 'payload'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { DynamicAudience } from '@/blocks/DynamicAudience/config'
import { FormBlock } from '@/blocks/Form/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureStatementLinks } from '@/blocks/feature/StatementLinks/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FullMedia } from '@/blocks/full-media/config'
import { IndustryWork } from '@/blocks/IndustryWork/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { NewsletterSignup } from '@/blocks/NewsletterSignup/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { TestimonialsMarquee } from '@/blocks/TestimonialsMarquee/config'

/**
 * Layout blocks shared by Pages and the Home global.
 * Ordered by `admin.group` — the blocks drawer renders groups in first-appearance order.
 */
export const pageLayoutBlocks: Block[] = [
  // Text
  Content,
  // Media
  MediaBlock,
  FullMedia,
  // Split layouts
  SplitContentNarrow,
  // Statements
  FeatureStatementGrid,
  FeatureStatementLinks,
  FeatureHeadingOffset,
  FeatureImageStatement,
  // Interactive
  FeatureTabs,
  DynamicAudience,
  AudienceTabs,
  IndustryWork,
  TestimonialsMarquee,
  // Lists & grids
  Archive,
  // Forms & CTAs
  CallToAction,
  FormBlock,
  NewsletterSignup,
]
