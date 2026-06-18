import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { TAX_ID_LENGTH, TAX_ID_TYPE_OPTIONS } from '@/features/purchase-requests/utils/completePurchaseFormUtils'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const PurchaseContractInfoEditDialog = ({
  open,
  batch,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const [contractNumber, setContractNumber] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [taxIdType, setTaxIdType] = useState('')
  const [taxIdNumber, setTaxIdNumber] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    setContractNumber(batch?.contractNumber ?? '')
    setOrganizationName(batch?.organizationName ?? '')
    setTaxIdType(batch?.innOrPinflType ?? '')
    setTaxIdNumber(batch?.innOrPinfl ?? '')
    setError('')
  }, [open, batch])

  const handleSubmit = async () => {
    setError('')

    const trimmedTaxIdNumber = taxIdNumber.trim()

    if ((taxIdType && !trimmedTaxIdNumber) || (!taxIdType && trimmedTaxIdNumber)) {
      setError('INN yoki PINFL uchun avval turini tanlang, keyin raqamni kiriting')
      return
    }

    if (taxIdType && trimmedTaxIdNumber) {
      const expectedLength = TAX_ID_LENGTH[taxIdType]

      if (trimmedTaxIdNumber.length !== expectedLength) {
        setError(
          taxIdType === 'inn'
            ? 'INN 9 ta raqamdan iborat bo‘lishi kerak'
            : 'PINFL 14 ta raqamdan iborat bo‘lishi kerak',
        )
        return
      }
    }

    try {
      await onSave({
        contractNumber: contractNumber.trim(),
        organizationName: organizationName.trim(),
        innOrPinflType: taxIdType,
        innOrPinfl: trimmedTaxIdNumber,
      })
      onClose()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Ma’lumotlarni saqlashda xatolik'))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tashkilot ma’lumotlarini tahrirlash</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Shartnoma raqami"
            value={contractNumber}
            onChange={(event) => setContractNumber(event.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Tashkilot nomi"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            fullWidth
            size="small"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              select
              label="Identifikator turi"
              value={taxIdType}
              onChange={(event) => {
                const nextType = event.target.value
                setTaxIdType(nextType)
                setTaxIdNumber((prev) =>
                  nextType ? prev.slice(0, TAX_ID_LENGTH[nextType]) : '',
                )
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">
                <em>Tanlash</em>
              </MenuItem>
              {TAX_ID_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={taxIdType === 'pinfl' ? 'PINFL raqami' : 'INN raqami'}
              value={taxIdNumber}
              onChange={(event) => {
                const maxLength = taxIdType ? TAX_ID_LENGTH[taxIdType] : 14
                setTaxIdNumber(event.target.value.replace(/\D/g, '').slice(0, maxLength))
              }}
              fullWidth
              size="small"
              disabled={!taxIdType}
            />
          </Stack>
          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Bekor qilish
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  )
}
