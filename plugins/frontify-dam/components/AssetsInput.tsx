import {Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {set, type ArrayOfObjectsInputProps} from 'sanity'

import {useFinder} from './useFinder'
import {toStoredAsset} from '../mapAsset'
import type {FrontifyFieldOptions, FrontifyPluginOptions, FrontifyStoredAsset} from '../types'
import {AssetCard} from './AssetCard'
import {FinderDialog} from './FinderDialog'

type Props = ArrayOfObjectsInputProps & {
  defaults: FrontifyPluginOptions
}

export function AssetsInput(props: Props) {
  const {value, onChange, schemaType, defaults} = props
  const finder = useFinder(defaults, schemaType.options as FrontifyFieldOptions | undefined, true)
  const items = (Array.isArray(value) ? value : []) as FrontifyStoredAsset[]

  return (
    <Stack space={3}>
      <Flex justify="space-between" align="center" gap={2} wrap="wrap">
        <Text size={1} muted>
          {items.length
            ? `${items.length} asset${items.length === 1 ? '' : 's'}`
            : 'No assets selected'}
        </Text>
        <Button
          text={items.length ? 'Add from Frontify' : 'Select from Frontify'}
          onClick={finder.openFinder}
        />
      </Flex>

      {items.length === 0 ? (
        <Card padding={3} radius={2} border>
          <Text muted size={1}>
            Choose images, video, audio, or documents.
          </Text>
        </Card>
      ) : (
        <Flex gap={3} wrap="wrap">
          {items.map((item, index) => (
            <AssetCard
              key={item._key || `${item.id}-${index}`}
              asset={item}
              cdn={finder.cdn}
              onRemove={() => onChange(set(items.filter((_, i) => i !== index)))}
            />
          ))}
        </Flex>
      )}

      <FinderDialog
        open={finder.open}
        openingOptions={finder.openingOptions}
        onClose={finder.closeFinder}
        onAssetsChosen={(assets) => {
          const incoming = assets.map((asset) => toStoredAsset(asset, true))
          const byId = new Map(items.map((item) => [item.id, item]))
          for (const item of incoming) {
            if (!byId.has(item.id)) byId.set(item.id, item)
          }
          onChange(set(Array.from(byId.values())))
        }}
      />
    </Stack>
  )
}
