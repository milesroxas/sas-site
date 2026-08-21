// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// jsdom ships no matchMedia; embla-carousel and motion code read it on mount.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom ships no IntersectionObserver; embla and reveal components observe on mount.
if (typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'function') {
  class IntersectionObserverStub implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly scrollMargin = ''
    readonly thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  window.IntersectionObserver = IntersectionObserverStub
  globalThis.IntersectionObserver = IntersectionObserverStub
}

// jsdom ships no ResizeObserver; embla measures slides with it on mount.
if (typeof window !== 'undefined' && typeof window.ResizeObserver !== 'function') {
  class ResizeObserverStub implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverStub
  globalThis.ResizeObserver = ResizeObserverStub
}
