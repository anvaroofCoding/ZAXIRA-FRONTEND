import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  useCompletePurchaseMutation,
  useGetPurchaseRequestByIdQuery,
  useMarkItemsUnavailableMutation,
} from '@/features/purchase-requests/api/purchaseRequestsApi'
import { PurchaseBatchCard } from '@/features/purchase-requests/components/PurchaseBatchCard'
import { PurchaseUnavailableBatchCard } from '@/features/purchase-requests/components/PurchaseUnavailableBatchCard'
import { DispatchToWarehouseDialog } from '@/features/warehouse-dispatches/components/DispatchToWarehouseDialog'
import { MEASUREMENT_UNITS } from '@/features/purchase-requests/constants/measurementUnits'
import { parseUzsInput } from '@/shared/utils/formatUzs'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const newLink = () => ({ id: crypto.randomUUID(), url: '' })
const newFileRow = () => ({ id: crypto.randomUUID(), file: null })

const buildPendingRow = (item, index) => ({
  itemIndex: index,
  selected: false,
  name: item.name,
  characteristics: item.characteristics,
  quantity: String(item.quantity),
  unit: item.unit?.trim() || 'dona',
  amount: '',
})

const resolveUnitOptions = (currentUnit) => {
  const trimmed = currentUnit?.trim()

  if (trimmed && !MEASUREMENT_UNITS.includes(trimmed)) {
    return [trimmed, ...MEASUREMENT_UNITS]
  }

  return MEASUREMENT_UNITS
}

const formatAmountInput = (value) => {
  const digits = value.replace(/\D/g, '')
  return digits ? new Intl.NumberFormat('uz-UZ').format(Number(digits)) : ''
}

export const CompletePurchaseDialog = ({ open, request, onClose, onSuccess }) => {
  const [comment, setComment] = useState('')
  const [links, setLinks] = useState([])
  const [fileRows, setFileRows] = useState([])
  const [pendingRows, setPendingRows] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [dispatchBatch, setDispatchBatch] = useState(null)
  const [error, setError] = useState('')

  const [completePurchase, { isLoading: isPurchasing }] = useCompletePurchaseMutation()
  const [markItemsUnavailable, { isLoading: isMarkingUnavailable }] =
    useMarkItemsUnavailableMutation()

  const isLoading = isPurchasing || isMarkingUnavailable

  const detailQuery = useGetPurchaseRequestByIdQuery(
    { id: request?.id, purchasingView: true },
    { skip: !open || !request?.id },
  )

  const liveRequest = detailQuery.data ?? request

  const purchaseBatches = useMemo(() => {
    const batches = liveRequest?.purchaseBatches ?? []
    return [...batches].sort(
      (left, right) => new Date(right.purchasedAt).getTime() - new Date(left.purchasedAt).getTime(),
    )
  }, [liveRequest?.purchaseBatches])

  const isItemPending = (item) => !item.isPurchased && !item.isPurchaseUnavailable

  const pendingItems = useMemo(
    () =>
      (liveRequest?.items ?? [])
        .map((item, index) => ({ ...item, itemIndex: index }))
        .filter((item) => isItemPending(item)),
    [liveRequest?.items],
  )

  const unavailableBatches = useMemo(() => {
    const batches = liveRequest?.purchaseUnavailableBatches ?? []
    return [...batches].sort(
      (left, right) => new Date(right.markedAt).getTime() - new Date(left.markedAt).getTime(),
    )
  }, [liveRequest?.purchaseUnavailableBatches])

  useEffect(() => {
    if (!open || !liveRequest) {
      return
    }

    setComment('')
    setDispatchBatch(null)
    setLinks([])
    setFileRows([])
    const unpurchased = liveRequest.items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => isItemPending(item))

    setPendingRows(unpurchased.map(({ item, index }) => buildPendingRow(item, index)))

    if (unpurchased.length) {
      setActiveTab(0)
    } else if ((liveRequest.purchaseBatches ?? []).length) {
      setActiveTab(1)
    } else {
      setActiveTab(2)
    }

    setError('')
  }, [open, liveRequest?.id, liveRequest?.updatedAt])

  const selectedRows = pendingRows.filter((row) => row.selected)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!selectedRows.length) {
      setError('Kamida bitta tovar tanlang')
      return
    }

    const preparedLinks = links
      .map((link) => ({ url: link.url.trim() }))
      .filter((link) => link.url)

    const purchasedItemsPayload = []

    for (const row of selectedRows) {
      const amount = parseUzsInput(row.amount)
      const quantity = Number(row.quantity)

      if (!row.name.trim()) {
        setError(`${row.itemIndex + 1}-tovar nomi kiritilishi shart`)
        return
      }

      if (!row.characteristics.trim()) {
        setError(`${row.itemIndex + 1}-tovar xususiyati kiritilishi shart`)
        return
      }

      if (!Number.isFinite(quantity) || quantity < 1) {
        setError(`${row.itemIndex + 1}-tovar soni noto‘g‘ri`)
        return
      }

      if (!amount || amount < 1) {
        setError(`${row.itemIndex + 1}-tovar summasi kiritilishi shart`)
        return
      }

      purchasedItemsPayload.push({
        itemIndex: row.itemIndex,
        amount,
        name: row.name.trim(),
        characteristics: row.characteristics.trim(),
        quantity: Math.round(quantity),
        unit: row.unit.trim(),
      })
    }

    const formData = new FormData()
    formData.append('comment', comment.trim())
    formData.append('links', JSON.stringify(preparedLinks))
    formData.append('purchasedItems', JSON.stringify(purchasedItemsPayload))

    const fileLabels = []

    fileRows.forEach((row) => {
      if (row.file) {
        formData.append('files', row.file)
        fileLabels.push(row.file.name)
      }
    })

    formData.append('fileLabels', JSON.stringify(fileLabels))

    try {
      await completePurchase({ id: liveRequest.id, formData }).unwrap()
      onSuccess?.()
      onClose()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Xarid qilishda xatolik'))
    }
  }

  const handleMarkUnavailable = async () => {
    setError('')

    if (!selectedRows.length) {
      setError('Kamida bitta tovar tanlang')
      return
    }

    const trimmedComment = comment.trim()

    if (trimmedComment.length < 5) {
      setError(
        '«Xarid qilib bo‘lmaydi» uchun yuqoridagi izoh maydoniga sabab yozing (kamida 5 belgi)',
      )
      return
    }

    try {
      await markItemsUnavailable({
        id: liveRequest.id,
        itemIndexes: selectedRows.map((row) => row.itemIndex),
        comment: trimmedComment,
      }).unwrap()
      setComment('')
      onSuccess?.('Tovarlar xarid qilib bo‘lmaydi deb belgilandi')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Belgilanishda xatolik'))
    }
  }

  if (!liveRequest) {
    return null
  }

  const hasPending = pendingItems.length > 0
  const purchasedItemCount = (liveRequest.items ?? []).filter((item) => item.isPurchased).length
  const unavailableItemCount = (liveRequest.items ?? []).filter(
    (item) => item.isPurchaseUnavailable,
  ).length

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="lg" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pr: 2,
          }}
        >
          <Typography variant="h6" component="span" sx={{ flex: 1, fontWeight: 600 }}>
            Xarid qilish — {liveRequest.requestCode}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={isLoading}
              onClick={() => setLinks((prev) => [...prev, newLink()])}
            >
              Havola qo‘shish
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={isLoading}
              onClick={() => setFileRows((prev) => [...prev, newFileRow()])}
            >
              Fayl qo‘shish
            </Button>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            {hasPending ? (
              <Typography variant="body2" color="text.secondary">
                Izoh, havola va fayllar shu xarid partiyasiga saqlanadi va «Xarid qilingan tovarlar»
                bo‘limida alohida karta sifatida ko‘rinadi.
              </Typography>
            ) : null}

            {links.length ? (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Havolalar (ixtiyoriy)
                </Typography>
                <Stack spacing={1}>
                  {links.map((link, index) => (
                    <Stack key={link.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <TextField
                        label="Havola"
                        value={link.url}
                        onChange={(event) =>
                          setLinks((prev) =>
                            prev.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, url: event.target.value } : row,
                            ),
                          )
                        }
                        fullWidth
                        size="small"
                      />
                      <IconButton
                        aria-label="Havolani o‘chirish"
                        onClick={() => setLinks((prev) => prev.filter((row) => row.id !== link.id))}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            ) : null}

            {fileRows.length ? (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Fayllar (ixtiyoriy)
                </Typography>
                <Stack spacing={1}>
                  {fileRows.map((row, index) => (
                    <Stack key={row.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Button component="label" variant="outlined" sx={{ flex: 1 }}>
                        {row.file ? row.file.name : 'Fayl tanlash'}
                        <input
                          hidden
                          type="file"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null
                            setFileRows((prev) =>
                              prev.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, file } : entry,
                              ),
                            )
                          }}
                        />
                      </Button>
                      <IconButton
                        aria-label="Faylni olib tashlash"
                        onClick={() =>
                          setFileRows((prev) => prev.filter((entry) => entry.id !== row.id))
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            ) : null}

            <TextField
              label="Izoh"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              multiline
              minRows={2}
              fullWidth
              size="small"
              helperText="Xarid qilishda ixtiyoriy. «Xarid qilib bo‘lmaydi» uchun xarid qilinmaganlik sababi sifatida majburiy."
            />

            <Box>
              <Tabs
                value={activeTab}
                onChange={(_event, value) => setActiveTab(value)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab
                  label={`Xarid qilinadigan tovarlar (${pendingItems.length})`}
                  disabled={!hasPending}
                />
                <Tab label={`Xarid qilingan tovarlar (${purchasedItemCount})`} />
                <Tab label={`Xarid qilib bo‘lmaydi (${unavailableItemCount})`} />
              </Tabs>

              {activeTab === 0 && hasPending ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" width={48}>
                          Tanlash
                        </TableCell>
                        <TableCell sx={{ minWidth: 140 }}>Olib beriladigan nomi</TableCell>
                        <TableCell sx={{ minWidth: 180 }}>Xususiyat</TableCell>
                        <TableCell width={120}>Soni</TableCell>
                        <TableCell width={150}>Birlik</TableCell>
                        <TableCell width={150}>Summa (1 dona)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingRows.map((row, rowIndex) => (
                        <TableRow key={row.itemIndex} selected={row.selected}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={row.selected}
                              onChange={(event) =>
                                setPendingRows((prev) =>
                                  prev.map((entry, entryIndex) =>
                                    entryIndex === rowIndex
                                      ? { ...entry, selected: event.target.checked }
                                      : entry,
                                  ),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={row.name}
                              onChange={(event) =>
                                setPendingRows((prev) =>
                                  prev.map((entry, entryIndex) =>
                                    entryIndex === rowIndex
                                      ? { ...entry, name: event.target.value }
                                      : entry,
                                  ),
                                )
                              }
                              size="small"
                              fullWidth
                              disabled={!row.selected}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={row.characteristics}
                              onChange={(event) =>
                                setPendingRows((prev) =>
                                  prev.map((entry, entryIndex) =>
                                    entryIndex === rowIndex
                                      ? { ...entry, characteristics: event.target.value }
                                      : entry,
                                  ),
                                )
                              }
                              size="small"
                              fullWidth
                              multiline
                              minRows={1}
                              disabled={!row.selected}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={row.quantity}
                              onChange={(event) =>
                                setPendingRows((prev) =>
                                  prev.map((entry, entryIndex) =>
                                    entryIndex === rowIndex
                                      ? { ...entry, quantity: event.target.value.replace(/\D/g, '') }
                                      : entry,
                                  ),
                                )
                              }
                              size="small"
                              fullWidth
                              disabled={!row.selected}
                              slotProps={{
                                htmlInput: {
                                  inputMode: 'numeric',
                                  pattern: '[0-9]*',
                                  min: 1,
                                  style: { textAlign: 'center' },
                                },
                              }}
                              sx={{ minWidth: 96 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              select
                              value={row.unit}
                              onChange={(event) =>
                                setPendingRows((prev) =>
                                  prev.map((entry, entryIndex) =>
                                    entryIndex === rowIndex
                                      ? { ...entry, unit: event.target.value }
                                      : entry,
                                  ),
                                )
                              }
                              size="small"
                              fullWidth
                              disabled={!row.selected}
                              sx={{ minWidth: 130 }}
                            >
                              {resolveUnitOptions(row.unit).map((unit) => (
                                <MenuItem key={unit} value={unit}>
                                  {unit}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={row.amount}
                              onChange={(event) =>
                                setPendingRows((prev) =>
                                  prev.map((entry, entryIndex) =>
                                    entryIndex === rowIndex
                                      ? { ...entry, amount: formatAmountInput(event.target.value) }
                                      : entry,
                                  ),
                                )
                              }
                              placeholder="10 000 000"
                              size="small"
                              fullWidth
                              disabled={!row.selected}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}

              {activeTab === 1 ? (
                purchaseBatches.length ? (
                  <Stack spacing={2}>
                    {purchaseBatches.map((batch, index) => (
                      <PurchaseBatchCard
                        key={batch.batchId}
                        batch={batch}
                        batchNumber={purchaseBatches.length - index}
                        items={liveRequest.items}
                        requestId={liveRequest.id}
                        compact
                        onDispatch={(selectedBatch) =>
                          setDispatchBatch({
                            ...selectedBatch,
                            batchNumber: purchaseBatches.length - index,
                          })
                        }
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Hali xarid qilingan partiyalar yo‘q
                  </Typography>
                )
              ) : null}

              {activeTab === 2 ? (
                unavailableBatches.length ? (
                  <Stack spacing={2}>
                    {unavailableBatches.map((batch, index) => (
                      <PurchaseUnavailableBatchCard
                        key={batch.batchId}
                        batch={batch}
                        batchNumber={unavailableBatches.length - index}
                        items={liveRequest.items}
                        compact
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Xarid qilib bo‘lmaydigan tovarlar yo‘q
                  </Typography>
                )
              ) : null}

              {activeTab === 0 && !hasPending ? (
                <Typography variant="body2" color="text.secondary">
                  Xarid qilinadigan tovarlar qolmadi
                </Typography>
              ) : null}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          {hasPending ? (
            <>
              <Button
                type="button"
                variant="outlined"
                color="warning"
                disabled={isLoading || !selectedRows.length || comment.trim().length < 5}
                onClick={handleMarkUnavailable}
              >
                Xarid qilib bo‘lmaydi ({selectedRows.length || 0})
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading || !selectedRows.length}>
                {selectedRows.length
                  ? `Tanlanganlarni xarid qilish (${selectedRows.length})`
                  : 'Xarid qilish'}
              </Button>
            </>
          ) : null}
        </DialogActions>
      </Box>

      <DispatchToWarehouseDialog
        open={Boolean(dispatchBatch)}
        request={liveRequest}
        purchaseBatch={dispatchBatch}
        onClose={() => setDispatchBatch(null)}
        onSuccess={() => {
          onSuccess?.('Partiya omborga jo‘natildi')
        }}
      />
    </Dialog>
  )
}
