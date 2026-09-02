import type { Block } from 'payload'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Carousel } from '@/blocks/Carousel/config'
import { Content } from '@/blocks/Content/config'
import { ContactBlock } from '@/blocks/contact/config'
import { DynamicAudience } from '@/blocks/DynamicAudience/config'
import { FormBlock } from '@/blocks/Form/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureStatementLinks } from '@/blocks/feature/StatementLinks/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { FeaturedWork } from '@/blocks/featured-work/config'
import { FullMedia } from '@/blocks/full-media/config'
import { IndustryWork } from '@/blocks/IndustryWork/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { NewsletterSignup } from '@/blocks/NewsletterSignup/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { TestimonialsMarquee } from '@/blocks/TestimonialsMarquee/config'

/**
 * Layout blocks offered by Pages.
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
  Carousel,
  // Lists & grids
  Archive,
  FeaturedWork,
  // Forms & CTAs
  CallToAction,
  ContactBlock,
  FormBlock,
  NewsletterSignup,
]

/**
 * Home composition: everything Pages offers except the curated work list — the
 * homepage tells that story through its own hero and industry blocks.
 */
export const homeLayoutBlocks: Block[] = pageLayoutBlocks.filter((block) => block !== FeaturedWork)

/**
 * Layout blocks shared by the segment pages (Audience, Expertise). A narrower
 * set than `pageLayoutBlocks`: these pages are argument-and-proof surfaces, so
 * the marketing-only blocks (marquee, newsletter) are left out.
 */
export const segmentPageBlocks: Block[] = [
  // Text
  Content,
  // Media
  MediaBlock,
  // Split layouts
  SplitContentNarrow,
  // Statements
  FeatureStatementGrid,
  FeatureHeadingOffset,
  FeatureImageStatement,
  // Interactive
  FeatureTabs,
  AudienceTabs,
  Carousel,
  // Lists & grids
  Archive,
  FeaturedWork,
  // Forms & CTAs
  CallToAction,
  ContactBlock,
  FormBlock,
]
