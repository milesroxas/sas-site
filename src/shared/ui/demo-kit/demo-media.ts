/** Default demo image in /public; a GUI upload swaps in a blob URL. */
export const DEMO_IMAGE_SRC = '/images/bg-fpo-01.jpg'

/**
 * The home hero's gradient video (media #22), through the same-origin Payload
 * proxy — the R2 custom domain sends no CORS headers, so sampling it
 * cross-origin would taint a WebGL canvas.
 */
export const DEMO_VIDEO_SRC = '/api/media/file/Gradient%20Animation_converted-1.mp4'
