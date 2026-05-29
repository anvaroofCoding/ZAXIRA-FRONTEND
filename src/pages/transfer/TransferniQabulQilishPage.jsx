import { useEffect, useState } from 'react'
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
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useGetTransferInboxQuery } from '@/features/transfer/api/transferApi'
import { TransferPageFilters } from '@/features/transfer/components/TransferPageFilters'
import { ReceiveWarehouseDispatchDialog } from '@/features/warehouse-dispatches/components/ReceiveWarehouseDispatchDialog'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useTransferListFilters } from '@/shared/hooks/useTransferListFilters'
import { getDispatchStatusChipProps } from '@/features/warehouse-dispatches/utils/dispatchStatusDisplay'
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const TransferniQabulQilishPage = () => {
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
  } = useTransferListFilters()

  const [detailTarget, setDetailTarget] = useState(null)

  useEffect(
    () => () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    },
    [],
  )

  const inboxQuery = useGetTransferInboxQuery(queryParams)
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
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {inboxQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(inboxQuery.error, 'Transfer ro‘yxatini yuklab bo‘lmadi')}
            </Alert>
          ) : null}

          <TransferPageFilters
            title="Transferni qabul qilish"
            subtitle="Tovarlarni qisman yoki to‘liq qabul qiling"
            search={search}
            onSearchChange={setSearch}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            dateFromLabel="Sana (dan)"
            dateToLabel="Sana (gacha)"
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {!items.length ? (
            <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">Qabul qilish uchun transfer yo‘q</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 200, width: '1%', whiteSpace: 'nowrap' }}>
                      Nakladnoy
                    </TableCell>
                    <TableCell width={120}>Kod</TableCell>
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
                      onClick={() => setDetailTarget(item)}
                    >
                      <TableCell sx={{ minWidth: 200, width: '1%', whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
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
                        <Chip size="small" {...getDispatchStatusChipProps(item.status, item.statusLabel)} />
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
          title="Transferni qabul qilish"
          onClose={() => setDetailTarget(null)}
        />
      ) : null}
    </Box>
  )
}
