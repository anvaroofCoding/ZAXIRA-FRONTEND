import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'

const formatDateParam = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : undefined

export const ALL_STRUCTURES_FILTER_VALUE = ''

export const usePurchasingListFilters = (
  initialRowsPerPage = 10,
  { withStructureFilter = false, structureFilterDefault = 'viewer' } = {},
) => {
  const { user } = usePermissions()
  const viewerStructureId = user?.structureId ?? ''
  const defaultStructureFilter =
    structureFilterDefault === 'all'
      ? ALL_STRUCTURES_FILTER_VALUE
      : viewerStructureId || ALL_STRUCTURES_FILTER_VALUE

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)
  const [structureFilter, setStructureFilter] = useState(
    withStructureFilter ? null : undefined,
  )

  const debouncedSearch = useDebouncedValue(search, 350)

  const dateFromParam = useMemo(() => formatDateParam(dateFrom), [dateFrom])
  const dateToParam = useMemo(() => formatDateParam(dateTo), [dateTo])

  useEffect(() => {
    if (!withStructureFilter || structureFilter !== null) return
    setStructureFilter(defaultStructureFilter)
  }, [withStructureFilter, structureFilter, defaultStructureFilter])

  const resolvedStructureFilter = withStructureFilter
    ? structureFilter === null
      ? defaultStructureFilter
      : structureFilter
    : undefined

  const structureIdParam =
    withStructureFilter && resolvedStructureFilter !== ALL_STRUCTURES_FILTER_VALUE
      ? resolvedStructureFilter
      : undefined

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch,
      dateFrom: dateFromParam,
      dateTo: dateToParam,
      ...(structureIdParam ? { structureId: structureIdParam } : {}),
    }),
    [page, rowsPerPage, debouncedSearch, dateFromParam, dateToParam, structureIdParam],
  )

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, dateFromParam, dateToParam, rowsPerPage, structureIdParam])

  const clearFilters = () => {
    setSearch('')
    setDateFrom(null)
    setDateTo(null)
    setPage(0)
    if (withStructureFilter) {
      setStructureFilter(defaultStructureFilter)
    }
  }

  const hasActiveFilters = Boolean(
    search.trim() ||
      dateFromParam ||
      dateToParam ||
      (withStructureFilter &&
        structureFilter !== null &&
        structureFilter !== defaultStructureFilter),
  )

  return {
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    queryParams,
    clearFilters,
    hasActiveFilters,
    ...(withStructureFilter
      ? {
          structureFilter: resolvedStructureFilter,
          setStructureFilter,
          structureFilterReady: structureFilter !== null,
          viewerStructureId,
        }
      : {}),
  }
}
