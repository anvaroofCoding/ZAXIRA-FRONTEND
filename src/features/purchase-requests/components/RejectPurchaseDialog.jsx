import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { PURCHASE_REJECTION_REASONS } from '@/features/purchase-requests/constants/purchaseRejectionReasons'
import { useRejectPurchaseMutation } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const RejectPurchaseDialog = ({ open, request, onClose, onSuccess }) => {
  const [reasonKey, setReasonKey] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const [rejectPurchase, { isLoading }] = useRejectPurchaseMutation()

  useEffect(() => {
    if (!open) return
    setReasonKey('')
    setComment('')
    setError('')
  }, [open, request?.id])

  const handleClose = () => {
    if (isLoading) return
    onClose()
  }

  const handleSubmit = async () => {
    setError('')

    if (!reasonKey) {
      setError('Rad etish sababini tanlang')
      return
    }

    if (reasonKey === 'OTHER' && !comment.trim()) {
      setError('«Boshqa» sabab uchun izoh kiriting')
      return
    }

    try {
      await rejectPurchase({
        id: request.id,
        reasonKey,
        comment: comment.trim(),
      }).unwrap()
      onSuccess?.()
      onClose()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Rad etishda xatolik'))
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Rad etish — {request?.requestCode}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Alert severity="warning">
            Rad etilsa, ariza jarayoni shu bosqichda to‘xtaydi va boshqa amallar bajarilmaydi.
          </Alert>

          <FormControl fullWidth required disabled={isLoading}>
            <InputLabel id="reject-reason-label">Rad etish sababi</InputLabel>
            <Select
              labelId="reject-reason-label"
              label="Rad etish sababi"
              value={reasonKey}
              onChange={(event) => setReasonKey(event.target.value)}
            >
              {PURCHASE_REJECTION_REASONS.map((item) => (
                <MenuItem key={item.key} value={item.key}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Izoh"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            multiline
            minRows={3}
            maxRows={8}
            fullWidth
            disabled={isLoading}
            placeholder="Qisqacha izoh yozing..."
            helperText={
              reasonKey === 'OTHER' ? '«Boshqa» tanlangan — izoh majburiy' : undefined
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Bekor qilish
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={isLoading}
          onClick={handleSubmit}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Rad etish
        </Button>
      </DialogActions>
    </Dialog>
  )
}
