import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

const formatDateParam = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : undefined

export const ALL_STRUCTURES_FILTER_VALUE = ''

export const useTransferListFilters = ({
  initialRowsPerPage = 10,
  withStructureFilter = false,
  viewerStructureId = '',
} = {}) => {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [structureFilter, setStructureFilter] = useState(
    withStructureFilter ? null : ALL_STRUCTURES_FILTER_VALUE,
  )
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)

  useEffect(() => {
    if (!withStructureFilter || structureFilter !== null) return
    setStructureFilter(ALL_STRUCTURES_FILTER_VALUE)
  }, [withStructureFilter, structureFilter])

  const debouncedSearch = useDebouncedValue(search, 350)
  const dateFromParam = useMemo(() => formatDateParam(dateFrom), [dateFrom])
  const dateToParam = useMemo(() => formatDateParam(dateTo), [dateTo])

  const resolvedStructureFilter =
    structureFilter === null
      ? withStructureFilter
        ? ALL_STRUCTURES_FILTER_VALUE
        : ALL_STRUCTURES_FILTER_VALUE
      : structureFilter

  const structureIdParam =
    withStructureFilter && resolvedStructureFilter
      ? resolvedStructureFilter
      : undefined

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch,
      dateFrom: dateFromParam,
      dateTo: dateToParam,
      structureId: structureIdParam,
    }),
    [
      page,
      rowsPerPage,
      debouncedSearch,
      dateFromParam,
      dateToParam,
      structureIdParam,
    ],
  )

  const setSearchWithReset = (value) => {
    setSearch(value)
    setPage(0)
  }

  const setDateFromWithReset = (value) => {
    setDateFrom(value)
    setPage(0)
  }

  const setDateToWithReset = (value) => {
    setDateTo(value)
    setPage(0)
  }

  const setStructureFilterWithReset = (value) => {
    setStructureFilter(value)
    setPage(0)
  }

  const setRowsPerPageWithReset = (value) => {
    setRowsPerPage(value)
    setPage(0)
  }

  const clearFilters = () => {
    setSearch('')
    setDateFrom(null)
    setDateTo(null)
    if (withStructureFilter) {
      setStructureFilter(ALL_STRUCTURES_FILTER_VALUE)
    }
    setPage(0)
  }

  const hasActiveFilters = Boolean(
    search.trim() ||
      dateFromParam ||
      dateToParam ||
      (withStructureFilter && resolvedStructureFilter),
  )

  return {
    search,
    setSearch: setSearchWithReset,
    dateFrom,
    setDateFrom: setDateFromWithReset,
    dateTo,
    setDateTo: setDateToWithReset,
    structureFilter: resolvedStructureFilter,
    setStructureFilter: setStructureFilterWithReset,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage: setRowsPerPageWithReset,
    queryParams,
    clearFilters,
    hasActiveFilters,
    viewerStructureId,
  }
}
