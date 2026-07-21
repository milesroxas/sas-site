/**
 * design-sync bundle entry. This repo is a Next.js app, not a packaged
 * library — there is no dist/, so the bundle compiles straight from source.
 * Exports: every storied component plus its public subcomponents.
 * `Card` (shadcn ui) and the post Card collide; the post card ships as
 * `PostCard` (see titleMap + storyImports.bundle in config.json).
 */
import './vt-polyfill'

export { PreviewAppRouter } from './preview-provider'

// UI primitives (ejected shadcn)
export * from '../src/components/ui/alert'
export * from '../src/components/ui/bubble'
export * from '../src/components/ui/button'
export * from '../src/components/ui/card'
export * from '../src/components/ui/checkbox'
export * from '../src/components/ui/field'
export * from '../src/components/ui/input'
export * from '../src/components/ui/input-group'
export * from '../src/components/ui/label'
export * from '../src/components/ui/message'
export * from '../src/components/ui/message-scroller'
export * from '../src/components/ui/pagination'
export * from '../src/components/ui/select'
export * from '../src/components/ui/separator'
export * from '../src/components/ui/spinner'
export * from '../src/components/ui/textarea'

// Composite components
export { Card as PostCard } from '../src/components/Card/index'

// Blocks
export { BannerBlock } from '../src/blocks/Banner/Component'
export { CallToActionBlock } from '../src/blocks/CallToAction/Component'
export { CodeBlock } from '../src/blocks/Code/Component'
export { ContentBlock } from '../src/blocks/Content/Component'
export { FormBlock } from '../src/blocks/Form/Component'
export { MediaBlock } from '../src/blocks/MediaBlock/Component'
export { RelatedPosts } from '../src/blocks/RelatedPosts/Component'
export { FeatureHeadingOffsetBlock } from '../src/blocks/feature/HeadingOffset/Component'
export { FeatureImageStatementBlock } from '../src/blocks/feature/ImageStatement/Component'
export { FeatureStatementGridBlock } from '../src/blocks/feature/StatementGrid/Component'
export { FeatureTabsBlock } from '../src/blocks/feature/Tabs/Component'

// Features
export { AskWidget } from '../src/features/ask/AskWidget'
