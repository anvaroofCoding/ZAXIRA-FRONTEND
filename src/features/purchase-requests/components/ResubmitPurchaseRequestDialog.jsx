import { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { COUNTRIES } from '@/features/purchase-requests/constants/countries'
import { MEASUREMENT_UNITS } from '@/features/purchase-requests/constants/measurementUnits'

const emptyItem = () => ({
  name: '',
  characteristics: '',
  quantity: '1',
  unit: 'dona',
  manufacturingCountry: '',
})

const mapItemsFromRequest = (items = []) =>
  items.length
    ? items.map((item) => ({
        name: item.name,
        characteristics: item.characteristics,
        quantity: String(item.quantity),
        unit: item.unit || 'dona',
        manufacturingCountry: item.manufacturingCountry || '',
      }))
    : [emptyItem()]

export const ResubmitPurchaseRequestDialog = ({
  open,
  loading,
  request,
  onClose,
  onSubmit,
}) => {
  const [items, setItems] = useState([emptyItem()])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !request) return
    setItems(mapItemsFromRequest(request.items))
    setComment(request.comment ?? '')
    setError('')
  }, [open, request])

  const handleClose = () => {
    if (loading) return
    onClose()
  }

  const handleSubmit = async () => {
    const normalizedItems = items
      .map((item) => ({
        name: item.name.trim(),
        characteristics: item.characteristics.trim(),
        quantity: Number(item.quantity),
        unit: item.unit.trim(),
        manufacturingCountry: item.manufacturingCountry.trim(),
      }))
      .filter((item) => item.name && item.characteristics)

    if (!normalizedItems.length) {
      setError('Kamida bitta tovar kiriting')
      return
    }

    if (normalizedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity < 1)) {
      setError('Tovar soni 1 dan katta bo‘lishi kerak')
      return
    }

    if (normalizedItems.some((item) => !item.unit)) {
      setError('Har bir tovar uchun birlikni tanlang')
      return
    }

    if (normalizedItems.some((item) => !item.manufacturingCountry)) {
      setError('Har bir tovar uchun ishlab chiqarilgan davlatni tanlang')
      return
    }

    try {
      await onSubmit({
        items: normalizedItems,
        comment: comment.trim(),
      })
    } catch (err) {
      setError(err.message || 'Saqlashda xatolik')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Arizani qayta yuborish — {request?.requestCode}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Alert severity="info">
            Komissiya qisman tasdiqlagan. Tovarlarni tuzatib, qayta yuboring. Keyin komissiya
            qayta qaror beradi.
          </Alert>

          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Stack
                direction="row"
                sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Tovar {index + 1}
                </Typography>
                {items.length > 1 ? (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </Stack>

              <Stack spacing={1.5}>
                <TextField
                  label="Tovar nomi"
                  size="small"
                  fullWidth
                  value={item.name}
                  onChange={(event) =>
                    setItems((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, name: event.target.value } : row,
                      ),
                    )
                  }
                />
                <TextField
                  label="Tovar xususiyati"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  helperText={`${item.characteristics.length}/500`}
                  value={item.characteristics}
                  onChange={(event) =>
                    setItems((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, characteristics: event.target.value } : row,
                      ),
                    )
                  }
                  slotProps={{
                    htmlInput: { maxLength: 500 },
                  }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Soni"
                    size="small"
                    type="number"
                    fullWidth
                    sx={{ flex: 1, minWidth: 0 }}
                    value={item.quantity}
                    onChange={(event) =>
                      setItems((prev) =>
                        prev.map((row, i) =>
                          i === index ? { ...row, quantity: event.target.value } : row,
                        ),
                      )
                    }
                  />
                  <TextField
                    select
                    label="Birlik"
                    size="small"
                    fullWidth
                    sx={{ flex: 1, minWidth: 0 }}
                    value={item.unit}
                    onChange={(event) =>
                      setItems((prev) =>
                        prev.map((row, i) =>
                          i === index ? { ...row, unit: event.target.value } : row,
                        ),
                      )
                    }
                  >
                    {MEASUREMENT_UNITS.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Autocomplete
                  size="small"
                  options={COUNTRIES}
                  value={item.manufacturingCountry || null}
                  onChange={(_event, value) =>
                    setItems((prev) =>
                      prev.map((row, i) =>
                        i === index
                          ? { ...row, manufacturingCountry: value ?? '' }
                          : row,
                      ),
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Ishlab chiqarilgan davlati"
                      placeholder="Davlatni tanlang"
                    />
                  )}
                />
              </Stack>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => setItems((prev) => [...prev, emptyItem()])}
            sx={{ alignSelf: 'flex-start' }}
          >
            Tovar qo‘shish
          </Button>

          <TextField
            label="Sotib olish sababi"
            multiline
            minRows={3}
            fullWidth
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Qayta yuborish
        </Button>
      </DialogActions>
    </Dialog>
  )
}
