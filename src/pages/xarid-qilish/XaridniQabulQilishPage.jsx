import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import { PurchasingPageFilters } from '@/features/purchase-requests/components/PurchasingPageFilters'
import { PurchasingInboxSkeleton } from '@/features/purchase-requests/components/PurchasingInboxSkeletons'
import { ReceiveWarehouseDispatchDialog } from '@/features/warehouse-dispatches/components/ReceiveWarehouseDispatchDialog'
import { useGetWarehouseReceiptInboxQuery } from '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePurchasingListFilters } from '@/shared/hooks/usePurchasingListFilters'
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import { formatDateTime } from '@/shared/utils/formatDate'
import { useQueryParamOpen } from '@/shared/hooks/useQueryParamOpen'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const XaridniQabulQilishPage = () => {
  const {
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
  } = usePurchasingListFilters()

  const [searchParams] = useSearchParams()
  const [detailTarget, setDetailTarget] = useState(() => {
    const dispatchId = searchParams.get('dispatch')?.trim()
    return dispatchId ? { id: dispatchId } : null
  })

  const openDispatchFromQuery = useCallback((id) => setDetailTarget({ id }), [])
  useQueryParamOpen('dispatch', openDispatchFromQuery)

  useEffect(
    () => () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    },
    [],
  )

  const inboxQuery = useGetWarehouseReceiptInboxQuery(queryParams)

  const items = inboxQuery.data?.items ?? []
  const total = inboxQuery.data?.total ?? 0
  const isReady = !inboxQuery.isLoading && !inboxQuery.isUninitialized

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={inboxQuery.isLoading}
        isFetching={inboxQuery.isFetching}
        isUninitialized={inboxQuery.isUninitialized}
        hasData={isReady}
        skeleton={<PurchasingInboxSkeleton variant="receipt" ariaLabel="Qabul qilish ro‘yxati yuklanmoqda" />}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {inboxQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(inboxQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : null}

          <PurchasingPageFilters
            title="Xaridni qabul qilish"
            search={search}
            onSearchChange={setSearch}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            dateFromLabel="Jo‘natilgan (dan)"
            dateToLabel="Jo‘natilgan (gacha)"
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {!items.length ? (
            <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">Qabul qilish uchun jo‘natmalar yo‘q</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 200, width: '1%', whiteSpace: 'nowrap' }}>
                      Nakladnoy raqami
                    </TableCell>
                    <TableCell width={120}>Ariza</TableCell>
                    <TableCell width={150}>Sana</TableCell>
                    <TableCell width={140}>Jo‘natuvchi</TableCell>
                    <TableCell width={110}>Tuzilma</TableCell>
                    <TableCell width={100}>Qolgan</TableCell>
                    <TableCell width={180}>Holat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setDetailTarget({ id: item.id })}
                    >
                      <TableCell sx={{ minWidth: 200, width: '1%', whiteSpace: 'nowrap' }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', flexWrap: 'nowrap' }}
                        >
                          {!item.isSeenByReceiver ? (
                            <Badge color="error" variant="dot" sx={{ flexShrink: 0 }} />
                          ) : null}
                          <Typography component="span" variant="body2" sx={dispatchCodeSx}>
                            {item.dispatchCode}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{item.requestCode}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {formatDateTime(item.dispatchedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {item.dispatchedBy?.displayName ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.targetStructure.shortName}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.pendingTotal} ta</TableCell>
                      <TableCell>
                        <Chip size="small" color="info" label={item.statusLabel} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

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
            labelRowsPerPage="Qatorlar:"
          />
        </Box>
      </QuerySkeleton>

      {detailTarget ? (
        <ReceiveWarehouseDispatchDialog
          open
          dispatchId={detailTarget.id}
          requireItemNomenclature
          onClose={() => setDetailTarget(null)}
          onSuccess={() => setDetailTarget(null)}
        />
      ) : null}
    </Box>
  )
}
