import type {FrontifyAsset} from '@frontify/frontify-finder'

import type {FrontifyStoredAsset, FrontifyStoredMetadataValue} from './types'

function newKey(id: string): string {
  return globalThis.crypto?.randomUUID?.() ?? `${id}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

type WithoutNullish<T> = {
  [K in keyof T]?: Exclude<T[K], null | undefined>
}

function omitNullish<T extends Record<string, unknown>>(obj: T): WithoutNullish<T> {
  const out: WithoutNullish<T> = {}
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key]
    if (value !== null && value !== undefined) {
      out[key] = value as WithoutNullish<T>[typeof key]
    }
  }
  return out
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string' && value) return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return undefined
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function asUrl(value: unknown): string | undefined {
  const url = asString(value)
  if (!url) return undefined
  const resolved = url.replaceAll('{width}', '800').replaceAll('{height}', '800')
  try {
    return new URL(resolved).toString()
  } catch {
    return undefined
  }
}

function asDatetime(value: unknown): string | undefined {
  const raw = asString(value)
  if (!raw) return undefined
  const time = Date.parse(raw)
  return Number.isNaN(time) ? undefined : new Date(time).toISOString()
}

function mapMetadataScalar(value: unknown): FrontifyStoredMetadataValue | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') return {value}
  if (typeof value === 'number' || typeof value === 'boolean') return {value: String(value)}
  if (typeof value !== 'object') return undefined
  const record = value as {optionId?: unknown; text?: unknown; value?: unknown}
  if (record.optionId !== undefined || record.text !== undefined) {
    return omitNullish({optionId: asString(record.optionId), text: asString(record.text)})
  }
  if ('value' in record) return mapMetadataScalar(record.value)
  return undefined
}

function mapMetadataEntry(entry: unknown): FrontifyStoredMetadataValue | undefined {
  if (entry && typeof entry === 'object' && 'value' in entry && !('optionId' in entry)) {
    return mapMetadataScalar((entry as {value: unknown}).value)
  }
  return mapMetadataScalar(entry)
}

function mapCustomMetadata(items: FrontifyAsset['customMetadata']): FrontifyStoredAsset['customMetadata'] {
  if (!items?.length) return undefined
  const mapped = items.flatMap((item) => {
    const property = item?.property
    const id = asString(property?.id)
    if (!id) return []
    const typeName = asString(property?.type?.name)
    const values = item.values
      ?.map((entry) => {
        const value = mapMetadataEntry(entry)
        return value ? {_key: newKey('meta'), ...value} : undefined
      })
      .filter((entry): entry is {_key: string} & FrontifyStoredMetadataValue => Boolean(entry))
    return [
      {
        _key: newKey(id),
        property: {
          id,
          ...omitNullish({
            name: asString(property?.name),
            type: typeName ? {name: typeName} : undefined,
          }),
        },
        ...omitNullish({value: mapMetadataScalar(item.value?.value ?? item.value)}),
        ...(values?.length ? {values} : {}),
      },
    ]
  })
  return mapped.length ? mapped : undefined
}

function mapTags(tags: FrontifyAsset['tags']): FrontifyStoredAsset['tags'] {
  if (!tags?.length) return undefined
  const mapped = tags.flatMap((tag) => {
    if (typeof tag === 'string') {
      return tag ? [{_key: newKey('tag'), value: tag}] : []
    }
    const value = asString(tag?.value)
    const source = asString(tag?.source)
    if (!value && !source) return []
    return [{_key: newKey('tag'), ...omitNullish({value, source})}]
  })
  return mapped.length ? mapped : undefined
}

function mapLicenses(licenses: FrontifyAsset['licenses']): FrontifyStoredAsset['licenses'] {
  if (!licenses?.length) return undefined
  const mapped = licenses.flatMap((license) => {
    const title = asString(license?.title)
    const text = asString(license?.text)
    if (!title && !text) return []
    return [{_key: newKey('license'), ...omitNullish({title, text})}]
  })
  return mapped.length ? mapped : undefined
}

function mapFocalPoint(value: unknown): number[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const points = value.map(asNumber).filter((point): point is number => point !== undefined)
  return points.length === value.length ? points : undefined
}

function mapAsset(asset: FrontifyAsset, withKey: boolean): FrontifyStoredAsset {
  const id = asString(asset.id)
  if (!id) throw new Error('Frontify asset is missing an id')

  const licenses = mapLicenses(asset.licenses)
  const tags = mapTags(asset.tags)
  const customMetadata = mapCustomMetadata(asset.customMetadata)

  return {
    _type: 'frontifyAsset',
    ...(withKey ? {_key: newKey(id)} : {}),
    ...omitNullish({
      id,
      externalId: asString(asset.externalId),
      title: asString(asset.title),
      description: asString(asset.description),
      creator: asString(asset.creator?.name) ? {name: asString(asset.creator?.name)} : undefined,
      createdAt: asDatetime(asset.createdAt),
      type: asString(asset.type),
      author: asString(asset.author),
      expiresAt: asDatetime(asset.expiresAt),
      alternativeText: asString(asset.alternativeText),
      isDecorative: asBoolean(asset.isDecorative),
      licenses,
      copyright: asset.copyright
        ? omitNullish({
            status: asString(asset.copyright.status),
            notice: asString(asset.copyright.notice),
          })
        : undefined,
      tags,
      customMetadata,
      filename: asString(asset.filename),
      extension: asString(asset.extension),
      size: asNumber(asset.size),
      previewUrl: asUrl(asset.previewUrl),
      downloadUrl: asUrl(asset.downloadUrl),
      dynamicPreviewUrl: asUrl(asset.dynamicPreviewUrl),
      thumbnailUrl: asUrl(asset.thumbnailUrl),
      icon: asUrl(asset.icon),
      focalPoint: mapFocalPoint(asset.focalPoint),
      width: asNumber(asset.width),
      height: asNumber(asset.height),
      duration: asNumber(asset.duration),
      bitrate: asNumber(asset.bitrate),
      pageCount: asNumber(asset.pageCount),
    }),
    id,
  }
}

export function toStoredAsset(asset: FrontifyAsset, withKey = false): FrontifyStoredAsset {
  try {
    return mapAsset(asset, withKey)
  } catch {
    const id = asString(asset.id) ?? newKey('asset')
    return {
      _type: 'frontifyAsset',
      ...(withKey ? {_key: newKey(id)} : {}),
      id,
      ...omitNullish({
        title: asString(asset.title),
        filename: asString(asset.filename),
        type: asString(asset.type),
        previewUrl: asUrl(asset.previewUrl),
        downloadUrl: asUrl(asset.downloadUrl),
        dynamicPreviewUrl: asUrl(asset.dynamicPreviewUrl),
        thumbnailUrl: asUrl(asset.thumbnailUrl),
        icon: asUrl(asset.icon),
        width: asNumber(asset.width),
        height: asNumber(asset.height),
      }),
    }
  }
}
