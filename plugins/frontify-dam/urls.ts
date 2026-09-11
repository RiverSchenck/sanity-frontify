import {createElement, type ReactElement} from 'react'

import {DEFAULT_CDN, type CdnMode, type FrontifyStoredAsset} from './types'

export type FrontifyUrlSource = Pick<
  FrontifyStoredAsset,
  | 'previewUrl'
  | 'downloadUrl'
  | 'dynamicPreviewUrl'
  | 'thumbnailUrl'
  | 'icon'
  | 'type'
  | 'extension'
>

export type GetFrontifyUrlParams = {
  width?: number
  height?: number
  format?: string
  page?: number
  cdn?: CdnMode
}

const IMAGE_URL = /\.(avif|bmp|gif|heic|jpe?g|png|svg|tiff?|webp)(\?|$)/i
const NON_IMAGE_TYPES = new Set(['audio', 'video', 'file'])

function withQueryParams(
  base: string,
  params: {width?: number; height?: number; format?: string; page?: number},
): string {
  const entries: [string, string][] = []
  if (params.width) entries.push(['width', String(params.width)])
  if (params.height) entries.push(['height', String(params.height)])
  if (params.format) entries.push(['format', params.format])
  if (params.page) entries.push(['page', String(params.page)])
  if (entries.length === 0) return base

  try {
    const url = new URL(base)
    for (const [key, value] of entries) url.searchParams.set(key, value)
    return url.toString()
  } catch {
    const qs = entries
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    return `${base}${base.includes('?') ? '&' : '?'}${qs}`
  }
}

function isVisualUrl(url?: string): url is string {
  return Boolean(url && IMAGE_URL.test(url))
}

/**
 * Delivery URL for a stored Frontify asset (the file itself).
 * `preview` (default) → previewUrl, else downloadUrl.
 * `dynamic` → dynamicPreviewUrl + optional width/height/format. Falls back to preview.
 */
export function getFrontifyUrl(
  asset?: FrontifyUrlSource | null,
  params: GetFrontifyUrlParams = {},
): string | undefined {
  if (!asset) return undefined

  if ((params.cdn ?? DEFAULT_CDN) === 'dynamic' && asset.dynamicPreviewUrl) {
    return withQueryParams(asset.dynamicPreviewUrl, params)
  }

  return asset.previewUrl || asset.downloadUrl
}

function isPdfSource(asset: FrontifyUrlSource): boolean {
  const ext = asset.extension?.toLowerCase()
  const type = asset.type?.toLowerCase()
  return (
    ext === 'pdf' ||
    type === 'document' ||
    /\.pdf(\?|$)/i.test(asset.previewUrl || '') ||
    /\.pdf(\?|$)/i.test(asset.thumbnailUrl || '')
  )
}

/**
 * URL safe to put in an `<img>`. Audio/video `previewUrl` is the media file;
 * Frontify’s generic file image is `thumbnailUrl` or `icon`.
 * PDF `thumbnailUrl` / `previewUrl` is the file; `width` makes Frontify return page 1 as jpeg.
 */
export function getFrontifyPreviewImageUrl(
  asset?: FrontifyUrlSource | null,
  params: GetFrontifyUrlParams = {},
): string | undefined {
  if (!asset) return undefined

  if (isPdfSource(asset)) {
    const base =
      asset.thumbnailUrl ||
      ((params.cdn ?? DEFAULT_CDN) === 'dynamic' && asset.dynamicPreviewUrl
        ? asset.dynamicPreviewUrl
        : asset.previewUrl || asset.dynamicPreviewUrl)
    if (!base) return undefined
    return withQueryParams(base, {
      width: params.width ?? 800,
      height: params.height,
      format: params.format,
      page: params.page ?? 1,
    })
  }

  const poster = [asset.thumbnailUrl, asset.icon].find(isVisualUrl)
  if (poster) {
    return withQueryParams(poster, {width: params.width, height: params.height, format: params.format})
  }

  const type = asset.type?.toLowerCase()
  const previewIsImage =
    type === 'image' || (!type || !NON_IMAGE_TYPES.has(type) ? isVisualUrl(asset.previewUrl) : false)

  if (previewIsImage) return getFrontifyUrl(asset, params)
  return undefined
}

/** Sanity list/document previews need an `<img>`, not a URL string. */
export function frontifyPreviewMedia(url?: string | null): ReactElement | undefined {
  if (!url) return undefined
  return createElement('img', {
    src: url,
    alt: '',
    style: {objectFit: 'cover', width: '100%', height: '100%'},
  })
}
