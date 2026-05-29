import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

export const PermanentDeleteDialog = ({
  open,
  user,
  loading,
  onClose,
  onConfirm,
}) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 600 }}>Profilni o‘chirish</DialogTitle>
    <DialogContent>
      <DialogContentText>
        <strong>{user?.login}</strong> profili bazadan o‘chiriladi. Bu amalni
        qaytarib bo‘lmaydi.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={loading}>
        Bekor
      </Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
        O‘chirish
      </Button>
    </DialogActions>
  </Dialog>
)
