import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import ffmpegPath from 'ffmpeg-static'

export type VideoFrameSource = {
  /** Original upload filename (used to derive the poster filename). */
  filename: string
  /** In-memory upload buffer when Payload did not spill to disk. */
  data?: Buffer
  /** Temp path from multipart upload — preferred when present. */
  tempFilePath?: string
}

export type ExtractedVideoFrame = {
  buffer: Buffer
  filename: string
  mimeType: 'image/jpeg'
}

/**
 * Extract a single JPEG still from a video file via the bundled ffmpeg binary.
 * Leaves any Payload-owned temp upload path untouched; only our work directory
 * is cleaned up.
 */
export async function extractVideoFrame(source: VideoFrameSource): Promise<ExtractedVideoFrame> {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary is not available in this environment')
  }

  if (!source.tempFilePath && !source.data) {
    throw new Error('Video frame extraction requires tempFilePath or data')
  }

  const workDir = await mkdtemp(path.join(tmpdir(), 'sas-video-poster-'))
  const outputPath = path.join(workDir, 'poster.jpg')
  let inputPath = source.tempFilePath

  try {
    if (!inputPath) {
      inputPath = path.join(workDir, path.basename(source.filename) || 'input.bin')
      await writeFile(inputPath, source.data as Buffer)
    }

    await runFfmpeg(ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      inputPath,
      // First decoded frame only — enough for a poster / admin thumbnail.
      '-frames:v',
      '1',
      // Cap width for stills; height follows aspect ratio.
      '-vf',
      'scale=1920:-1',
      '-q:v',
      '2',
      outputPath,
    ])

    const buffer = await readFile(outputPath)
    if (buffer.byteLength === 0) {
      throw new Error('ffmpeg produced an empty poster frame')
    }

    const baseName = path.parse(source.filename).name || 'video'

    return {
      buffer,
      filename: `${baseName}-poster.jpg`,
      mimeType: 'image/jpeg',
    }
  } finally {
    await rm(workDir, { force: true, recursive: true })
  }
}

function runFfmpeg(binary: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    const stderr: Buffer[] = []

    child.stderr?.on('data', (chunk: Buffer) => {
      stderr.push(chunk)
    })

    child.on('error', reject)

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      const detail = Buffer.concat(stderr).toString('utf8').trim()
      reject(new Error(detail || `ffmpeg exited with code ${code ?? 'unknown'}`))
    })
  })
}
