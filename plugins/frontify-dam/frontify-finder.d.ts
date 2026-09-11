// @frontify/frontify-finder ships index.d.ts but omits it from package.json "exports".
declare module '@frontify/frontify-finder' {
  export type FrontifyAsset = {
    id: string
    externalId: string | null
    title: string
    description: string | null
    creator: {
      name: string
    }
    createdAt: string
    type: string
    author: string | null
    expiresAt: string | null
    alternativeText: string | null
    isDecorative: boolean
    licenses:
      | {
          title: string
          text: string
        }[]
      | null
    copyright: {
      status: string
      notice: string
    } | null
    tags:
      | {
          value: string
          source: string
        }[]
      | null
    customMetadata: {
      property: {
        id: string
        name: string
        type: {
          name: string
        }
      }
      value?: {
        value: string | {optionId: string; text: string}
      }
      values?: {
        value: {optionId: string; text: string}
      }[]
    }[]
    filename?: string | null
    extension?: string
    size?: number | null
    downloadUrl?: string | null
    previewUrl?: string
    dynamicPreviewUrl?: string | null
    thumbnailUrl?: string | null
    icon?: string
    focalPoint?: number[] | null
    width?: number
    height?: number
    duration?: number
    bitrate?: number
    pageCount?: number | null
  }

  export type FinderFilter = {
    key: string
    values: string[]
    inverted: boolean
  }

  export type OpeningOptions = {
    clientId: string
    domain?: string
    options?: {
      allowMultiSelect?: boolean
      autoClose?: boolean
      filters?: FinderFilter[]
      permanentDownloadUrls?: boolean
    }
  }

  export function create(opts: OpeningOptions): Promise<{
    onAssetsChosen(callback: (assets: FrontifyAsset[]) => void): unknown
    onCancel(callback: () => void): unknown
    mount(parentNode: HTMLElement): void
    close(): void
  }>
}
