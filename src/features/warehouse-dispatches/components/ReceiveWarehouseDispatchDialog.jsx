import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
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
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { WAREHOUSE_RECEIPT_PAGE_PATH } from '@/features/permissions/constants'
import { usePermissions } from '@/shared/hooks/usePermissions'

const REJECT_REASON = 'Kelmadi'

const emptyDraft = () => ({ received: '', rejected: '' })

const parseQty = (value) => {
  const parsed = Number.parseInt(String(value).trim(), 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

const hasDraftValue = (value) => {
  const qty = parseQty(value)
  return qty != null && qty > 0
}

const getItemDraftState = (draft) => {
  const receivedFilled = hasDraftValue(draft.received)
  const rejectedFilled = hasDraftValue(draft.rejected)
  return { receivedFilled, rejectedFilled, receivedQty: parseQty(draft.received) ?? 0, rejectedQty: parseQty(draft.rejected) ?? 0 }
}

const canSubmitItemDraft = (item, draft) => {
  const { receivedFilled, rejectedFilled, receivedQty, rejectedQty } = getItemDraftState(draft)
  const pending = item.quantityPending

  if (receivedFilled === rejectedFilled) {
    return false
  }

  if (receivedFilled) {
    return receivedQty <= pending
  }

  return rejectedQty <= pending
}

export const ReceiveWarehouseDispatchDialog = ({
  open,
  dispatchId,
  onClose,
  onSuccess,
  title = 'Omborga qabul qilish',
  permissionPath = WAREHOUSE_RECEIPT_PAGE_PATH,
  requireItemNomenclature = false,
  showItemNomenclature = false,
  summaryPrimaryField = 'nakladnoy',
}) => {
  const { canReceiveOnPage } = usePermissions()
  const canReceiveItems = canReceiveOnPage(permissionPath)

  const [error, setError] = useState('')
  const [locationId, setLocationId] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [actionLoadingByItem, setActionLoadingByItem] = useState({})
  const [draftByItem, setDraftByItem] = useState({})
  const [nomenclatureByItem, setNomenclatureByItem] = useState({})

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

  const showItemNomenclatureColumn = true
  const canInteractWithReceipt = canReceiveItems

  useEffect(() => {
    if (!open) {
      setDraftByItem({})
      setNomenclatureByItem({})
      return
    }

    setError('')
  }, [open, dispatchId])

  useEffect(() => {
    if (!open) {
      return
    }

    setDraftByItem((prev) => {
      const next = { ...prev }
      for (const item of pendingItems) {
        if (next[item.itemIndex] == null) {
          next[item.itemIndex] = {
            received: String(item.quantityPending),
            rejected: '',
          }
        }
      }
      return next
    })

    if (requireItemNomenclature) {
      setNomenclatureByItem((prev) => {
        const next = { ...prev }
        for (const item of pendingItems) {
          if (!next[item.itemIndex]?.trim()) {
            const existing = getItemNomenclatureCode(item)
            if (existing !== '—') {
              next[item.itemIndex] = existing
            }
          }
        }
        return next
      })
    }
  }, [open, pendingItems, requireItemNomenclature])

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

  const getItemNomenclatureInput = (item) =>
    nomenclatureByItem[item.itemIndex]?.trim() ||
    (item.nomenclatureCode?.trim() || '')

  const updateItemNomenclature = (itemIndex, value) => {
    setNomenclatureByItem((prev) => ({
      ...prev,
      [itemIndex]: value,
    }))
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

  const updateDraft = (itemIndex, field, value) => {
    setDraftByItem((prev) => ({
      ...prev,
      [itemIndex]: {
        ...(prev[itemIndex] ?? emptyDraft()),
        [field]: value.replace(/[^\d]/g, ''),
      },
    }))
  }

  const handleSaveItem = async (item) => {
    setError('')
    if (!ensureLocationSelected()) return

    const draft = draftByItem[item.itemIndex] ?? emptyDraft()
    if (!canSubmitItemDraft(item, draft)) {
      return
    }

    const { receivedFilled, receivedQty, rejectedQty } = getItemDraftState(draft)
    const pending = item.quantityPending

    if (receivedFilled && receivedQty > pending) {
      setError(`«${item.name}» uchun qabul ${pending} tadan ko‘p bo‘lishi mumkin emas`)
      return
    }

    if (!receivedFilled && rejectedQty > pending) {
      setError(`«${item.name}» uchun kelmagan ${pending} tadan ko‘p bo‘lishi mumkin emas`)
      return
    }

    const itemNomenclatureCode = getItemNomenclatureInput(item)

    if (requireItemNomenclature && receivedQty > 0 && !itemNomenclatureCode) {
      setError(`«${item.name}» uchun nomeklatura raqamini kiriting`)
      return
    }

    try {
      await withItemLoading(item.itemIndex, () =>
        receiveDispatch({
          id: dispatchId,
          body: {
            locationId: selectedLocationId,
            receivedItems:
              receivedQty > 0
                ? [
                    {
                      itemIndex: item.itemIndex,
                      quantityReceived: receivedQty,
                      nomenclatureCode: itemNomenclatureCode,
                    },
                  ]
                : [],
            rejectedItems:
              rejectedQty > 0
                ? [
                    {
                      itemIndex: item.itemIndex,
                      quantityRejected: rejectedQty,
                      reason: REJECT_REASON,
                    },
                  ]
                : [],
          },
        }).unwrap(),
      )

      const parts = []
      if (receivedQty > 0) parts.push(`${receivedQty} ta qabul`)
      if (rejectedQty > 0) parts.push(`${rejectedQty} ta kelmadi`)
      showSnackbar(`"${item.name}": ${parts.join(', ')}`, 'success')

      setDraftByItem((prev) => {
        const next = { ...prev }
        delete next[item.itemIndex]
        return next
      })
      await detailQuery.refetch()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Qabul qilishda xatolik'))
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
      <Box sx={{ position: 'relative' }}>
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
                <Chip
                  label={dispatch.dispatchCode}
                  size="small"
                  variant="outlined"
                  sx={{ flexShrink: 0, ...dispatchCodeSx }}
                />
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
                    pb: 0,
                  }}
                >
                  {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  ) : null}
                  <WarehouseDispatchSummaryPanel
                    dispatch={dispatch}
                    summaryPrimaryField={summaryPrimaryField}
                  />
                </Box>

                <Box sx={{ px: 3, pt: 2, pb: 2 }}>
                  <Box sx={{ mt: 0 }}>
                    <DispatchQrSection dispatch={dispatch} />
                  </Box>

                  {hasLocations ? (
                    <Box sx={{ mt: 2, maxWidth: 420 }}>
                      <FormControl
                        size="small"
                        fullWidth
                        required
                        disabled={locationsQuery.isLoading || !canInteractWithReceipt}
                      >
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

                <Box sx={{ px: 3, py: 2.5, pt: 0 }}>
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
                              {showItemNomenclatureColumn ? (
                                <TableCell width={180}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                              ) : null}
                              <TableCell width={90} align="right">
                                Jo‘natilgan
                              </TableCell>
                              <TableCell width={80} align="right">
                                Qolgan
                              </TableCell>
                              <TableCell width={100} align="center">
                                Qabul
                              </TableCell>
                              <TableCell width={100} align="center">
                                Kelmadi
                              </TableCell>
                              {canReceiveItems ? (
                                <TableCell width={72} align="center" />
                              ) : null}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pendingItems.map((item) => {
                              const itemLoading = Boolean(actionLoadingByItem[item.itemIndex]) || isLoading
                              const draft = draftByItem[item.itemIndex] ?? emptyDraft()
                              const { receivedFilled, rejectedFilled, receivedQty, rejectedQty } =
                                getItemDraftState(draft)
                              const itemNomenclature = getItemNomenclatureInput(item)
                              const needsItemNomenclature =
                                requireItemNomenclature && receivedFilled
                              const hasRequiredNomenclature =
                                !needsItemNomenclature || Boolean(itemNomenclature)
                              const canSubmit =
                                canSubmitItemDraft(item, draft) && hasRequiredNomenclature
                              const receivedExceeds =
                                receivedFilled && receivedQty > item.quantityPending
                              const rejectedExceeds =
                                rejectedFilled && rejectedQty > item.quantityPending

                              return (
                                <TableRow key={item.itemIndex} hover>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                      {item.name}
                                    </Typography>
                                  </TableCell>
                                  {showItemNomenclatureColumn ? (
                                    <TableCell>
                                      {requireItemNomenclature ? (
                                        <TextField
                                          size="small"
                                          required
                                          label="Raqam"
                                          placeholder="NK-..."
                                          value={nomenclatureByItem[item.itemIndex] ?? ''}
                                          onChange={(e) =>
                                            updateItemNomenclature(item.itemIndex, e.target.value)
                                          }
                                          slotProps={{ htmlInput: { maxLength: 64 } }}
                                          disabled={itemLoading || !canInteractWithReceipt}
                                          error={!itemNomenclature && (receivedFilled || rejectedFilled)}
                                          sx={{ minWidth: 150 }}
                                        />
                                      ) : (
                                        <Typography
                                          variant="body2"
                                          fontFamily="monospace"
                                          sx={{ fontSize: '0.85rem' }}
                                        >
                                          {getItemNomenclatureCode(item)}
                                        </Typography>
                                      )}
                                    </TableCell>
                                  ) : null}
                                  <TableCell align="right">{item.quantityDispatched} ta</TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      color={receivedExceeds || rejectedExceeds ? 'error.main' : 'text.primary'}
                                    >
                                      {item.quantityPending} ta
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={draft.received}
                                      onChange={(e) => updateDraft(item.itemIndex, 'received', e.target.value)}
                                      slotProps={{
                                        htmlInput: {
                                          min: 1,
                                          max: item.quantityPending,
                                          style: { textAlign: 'center' },
                                        },
                                      }}
                                      disabled={itemLoading || !canInteractWithReceipt}
                                      error={receivedExceeds || (receivedFilled && rejectedFilled)}
                                      sx={{ width: 88 }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={draft.rejected}
                                      onChange={(e) => updateDraft(item.itemIndex, 'rejected', e.target.value)}
                                      slotProps={{
                                        htmlInput: {
                                          min: 1,
                                          max: item.quantityPending,
                                          style: { textAlign: 'center' },
                                        },
                                      }}
                                      disabled={itemLoading || !canInteractWithReceipt}
                                      error={rejectedExceeds || (receivedFilled && rejectedFilled)}
                                      sx={{ width: 88 }}
                                    />
                                  </TableCell>
                                  {canReceiveItems ? (
                                    <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                                      <Tooltip
                                        title={
                                          needsItemNomenclature && !itemNomenclature
                                            ? 'Nomeklatura raqamini kiriting'
                                            : canSubmit
                                                ? 'Qabul qilish'
                                                : receivedFilled && rejectedFilled
                                                  ? 'Faqat bitta maydonni to‘ldiring'
                                                  : 'Qabul yoki kelmadi sonini kiriting'
                                        }
                                      >
                                        <span>
                                          <IconButton
                                            type="button"
                                            color="primary"
                                            disabled={itemLoading || !canSubmit}
                                            onClick={() => handleSaveItem(item)}
                                            sx={{
                                              bgcolor: canSubmit ? 'primary.main' : undefined,
                                              color: canSubmit ? 'primary.contrastText' : undefined,
                                              '&:hover': canSubmit
                                                ? { bgcolor: 'primary.dark' }
                                                : undefined,
                                            }}
                                          >
                                            {itemLoading ? (
                                              <CircularProgress size={20} color="inherit" />
                                            ) : (
                                              <AddIcon />
                                            )}
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </TableCell>
                                  ) : null}
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
                              {showItemNomenclatureColumn ? (
                                <TableCell width={180}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                              ) : null}
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
                                    <Typography variant="body2" fontWeight={600}>
                                      {item.name}
                                    </Typography>
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
                                {showItemNomenclatureColumn ? (
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      fontFamily="monospace"
                                      sx={{ fontSize: '0.85rem' }}
                                    >
                                      {getItemNomenclatureCode(item)}
                                    </Typography>
                                  </TableCell>
                                ) : null}
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
