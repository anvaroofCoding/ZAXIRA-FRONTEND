import { useState } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export const CustomUnitFormDialog = ({
  open,
  initialUnit,
  loading,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initialUnit?.name ?? '')
  const [error, setError] = useState('')

  const handleEnter = () => {
    setName(initialUnit?.name ?? '')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const trimmed = name.trim()

    if (!trimmed) {
      setError('Birlik nomini kiriting')
      return
    }

    try {
      await onSubmit({ name: trimmed })
    } catch (submitError) {
      setError(submitError.message || 'Saqlashda xatolik')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        transition: { onEnter: handleEnter },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Birlikni tahrirlash</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {initialUnit?.ownerName ? (
              <Typography variant="body2" color="text.secondary">
                Foydalanuvchi: {initialUnit.ownerName}
              </Typography>
            ) : null}

            <TextField
              label="Birlik nomi"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (error) {
                  setError('')
                }
              }}
              disabled={loading}
              autoFocus
              fullWidth
              error={Boolean(error)}
              helperText={error}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            Saqlash
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
