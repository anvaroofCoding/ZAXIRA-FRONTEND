import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

const buildFormState = (initialStructure) => ({
  fullName: initialStructure?.fullName ?? '',
  shortName: initialStructure?.shortName ?? '',
})

const StructureFormFields = ({
  mode,
  initialStructure,
  loading,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => buildFormState(initialStructure))
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const fullName = form.fullName.trim()
    const shortName = form.shortName.trim()

    if (!fullName) {
      setError('To‘liq nomini kiriting')
      return
    }

    if (shortName.length < 2) {
      setError('Qisqa nom kamida 2 belgidan iborat bo‘lishi kerak')
      return
    }

    try {
      await onSubmit({ fullName, shortName })
    } catch (submitError) {
      setError(submitError.message || 'Saqlashda xatolik')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="To‘liq nomi"
            value={form.fullName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
            required
            fullWidth
            autoFocus
            disabled={loading}
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />

          <TextField
            label="Qisqa nomi"
            value={form.shortName}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                shortName: event.target.value.toUpperCase(),
              }))
            }
            required
            fullWidth
            disabled={loading}
            slotProps={{ htmlInput: { maxLength: 32 } }}
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
  )
}

export const StructureFormDialog = ({
  open,
  mode,
  initialStructure,
  loading,
  onClose,
  onSubmit,
}) => {
  const formKey = `${mode}-${initialStructure?.id ?? 'new'}`
  const title =
    mode === 'create'
      ? 'Tarkibiy tuzilmani ro‘yxatga olish'
      : 'Tarkibiy tuzilmani tahrirlash'

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>

      {open ? (
        <StructureFormFields
          key={formKey}
          mode={mode}
          initialStructure={initialStructure}
          loading={loading}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}
