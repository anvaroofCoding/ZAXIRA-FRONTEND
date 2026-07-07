import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BarcodeImage } from '@/features/warehouse/components/BarcodeImage'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'

export const BarcodeDetailDialog = ({ open, onClose, barcode, productName }) => {
  const dispatch = useAppDispatch()
  const value = String(barcode ?? '').trim()

  const handleCopy = async () => {
    if (!value) return

    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error('clipboard unavailable')
      }
      await navigator.clipboard.writeText(value)
      dispatch(
        showNotification({
          severity: 'success',
          message: 'Barcode nusxalandi',
        }),
      )
    } catch {
      dispatch(
        showNotification({
          severity: 'error',
          message: 'Barcode nusxalashda xatolik',
        }),
      )
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{productName?.trim() || 'Barcode'}</DialogTitle>
      <DialogContent>
        <Stack alignItems="center" spacing={2} sx={{ py: 1 }}>
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              width: '100%',
              bgcolor: '#fff',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              px: 2,
              py: 2,
            }}
          >
            <BarcodeImage value={value} height={72} maxWidth="100%" displayValue />
          </Stack>
          <Typography
            variant="body1"
            sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 0.5, wordBreak: 'break-all' }}
          >
            {value || '—'}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Yopish</Button>
        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          disabled={!value}
        >
          Nusxalash
        </Button>
      </DialogActions>
    </Dialog>
  )
}
