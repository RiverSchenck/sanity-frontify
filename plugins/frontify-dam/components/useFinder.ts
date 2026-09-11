import {useCallback, useMemo, useState} from 'react'

import {resolveFieldOptions, toOpeningOptions} from '../config'
import type {FrontifyFieldOptions, FrontifyPluginOptions} from '../types'

export function useFinder(
  defaults: FrontifyPluginOptions,
  fieldOptions: FrontifyFieldOptions | undefined,
  allowMultiSelectDefault: boolean,
) {
  const [open, setOpen] = useState(false)
  const resolved = useMemo(
    () => resolveFieldOptions(defaults, fieldOptions, allowMultiSelectDefault),
    [defaults, fieldOptions, allowMultiSelectDefault],
  )
  const openingOptions = useMemo(() => toOpeningOptions(resolved), [resolved])
  const openFinder = useCallback(() => setOpen(true), [])
  const closeFinder = useCallback(() => setOpen(false), [])

  return {open, cdn: resolved.cdn, openingOptions, openFinder, closeFinder}
}
