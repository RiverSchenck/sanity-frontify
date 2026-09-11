import {LaunchIcon} from '@sanity/icons'
import {useEffect, useState, type CSSProperties} from 'react'

import {MediaOverlay} from './MediaOverlay'

type Props = {
  src: string
  label: string
  poster?: string
  pages?: number
}

const FILL: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
}

const PAGE: CSSProperties = {
  position: 'absolute',
  inset: '26% 24%',
  borderRadius: 4,
  border: '2px solid var(--card-fg-color)',
}

function PdfPoster() {
  return (
    <div aria-hidden style={FILL}>
      <span style={{...PAGE, opacity: 0.16, transform: 'rotate(-8deg)'}} />
      <span style={{...PAGE, opacity: 0.28}} />
    </div>
  )
}

function pageLabel(pages?: number): string | undefined {
  if (!pages || pages <= 0) return undefined
  return pages === 1 ? '1 page' : `${pages} pages`
}

export function PdfPreview({src, label, poster, pages}: Props) {
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [poster])
  const showPoster = Boolean(poster) && !broken

  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      {showPoster ? <img src={poster} alt="" style={FILL} onError={() => setBroken(true)} /> : <PdfPoster />}
      <MediaOverlay
        icon={LaunchIcon}
        label={`Open ${label}`}
        caption={pageLabel(pages)}
        onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
      />
    </div>
  )
}
