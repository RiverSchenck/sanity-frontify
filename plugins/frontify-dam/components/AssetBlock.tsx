import {useEffect, useRef, type CSSProperties, type MouseEvent} from 'react'
import {PatchEvent, set, useFormCallbacks, type BlockProps} from 'sanity'

import {useFinder} from './useFinder'
import {toStoredAsset} from '../mapAsset'
import type {FrontifyFieldOptions, FrontifyPluginOptions, FrontifyStoredAsset} from '../types'
import {AssetCard} from './AssetCard'
import {FinderDialog} from './FinderDialog'

type Props = BlockProps & {
  defaults: FrontifyPluginOptions
}

const SHELL: CSSProperties = {userSelect: 'none'}

function hasAssetId(value: unknown): value is FrontifyStoredAsset {
  return Boolean(value && typeof value === 'object' && 'id' in value && (value as FrontifyStoredAsset).id)
}

export function AssetBlock(props: Props) {
  const {defaults, onClose, onRemove, open, path, readOnly, schemaType, value} = props
  const asset = hasAssetId(value) ? value : undefined
  const {cdn, open: finderOpen, openingOptions, openFinder, closeFinder} = useFinder(
    defaults,
    schemaType.options as FrontifyFieldOptions | undefined,
    false,
  )
  const {onChange} = useFormCallbacks()
  const appliedRef = useRef(Boolean(asset))
  const autoOpenedRef = useRef(false)

  useEffect(() => {
    if (readOnly || !open) return
    onClose()
    if (asset) openFinder()
  }, [asset, onClose, open, openFinder, readOnly])

  useEffect(() => {
    if (readOnly || asset || autoOpenedRef.current) return
    autoOpenedRef.current = true
    openFinder()
  }, [asset, openFinder, readOnly])

  const dismissEmpty = () => {
    closeFinder()
    if (!appliedRef.current && !asset) onRemove()
  }

  return (
    <div
      contentEditable={false}
      style={SHELL}
      onMouseDown={(event: MouseEvent) => event.preventDefault()}
      onClick={(event: MouseEvent) => event.stopPropagation()}
    >
      {asset ? (
        <AssetCard
          asset={asset}
          layout="block"
          cdn={cdn}
          onReplace={readOnly ? undefined : openFinder}
          onRemove={readOnly ? undefined : onRemove}
        />
      ) : null}

      <FinderDialog
        open={finderOpen}
        openingOptions={openingOptions}
        onClose={dismissEmpty}
        onAssetsChosen={(assets) => {
          const chosen = assets[0]
          if (!chosen) return
          appliedRef.current = true
          onChange(
            PatchEvent.from(
              set(
                {
                  ...toStoredAsset(chosen),
                  _key: (value as FrontifyStoredAsset | undefined)?._key,
                  _type: 'frontifyAsset',
                },
                path,
              ),
            ),
          )
        }}
      />
    </div>
  )
}
