import { useMemo, useState } from 'react'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import DescriptionIcon from '@mui/icons-material/Description'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import {
  useGetWarehouseDispatchByIdQuery,
  useReceiveWarehouseDispatchMutation,
} from '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import { useGetWarehouseLocationsQuery } from '@/features/warehouse/api/warehouseApi'
import { DispatchQrSection } from '@/features/warehouse-dispatches/components/DispatchQrSection'
import { WarehouseDispatchSummaryPanel } from '@/features/warehouse-dispatches/components/WarehouseDispatchSummaryPanel'
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'
import { getDispatchStatusChipProps } from '@/features/warehouse-dispatches/utils/dispatchStatusDisplay'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const REJECT_REASON = 'Kelmadi'

export const ReceiveWarehouseDispatchDialog = ({ open, dispatchId, onClose, onSuccess, title = 'Omborga qabul qilish' }) => {
  const [error, setError] = useState('')
  const [locationId, setLocationId] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [actionLoadingByItem, setActionLoadingByItem] = useState({})

  const detailQuery = useGetWarehouseDispatchByIdQuery(
    { id: dispatchId, markSeen: true },
    { skip: !open || !dispatchId },
  )

  const locationsQuery = useGetWarehouseLocationsQuery(undefined, { skip: !open })
  const locations = locationsQuery.data ?? []
  const hasLocations = locations.length > 0
  const selectedLocationId = locationId || locations[0]?.id || ''

  const [receiveDispatch, { isLoading }] = useReceiveWarehouseDispatchMutation()
  const dispatch = detailQuery.data

  const pendingItems = useMemo(
    () => dispatch?.items?.filter((item) => item.quantityPending > 0) ?? [],
    [dispatch?.items],
  )

  const processedItems = useMemo(
    () => dispatch?.items?.filter((item) => item.quantityReceived > 0 || item.quantityRejected > 0) ?? [],
    [dispatch?.items],
  )

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const withItemLoading = async (itemIndex, task) => {
    setActionLoadingByItem((prev) => ({ ...prev, [itemIndex]: true }))
    try {
      await task()
    } finally {
      setActionLoadingByItem((prev) => ({ ...prev, [itemIndex]: false }))
    }
  }

  const ensureLocationSelected = () => {
    if (!hasLocations) {
      setError('Ombor joylari topilmadi. Avval ombor joyini yarating.')
      return false
    }

    if (!selectedLocationId) {
      setError('Ombor joyini tanlang')
      return false
    }

    return true
  }

  const handleAcceptItem = async (item) => {
    setError('')
    if (!ensureLocationSelected()) return

    try {
      await withItemLoading(item.itemIndex, () =>
        receiveDispatch({
          id: dispatchId,
          body: {
            locationId: selectedLocationId,
            receivedItems: [{ itemIndex: item.itemIndex, quantityReceived: item.quantityPending }],
            rejectedItems: [],
          },
        }).unwrap(),
      )
      showSnackbar(`"${item.name}" qabul qilindi`, 'success')
      await detailQuery.refetch()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Qabul qilishda xatolik'))
    }
  }

  const handleRejectItem = async (item) => {
    setError('')
    if (!ensureLocationSelected()) return

    try {
      await withItemLoading(item.itemIndex, () =>
        receiveDispatch({
          id: dispatchId,
          body: {
            locationId: selectedLocationId,
            receivedItems: [],
            rejectedItems: [
              {
                itemIndex: item.itemIndex,
                quantityRejected: item.quantityPending,
                reason: REJECT_REASON,
              },
            ],
          },
        }).unwrap(),
      )
      showSnackbar(`"${item.name}" kelmadi deb belgilandi`, 'info')
      await detailQuery.refetch()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Rad etishda xatolik'))
    }
  }

  const handleDownload = (type) => {
    if (!dispatch) return
    const extension = type === 'pdf' ? 'pdf' : 'docx'

    downloadAuthenticatedFile(
      `/warehouse-dispatches/${dispatch.id}/nakladnoy/${extension}`,
      `nakladnoy-${dispatch.dispatchCode}.${extension}`,
    ).catch(() => {})
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="lg" fullWidth scroll="paper">
      <Box>
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            pr: 2,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="span" fontWeight={600}>
              {title}
            </Typography>
            {dispatch ? (
              <>
                <Chip label={dispatch.dispatchCode} size="small" variant="outlined" sx={{ flexShrink: 0, ...dispatchCodeSx }} />
                <Chip
                  size="small"
                  {...getDispatchStatusChipProps(dispatch.status, dispatch.statusLabel)}
                />
              </>
            ) : null}
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {detailQuery.isLoading ? (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">Yuklanmoqda...</Typography>
            </Box>
          ) : dispatch ? (
            <Stack spacing={0}>
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  px: 3,
                  pt: 2,
                  pb: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                {error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ) : null}
                <WarehouseDispatchSummaryPanel dispatch={dispatch} />
                <Box sx={{ mt: 2 }}>
                  <DispatchQrSection dispatch={dispatch} />
                </Box>

                {hasLocations ? (
                  <Box sx={{ mt: 2, maxWidth: 420 }}>
                    <FormControl size="small" fullWidth required disabled={locationsQuery.isLoading}>
                      <InputLabel id="warehouse-location-select">Ombor joyi</InputLabel>
                      <Select
                        labelId="warehouse-location-select"
                        value={selectedLocationId}
                        label="Ombor joyi"
                        onChange={(e) => setLocationId(e.target.value)}
                      >
                        {locations.map((loc) => (
                          <MenuItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ) : !locationsQuery.isLoading ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Ombor joylari topilmadi. Tovarlarni qabul qilishdan oldin ombor joyini yarating.
                  </Alert>
                ) : null}
              </Box>

              <Box sx={{ px: 3, py: 2.5 }}>
                {pendingItems.length ? (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Qabul qilinmagan tovarlar
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tovar</TableCell>
                            <TableCell width={120} align="right">
                              Qolgan
                            </TableCell>
                            <TableCell width={140} align="center">
                              Amallar
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pendingItems.map((item) => {
                            const itemLoading = Boolean(actionLoadingByItem[item.itemIndex]) || isLoading
                            return (
                              <TableRow key={item.itemIndex} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    {item.name}
                                  </Typography>
                                  {item.characteristics ? (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {item.characteristics}
                                    </Typography>
                                  ) : null}
                                </TableCell>
                                <TableCell align="right">{item.quantityPending} ta</TableCell>
                                <TableCell align="center">
                                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
                                    <Tooltip title="Qabul qilish (ticket)">
                                      <span>
                                        <IconButton
                                          type="button"
                                          size="small"
                                          color="primary"
                                          disabled={itemLoading}
                                          onClick={() => handleAcceptItem(item)}
                                        >
                                          <CheckCircleOutlineIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title="Kelmadi">
                                      <span>
                                        <IconButton
                                          type="button"
                                          size="small"
                                          color="error"
                                          disabled={itemLoading}
                                          onClick={() => handleRejectItem(item)}
                                        >
                                          <CloseIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Alert severity="success">Barcha tovarlar qayta ishlangan</Alert>
                )}

                {processedItems.length ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Qabul qilingan tovarlar
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tovar</TableCell>
                            <TableCell width={120} align="right">
                              Qabul
                            </TableCell>
                            <TableCell width={120} align="right">
                              Rad
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {processedItems.map((item) => (
                            <TableRow key={item.itemIndex}>
                              <TableCell>
                                <Stack spacing={0.5}>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {item.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {item.characteristics}
                                    </Typography>
                                  </Box>
                                  {item.rejectReason ? (
                                    <Tooltip title={item.rejectReason} placement="top-start" arrow>
                                      <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{
                                          maxWidth: { xs: 220, sm: 320, md: 420 },
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        Rad etish sababi: {item.rejectReason}
                                      </Typography>
                                    </Tooltip>
                                  ) : null}
                                </Stack>
                              </TableCell>
                              <TableCell align="right">{item.quantityReceived} ta</TableCell>
                              <TableCell align="right">{item.quantityRejected} ta</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : null}
              </Box>
            </Stack>
          ) : (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">Ma’lumot topilmadi</Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {dispatch ? (
            <Stack direction="row" spacing={1}>
              <Button type="button" size="small" variant="outlined" startIcon={<PictureAsPdfIcon fontSize="small" />} onClick={() => handleDownload('pdf')}>
                PDF
              </Button>
              <Button type="button" size="small" variant="outlined" startIcon={<DescriptionIcon fontSize="small" />} onClick={() => handleDownload('docx')}>
                Word
              </Button>
            </Stack>
          ) : (
            <Box />
          )}

          <Button
            onClick={() => {
              onSuccess?.()
              onClose()
            }}
            disabled={isLoading}
          >
            Yopish
          </Button>
        </DialogActions>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}
