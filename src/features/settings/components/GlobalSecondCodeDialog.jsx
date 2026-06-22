import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { GlobalSecondCodeForm } from './GlobalSecondCodeForm'

export const GlobalSecondCodeDialog = ({ open, onClose, onSaved }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 600 }}>Umumiy kod</DialogTitle>
    <DialogContent>
      <GlobalSecondCodeForm
        onSaved={(message) => {
          onSaved?.(message)
          onClose()
        }}
      />
    </DialogContent>
  </Dialog>
)
