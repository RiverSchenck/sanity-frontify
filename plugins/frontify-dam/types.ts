export type CdnMode = 'preview' | 'dynamic'

export const DEFAULT_CDN: CdnMode = 'preview'

export type FinderFilter = {
  key: string
  values: string[]
  inverted: boolean
}

export type FrontifyPluginOptions = {
  domain?: string
  filters?: FinderFilter[]
  allowMultiSelect?: boolean
  /** Studio + helper default. Read-time — changing this does not require re-picking assets. */
  cdn?: CdnMode
}

export type FrontifyFieldOptions = FrontifyPluginOptions

export type FrontifyStoredLicense = {
  _key: string
  title?: string
  text?: string
}

export type FrontifyStoredTag = {
  _key: string
  value?: string
  source?: string
}

export type FrontifyStoredMetadataValue = {
  value?: string
  optionId?: string
  text?: string
}

export type FrontifyStoredCustomMetadata = {
  _key: string
  property?: {
    id?: string
    name?: string
    type?: {name?: string}
  }
  value?: FrontifyStoredMetadataValue
  values?: ({_key: string} & FrontifyStoredMetadataValue)[]
}

/** Finder asset as stored on the document. Nested object arrays include Sanity `_key`s. */
export type FrontifyStoredAsset = {
  _type: 'frontifyAsset'
  _key?: string
  id: string
  externalId?: string
  title?: string
  description?: string
  creator?: {name?: string}
  createdAt?: string
  type?: string
  author?: string
  expiresAt?: string
  alternativeText?: string
  isDecorative?: boolean
  licenses?: FrontifyStoredLicense[]
  copyright?: {status?: string; notice?: string}
  tags?: FrontifyStoredTag[]
  customMetadata?: FrontifyStoredCustomMetadata[]
  filename?: string
  extension?: string
  size?: number
  previewUrl?: string
  downloadUrl?: string
  dynamicPreviewUrl?: string
  thumbnailUrl?: string
  icon?: string
  focalPoint?: number[]
  width?: number
  height?: number
  duration?: number
  bitrate?: number
  pageCount?: number
}
