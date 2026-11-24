import { describe, expect, it } from 'vitest'
import { MEDIA_URL } from '@/utilities/getMediaUrl'
import { downloadableResource, fileTypeLabel, formatFileSize, resourceHref } from './resource'

describe('fileTypeLabel', () => {
  it('reads the extension', () => {
    expect(fileTypeLabel({ filename: 'workbook.pdf', mimeType: 'application/pdf' })).toBe('PDF')
  })

  it('falls back to a short MIME subtype', () => {
    expect(fileTypeLabel({ filename: 'README', mimeType: 'text/plain' })).toBe('PLAIN')
  })

  it('skips a MIME subtype readers would not recognise', () => {
    expect(
      fileTypeLabel({
        filename: 'notes',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
    ).toBe('')
  })
})

describe('formatFileSize', () => {
  it('formats each unit', () => {
    expect(formatFileSize(512)).toBe('512 bytes')
    expect(formatFileSize(640_000)).toBe('640 kB')
    expect(formatFileSize(2_418_000)).toBe('2.4 MB')
    expect(formatFileSize(1_200_000_000)).toBe('1.2 GB')
  })

  it('is empty when the size is unknown', () => {
    expect(formatFileSize(null)).toBe('')
    expect(formatFileSize(Number.NaN)).toBe('')
  })
})

describe('resourceHref', () => {
  const file = {
    _objectKey: null,
    filename: 'field notes.pdf',
    prefix: 'resources',
    url: '/api/resources/file/field%20notes.pdf',
  }

  it('links the CDN object key when a CDN host is set, else the Payload file route', () => {
    expect(resourceHref(file)).toBe(
      MEDIA_URL ? `${MEDIA_URL}/resources/field%20notes.pdf` : file.url,
    )
  })

  it('folds the per-upload object key into the path', () => {
    const href = resourceHref({ ...file, _objectKey: 'k1' })
    expect(href).toBe(MEDIA_URL ? `${MEDIA_URL}/resources/k1/field%20notes.pdf` : file.url)
  })
})

describe('downloadableResource', () => {
  const resource = {
    createdAt: '',
    id: 1,
    title: 'Workbook',
    updatedAt: '',
    usageStatus: 'public-approved' as const,
  }

  it('passes a populated, public-approved resource', () => {
    expect(downloadableResource(resource)).toBe(resource)
  })

  it('drops a bare id and any other status', () => {
    expect(downloadableResource(1)).toBeNull()
    expect(downloadableResource({ ...resource, usageStatus: 'internal' })).toBeNull()
  })
})
