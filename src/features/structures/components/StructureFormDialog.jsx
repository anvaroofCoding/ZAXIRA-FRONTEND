import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

const buildFormState = (initialStructure) => ({
  fullName: initialStructure?.fullName ?? '',
  shortName: initialStructure?.shortName ?? '',
  hasWarehouse: initialStructure?.hasWarehouse ?? false,
  hasLeader: initialStructure?.hasLeader ?? false,
  leaderName: initialStructure?.leaderName ?? '',
})

const BooleanChoiceField = ({ label, value, onChange, disabled }) => (
  <FormControl disabled={disabled}>
    <FormLabel sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>{label}</FormLabel>
    <RadioGroup
      row
      value={value ? 'yes' : 'no'}
      onChange={(event) => onChange(event.target.value === 'yes')}
    >
      <FormControlLabel value="yes" control={<Radio size="small" />} label="Ha" />
      <FormControlLabel value="no" control={<Radio size="small" />} label="Yo‘q" />
    </RadioGroup>
  </FormControl>
)

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

    if (!shortName) {
      setError('Qisqa nomini kiriting')
      return
    }

    const leaderName = form.leaderName.trim()

    if (form.hasLeader && !leaderName) {
      setError('Raxbar ismini kiriting')
      return
    }

    try {
      await onSubmit({
        fullName,
        shortName,
        hasWarehouse: form.hasWarehouse,
        hasLeader: form.hasLeader,
        leaderName,
      })
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

          <BooleanChoiceField
            label="Ombori bormi?"
            value={form.hasWarehouse}
            onChange={(value) => setForm((prev) => ({ ...prev, hasWarehouse: value }))}
            disabled={loading}
          />

          <BooleanChoiceField
            label="Raxbarmi?"
            value={form.hasLeader}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                hasLeader: value,
                leaderName: value ? prev.leaderName : '',
              }))
            }
            disabled={loading}
          />

          {form.hasLeader ? (
            <TextField
              label="Raxbar ismi"
              value={form.leaderName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, leaderName: event.target.value }))
              }
              required
              fullWidth
              disabled={loading}
              placeholder="Masalan: Karimov Alisher Akmalovich"
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
          ) : null}
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
