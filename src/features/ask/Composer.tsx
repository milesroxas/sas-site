'use client'

import { InputGroupTextarea } from '@/components/ui/input-group'
import { ASK_QUESTION_LENGTH } from './vocabulary'

/**
 * The composer's text box on every surface that uses a textarea (the /ask
 * page, the closing band, its phone sheet): Enter sends, Shift+Enter breaks
 * a line, an IME composition is never cut short, and the length cap is the
 * endpoint's own. The menu's single-line pill is a plain input and submits
 * on Enter by itself.
 */
export function AskTextarea(props: React.ComponentProps<typeof InputGroupTextarea>) {
  return (
    <InputGroupTextarea
      enterKeyHint="send"
      maxLength={ASK_QUESTION_LENGTH.max}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault()
          event.currentTarget.form?.requestSubmit()
        }
      }}
      required
      rows={1}
      {...props}
    />
  )
}
