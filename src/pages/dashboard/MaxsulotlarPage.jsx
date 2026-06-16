import { useEffect, useState } from 'react'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
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
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  useArchiveProductMutation,
  useGetProductsQuery,
} from '@/features/products/api/productsApi'
import { truncateText } from '@/features/products/utils/truncateText'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { showNotification } from '@/shared/model/notificationSlice'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = '/dashboard/maxsulotlar'
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]
const CHARACTERISTICS_PREVIEW_LENGTH = 100

const CharacteristicsCell = ({ value }) => {
  const { text, truncated } = truncateText(value, CHARACTERISTICS_PREVIEW_LENGTH)

  if (!text) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    )
  }

  if (!truncated) {
    return (
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </Typography>
    )
  }

  return (
    <Tooltip title={value} placement="top-start" enterDelay={400}>
      <Typography
        variant="body2"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </Typography>
    </Tooltip>
  )
}

export const MaxsulotlarPage = () => {
  const dispatch = useAppDispatch()
  const { user, canDelete } = usePermissions()
  const canArchive = user?.isSuperAdmin || user?.role === 'SUPER_ADMIN' || canDelete(PAGE_PATH)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [archiveTarget, setArchiveTarget] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const productsQuery = useGetProductsQuery({
    search: debouncedSearch || undefined,
    page: page + 1,
    limit: rowsPerPage,
  })

  const [archiveProduct, archiveState] = useArchiveProductMutation()

  const items = productsQuery.data?.items ?? []
  const total = productsQuery.data?.total ?? 0

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return

    try {
      await archiveProduct(archiveTarget.itemKey).unwrap()
      dispatch(
        showNotification({
          message: `«${archiveTarget.name}» arxivga olindi`,
          severity: 'success',
        }),
      )
      setArchiveTarget(null)
    } catch (error) {
      dispatch(
        showNotification({
          message: getApiErrorMessage(error, 'Arxivlashda xatolik'),
          severity: 'error',
        }),
      )
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Maxsulotlar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          «Omborga qabul qilindi» statusidagi tovarlar ro‘yxati. Arxivlash faqat nomni
          yashiradi — ombordagi qoldiq o‘zgarmaydi.
        </Typography>
      </Box>

      <TextField
        size="small"
        placeholder="Qidirish"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ maxWidth: 400 }}
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

      {productsQuery.isError ? (
        <Alert severity="error">
          {getApiErrorMessage(productsQuery.error, 'Maxsulotlar yuklanmadi')}
        </Alert>
      ) : null}

      <QuerySkeleton loading={productsQuery.isLoading && !productsQuery.data}>
        <TableContainer component={Paper} variant="outlined" elevation={0}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Tovar nomi</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>Barcode</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 280 }}>Xususiyat</TableCell>
                  {canArchive ? (
                    <TableCell sx={{ fontWeight: 700, width: 72 }} align="right">
                      Arxiv
                    </TableCell>
                  ) : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {!items.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={canArchive ? 5 : 4}
                      align="center"
                      sx={{ py: 4 }}
                    >
                      <Typography color="text.secondary">
                        {debouncedSearch
                          ? 'Qidiruv bo‘yicha maxsulot topilmadi'
                          : 'Hozircha maxsulotlar yo‘q'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.itemKey} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={nomenclatureTableCellSx}>
                        {getItemNomenclatureCode(item)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          sx={{ fontSize: '0.85rem' }}
                        >
                          {item.barcode || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 420 }}>
                        <CharacteristicsCell value={item.characteristics} />
                      </TableCell>
                      {canArchive ? (
                        <TableCell align="right">
                          <Tooltip title="Nomni arxivga olish">
                            <span>
                              <IconButton
                                size="small"
                                color="warning"
                                aria-label="Arxivga olish"
                                onClick={() => setArchiveTarget(item)}
                              >
                                <ArchiveOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      ) : null}
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
            setRowsPerPage(Number.parseInt(event.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage="Qatorlar:"
        />
      </QuerySkeleton>

      <Dialog open={Boolean(archiveTarget)} onClose={() => setArchiveTarget(null)}>
        <DialogTitle>Maxsulotni arxivlash</DialogTitle>
        <DialogContent>
          <DialogContentText>
            «{archiveTarget?.name}» nomi maxsulotlar ro‘yxatidan yashiriladi. Ombordagi
            qoldiq va tarix o‘zgarmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveTarget(null)} disabled={archiveState.isLoading}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleArchiveConfirm}
            disabled={archiveState.isLoading}
            startIcon={
              archiveState.isLoading ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            Arxivlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
