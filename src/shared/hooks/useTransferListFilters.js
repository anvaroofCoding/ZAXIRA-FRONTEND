import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

const formatDateParam = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : undefined

export const useTransferListFilters = (initialRowsPerPage = 10) => {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)

  const debouncedSearch = useDebouncedValue(search, 350)
  const dateFromParam = useMemo(() => formatDateParam(dateFrom), [dateFrom])
  const dateToParam = useMemo(() => formatDateParam(dateTo), [dateTo])

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch,
      dateFrom: dateFromParam,
      dateTo: dateToParam,
    }),
    [page, rowsPerPage, debouncedSearch, dateFromParam, dateToParam],
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

  const setRowsPerPageWithReset = (value) => {
    setRowsPerPage(value)
    setPage(0)
  }

  const clearFilters = () => {
    setSearch('')
    setDateFrom(null)
    setDateTo(null)
    setPage(0)
  }

  const hasActiveFilters = Boolean(search.trim() || dateFromParam || dateToParam)

  return {
    search,
    setSearch: setSearchWithReset,
    dateFrom,
    setDateFrom: setDateFromWithReset,
    dateTo,
    setDateTo: setDateToWithReset,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage: setRowsPerPageWithReset,
    queryParams,
    clearFilters,
    hasActiveFilters,
  }
}
