import type { Block } from 'payload'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { DynamicAudience } from '@/blocks/DynamicAudience/config'
import { FormBlock } from '@/blocks/Form/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { NewsletterSignup } from '@/blocks/NewsletterSignup/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { TestimonialsMarquee } from '@/blocks/TestimonialsMarquee/config'

/** Layout blocks shared by Pages and the Home global. */
export const pageLayoutBlocks: Block[] = [
  CallToAction,
  Content,
  MediaBlock,
  Archive,
  FormBlock,
  NewsletterSignup,
  FeatureStatementGrid,
  FeatureHeadingOffset,
  FeatureTabs,
  FeatureImageStatement,
  SplitContentNarrow,
  TestimonialsMarquee,
  DynamicAudience,
]
