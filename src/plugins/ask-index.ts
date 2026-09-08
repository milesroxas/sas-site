import type { CollectionConfig, GlobalConfig, Plugin } from 'payload'
import {
  askIndexAfterChange,
  askIndexAfterDelete,
  askIndexCanonicalAfterChange,
  askIndexGlobalAfterChange,
} from '@/features/ask/indexSync'
import {
  CONTENT_SURFACES,
  globalSurfaceBySlug,
  surfaceByCollection,
} from '@/shared/content/surfaces'

/**
 * Attaches the Ask RAG embedding-sync hooks to every public content surface,
 * the canonical Content Hub collections their pages render (work-pages →
 * case-studies, lab-pages → lab-projects), and the global surfaces (home,
 * index heroes, site info). Which documents participate is decided by the
 * shared surface registry — adding a surface there wires it into the
 * embedding index automatically.
 */
export const askIndexPlugin = (): Plugin => (config) => {
  const canonicalHooks = new Map<string, ReturnType<typeof askIndexCanonicalAfterChange>>()
  for (const surface of CONTENT_SURFACES) {
    if (surface.body.kind === 'walk' && surface.body.canonicalField) {
      canonicalHooks.set(
        surface.body.canonicalField.collection as string,
        askIndexCanonicalAfterChange(surface, surface.body.canonicalField),
      )
    }
  }

  const withHooks = (collection: CollectionConfig): CollectionConfig => {
    const surface = surfaceByCollection.get(collection.slug)
    if (surface) {
      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [...(collection.hooks?.afterChange ?? []), askIndexAfterChange(surface)],
          afterDelete: [...(collection.hooks?.afterDelete ?? []), askIndexAfterDelete(surface)],
        },
      }
    }

    const canonicalHook = canonicalHooks.get(collection.slug)
    if (canonicalHook) {
      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [...(collection.hooks?.afterChange ?? []), canonicalHook],
        },
      }
    }

    return collection
  }

  const withGlobalHooks = (global: GlobalConfig): GlobalConfig => {
    const surface = globalSurfaceBySlug.get(global.slug)
    if (!surface) return global
    return {
      ...global,
      hooks: {
        ...global.hooks,
        afterChange: [...(global.hooks?.afterChange ?? []), askIndexGlobalAfterChange(surface)],
      },
    }
  }

  return {
    ...config,
    collections: (config.collections ?? []).map(withHooks),
    globals: (config.globals ?? []).map(withGlobalHooks),
  }
}
