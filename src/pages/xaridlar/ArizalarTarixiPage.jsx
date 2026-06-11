import { useCallback, useEffect, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useGetPurchaseRequestHistoryQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { PurchaseRequestHistoryTable } from '@/features/purchase-requests/components/PurchaseRequestHistoryTable'
import { PurchaseRequestReadOnlyDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestReadOnlyDetailDialog'
import { PurchaseRequestsPageSkeleton } from '@/features/purchase-requests/components/PurchaseRequestsPageSkeleton'
import {
  HISTORY_EVENT_TYPE_OPTIONS,
  PURCHASE_REQUEST_STATUS_OPTIONS,
} from '@/features/purchase-requests/utils/historyLabels'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useSubmittedDocumentDownload } from '@/features/purchase-requests/hooks/useSubmittedDocumentDownload'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { useQueryParamOpen } from '@/shared/hooks/useQueryParamOpen'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export const ArizalarTarixiPage = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [eventType, setEventType] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [detailRequestId, setDetailRequestId] = useState(null)

  const openDetailFromQuery = useCallback((id) => setDetailRequestId(id), [])
  useQueryParamOpen('detail', openDetailFromQuery)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, status, eventType])

  const historyQuery = useGetPurchaseRequestHistoryQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    status,
    eventType,
  })

  const items = useMemo(() => historyQuery.data?.items ?? [], [historyQuery.data?.items])
  const total = historyQuery.data?.total ?? 0
  const isReady = !historyQuery.isLoading && !historyQuery.isUninitialized

  const { downloadingId, downloadHandlers } = useSubmittedDocumentDownload({
    onError: (error) => {
      // eslint-disable-next-line no-alert
      window.alert(error.message || 'Yuklab olishda xatolik')
    },
  })

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={historyQuery.isLoading}
        isFetching={historyQuery.isFetching}
        isUninitialized={historyQuery.isUninitialized}
        hasData={isReady}
        skeleton={
          <PurchaseRequestsPageSkeleton
            variant="history"
            ariaLabel="Arizalar tarixi yuklanmoqda"
          />
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Arizalar tarixi
          </Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ flexWrap: 'wrap' }}
          >
              <TextField
                size="small"
                placeholder="Qidiruv"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ flex: 1, minWidth: { xs: '100%', md: 280 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                <InputLabel id="history-status-label">Ariza holati</InputLabel>
                <Select
                  labelId="history-status-label"
                  label="Ariza holati"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {PURCHASE_REQUEST_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                <InputLabel id="history-event-label">Hodisa turi</InputLabel>
                <Select
                  labelId="history-event-label"
                  label="Hodisa turi"
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value)}
                >
                  {HISTORY_EVENT_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
          </Stack>

          {historyQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(historyQuery.error, 'Tarixni yuklab bo‘lmadi')}
            </Alert>
          ) : (
            <>
              <PurchaseRequestHistoryTable
                items={items}
                onView={(row) => setDetailRequestId(row.requestId)}
              />

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setPage(0)
                }}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Sahifada:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} / ${count !== -1 ? count : `>${to}`}`
                }
              />
            </>
          )}
        </Box>
      </QuerySkeleton>

      <PurchaseRequestReadOnlyDetailDialog
        open={Boolean(detailRequestId)}
        requestId={detailRequestId}
        historyView
        downloading={downloadingId === detailRequestId}
        onClose={() => setDetailRequestId(null)}
        {...downloadHandlers}
      />
    </Box>
  )
}
