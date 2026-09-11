import {PauseIcon, PlayIcon} from '@sanity/icons'
import {Flex} from '@sanity/ui'
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

const WAVE = [10, 18, 28, 16, 22, 34, 14, 24, 12, 20, 30, 16, 10]

function formatClock(seconds: number): string | undefined {
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function WaveformPoster() {
  return (
    <Flex
      align="center"
      justify="center"
      gap={2}
      aria-hidden
      style={{...FILL, opacity: 0.28}}
    >
      {WAVE.map((height, index) => (
        <span
          key={index}
          style={{
            width: 5,
            height,
            borderRadius: 999,
            background: 'var(--card-fg-color)',
          }}
        />
      ))}
    </Flex>
  )
}

export function AudioPlayer({src, label, poster, duration: durationHint}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(durationHint && durationHint > 0 ? durationHint : 0)

  useEffect(() => {
    setPlaying(false)
    setDuration(durationHint && durationHint > 0 ? durationHint : 0)
  }, [src, durationHint])

  useEffect(() => {
    const onOtherPlay = (event: Event) => {
      const other = (event as CustomEvent<HTMLMediaElement>).detail
      const el = audioRef.current
      if (el && other && other !== el) el.pause()
    }
    window.addEventListener(MEDIA_PLAY_EVENT, onOtherPlay)
    return () => window.removeEventListener(MEDIA_PLAY_EVENT, onOtherPlay)
  }, [])

  const toggle = () => {
    const el = audioRef.current
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
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
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
      {poster ? <img src={poster} alt="" style={FILL} /> : <WaveformPoster />}
      <MediaOverlay
        icon={playing ? PauseIcon : PlayIcon}
        label={playing ? `Pause ${label}` : `Play ${label}`}
        caption={!playing ? formatClock(duration) : undefined}
        onClick={toggle}
      />
    </div>
  )
}
