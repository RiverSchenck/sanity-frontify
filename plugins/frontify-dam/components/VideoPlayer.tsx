import {PauseIcon, PlayIcon} from '@sanity/icons'
import {useEffect, useRef, useState, type CSSProperties} from 'react'

import {MEDIA_PLAY_EVENT} from './mediaPlay'
import {MediaOverlay} from './MediaOverlay'

type Props = {
  src: string
  label: string
  poster?: string
  duration?: number
}

const FILL: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
}

const HIDE_NATIVE = `.frontify-dam-video::-webkit-media-controls,.frontify-dam-video::-webkit-media-controls-start-playback-button,.frontify-dam-video::-webkit-media-controls-overlay-play-button{display:none!important}`

function formatClock(seconds: number): string | undefined {
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VideoPlayer({src, label, poster, duration: durationHint}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(durationHint && durationHint > 0 ? durationHint : 0)

  useEffect(() => {
    setPlaying(false)
    setDuration(durationHint && durationHint > 0 ? durationHint : 0)
  }, [src, durationHint])

  useEffect(() => {
    const onOtherPlay = (event: Event) => {
      const other = (event as CustomEvent<HTMLMediaElement>).detail
      const el = videoRef.current
      if (el && other && other !== el) el.pause()
    }
    window.addEventListener(MEDIA_PLAY_EVENT, onOtherPlay)
    return () => window.removeEventListener(MEDIA_PLAY_EVENT, onOtherPlay)
  }, [])

  const toggle = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      if (el.ended) el.currentTime = 0
      void el.play()
    } else {
      el.pause()
    }
  }

  return (
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
      <style>{HIDE_NATIVE}</style>
      <video
        ref={videoRef}
        className="frontify-dam-video"
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        style={FILL}
        onClick={toggle}
        onPlay={(event) => {
          setPlaying(true)
          window.dispatchEvent(new CustomEvent(MEDIA_PLAY_EVENT, {detail: event.currentTarget}))
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(event) => {
          const next = event.currentTarget.duration
          if (Number.isFinite(next)) setDuration(next)
        }}
      />
      <MediaOverlay
        icon={playing ? PauseIcon : PlayIcon}
        label={playing ? `Pause ${label}` : `Play ${label}`}
        caption={!playing ? formatClock(duration) : undefined}
        onClick={toggle}
      />
    </div>
  )
}
