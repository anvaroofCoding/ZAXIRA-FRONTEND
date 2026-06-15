import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
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
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import {
  useDeleteWarehouseExpenseMutation,
  useGetWarehouseExpenseByCodeQuery,
  useGetWarehouseExpenseReasonsQuery,
  useGetWarehouseExpensesQuery,
} from '@/features/warehouse/api/warehouseApi'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { filterStructuresWithWarehouse } from '@/features/structures/utils/structureFilters'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { PageShell } from '@/shared/components/layout/PageShell'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { showNotification } from '@/shared/model/notificationSlice'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]
const CHIQIM_QILISH_PATH = '/omborlar/chiqim-qilish'
const ALL_STRUCTURES_VALUE = ''

export const ChiqimTarixiPage = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, canDelete } = usePermissions()
  const viewerStructureId = user?.structureId ?? ''
  const canDeleteExpense =
    user?.isSuperAdmin ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    canDelete(CHIQIM_QILISH_PATH)

  const [search, setSearch] = useState('')
  const [reasonKey, setReasonKey] = useState('')
  const [structureFilter, setStructureFilter] = useState(null)
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [detailSelection, setDetailSelection] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const [deleteExpense, deleteExpenseState] = useDeleteWarehouseExpenseMutation()

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
  }, [debouncedSearch, reasonKey, structureFilter, dateFromParam, dateToParam])

  useEffect(() => {
    if (structureFilter !== null) return
    setStructureFilter(viewerStructureId || ALL_STRUCTURES_VALUE)
  }, [structureFilter, viewerStructureId])

  useEffect(() => {
    const code = searchParams.get('chiqim')?.trim()
    if (!code) return

    const structureId = searchParams.get('structureId')?.trim() || undefined
    setDetailSelection({ code, structureId })

    const next = new URLSearchParams(searchParams)
    next.delete('chiqim')
    next.delete('structureId')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const structuresQuery = useGetStructuresQuery()
  const structuresForFilter = useMemo(() => {
    const list = filterStructuresWithWarehouse(structuresQuery.data)
    return [...list].sort((a, b) => a.shortName.localeCompare(b.shortName, 'uz'))
  }, [structuresQuery.data])

  const resolvedStructureFilter =
    structureFilter === null ? viewerStructureId || ALL_STRUCTURES_VALUE : structureFilter

  const structureIdParam =
    resolvedStructureFilter === ALL_STRUCTURES_VALUE ? undefined : resolvedStructureFilter

  const showAllStructures = resolvedStructureFilter === ALL_STRUCTURES_VALUE
  const showStructureColumn = showAllStructures || structuresForFilter.length > 1

  const reasonsQuery = useGetWarehouseExpenseReasonsQuery()
  const historyQuery = useGetWarehouseExpensesQuery(
    {
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch,
      dateFrom: dateFromParam,
      dateTo: dateToParam,
      reasonKey,
      structureId: structureIdParam,
    },
    { skip: structureFilter === null },
  )

  const detailQuery = useGetWarehouseExpenseByCodeQuery(
    {
      code: detailSelection?.code ?? '',
      structureId: detailSelection?.structureId,
    },
    { skip: !detailSelection?.code },
  )

  const items = historyQuery.data?.items ?? []
  const total = historyQuery.data?.total ?? 0
  const isReady = !historyQuery.isLoading && !historyQuery.isUninitialized
  const reasons = reasonsQuery.data ?? []

  const handleCloseDetail = () => {
    if (deleteExpenseState.isLoading) return
    setDetailSelection(null)
    setDeleteConfirmOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!detailSelection?.code) return

    const structureId =
      detailSelection.structureId || detailQuery.data?.structureId || undefined

    try {
      const result = await deleteExpense({
        code: detailSelection.code,
        structureId,
      }).unwrap()

      dispatch(
        showNotification({
          severity: 'success',
          message: `Chiqim o‘chirildi. Omborga ${result.restoredQuantity} ta qaytarildi.`,
        }),
      )
      setDeleteConfirmOpen(false)
      setDetailSelection(null)
    } catch (error) {
      dispatch(
        showNotification({
          severity: 'error',
          message: getApiErrorMessage(error, 'Chiqimni o‘chirishda xatolik'),
        }),
      )
    }
  }

  return (
    <PageShell>
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h5" component="h1" fontWeight={700} sx={{ flexShrink: 0 }}>
            Chiqim tarixi
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' },
              ml: { sm: 'auto' },
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
            }}
          >
            <DatePicker
              label="Sana (dan)"
              value={dateFrom}
              onChange={setDateFrom}
              format="DD.MM.YYYY"
              maxDate={dateTo || undefined}
              slotProps={{
                textField: { size: 'small', sx: { minWidth: { xs: '100%', sm: 160 } } },
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
                textField: { size: 'small', sx: { minWidth: { xs: '100%', sm: 160 } } },
                field: { clearable: true },
              }}
            />
          </Stack>
        </Box>

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

              <FormControl
                size="small"
                sx={{ minWidth: { xs: '100%', md: 240 } }}
                disabled={structureFilter === null}
              >
                <InputLabel id="expense-structure-filter-label">Tuzilma</InputLabel>
                <Select
                  labelId="expense-structure-filter-label"
                  label="Tuzilma"
                  value={resolvedStructureFilter}
                  onChange={(event) => setStructureFilter(event.target.value)}
                >
                  <MenuItem value={ALL_STRUCTURES_VALUE}>
                    <em>Barcha tuzilmalar</em>
                  </MenuItem>
                  {structuresForFilter.map((structure) => (
                    <MenuItem key={structure.id} value={structure.id}>
                      {structure.shortName || structure.fullName}
                      {structure.id === viewerStructureId ? ' (sizniki)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                      {showStructureColumn ? <TableCell>Tuzilma</TableCell> : null}
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
                        key={`${item.structureId}-${item.code}`}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() =>
                          setDetailSelection({
                            code: item.code,
                            structureId: item.structureId,
                          })
                        }
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                            {item.code}
                          </Typography>
                        </TableCell>
                        {showStructureColumn ? (
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {item.structureName ?? '—'}
                            </Typography>
                          </TableCell>
                        ) : null}
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

      <Dialog
        open={Boolean(detailSelection?.code)}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pr: canDeleteExpense ? 14 : undefined }}>Chiqim batafsil</DialogTitle>
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
                    Tuzilma
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {detailQuery.data.structureName ?? '—'}
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
                {detailQuery.data.serviceStructureName ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Xizmat
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {detailQuery.data.serviceStructureName}
                    </Typography>
                  </Box>
                ) : null}
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
                      <TableCell width={140}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
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
                        <TableCell sx={nomenclatureTableCellSx}>
                          {getItemNomenclatureCode(row)}
                        </TableCell>
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
        {canDeleteExpense && detailQuery.data ? (
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              O‘chirilgach tovarlar omborga qaytariladi
            </Typography>
            <Button
              color="error"
              variant="outlined"
              startIcon={
                deleteExpenseState.isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DeleteOutlinedIcon />
                )
              }
              disabled={deleteExpenseState.isLoading}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Chiqimni o‘chirish
            </Button>
          </DialogActions>
        ) : null}
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleteExpenseState.isLoading && setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Chiqimni o‘chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{detailSelection?.code}</strong> chiqimini o‘chirasizmi? Barcha tovarlar
            soni va qiymati omborga qaytariladi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteExpenseState.isLoading}
          >
            Bekor qilish
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteExpenseState.isLoading}
            onClick={handleConfirmDelete}
          >
            {deleteExpenseState.isLoading ? 'O‘chirilmoqda...' : 'O‘chirish'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
