import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import HistoryIcon from '@mui/icons-material/History'
import RemoveIcon from '@mui/icons-material/Remove'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
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
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'
import { usePermissions } from '@/shared/hooks/usePermissions'
import {
  useCreateWarehouseExpenseMutation,
  useGetWarehouseExpenseReasonsQuery,
  useLazyGetWarehouseInventoryItemByBarcodeGloballyQuery,
} from '@/features/warehouse/api/warehouseApi'
import { PageShell } from '@/shared/components/layout/PageShell'

const PAGE_PATH = '/omborlar/chiqim-qilish'

const clampInt = (value, min, max) => {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (Number.isNaN(n)) return min
  return Math.max(min, Math.min(max, n))
}

export const ChiqimQilishPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { canAccess, canCreate } = usePermissions()
  const canViewExpense = canAccess(PAGE_PATH)
  const canCreateExpense = canCreate(PAGE_PATH)

  const reasonsQuery = useGetWarehouseExpenseReasonsQuery()
  const [lookupByBarcode, lookupState] = useLazyGetWarehouseInventoryItemByBarcodeGloballyQuery()
  const [createExpense, createExpenseState] = useCreateWarehouseExpenseMutation()

  const reasons = reasonsQuery.data ?? []

  const [reasonKey, setReasonKey] = useState('')
  const [comment, setComment] = useState('')
  const [barcode, setBarcode] = useState('')
  const [error, setError] = useState('')
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const barcodeRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => barcodeRef.current?.focus(), 0)
    return () => clearTimeout(timer)
  }, [])

  const [rows, setRows] = useState([])
  const rowsByKey = useMemo(() => new Map(rows.map((r) => [r.rowKey, r])), [rows])

  const canScan =
    canCreateExpense &&
    !lookupState.isFetching &&
    !createExpenseState.isLoading
  const canOpenSaveDialog =
    canCreateExpense &&
    rows.length > 0 &&
    rows.every((r) => r.quantity >= 1 && r.quantity <= r.available) &&
    !createExpenseState.isLoading
  const canSubmit = canOpenSaveDialog && Boolean(reasonKey)

  const handleScan = async () => {
    setError('')
    const value = barcode.trim()
    if (!value) {
      barcodeRef.current?.focus()
      return
    }

    try {
      const found = await lookupByBarcode({ barcode: value }).unwrap()
      const rowKey = `${found.locationId}|${found.barcode}`

      setRows((prev) => {
        const existing = prev.find((r) => r.rowKey === rowKey)
        if (existing) {
          const nextQty = Math.min(existing.available, existing.quantity + 1)
          return prev.map((r) => (r.rowKey === existing.rowKey ? { ...r, quantity: nextQty } : r))
        }

        return [
          ...prev,
          {
            rowKey,
            inventoryId: found.id,
            locationId: found.locationId,
            locationName: found.locationName,
            name: found.name,
            characteristics: found.characteristics,
            barcode: found.barcode,
            available: found.quantity,
            quantity: 1,
          },
        ]
      })

      setBarcode('')
    } catch (e) {
      const msg = e?.data?.message || 'Barcode topilmadi'
      setError(msg)
      barcodeRef.current?.select?.()
    } finally {
      setTimeout(() => barcodeRef.current?.focus(), 0)
    }
  }

  const updateRowQty = (rowKey, nextQty) => {
    const row = rowsByKey.get(rowKey)
    if (!row) return
    const qty = clampInt(nextQty, 1, row.available)
    setRows((prev) => prev.map((r) => (r.rowKey === rowKey ? { ...r, quantity: qty } : r)))
  }

  const removeRow = (rowKey) => {
    setRows((prev) => prev.filter((r) => r.rowKey !== rowKey))
    barcodeRef.current?.focus()
  }

  const resetForm = () => {
    setReasonKey('')
    setComment('')
    setRows([])
    setBarcode('')
    setError('')
    barcodeRef.current?.focus()
  }

  const handleSubmit = async () => {
    setError('')
    if (!canSubmit) return

    try {
      const result = await createExpense({
        reasonKey,
        comment,
        items: rows.map((r) => ({ locationId: r.locationId, barcode: r.barcode, quantity: r.quantity })),
      }).unwrap()

      dispatch(
        showNotification({
          severity: 'success',
          message: `Chiqim saqlandi: ${result.code}`,
        }),
      )

      resetForm()
      setSaveDialogOpen(false)
    } catch (e) {
      setError(e?.data?.message || 'Chiqimni saqlashda xatolik')
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
            Chiqim qilish
          </Typography>
          {canViewExpense ? (
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/omborlar/chiqim-tarixi')}
            >
              Chiqim tarixi
            </Button>
          ) : null}
        </Box>

        {!canCreateExpense ? (
          <Alert severity="warning">
            Sizda chiqim yaratish amali uchun ruxsat yo‘q.
          </Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box sx={{ p: 0 }}>
          <Stack spacing={2}>
            <Box>
              <TextField
                inputRef={barcodeRef}
                size="small"
                label="Barcode"
                placeholder="Skaner qiling va Enter bosing"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                disabled={!canScan}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleScan()
                  }
                }}
                fullWidth
              />
            </Box>
          </Stack>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tovar</TableCell>
                <TableCell width={150}>Barcode</TableCell>
                <TableCell width={170}>Ombor joyi</TableCell>
                <TableCell width={110} align="right">
                  Omborda
                </TableCell>
                <TableCell width={220} align="right">
                  Chiqim soni
                </TableCell>
                <TableCell width={56} />
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      Hozircha tovar qo‘shilmagan
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.rowKey} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {r.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{r.barcode}</TableCell>
                    <TableCell>{r.locationName || '—'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {r.available}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => updateRowQty(r.rowKey, r.quantity - 1)}
                          disabled={createExpenseState.isLoading || r.quantity <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          size="small"
                          value={r.quantity}
                          onChange={(e) => updateRowQty(r.rowKey, e.target.value)}
                          disabled={createExpenseState.isLoading}
                          inputMode="numeric"
                          sx={{ width: 86 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => updateRowQty(r.rowKey, r.quantity + 1)}
                          disabled={createExpenseState.isLoading || r.quantity >= r.available}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeRow(r.rowKey)}
                        disabled={createExpenseState.isLoading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={resetForm} disabled={createExpenseState.isLoading}>
            Tozalash
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (canOpenSaveDialog) {
                setSaveDialogOpen(true)
              }
            }}
            disabled={!canOpenSaveDialog}
          >
            Saqlash
          </Button>
        </Box>
      </Stack>

      <Dialog
        open={saveDialogOpen}
        onClose={createExpenseState.isLoading ? undefined : () => setSaveDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Chiqimni saqlash</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <FormControl fullWidth size="small" disabled={reasonsQuery.isLoading || createExpenseState.isLoading}>
              <InputLabel id="expense-reason-label">Chiqim sababi</InputLabel>
              <Select
                labelId="expense-reason-label"
                label="Chiqim sababi"
                value={reasonKey}
                onChange={(e) => setReasonKey(e.target.value)}
              >
                {reasons.map((r) => (
                  <MenuItem key={r.key} value={r.key}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Izoh (ixtiyoriy)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              disabled={createExpenseState.isLoading}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            disabled={createExpenseState.isLoading}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit}
            startIcon={
              createExpenseState.isLoading ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            Saqlashni tasdiqlash
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}

