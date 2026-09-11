import {create, type FrontifyAsset, type OpeningOptions} from '@frontify/frontify-finder'
import {CloseIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Spinner, Text} from '@sanity/ui'
import {useEffect, useRef, useState, type CSSProperties} from 'react'
import {createPortal} from 'react-dom'

type Props = {
  open: boolean
  openingOptions: OpeningOptions
  onClose: () => void
  onAssetsChosen: (assets: FrontifyAsset[]) => void
}

const OVERLAY_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  background: 'color-mix(in srgb, var(--card-fg-color) 40%, transparent)',
}

const CARD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: 'min(1600px, calc(100vw - 48px))',
  height: 'min(800px, calc(100vh - 48px))',
  overflow: 'hidden',
}

const MOUNT_STYLE: CSSProperties = {
  position: 'relative',
  flex: 1,
  minWidth: 0,
  minHeight: 0,
}

function syncFinderIframe(container: HTMLElement) {
  const iframe = container.querySelector('iframe')
  if (!iframe) return
  const {width, height} = container.getBoundingClientRect()
  iframe.style.display = 'block'
  iframe.style.border = 'none'
  iframe.style.width = `${Math.max(0, Math.round(width))}px`
  iframe.style.height = `${Math.max(0, Math.round(height))}px`
}

export function FinderDialog({open, openingOptions, onClose, onAssetsChosen}: Props) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const onCloseRef = useRef(onClose)
  const onChosenRef = useRef(onAssetsChosen)
  onCloseRef.current = onClose
  onChosenRef.current = onAssetsChosen

  const openingKey = JSON.stringify(openingOptions)

  useEffect(() => {
    if (!open || !container) return

    let cancelled = false
    let finder: Awaited<ReturnType<typeof create>> | undefined
    setLoading(true)
    setError(null)
    const options = JSON.parse(openingKey) as OpeningOptions

    ;(async () => {
      try {
        finder = await create(options)
        if (cancelled) {
          finder.close()
          return
        }
        finder.onAssetsChosen((assets) => {
          try {
            onChosenRef.current(assets)
          } catch (err) {
            console.error('Frontify Finder: failed to apply selected assets', err)
          } finally {
            onCloseRef.current()
          }
        })
        finder.onCancel(() => onCloseRef.current())
        finder.mount(container)
        syncFinderIframe(container)
        if (!cancelled) setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load Frontify Finder')
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
      finder?.close()
    }
  }, [open, container, openingKey])

  useEffect(() => {
    if (!open || !container) return

    const sync = () => syncFinderIframe(container)
    const frame = requestAnimationFrame(sync)
    const observer = new ResizeObserver(sync)
    observer.observe(container)
    window.addEventListener('resize', sync)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [open, container, loading])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Frontify Finder"
      style={OVERLAY_STYLE}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <Card radius={3} shadow={4} style={CARD_STYLE}>
        <Flex align="center" padding={3}>
          <Box flex={1} padding={2}>
            <Text size={1} weight="semibold">
              Frontify
            </Text>
          </Box>
          <Button icon={CloseIcon} mode="bleed" onClick={onClose} aria-label="Close" />
        </Flex>
        <div style={MOUNT_STYLE}>
          {loading && !error && (
            <Flex
              align="center"
              justify="center"
              style={{position: 'absolute', inset: 0, zIndex: 1, background: 'var(--card-bg-color)'}}
            >
              <Flex direction="column" align="center" gap={3}>
                <Spinner muted />
                <Text muted size={1}>
                  Loading…
                </Text>
              </Flex>
            </Flex>
          )}
          {error && (
            <Flex align="center" justify="center" style={{height: '100%'}}>
              <Text size={1}>
                {error}
              </Text>
            </Flex>
          )}
          <div ref={setContainer} style={{position: 'absolute', inset: 0}} />
        </div>
      </Card>
    </div>,
    document.body,
  )
}
