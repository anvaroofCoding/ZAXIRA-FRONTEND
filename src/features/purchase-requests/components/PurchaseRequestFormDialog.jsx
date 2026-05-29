import { useEffect, useMemo, useState } from 'react'
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
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { formatMemberLabel as formatUserLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import { useGetUsersLookupQuery } from '@/features/users/api/usersApi'
import { usePermissions } from '@/shared/hooks/usePermissions'

const emptyItem = () => ({
  name: '',
  characteristics: '',
  quantity: '1',
})

export const PurchaseRequestFormDialog = ({ open, loading, onClose, onSubmit }) => {
  const { user: authUser } = usePermissions()
  const currentUserId = authUser?.id

  const usersQuery = useGetUsersLookupQuery(undefined, { skip: !open })
  const users = useMemo(
    () => (usersQuery.data ?? []).filter((user) => user.id !== currentUserId),
    [usersQuery.data, currentUserId],
  )

  const [commissionMembers, setCommissionMembers] = useState([])
  const [bossId, setBossId] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const bossOptions = useMemo(
    () => users.filter((user) => !commissionMembers.some((member) => member.id === user.id)),
    [users, commissionMembers],
  )

  useEffect(() => {
    if (!open) return
    setCommissionMembers([])
    setBossId('')
    setItems([emptyItem()])
    setComment('')
    setError('')
  }, [open])

  const resetForm = () => {
    setCommissionMembers([])
    setBossId('')
    setItems([emptyItem()])
    setComment('')
    setError('')
  }

  const handleClose = () => {
    if (loading) return
    resetForm()
    onClose()
  }

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    )
  }

  const handleQuantityChange = (index, rawValue) => {
    const digitsOnly = rawValue.replace(/\D/g, '')
    handleItemChange(index, 'quantity', digitsOnly)
  }

  const handleAddItem = () => {
    setItems((prev) => [...prev, emptyItem()])
  }

  const handleRemoveItem = (index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (commissionMembers.length === 0) {
      setError('Kamida bitta komissiya a’zosini tanlang')
      return
    }

    if (!bossId) {
      setError('Boshliqni tanlang')
      return
    }

    const normalizedItems = items.map((item) => ({
      name: item.name.trim(),
      characteristics: item.characteristics.trim(),
      quantity: Number.parseInt(item.quantity, 10),
    }))

    if (normalizedItems.some((item) => !item.name)) {
      setError('Har bir tovar uchun nom kiriting')
      return
    }

    if (normalizedItems.some((item) => !item.characteristics)) {
      setError('Har bir tovar uchun xususiyat kiriting')
      return
    }

    if (normalizedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity < 1)) {
      setError('Tovar soni kamida 1 bo‘lishi kerak')
      return
    }

    try {
      await onSubmit({
        commissionMemberIds: commissionMembers.map((member) => member.id),
        bossId,
        items: normalizedItems,
        comment: comment.trim(),
      })
      resetForm()
    } catch (submitError) {
      setError(submitError.message || 'Saqlashda xatolik')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Yangi ariza</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Autocomplete
              multiple
              disableCloseOnSelect
              filterSelectedOptions
              options={users}
              value={commissionMembers}
              loading={usersQuery.isLoading}
              getOptionLabel={formatUserLabel}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_event, value) => {
                setCommissionMembers(value)
                if (
                  value.length > 0 &&
                  error === 'Kamida bitta komissiya a’zosini tanlang'
                ) {
                  setError('')
                }
                if (bossId && value.some((member) => member.id === bossId)) {
                  setBossId('')
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Komissiya a’zolari"
                  placeholder={
                    commissionMembers.length === 0
                      ? 'Foydalanuvchilarni tanlang'
                      : 'Yana qo‘shish...'
                  }
                  error={error === 'Kamida bitta komissiya a’zosini tanlang'}
                />
              )}
            />

            <FormControl fullWidth>
              <InputLabel id="boss-select-label">Boshliq</InputLabel>
              <Select
                labelId="boss-select-label"
                label="Boshliq"
                value={bossId}
                onChange={(event) => setBossId(event.target.value)}
                disabled={usersQuery.isLoading}
              >
                {bossOptions.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {formatUserLabel(user)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Tovarlar
              </Typography>

              <Stack spacing={2}>
                {items.map((item, index) => (
                  <Box
                    key={`item-${index}`}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Tovar {index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label="Tovarni o‘chirish"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        sx={{ ml: 'auto', mr: -1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Stack spacing={2}>
                      <TextField
                        label="Tovar nomi"
                        value={item.name}
                        onChange={(event) =>
                          handleItemChange(index, 'name', event.target.value)
                        }
                        fullWidth
                        disabled={loading}
                      />

                      <TextField
                        label="Tovar xususiyati"
                        value={item.characteristics}
                        onChange={(event) =>
                          handleItemChange(index, 'characteristics', event.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={10}
                        disabled={loading}
                        placeholder="Batafsil xususiyatlarni yozing..."
                        slotProps={{
                          htmlInput: {
                            style: { resize: 'vertical' },
                          },
                        }}
                      />

                      <TextField
                        label="Soni"
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(index, event.target.value)
                        }
                        disabled={loading}
                        placeholder="1"
                        slotProps={{
                          htmlInput: {
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                            min: 1,
                            style: { textAlign: 'left' },
                          },
                        }}
                        sx={{
                          maxWidth: 200,
                          '& .MuiInputBase-input': {
                            fontSize: '1.1rem',
                            py: 1.25,
                          },
                        }}
                        helperText="Faqat butun son kiriting"
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Button
                type="button"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
              >
                Tovar qo‘shish
              </Button>
            </Box>

            <TextField
              label="Izoh"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              multiline
              minRows={4}
              maxRows={12}
              fullWidth
              disabled={loading}
              slotProps={{
                htmlInput: {
                  style: { resize: 'vertical' },
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Yuborish'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
