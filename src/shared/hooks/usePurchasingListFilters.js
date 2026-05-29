import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

const formatDateParam = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : undefined

export const usePurchasingListFilters = (initialRowsPerPage = 10) => {
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

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, dateFromParam, dateToParam, rowsPerPage])

  const clearFilters = () => {
    setSearch('')
    setDateFrom(null)
    setDateTo(null)
    setPage(0)
  }

  const hasActiveFilters = Boolean(
    search.trim() || dateFromParam || dateToParam,
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
  }
}
