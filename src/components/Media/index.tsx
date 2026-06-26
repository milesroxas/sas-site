import type React from 'react'
import { createElement } from 'react'
import { ImageMedia } from './ImageMedia'
import type { Props } from './types'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const content = isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />

  if (htmlElement === null) {
    return content
  }

  return createElement(htmlElement, className ? { className } : null, content)
}
