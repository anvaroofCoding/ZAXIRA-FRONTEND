import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {
  useGetWarehouseExpenseByCodeQuery,
  useGetWarehouseExpenseReasonsQuery,
  useGetWarehouseExpensesQuery,
} from '@/features/warehouse/api/warehouseApi'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { PageShell } from '@/shared/components/layout/PageShell'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const ChiqimTarixiPage = () => {
  const [search, setSearch] = useState('')
  const [reasonKey, setReasonKey] = useState('')
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [detailCode, setDetailCode] = useState('')

  const debouncedSearch = useDebouncedValue(search, 350)
  const dateFromParam = useMemo(
    () => (dateFrom && dayjs(dateFrom).isValid() ? dayjs(dateFrom).format('YYYY-MM-DD') : undefined),
    [dateFrom],
  )
  const dateToParam = useMemo(
    () => (dateTo && dayjs(dateTo).isValid() ? dayjs(dateTo).format('YYYY-MM-DD') : undefined),
    [dateTo],
  )

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, reasonKey, dateFromParam, dateToParam])

  const reasonsQuery = useGetWarehouseExpenseReasonsQuery()
  const historyQuery = useGetWarehouseExpensesQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    dateFrom: dateFromParam,
    dateTo: dateToParam,
    reasonKey,
  })

  const detailQuery = useGetWarehouseExpenseByCodeQuery(detailCode, {
    skip: !detailCode,
  })

  const items = historyQuery.data?.items ?? []
  const total = historyQuery.data?.total ?? 0
  const isReady = !historyQuery.isLoading && !historyQuery.isUninitialized
  const reasons = reasonsQuery.data ?? []

  return (
    <PageShell>
      <Stack spacing={2}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Chiqim tarixi
        </Typography>

        <QuerySkeleton
          isLoading={historyQuery.isLoading}
          isFetching={historyQuery.isFetching}
          isUninitialized={historyQuery.isUninitialized}
          hasData={isReady}
        >
          <Stack spacing={2}>
            {historyQuery.isError ? (
              <Alert severity="error">
                {getApiErrorMessage(historyQuery.error, 'Chiqim tarixini yuklab bo‘lmadi')}
              </Alert>
            ) : null}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Qidiruv"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                sx={{ flex: { md: '1 1 280px' } }}
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

              <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
                <InputLabel id="expense-reason-filter-label">Sabab</InputLabel>
                <Select
                  labelId="expense-reason-filter-label"
                  label="Sabab"
                  value={reasonKey}
                  onChange={(event) => setReasonKey(event.target.value)}
                >
                  <MenuItem value="">Barchasi</MenuItem>
                  {reasons.map((reason) => (
                    <MenuItem key={reason.key} value={reason.key}>
                      {reason.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Sana (dan)"
                value={dateFrom}
                onChange={setDateFrom}
                format="DD.MM.YYYY"
                maxDate={dateTo || undefined}
                slotProps={{
                  textField: { size: 'small', sx: { minWidth: { xs: '100%', md: 160 } } },
                  field: { clearable: true },
                }}
              />

              <DatePicker
                label="Sana (gacha)"
                value={dateTo}
                onChange={setDateTo}
                format="DD.MM.YYYY"
                minDate={dateFrom || undefined}
                slotProps={{
                  textField: { size: 'small', sx: { minWidth: { xs: '100%', md: 160 } } },
                  field: { clearable: true },
                }}
              />
            </Stack>

            {!items.length ? (
              <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">Chiqimlar hozircha yo‘q</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" aria-label="Chiqim tarixi">
                  <TableHead>
                    <TableRow>
                      <TableCell>Kod</TableCell>
                      <TableCell>Sabab</TableCell>
                      <TableCell width={180}>Sana</TableCell>
                      <TableCell>Kim</TableCell>
                      <TableCell width={90} align="right">
                        Tovar
                      </TableCell>
                      <TableCell width={90} align="right">
                        Soni
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.code}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setDetailCode(item.code)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                            {item.code}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.reasonLabel}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {formatDateTime(item.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {item.createdBy?.displayName ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.itemsCount}</TableCell>
                        <TableCell align="right">{item.totalQuantity} ta</TableCell>
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
          </Stack>
        </QuerySkeleton>
      </Stack>

      <Dialog open={Boolean(detailCode)} onClose={() => setDetailCode('')} maxWidth="md" fullWidth>
        <DialogTitle>Chiqim batafsil</DialogTitle>
        <DialogContent dividers>
          {detailQuery.isLoading ? (
            <Typography color="text.secondary">Yuklanmoqda...</Typography>
          ) : detailQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(detailQuery.error, 'Chiqim tafsilotini yuklab bo‘lmadi')}
            </Alert>
          ) : detailQuery.data ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Kod
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    {detailQuery.data.code}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Sabab
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {detailQuery.data.reasonLabel}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Sana
                  </Typography>
                  <Typography variant="body2">{formatDateTime(detailQuery.data.createdAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Kim
                  </Typography>
                  <Typography variant="body2">
                    {detailQuery.data.createdBy?.displayName ?? '—'}
                  </Typography>
                </Box>
              </Stack>

              {detailQuery.data.comment ? (
                <Typography variant="body2" color="text.secondary">
                  Izoh: {detailQuery.data.comment}
                </Typography>
              ) : null}

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tovar</TableCell>
                      <TableCell width={140}>Joy</TableCell>
                      <TableCell width={160}>Barcode</TableCell>
                      <TableCell width={80} align="right">
                        Soni
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailQuery.data.items?.map((row, index) => (
                      <TableRow key={`${row.barcode}-${index}`}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.name}
                          </Typography>
                          {row.characteristics ? (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {row.characteristics}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>{row.locationName}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{row.barcode}</TableCell>
                        <TableCell align="right">{row.quantity} ta</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
