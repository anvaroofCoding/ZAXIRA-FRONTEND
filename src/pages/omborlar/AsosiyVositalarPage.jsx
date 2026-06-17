import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HistoryIcon from '@mui/icons-material/History'
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
import {
  useDiscardWarehouseFixedAssetMutation,
  useGetWarehouseFixedAssetsQuery,
  useReturnWarehouseFixedAssetMutation,
} from '@/features/warehouse/api/warehouseApi'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { PageShell } from '@/shared/components/layout/PageShell'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useQueryParamOpen } from '@/shared/hooks/useQueryParamOpen'
import { showNotification } from '@/shared/model/notificationSlice'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]
const CHIQIM_QILISH_PATH = '/omborlar/chiqim-qilish'
const ALL_SERVICES_VALUE = ''

export const AsosiyVositalarPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { canCreate } = usePermissions()
  const canManageFixedAssets = canCreate(CHIQIM_QILISH_PATH)

  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState(ALL_SERVICES_VALUE)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [discardTarget, setDiscardTarget] = useState(null)
  const [discardReason, setDiscardReason] = useState('')
  const [returnTarget, setReturnTarget] = useState(null)

  useQueryParamOpen('search', setSearch)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, serviceFilter])

  const structuresQuery = useGetStructuresQuery()
  const serviceStructures = useMemo(
    () =>
      (structuresQuery.data ?? [])
        .filter((structure) => structure.isActive !== false)
        .sort((a, b) =>
          (a.shortName || a.fullName).localeCompare(b.shortName || b.fullName, 'uz'),
        ),
    [structuresQuery.data],
  )

  const fixedAssetsQuery = useGetWarehouseFixedAssetsQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    serviceStructureId: serviceFilter || undefined,
    status: 'active',
  })

  const [returnFixedAsset, returnState] = useReturnWarehouseFixedAssetMutation()
  const [discardFixedAsset, discardState] = useDiscardWarehouseFixedAssetMutation()

  const items = fixedAssetsQuery.data?.items ?? []
  const total = fixedAssetsQuery.data?.total ?? 0
  const isReady = !fixedAssetsQuery.isLoading && !fixedAssetsQuery.isUninitialized
  const isBusy = returnState.isLoading || discardState.isLoading

  const handleConfirmReturn = async () => {
    if (!returnTarget?.id) return

    try {
      await returnFixedAsset(returnTarget.id).unwrap()
      dispatch(
        showNotification({
          severity: 'success',
          message: `«${returnTarget.name}» skladga qaytarildi`,
        }),
      )
      setReturnTarget(null)
    } catch (e) {
      dispatch(
        showNotification({
          severity: 'error',
          message: getApiErrorMessage(e, 'Skladga qaytarishda xatolik'),
        }),
      )
    }
  }

  const handleConfirmDiscard = async () => {
    if (!discardTarget?.id) return

    try {
      await discardFixedAsset({
        id: discardTarget.id,
        reason: discardReason.trim() || undefined,
      }).unwrap()
      dispatch(
        showNotification({
          severity: 'success',
          message: `«${discardTarget.name}» hisobdan chiqarildi`,
        }),
      )
      setDiscardTarget(null)
      setDiscardReason('')
    } catch (e) {
      dispatch(
        showNotification({
          severity: 'error',
          message: getApiErrorMessage(e, 'Tovarni unutishda xatolik'),
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
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h5" component="h1" fontWeight={700}>
            Asosiy vositalar
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(CHIQIM_QILISH_PATH)}
            >
              Chiqim
            </Button>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/omborlar/chiqim-tarixi')}
            >
              Chiqim tarixi
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Asosiy vosita qilingan tovarlar ro‘yxati. Tovarni skladga qaytarish yoki eskirgan /
          yaroqsiz bo‘lsa hisobdan chiqarish mumkin.
        </Typography>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <TextField
            size="small"
            label="Qidirish"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{ flex: { md: '1 1 280px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 260 } }}>
            <InputLabel id="service-filter-label">Xizmat</InputLabel>
            <Select
              labelId="service-filter-label"
              label="Xizmat"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <MenuItem value={ALL_SERVICES_VALUE}>
                <em>Barcha xizmatlar</em>
              </MenuItem>
              {serviceStructures.map((structure) => (
                <MenuItem key={structure.id} value={structure.id}>
                  {structure.shortName || structure.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {fixedAssetsQuery.error ? (
          <Alert severity="error">
            {getApiErrorMessage(fixedAssetsQuery.error, 'Asosiy vositalarni yuklashda xatolik')}
          </Alert>
        ) : null}

        <QuerySkeleton loading={!isReady} rows={6}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tovar</TableCell>
                  <TableCell width={140}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                  <TableCell width={150}>Barcode</TableCell>
                  <TableCell width={90} align="right">
                    Miqdor
                  </TableCell>
                  <TableCell width={180}>Xizmat</TableCell>
                  <TableCell width={120}>Chiqim kodi</TableCell>
                  <TableCell width={170}>Sana</TableCell>
                  <TableCell width={260} align="right">
                    Amallar
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!items.length ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography variant="body2" color="text.secondary">
                        Hozircha asosiy vositalar yo‘q
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {item.name}
                        </Typography>
                        {item.characteristics ? (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.characteristics}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell sx={nomenclatureTableCellSx}>
                        {getItemNomenclatureCode(item)}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{item.barcode}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.serviceStructureName || '—'}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{item.expenseCode}</TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell align="right">
                        {canManageFixedAssets ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={isBusy}
                              onClick={() => setReturnTarget(item)}
                            >
                              Skladga qaytarish
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              disabled={isBusy}
                              onClick={() => {
                                setDiscardTarget(item)
                                setDiscardReason('')
                              }}
                            >
                              Tovarni unutish
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Ruxsat yo‘q
                          </Typography>
                        )}
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
            onPageChange={(_e, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number.parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            labelRowsPerPage="Qatorlar:"
          />
        </QuerySkeleton>
      </Stack>

      <Dialog open={Boolean(returnTarget)} onClose={isBusy ? undefined : () => setReturnTarget(null)}>
        <DialogTitle>Skladga qaytarish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{returnTarget?.name}</strong> ({returnTarget?.quantity} dona) skladga
            qaytarilsinmi? Tovar ombor qoldig‘iga qo‘shiladi.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReturnTarget(null)} disabled={isBusy}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmReturn}
            disabled={isBusy}
            startIcon={returnState.isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Qaytarish
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(discardTarget)}
        onClose={isBusy ? undefined : () => setDiscardTarget(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tovarni unutish</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <DialogContentText>
              <strong>{discardTarget?.name}</strong> ({discardTarget?.quantity} dona) hisobdan
              chiqarilsinmi? Tovar skladga qaytmaydi — eskirgan yoki yaroqsiz deb belgilanadi.
            </DialogContentText>
            <TextField
              size="small"
              label="Sabab (ixtiyoriy)"
              value={discardReason}
              onChange={(e) => setDiscardReason(e.target.value)}
              multiline
              minRows={2}
              fullWidth
              disabled={isBusy}
              placeholder="Masalan: tavar eskirib ketgan"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDiscardTarget(null)} disabled={isBusy}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmDiscard}
            disabled={isBusy}
            startIcon={discardState.isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Hisobdan chiqarish
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}
