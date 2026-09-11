import type {OpeningOptions} from '@frontify/frontify-finder'

import {DEFAULT_CDN, type CdnMode, type FrontifyFieldOptions, type FrontifyPluginOptions} from './types'

export const FINDER_CLIENT_ID = 'sanity-finder'

export type ResolvedFrontifyOptions = {
  domain?: string
  filters?: FrontifyPluginOptions['filters']
  allowMultiSelect: boolean
  cdn: CdnMode
}

let studioCdn: CdnMode = DEFAULT_CDN

export function setStudioCdn(cdn?: CdnMode) {
  studioCdn = cdn ?? DEFAULT_CDN
}

/** Plugin-level `cdn`. Use in document `preview.prepare` so list thumbs follow config. */
export function getStudioCdn(): CdnMode {
  return studioCdn
}

export function resolveFieldOptions(
  defaults: FrontifyPluginOptions,
  fieldOptions: FrontifyFieldOptions | undefined,
  allowMultiSelectDefault: boolean,
): ResolvedFrontifyOptions {
  return {
    domain: fieldOptions?.domain ?? defaults.domain,
    filters: fieldOptions?.filters ?? defaults.filters,
    allowMultiSelect:
      fieldOptions?.allowMultiSelect ?? defaults.allowMultiSelect ?? allowMultiSelectDefault,
    cdn: fieldOptions?.cdn ?? defaults.cdn ?? DEFAULT_CDN,
  }
}

export function toOpeningOptions(resolved: ResolvedFrontifyOptions): OpeningOptions {
  return {
    clientId: FINDER_CLIENT_ID,
    ...(resolved.domain ? {domain: resolved.domain} : {}),
    options: {
      allowMultiSelect: resolved.allowMultiSelect,
      autoClose: false,
      permanentDownloadUrls: true,
      ...(resolved.filters?.length ? {filters: resolved.filters} : {}),
    },
  }
}
