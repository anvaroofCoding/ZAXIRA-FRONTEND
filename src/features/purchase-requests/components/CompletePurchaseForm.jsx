import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
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
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  useCompletePurchaseMutation,
  useGetPurchaseRequestByIdQuery,
  useMarkItemsUnavailableMutation,
} from '@/features/purchase-requests/api/purchaseRequestsApi'
import { PurchaseBatchCard } from '@/features/purchase-requests/components/PurchaseBatchCard'
import { PurchaseRequestItemCharacteristicsField } from '@/features/purchase-requests/components/PurchaseRequestItemCharacteristicsField'
import { PurchaseUnavailableBatchCard } from '@/features/purchase-requests/components/PurchaseUnavailableBatchCard'
import { DispatchToWarehouseDialog } from '@/features/warehouse-dispatches/components/DispatchToWarehouseDialog'
import {
  TAX_ID_LENGTH,
  TAX_ID_TYPE_OPTIONS,
  VAT_RATE_OPTIONS,
  buildPendingRowsFromRequest,
  calculateVatAmountInput,
  formatAmountInput,
  getRowLineTotal,
  getRowUnitTotal,
  newFileRow,
  newLink,
  resolveUnitOptions,
} from '@/features/purchase-requests/utils/completePurchaseFormUtils'
import { enrichBatchContractInfo } from '@/features/purchase-requests/utils/purchaseDisplayUtils'
import { formatUzs, parseUzsInput } from '@/shared/utils/formatUzs'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const CompletePurchaseForm = ({ requestId, onCancel, onSuccess }) => {
  const [comment, setComment] = useState('')
  const [contractNumber, setContractNumber] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [taxIdType, setTaxIdType] = useState('')
  const [taxIdNumber, setTaxIdNumber] = useState('')
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
    { id: requestId, purchasingView: true },
    { skip: !requestId },
  )

  const liveRequest = detailQuery.data

  const purchaseBatches = useMemo(() => {
    const batches = liveRequest?.purchaseBatches ?? []
    return [...batches].sort(
      (left, right) => new Date(right.purchasedAt).getTime() - new Date(left.purchasedAt).getTime(),
    )
  }, [liveRequest?.purchaseBatches])

  const pendingItems = useMemo(
    () =>
      (liveRequest?.items ?? [])
        .map((item, index) => ({ ...item, itemIndex: index }))
        .filter((item) => !item.isPurchased && !item.isPurchaseUnavailable),
    [liveRequest?.items],
  )

  const unavailableBatches = useMemo(() => {
    const batches = liveRequest?.purchaseUnavailableBatches ?? []
    return [...batches].sort(
      (left, right) => new Date(right.markedAt).getTime() - new Date(left.markedAt).getTime(),
    )
  }, [liveRequest?.purchaseUnavailableBatches])

  const pendingItemsSignature = useMemo(
    () =>
      (liveRequest?.items ?? [])
        .map(
          (item, index) =>
            `${index}:${item.quantity}:${item.isPurchased}:${item.isPurchaseUnavailable}`,
        )
        .join('|'),
    [liveRequest?.items],
  )

  useEffect(() => {
    if (!liveRequest) {
      return
    }

    setComment('')
    setContractNumber('')
    setOrganizationName('')
    setTaxIdType('')
    setTaxIdNumber('')
    setDispatchBatch(null)
    setLinks([])
    setFileRows([])
    setPendingRows(buildPendingRowsFromRequest(liveRequest))

    const unpurchasedCount = buildPendingRowsFromRequest(liveRequest).length

    if (unpurchasedCount) {
      setActiveTab(0)
    } else if ((liveRequest.purchaseBatches ?? []).length) {
      setActiveTab(1)
    } else {
      setActiveTab(2)
    }

    setError('')
  }, [liveRequest?.id, liveRequest?.updatedAt, pendingItemsSignature])

  const selectedRows = pendingRows.filter((row) => row.selected)

  const updatePendingRow = (rowIndex, patch) => {
    setPendingRows((prev) =>
      prev.map((entry, entryIndex) => {
        if (entryIndex !== rowIndex) {
          return entry
        }

        const next = { ...entry, ...patch }

        if ('amount' in patch || 'vatRate' in patch) {
          if (next.vatRate && next.vatRate !== '0') {
            next.vatAmount = calculateVatAmountInput(next.amount, next.vatRate)
          } else if ('vatRate' in patch) {
            next.vatAmount = ''
          }
        }

        return next
      }),
    )
  }

  const resetBatchFields = () => {
    setComment('')
    setContractNumber('')
    setOrganizationName('')
    setTaxIdType('')
    setTaxIdNumber('')
    setLinks([])
    setFileRows([])
  }

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
      const vatAmount = parseUzsInput(row.vatAmount) || 0
      const vatRate = Number(row.vatRate) || 0
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

      if (quantity > row.originalQuantity) {
        setError(
          `${row.itemIndex + 1}-tovar soni so‘ralgan miqdordan (${row.originalQuantity}) ko‘p bo‘lishi mumkin emas`,
        )
        return
      }

      if (!amount || amount < 1) {
        setError(`${row.itemIndex + 1}-tovar summasi kiritilishi shart`)
        return
      }

      if (vatRate > 0 && vatAmount < 1) {
        setError(`${row.itemIndex + 1}-tovar uchun INDS summasini kiriting`)
        return
      }

      purchasedItemsPayload.push({
        itemIndex: row.itemIndex,
        amount,
        vatRate,
        vatAmount,
        name: row.name.trim(),
        characteristics: row.characteristics.trim(),
        quantity: Math.round(quantity),
        unit: row.unit.trim(),
      })
    }

    const trimmedTaxIdNumber = taxIdNumber.trim()

    if ((taxIdType && !trimmedTaxIdNumber) || (!taxIdType && trimmedTaxIdNumber)) {
      setError('INN yoki PINFL uchun avval turini tanlang, keyin raqamni kiriting')
      return
    }

    if (taxIdType && trimmedTaxIdNumber) {
      const expectedLength = TAX_ID_LENGTH[taxIdType]

      if (trimmedTaxIdNumber.length !== expectedLength) {
        setError(
          taxIdType === 'inn'
            ? 'INN 9 ta raqamdan iborat bo‘lishi kerak'
            : 'PINFL 14 ta raqamdan iborat bo‘lishi kerak',
        )
        return
      }
    }

    const formData = new FormData()
    formData.append('comment', comment.trim())
    formData.append('contractNumber', contractNumber.trim())
    formData.append('organizationName', organizationName.trim())
    formData.append('innOrPinflType', taxIdType)
    formData.append('innOrPinfl', trimmedTaxIdNumber)
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
      const result = await completePurchase({ id: liveRequest.id, formData }).unwrap()
      const remainingItems = (result.items ?? []).filter(
        (item) => !item.isPurchased && !item.isPurchaseUnavailable,
      )
      const remainingCount = remainingItems.length
      const remainingQuantity = remainingItems.reduce(
        (sum, item) => sum + Number(item.quantity ?? 0),
        0,
      )

      if (remainingCount > 0) {
        setPendingRows(buildPendingRowsFromRequest(result))
        setActiveTab(0)
        resetBatchFields()
        setError('')
        onSuccess?.(
          remainingQuantity > remainingCount
            ? `Qisman xarid qilindi — ${remainingQuantity} dona navbatda qoldi`
            : `${selectedRows.length} ta tovar xarid qilindi — ${remainingCount} ta tovar navbatda qoldi`,
        )
        return
      }

      onSuccess?.()
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

    for (const row of selectedRows) {
      const quantity = Number(row.quantity)

      if (!Number.isFinite(quantity) || quantity < 1) {
        setError(`${row.itemIndex + 1}-tovar soni noto‘g‘ri`)
        return
      }

      if (quantity > row.originalQuantity) {
        setError(
          `${row.itemIndex + 1}-tovar soni so‘ralgan miqdordan (${row.originalQuantity}) ko‘p bo‘lishi mumkin emas`,
        )
        return
      }
    }

    try {
      const result = await markItemsUnavailable({
        id: liveRequest.id,
        unavailableItems: selectedRows.map((row) => ({
          itemIndex: row.itemIndex,
          quantity: Math.round(Number(row.quantity)),
        })),
        comment: trimmedComment,
      }).unwrap()

      const remainingItems = (result.items ?? []).filter(
        (item) => !item.isPurchased && !item.isPurchaseUnavailable,
      )
      const remainingCount = remainingItems.length
      const remainingQuantity = remainingItems.reduce(
        (sum, item) => sum + Number(item.quantity ?? 0),
        0,
      )

      setComment('')

      if (remainingCount > 0) {
        setPendingRows(buildPendingRowsFromRequest(result))
        setActiveTab(0)
        onSuccess?.(
          remainingQuantity > remainingCount
            ? `Qisman belgilandi — ${remainingQuantity} dona navbatda qoldi`
            : `${selectedRows.length} ta tovar belgilandi — ${remainingCount} ta tovar navbatda qoldi`,
        )
        setError('')
        return
      }

      onSuccess?.()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Belgilanishda xatolik'))
    }
  }

  if (detailQuery.isLoading || detailQuery.isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!liveRequest) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">Ariza topilmadi yoki ko‘rish huquqi yo‘q</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={onCancel}>
          Orqaga
        </Button>
      </Stack>
    )
  }

  const hasPending = pendingItems.length > 0
  const purchasedItemCount = (liveRequest.items ?? []).filter((item) => item.isPurchased).length
  const unavailableItemCount = (liveRequest.items ?? []).filter(
    (item) => item.isPurchaseUnavailable,
  ).length

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={2.5}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            position: 'sticky',
            top: 0,
            zIndex: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              <IconButton aria-label="Orqaga" onClick={onCancel} disabled={isLoading}>
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" fontWeight={700} noWrap>
                  Xarid qilish — {liveRequest.requestCode}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {liveRequest.applicant?.displayName}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: 'wrap' }}>
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
          </Stack>
        </Paper>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
          <Stack spacing={2.5}>
            {hasPending ? (
              <Typography variant="body2" color="text.secondary">
                Izoh, shartnoma ma’lumotlari, havola va fayllar shu xarid partiyasiga saqlanadi.
                Har bir tovar uchun summa, INDS foizi va INDS summasini alohida kiriting. Sonni
                kamaytirsangiz, qolgan miqdor xarid navbatida qoladi.
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

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
              <TextField
                label="Shartnoma raqami"
                value={contractNumber}
                onChange={(event) => setContractNumber(event.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Tashkilot nomi"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                fullWidth
                size="small"
              />
              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                <TextField
                  select
                  label="Identifikator turi"
                  value={taxIdType}
                  onChange={(event) => {
                    const nextType = event.target.value
                    setTaxIdType(nextType)
                    setTaxIdNumber((prev) =>
                      nextType ? prev.slice(0, TAX_ID_LENGTH[nextType]) : '',
                    )
                  }}
                  size="small"
                  sx={{ minWidth: 150, flexShrink: 0 }}
                >
                  <MenuItem value="">
                    <em>Tanlash</em>
                  </MenuItem>
                  {TAX_ID_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label={taxIdType === 'pinfl' ? 'PINFL raqami' : 'INN raqami'}
                  value={taxIdNumber}
                  onChange={(event) => {
                    const maxLength = taxIdType ? TAX_ID_LENGTH[taxIdType] : 14
                    setTaxIdNumber(event.target.value.replace(/\D/g, '').slice(0, maxLength))
                  }}
                  fullWidth
                  size="small"
                  disabled={!taxIdType}
                  helperText={
                    taxIdType === 'inn'
                      ? '9 ta raqam'
                      : taxIdType === 'pinfl'
                        ? '14 ta raqam'
                        : 'Avval INN yoki PINFL tanlang'
                  }
                  slotProps={{
                    htmlInput: {
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      maxLength: taxIdType ? TAX_ID_LENGTH[taxIdType] : 14,
                    },
                  }}
                />
              </Stack>
            </Stack>

            <TextField
              label="Izoh"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              multiline
              minRows={2}
              fullWidth
              size="small"
              helperText="Xarid qilishda ixtiyoriy. «Xarid qilib bo‘lmaydi» uchun sabab sifatida majburiy."
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
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', minWidth: 1280 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          padding="checkbox"
                          width={56}
                          align="center"
                          sx={{ verticalAlign: 'middle' }}
                        >
                          Tanlash
                        </TableCell>
                        <TableCell sx={{ minWidth: 180, width: '16%', verticalAlign: 'top' }}>
                          Olib beriladigan nomi
                        </TableCell>
                        <TableCell sx={{ minWidth: 220, width: '24%', verticalAlign: 'top' }}>
                          Xususiyat
                        </TableCell>
                        <TableCell width={96} sx={{ verticalAlign: 'top' }}>
                          Soni
                        </TableCell>
                        <TableCell width={120} sx={{ verticalAlign: 'top' }}>
                          Birlik
                        </TableCell>
                        <TableCell width={140} sx={{ verticalAlign: 'top' }}>
                          Summa (1 dona)
                        </TableCell>
                        <TableCell width={120} sx={{ verticalAlign: 'top' }}>
                          % INDS
                        </TableCell>
                        <TableCell width={140} sx={{ verticalAlign: 'top' }}>
                          INDS summasi
                        </TableCell>
                        <TableCell width={140} sx={{ verticalAlign: 'top' }}>
                          Jami (1 dona)
                        </TableCell>
                        <TableCell width={150} sx={{ verticalAlign: 'top' }}>
                          Qator jami
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingRows.map((row, rowIndex) => (
                        <TableRow key={row.itemIndex} selected={row.selected}>
                          <TableCell
                            padding="checkbox"
                            align="center"
                            sx={{ verticalAlign: 'middle', py: 1, px: 0.5 }}
                          >
                            <Checkbox
                              checked={row.selected}
                              onChange={(event) =>
                                updatePendingRow(rowIndex, { selected: event.target.checked })
                              }
                              sx={{ p: 0.75 }}
                            />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <Tooltip
                              title={row.name.length > 40 ? row.name : ''}
                              placement="top-start"
                              slotProps={{ popper: { sx: { maxWidth: 360 } } }}
                            >
                              <TextField
                                value={row.name}
                                onChange={(event) =>
                                  updatePendingRow(rowIndex, { name: event.target.value })
                                }
                                size="small"
                                fullWidth
                                disabled={!row.selected}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <PurchaseRequestItemCharacteristicsField
                              value={row.characteristics}
                              disabled={!row.selected}
                              onChange={(nextValue) =>
                                updatePendingRow(rowIndex, { characteristics: nextValue })
                              }
                            />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <TextField
                              value={row.quantity}
                              onChange={(event) =>
                                updatePendingRow(rowIndex, {
                                  quantity: event.target.value.replace(/\D/g, ''),
                                })
                              }
                              size="small"
                              fullWidth
                              disabled={!row.selected}
                              slotProps={{
                                htmlInput: {
                                  inputMode: 'numeric',
                                  pattern: '[0-9]*',
                                  style: { textAlign: 'center' },
                                },
                              }}
                            />
                            {row.selected && row.originalQuantity > 1 ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.25, textAlign: 'center' }}
                              >
                                So‘ralgan: {row.originalQuantity}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <TextField
                              select
                              value={row.unit}
                              onChange={(event) =>
                                updatePendingRow(rowIndex, { unit: event.target.value })
                              }
                              size="small"
                              fullWidth
                              disabled={!row.selected}
                            >
                              {resolveUnitOptions(row.unit).map((unit) => (
                                <MenuItem key={unit} value={unit}>
                                  {unit}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <TextField
                              value={row.amount}
                              onChange={(event) =>
                                updatePendingRow(rowIndex, {
                                  amount: formatAmountInput(event.target.value),
                                })
                              }
                              placeholder="10 000 000"
                              size="small"
                              fullWidth
                              disabled={!row.selected}
                            />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <TextField
                              select
                              value={row.vatRate}
                              onChange={(event) =>
                                updatePendingRow(rowIndex, { vatRate: event.target.value })
                              }
                              size="small"
                              fullWidth
                              disabled={!row.selected}
                            >
                              {VAT_RATE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <TextField
                              value={row.vatAmount}
                              onChange={(event) =>
                                updatePendingRow(rowIndex, {
                                  vatAmount: formatAmountInput(event.target.value),
                                })
                              }
                              placeholder="0"
                              size="small"
                              fullWidth
                              disabled={!row.selected || row.vatRate === '0'}
                            />
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ pt: 1 }}>
                              {row.selected ? formatUzs(getRowUnitTotal(row)) : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ pt: 1 }}>
                              {row.selected ? formatUzs(getRowLineTotal(row)) : '—'}
                            </Typography>
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
                        batch={enrichBatchContractInfo(batch, liveRequest)}
                        batchNumber={purchaseBatches.length - index}
                        items={liveRequest.items}
                        requestId={liveRequest.id}
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
        </Paper>

        {hasPending ? (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              position: 'sticky',
              bottom: 0,
              bgcolor: 'background.paper',
              zIndex: 2,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button onClick={onCancel} disabled={isLoading}>
                Bekor qilish
              </Button>
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
            </Stack>
          </Paper>
        ) : (
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Orqaga</Button>
          </Stack>
        )}
      </Stack>

      <DispatchToWarehouseDialog
        open={Boolean(dispatchBatch)}
        request={liveRequest}
        purchaseBatch={dispatchBatch}
        onClose={() => setDispatchBatch(null)}
        onSuccess={() => onSuccess?.('Partiya omborga jo‘natildi')}
      />
    </Box>
  )
}
