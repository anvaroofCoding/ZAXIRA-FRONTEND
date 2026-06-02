import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DeleteIcon from '@mui/icons-material/Delete'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { formatMemberLabel as formatUserLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import { usePolishPurchaseRequestItemTextMutation } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { useGetUsersLookupQuery } from '@/features/users/api/usersApi'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { ProductNameAutocomplete } from '@/features/products/components/ProductNameAutocomplete'

const emptyItem = () => ({
  name: '',
  characteristics: '',
  quantity: '1',
})

const mapMemberToUserOption = (member) => ({
  id: member.userId,
  displayName: member.displayName,
  login: member.login,
  structureShortName: member.structureShortName ?? null,
})

export const PurchaseRequestFormDialog = ({
  open,
  loading,
  request,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(request?.id)
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
  const [purchaseDeadline, setPurchaseDeadline] = useState(null)
  const [purchaseDeadlineMandatory, setPurchaseDeadlineMandatory] = useState(false)
  const [error, setError] = useState('')
  const [aiLoadingByIndex, setAiLoadingByIndex] = useState({})
  const [polishItemText] = usePolishPurchaseRequestItemTextMutation()

  const bossOptions = useMemo(
    () => users.filter((user) => !commissionMembers.some((member) => member.id === user.id)),
    [users, commissionMembers],
  )

  useEffect(() => {
    if (!open) return

    if (request) {
      setCommissionMembers((request.commissionMembers ?? []).map(mapMemberToUserOption))
      setBossId(request.boss?.userId ?? '')
      setItems(
        request.items?.length
          ? request.items.map((item) => ({
              name: item.name,
              characteristics: item.characteristics,
              quantity: String(item.quantity),
            }))
          : [emptyItem()],
      )
      setComment(request.comment ?? '')
      setPurchaseDeadline(
        request.purchaseDeadline ? dayjs(request.purchaseDeadline) : null,
      )
      setPurchaseDeadlineMandatory(Boolean(request.purchaseDeadlineMandatory))
    } else {
      setCommissionMembers([])
      setBossId('')
      setItems([emptyItem()])
      setComment('')
      setPurchaseDeadline(null)
      setPurchaseDeadlineMandatory(false)
    }

    setError('')
    setAiLoadingByIndex({})
  }, [open, request])

  const resetForm = () => {
    setCommissionMembers([])
    setBossId('')
    setItems([emptyItem()])
    setComment('')
    setPurchaseDeadline(null)
    setPurchaseDeadlineMandatory(false)
    setError('')
    setAiLoadingByIndex({})
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
    setAiLoadingByIndex((prev) => {
      const next = {}
      Object.keys(prev).forEach((key) => {
        const currentIndex = Number.parseInt(key, 10)
        if (currentIndex < index) next[currentIndex] = prev[currentIndex]
        if (currentIndex > index) next[currentIndex - 1] = prev[currentIndex]
      })
      return next
    })
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

    if (purchaseDeadlineMandatory && !purchaseDeadline) {
      setError('Muddat majburiy deb belgilangan — sanani tanlang')
      return
    }

    try {
      await onSubmit({
        commissionMemberIds: commissionMembers.map((member) => member.id),
        bossId,
        items: normalizedItems,
        comment: comment.trim(),
        ...(purchaseDeadline
          ? {
              purchaseDeadline: dayjs(purchaseDeadline).format('YYYY-MM-DD'),
              purchaseDeadlineMandatory,
            }
          : {}),
      })
      resetForm()
    } catch (submitError) {
      setError(submitError.message || 'Saqlashda xatolik')
    }
  }

  const handlePolishWithAi = async (index) => {
    const current = items[index]
    if (!current) return

    const rawName = current.name.trim()
    const rawCharacteristics = current.characteristics.trim()

    if (!rawName || !rawCharacteristics) {
      setError('AI ishlatish uchun avval tovar nomi va xususiyatini kiriting')
      return
    }

    setError('')
    setAiLoadingByIndex((prev) => ({ ...prev, [index]: true }))

    try {
      const polished = await polishItemText({
        name: rawName,
        characteristics: rawCharacteristics,
      }).unwrap()

      handleItemChange(index, 'name', polished.name ?? rawName)
      handleItemChange(
        index,
        'characteristics',
        polished.characteristics ?? rawCharacteristics,
      )
    } catch (aiError) {
      setError(aiError?.data?.message || 'AI matnni qayta ishlay olmadi')
    } finally {
      setAiLoadingByIndex((prev) => ({ ...prev, [index]: false }))
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>
          {isEdit ? `Arizani tahrirlash — ${request.requestCode}` : 'Yangi ariza'}
        </DialogTitle>
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
                      <ProductNameAutocomplete
                        value={item.name}
                        disabled={loading || Boolean(aiLoadingByIndex[index])}
                        aiLoading={Boolean(aiLoadingByIndex[index])}
                        onNameChange={(name) => handleItemChange(index, 'name', name)}
                        onProductSelect={(product) => {
                          handleItemChange(index, 'name', product.name)
                          handleItemChange(index, 'characteristics', product.characteristics)
                        }}
                      />

                      <TextField
                        label="Tovar xususiyati"
                        value={item.characteristics}
                        onChange={(event) =>
                          handleItemChange(index, 'characteristics', event.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={6}
                        disabled={loading || Boolean(aiLoadingByIndex[index])}
                        placeholder="Model, o‘lcham, rang va boshqalar — qisqa va aniq yozing"
                        helperText={`Ustav tekshiruvi va jadval uchun qisqa, aniq tavsif (${item.characteristics.length}/500)`}
                        slotProps={{
                          htmlInput: {
                            style: { resize: 'vertical' },
                            maxLength: 500,
                          },
                        }}
                        InputProps={{
                          endAdornment: aiLoadingByIndex[index] ? (
                            <Skeleton
                              variant="rounded"
                              width={72}
                              height={18}
                              sx={{ borderRadius: 1, alignSelf: 'flex-start', mt: 1 }}
                            />
                          ) : null,
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="button"
                          size="small"
                          variant="text"
                          startIcon={<AutoFixHighIcon fontSize="small" />}
                          onClick={() => handlePolishWithAi(index)}
                          disabled={loading || Boolean(aiLoadingByIndex[index])}
                          sx={{ textTransform: 'none', minWidth: 'auto' }}
                        >
                          {aiLoadingByIndex[index] ? 'AI ishlamoqda...' : 'AI bilan ishlash'}
                        </Button>
                      </Box>

                      <TextField
                        label="Soni"
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(index, event.target.value)
                        }
                        disabled={loading || Boolean(aiLoadingByIndex[index])}
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

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Sotib olish muddati
              </Typography>
              <Stack spacing={1.5}>
                <DatePicker
                  label="Muddat (ixtiyoriy)"
                  value={purchaseDeadline}
                  onChange={(value) => {
                    setPurchaseDeadline(value)
                    if (!value) {
                      setPurchaseDeadlineMandatory(false)
                    }
                  }}
                  format="DD.MM.YYYY"
                  disablePast
                  disabled={loading}
                  slotProps={{
                    textField: { fullWidth: true },
                    field: { clearable: true },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={purchaseDeadlineMandatory}
                      onChange={(event) =>
                        setPurchaseDeadlineMandatory(event.target.checked)
                      }
                      disabled={loading || !purchaseDeadline}
                    />
                  }
                  label="Muddat majburiy (sotib olish shu sanagacha amalga oshirilishi kerak)"
                />
              </Stack>
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
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : isEdit ? (
              'Saqlash'
            ) : (
              'Yuborish'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
