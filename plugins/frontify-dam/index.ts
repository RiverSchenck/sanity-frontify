import {definePlugin} from 'sanity'

import {setStudioCdn} from './config'
import {createFrontifySchemaTypes} from './schema'
import type {FrontifyPluginOptions} from './types'

export {getStudioCdn} from './config'
export {DEFAULT_CDN} from './types'
export {frontifyPreviewMedia, getFrontifyPreviewImageUrl, getFrontifyUrl} from './urls'
export type {GetFrontifyUrlParams, FrontifyUrlSource} from './urls'
export type {
  CdnMode,
  FinderFilter,
  FrontifyFieldOptions,
  FrontifyPluginOptions,
  FrontifyStoredAsset,
  FrontifyStoredCustomMetadata,
  FrontifyStoredLicense,
  FrontifyStoredMetadataValue,
  FrontifyStoredTag,
} from './types'

export const frontifyPlugin = definePlugin<FrontifyPluginOptions>((opts = {}) => {
  setStudioCdn(opts.cdn)
  return {
    // Distinct from npm `@frontify/sanity-plugin-frontify` (`frontify-dam`).
    name: 'frontify-cdn',
    schema: {
      types: createFrontifySchemaTypes(opts),
    },
  }
})
