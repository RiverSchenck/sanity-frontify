import {CloseIcon} from '@sanity/icons'
import {Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {useEffect, useState, type CSSProperties} from 'react'

import {DEFAULT_CDN, type CdnMode, type FrontifyStoredAsset} from '../types'
import {getFrontifyPreviewImageUrl} from '../urls'
import {AudioPlayer} from './AudioPlayer'
import {PdfPreview} from './PdfPreview'
import {VideoPlayer} from './VideoPlayer'

type Props = {
  asset: FrontifyStoredAsset
  onRemove?: () => void
  size?: number
  layout?: 'tile' | 'hero'
  cdn?: CdnMode
}

const MEDIA: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '1',
  overflow: 'hidden',
  background: 'var(--card-muted-bg-color)',
}

const IMAGE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'contain',
}

const REMOVE: CSSProperties = {
  position: 'absolute',
  top: 6,
  right: 6,
  zIndex: 1,
}

function isAudioAsset(asset: FrontifyStoredAsset): boolean {
  if (asset.type?.toLowerCase() === 'audio') return true
  return /^(aac|flac|m4a|mp3|ogg|wav|wma)$/i.test(asset.extension || '')
}

function isVideoAsset(asset: FrontifyStoredAsset): boolean {
  if (asset.type?.toLowerCase() === 'video') return true
  return /^(avi|m4v|mkv|mov|mp4|mpeg|mpg|webm)$/i.test(asset.extension || '')
}

function isPdfAsset(asset: FrontifyStoredAsset): boolean {
  if (/^pdf$/i.test(asset.extension || '')) return true
  return /\.pdf(\?|$)/i.test(asset.filename || asset.downloadUrl || asset.previewUrl || '')
}

function formatClock(seconds?: number): string | undefined {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return undefined
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function metaLine(asset: FrontifyStoredAsset): string | undefined {
  const pages =
    isPdfAsset(asset) && asset.pageCount
      ? asset.pageCount === 1
        ? '1 page'
        : `${asset.pageCount} pages`
      : undefined
  const parts = [
    asset.extension?.toUpperCase(),
    pages ||
      (asset.width && asset.height ? `${asset.width} × ${asset.height}` : formatClock(asset.duration)),
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : undefined
}

function FilePoster({asset}: {asset: FrontifyStoredAsset}) {
  return (
    <Flex align="center" justify="center" direction="column" gap={2} style={{height: '100%'}}>
      <Text size={2} weight="semibold" muted>
        {asset.extension?.toUpperCase() || asset.type || 'FILE'}
      </Text>
    </Flex>
  )
}

export function AssetCard({
  asset,
  onRemove,
  size = 168,
  layout = 'tile',
  cdn = DEFAULT_CDN,
}: Props) {
  const isHero = layout === 'hero'
  const imageSrc = getFrontifyPreviewImageUrl(asset, {
    cdn,
    width: isHero ? 480 : Math.ceil(size * 2),
  })
  const mediaSrc = asset.previewUrl || asset.downloadUrl
  const audioSrc = isAudioAsset(asset) ? mediaSrc : undefined
  const videoSrc = isVideoAsset(asset) ? mediaSrc : undefined
  const pdfSrc = isPdfAsset(asset) ? asset.previewUrl || asset.downloadUrl : undefined
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [imageSrc])

  const label = asset.title || asset.filename || 'Untitled'
  const alt = asset.isDecorative ? '' : asset.alternativeText || label
  const meta = metaLine(asset)
  const showImage = Boolean(imageSrc) && !broken && !audioSrc && !videoSrc && !pdfSrc

  return (
    <Card radius={2} border overflow="hidden" style={{width: isHero ? 240 : size}}>
      <div style={MEDIA}>
        {audioSrc ? (
          <AudioPlayer src={audioSrc} poster={imageSrc} label={label} duration={asset.duration} />
        ) : videoSrc ? (
          <VideoPlayer src={videoSrc} poster={imageSrc} label={label} duration={asset.duration} />
        ) : pdfSrc ? (
          <PdfPreview src={pdfSrc} poster={imageSrc} label={label} pages={asset.pageCount} />
        ) : showImage ? (
          <img src={imageSrc} alt={alt} style={IMAGE} onError={() => setBroken(true)} />
        ) : (
          <FilePoster asset={asset} />
        )}
        {onRemove && (
          <Card radius={2} shadow={2} style={REMOVE}>
            <Button
              icon={CloseIcon}
              mode="bleed"
              padding={2}
              fontSize={1}
              aria-label={`Remove ${label}`}
              onClick={onRemove}
            />
          </Card>
        )}
      </div>
      <Stack space={2} padding={2}>
        <Text size={1} weight="medium" title={label} textOverflow="ellipsis">
          {label}
        </Text>
        {meta && (
          <Text size={0} muted>
            {meta}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
