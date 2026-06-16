import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
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
  useGetProductImportByIdQuery,
  useGetProductImportsQuery,
} from '@/features/product-import/api/productImportApi'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const ImportDetailDialog = ({ importId, open, onClose }) => {
  const detailQuery = useGetProductImportByIdQuery(importId, {
    skip: !open || !importId,
  })
  const record = detailQuery.data

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {record?.code ? `${record.code} — import tafsiloti` : 'Import tafsiloti'}
      </DialogTitle>
      <DialogContent dividers>
        {detailQuery.isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Yuklanmoqda...
          </Typography>
        ) : detailQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(detailQuery.error, 'Tafsilotni yuklab bo‘lmadi')}
          </Alert>
        ) : record ? (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                Sana: <strong>{formatDateTime(record.createdAt)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ombor joyi: <strong>{record.locationName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Import qilgan: <strong>{record.createdBy?.displayName ?? '—'}</strong>
              </Typography>
            </Stack>

            {record.comment?.trim() ? (
              <Typography variant="body2" color="text.secondary">
                Izoh: {record.comment.trim()}
              </Typography>
            ) : null}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tovar</TableCell>
                    <TableCell>Xususiyati</TableCell>
                    <TableCell align="right">Soni</TableCell>
                    <TableCell>Birlik</TableCell>
                    <TableCell>Davlati</TableCell>
                    <TableCell>Ombor joyi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(record.items ?? []).map((item, index) => (
                    <TableRow key={`${record.id}-item-${index}`}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>{item.characteristics}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.manufacturingCountry}</TableCell>
                      <TableCell>{item.locationName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Yopish</Button>
      </DialogActions>
    </Dialog>
  )
}

export const ProductImportsHistoryTable = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [detailId, setDetailId] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 350)
  const dateFromParam = useMemo(
    () =>
      dateFrom && dayjs(dateFrom).isValid()
        ? dayjs(dateFrom).format('YYYY-MM-DD')
        : undefined,
    [dateFrom],
  )
  const dateToParam = useMemo(
    () =>
      dateTo && dayjs(dateTo).isValid() ? dayjs(dateTo).format('YYYY-MM-DD') : undefined,
    [dateTo],
  )

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, dateFromParam, dateToParam])

  useEffect(() => {
    const importId = searchParams.get('import')?.trim()
    if (!importId) return

    setDetailId(importId)
    const next = new URLSearchParams(searchParams)
    next.delete('import')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const importsQuery = useGetProductImportsQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    dateFrom: dateFromParam,
    dateTo: dateToParam,
  })

  const items = importsQuery.data?.items ?? []
  const total = importsQuery.data?.total ?? 0

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        <TextField
          size="small"
          placeholder="Kod, tovar, izoh bo‘yicha qidirish"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: { xs: '100%', md: 280 }, flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <DatePicker
          label="Dan"
          value={dateFrom}
          onChange={setDateFrom}
          slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', sm: 160 } } } }}
        />
        <DatePicker
          label="Gacha"
          value={dateTo}
          onChange={setDateTo}
          slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', sm: 160 } } } }}
        />
      </Stack>

      <QuerySkeleton
        isLoading={importsQuery.isLoading}
        isUninitialized={importsQuery.isUninitialized}
        hasData={!importsQuery.isLoading && !importsQuery.isUninitialized}
      >
        {importsQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(importsQuery.error, 'Import tarixini yuklab bo‘lmadi')}
          </Alert>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Kod</TableCell>
                    <TableCell>Sana</TableCell>
                    <TableCell>Ombor joyi</TableCell>
                    <TableCell align="right">Tovarlar</TableCell>
                    <TableCell align="right">Jami dona</TableCell>
                    <TableCell>Import qilgan</TableCell>
                    <TableCell>Izoh</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!items.length ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          Hozircha import qilingan tavarlar topilmadi.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => setDetailId(row.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.code}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                        <TableCell>{row.locationName}</TableCell>
                        <TableCell align="right">{row.itemCount}</TableCell>
                        <TableCell align="right">{row.totalQuantity}</TableCell>
                        <TableCell>{row.createdBy?.displayName ?? '—'}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          {row.comment?.trim() || '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

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
      </QuerySkeleton>

      <ImportDetailDialog
        importId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
      />
    </Box>
  )
}
