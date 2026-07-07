import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useGetApiCatalogQuery } from '@/features/api-access/api/apiAccessApi'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const initialForm = {
  institutionName: '',
  stir: '',
  contactPerson: '',
  phone: '',
  email: '',
  notes: '',
}

const PHONE_MASK_PREFIX = '+998 '
const PHONE_DIGITS_LENGTH = 9

const formatPhoneFromDigits = (digits) => {
  const raw = digits.replace(/\D/g, '').slice(0, PHONE_DIGITS_LENGTH)
  const part1 = raw.slice(0, 2)
  const part2 = raw.slice(2, 5)
  const part3 = raw.slice(5, 7)
  const part4 = raw.slice(7, 9)

  let value = PHONE_MASK_PREFIX
  if (part1) value += part1
  if (part2) value += ` ${part2}`
  if (part3) value += ` ${part3}`
  if (part4) value += ` ${part4}`
  return value
}

const normalizePhoneDigits = (value) => {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('998')) {
    return digits.slice(3)
  }
  return digits
}

const isPhoneMaskComplete = (value) => /^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(value.trim())

export const GrantApiDialog = ({ open, onClose, onSubmit, isSaving }) => {
  const catalogQuery = useGetApiCatalogQuery(undefined, { skip: !open })
  const [form, setForm] = useState(initialForm)
  const [selectedScopes, setSelectedScopes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(initialForm)
    setSelectedScopes([])
    setError('')
  }, [open])

  const catalogItems = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data])

  const handleChange = (field) => (event) => {
    const inputValue = event.target.value
    if (field === 'phone') {
      const digits = normalizePhoneDigits(inputValue)
      setForm((prev) => ({ ...prev, phone: formatPhoneFromDigits(digits) }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: inputValue }))
  }

  const toggleScope = (scopeId) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId],
    )
  }

  const handleSave = async () => {
    setError('')

    if (!form.institutionName.trim()) {
      setError('Tashkilot nomini kiriting')
      return
    }
    if (!/^\d{9}$/.test(form.stir.trim())) {
      setError('STIR 9 ta raqamdan iborat bo‘lishi kerak')
      return
    }
    if (!form.contactPerson.trim()) {
      setError('Mas’ul shaxsni kiriting')
      return
    }
    if (!isPhoneMaskComplete(form.phone)) {
      setError('Telefon raqamini +998 90 900 90 90 formatida kiriting')
      return
    }
    if (!selectedScopes.length) {
      setError('Kamida bitta API tanlang')
      return
    }

    try {
      await onSubmit({
        institutionName: form.institutionName.trim(),
        stir: form.stir.trim(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
        scopes: selectedScopes,
      })
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Saqlashda xatolik'))
    }
  }

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>API berish</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Tashkilot ma’lumotlari
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Tashkilot nomi"
              value={form.institutionName}
              onChange={handleChange('institutionName')}
              fullWidth
              required
            />
            <TextField
              label="STIR"
              value={form.stir}
              onChange={handleChange('stir')}
              fullWidth
              required
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 9 } }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Mas’ul shaxs"
              value={form.contactPerson}
              onChange={handleChange('contactPerson')}
              fullWidth
              required
            />
            <TextField
              label="Telefon"
              value={form.phone}
              onChange={handleChange('phone')}
              fullWidth
              required
              placeholder="+998 90 900 90 90"
              slotProps={{ htmlInput: { inputMode: 'tel' } }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              fullWidth
            />
            <TextField
              label="Izoh"
              value={form.notes}
              onChange={handleChange('notes')}
              fullWidth
            />
          </Stack>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Beriladigan API’lar
            </Typography>

            <QuerySkeleton isLoading={catalogQuery.isLoading} data={catalogItems}>
              <Stack spacing={0.5}>
                {catalogItems.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedScopes.includes(item.id)}
                          onChange={() => toggleScope(item.id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight={600}>{item.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </Stack>
            </QuerySkeleton>
            {catalogQuery.isError ? (
              <Alert severity="error">
                {getApiErrorMessage(catalogQuery.error, 'API katalogini yuklashda xatolik')}
              </Alert>
            ) : null}
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Bekor qilish
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  )
}
