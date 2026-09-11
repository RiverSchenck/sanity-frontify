import {Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {set, unset, type ObjectInputProps} from 'sanity'

import {useFinder} from './useFinder'
import {toStoredAsset} from '../mapAsset'
import type {FrontifyFieldOptions, FrontifyPluginOptions, FrontifyStoredAsset} from '../types'
import {AssetCard} from './AssetCard'
import {FinderDialog} from './FinderDialog'

type Props = ObjectInputProps & {
  defaults: FrontifyPluginOptions
}

export function AssetInput(props: Props) {
  const {onChange, schemaType, defaults} = props
  const value = props.value as FrontifyStoredAsset | undefined
  const finder = useFinder(defaults, schemaType.options as FrontifyFieldOptions | undefined, false)
  const selected = Boolean(value?.id)

  return (
    <Stack space={3}>
      <Flex justify={selected ? 'flex-end' : 'space-between'} align="center" gap={2} wrap="wrap">
        {!selected && (
          <Text size={1} muted>
            No asset selected
          </Text>
        )}
        <Button
          text={selected ? 'Replace' : 'Select from Frontify'}
          onClick={finder.openFinder}
        />
      </Flex>

      {selected && value ? (
        <AssetCard asset={value} layout="hero" cdn={finder.cdn} onRemove={() => onChange(unset())} />
      ) : (
        <Card padding={3} radius={2} border>
          <Text muted size={1}>
            Choose an image, video, audio, or document.
          </Text>
        </Card>
      )}

      <FinderDialog
        open={finder.open}
        openingOptions={finder.openingOptions}
        onClose={finder.closeFinder}
        onAssetsChosen={(assets) => {
          const asset = assets[0]
          if (!asset) return
          onChange(
            set({
              ...toStoredAsset(asset),
              ...(value?._key ? {_key: value._key} : {}),
            }),
          )
        }}
      />
    </Stack>
  )
}
