'use client'

import { Component, type ReactNode } from 'react'

/**
 * Turns a render-time throw into a callback and renders nothing after it: a
 * renderer constructor that refuses a context, or a runtime chunk that fails
 * to load from `lazy`. The owner decides what the failure means (a poster, a
 * message); this only makes sure it hears about it once.
 */
export class FailureBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
