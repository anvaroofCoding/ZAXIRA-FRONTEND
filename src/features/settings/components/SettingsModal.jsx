import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { SettingsContent } from './SettingsContent'

export const SettingsModal = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
    <DialogTitle>Sozlamalar</DialogTitle>
    <DialogContent dividers>
      <SettingsContent />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Yopish</Button>
    </DialogActions>
  </Dialog>
)
