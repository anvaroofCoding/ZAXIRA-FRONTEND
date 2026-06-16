import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { ProductNameAutocomplete } from '@/features/products/components/ProductNameAutocomplete'
import { useSaveProductImportSessionMutation } from '@/features/product-import/api/productImportApi'
import { getLocalImportSessionById } from '@/features/product-import/utils/activeSessionsStorage'
import { useGetWarehouseLocationsQuery } from '@/features/warehouse/api/warehouseApi'
import { COUNTRIES } from '@/features/purchase-requests/constants/countries'
import { MEASUREMENT_UNITS } from '@/features/purchase-requests/constants/measurementUnits'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { splitAutocompleteOptionProps } from '@/shared/utils/autocompleteOptionProps'

const SESSION_AUTOSAVE_DEBOUNCE_MS = 2000
const BULK_ADD_OPTIONS = [3, 5, 10]

const emptyItem = () => ({
  name: '',
  characteristics: '',
  quantity: '1',
  unit: 'dona',
  manufacturingCountry: '',
})

const mapItemFromSource = (item) => ({
  name: item.name ?? '',
  characteristics: item.characteristics ?? '',
  quantity: String(item.quantity ?? 1),
  unit: item.unit ?? 'dona',
  manufacturingCountry: item.manufacturingCountry ?? '',
})

export const ProductImportFormDialog = ({
  open,
  loading,
  session,
  sessionId,
  onClose,
  onSubmit,
}) => {
  const usesSession = Boolean(sessionId)
  const { user: authUser } = usePermissions()
  const userId = authUser?.id

  const locationsQuery = useGetWarehouseLocationsQuery(undefined, { skip: !open })
  const locations = useMemo(() => locationsQuery.data ?? [], [locationsQuery.data])

  const [locationId, setLocationId] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [sessionNotice, setSessionNotice] = useState('')
  const [bulkAddCount, setBulkAddCount] = useState(5)
  const [saveSession, saveSessionState] = useSaveProductImportSessionMutation()
  const skipNextAutosaveRef = useRef(true)
  const autosaveTimerRef = useRef(null)
  const initializedForRef = useRef(null)

  const resolvedSession = useMemo(() => {
    if (session) return session
    if (sessionId && userId) {
      return getLocalImportSessionById(userId, sessionId)
    }
    return null
  }, [session, sessionId, userId])

  useEffect(() => {
    if (!open) {
      initializedForRef.current = null
      skipNextAutosaveRef.current = true
      return
    }

    const initKey = sessionId ?? 'new'
    if (initializedForRef.current === initKey) return
    initializedForRef.current = initKey

    const source = resolvedSession
    setLocationId(source?.locationId ?? locations[0]?.id ?? '')
    setItems(
      source?.items?.length
        ? source.items.map(mapItemFromSource)
        : [emptyItem()],
    )
    setComment(source?.comment ?? '')
    setError('')
    setSessionNotice('')
    skipNextAutosaveRef.current = true
  }, [open, sessionId, resolvedSession, locations])

  useEffect(() => {
    if (!open || !locations.length || locationId) return
    setLocationId(locations[0].id)
  }, [open, locations, locationId])

  const buildPayload = useCallback(
    () => ({
      locationId,
      comment: comment.trim(),
      items: items.map((item) => ({
        name: item.name.trim(),
        characteristics: item.characteristics.trim(),
        quantity: Number.parseInt(item.quantity, 10) || 1,
        unit: item.unit.trim(),
        manufacturingCountry: item.manufacturingCountry.trim(),
      })),
    }),
    [comment, items, locationId],
  )

  const persistSession = useCallback(async () => {
    if (!usesSession || !sessionId) return

    try {
      const result = await saveSession({
        id: sessionId,
        ...buildPayload(),
      }).unwrap()

      if (result?.pendingServerSync) {
        setSessionNotice('Qurilmada saqlandi. Internet qaytganda sinxronlanadi.')
      } else if (result?.serverSaved === false) {
        setSessionNotice('Qurilmada saqlandi.')
      } else {
        setSessionNotice('Avtomatik saqlandi')
      }
    } catch {
      setSessionNotice('Avtomatik saqlashda xatolik')
    }
  }, [buildPayload, saveSession, sessionId, usesSession])

  useEffect(() => {
    if (!open || !usesSession || !sessionId) return undefined

    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false
      return undefined
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }

    autosaveTimerRef.current = setTimeout(() => {
      void persistSession()
    }, SESSION_AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [open, usesSession, sessionId, locationId, items, comment, persistSession])

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

  const handleBulkAddItems = () => {
    const count = Math.max(1, Math.min(20, bulkAddCount))
    setItems((prev) => [...prev, ...Array.from({ length: count }, emptyItem)])
  }

  const handleRemoveItem = (index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!locationId) {
      setError('Ombor joyini tanlang')
      return
    }

    const normalizedItems = items.map((item) => ({
      name: item.name.trim(),
      characteristics: item.characteristics.trim(),
      quantity: Number.parseInt(item.quantity, 10),
      unit: item.unit.trim(),
      manufacturingCountry: item.manufacturingCountry.trim(),
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

    if (normalizedItems.some((item) => !item.unit)) {
      setError('Har bir tovar uchun birlikni tanlang')
      return
    }

    if (normalizedItems.some((item) => !item.manufacturingCountry)) {
      setError('Har bir tovar uchun ishlab chiqarilgan davlatni tanlang')
      return
    }

    const payload = {
      locationId,
      comment: comment.trim(),
      items: normalizedItems,
    }

    if (usesSession && sessionId) {
      try {
        await saveSession({ id: sessionId, syncServer: true, ...payload }).unwrap()
      } catch {
        setError('Seansni saqlab bo‘lmadi')
        return
      }
    }

    try {
      await onSubmit(payload, { sessionId })
    } catch (submitError) {
      setError(submitError?.message || 'Saqlashda xatolik')
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Tovar import qilish</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            {usesSession && sessionNotice ? (
              <Alert severity="info" sx={{ py: 0.5 }}>
                {sessionNotice}
                {saveSessionState.isLoading ? (
                  <CircularProgress size={14} sx={{ ml: 1, verticalAlign: 'middle' }} />
                ) : null}
              </Alert>
            ) : null}

            <FormControl fullWidth required>
              <InputLabel id="import-location-label">Ombor joyi</InputLabel>
              <Select
                labelId="import-location-label"
                label="Ombor joyi"
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                disabled={loading || locationsQuery.isLoading}
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Izoh (ixtiyoriy)"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={loading}
              multiline
              minRows={2}
              fullWidth
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Tovarlar ({items.length})
              </Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <TextField
                  select
                  size="small"
                  label="Ko‘p qator"
                  value={bulkAddCount}
                  onChange={(event) => setBulkAddCount(Number(event.target.value))}
                  sx={{ minWidth: 110 }}
                >
                  {BULK_ADD_OPTIONS.map((count) => (
                    <MenuItem key={count} value={count}>
                      {count} ta
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  onClick={handleBulkAddItems}
                  disabled={loading}
                >
                  Bir nechta qo‘shish
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  disabled={loading}
                >
                  Qo‘shish
                </Button>
              </Stack>
            </Stack>

            {items.map((item, index) => (
              <Box
                key={`import-item-${index}`}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  p: 2,
                }}
              >
                <Stack
                  direction="row"
                  sx={{ mb: 1.5, alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Tovar {index + 1}
                  </Typography>
                  {items.length > 1 ? (
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="Tovarni o‘chirish"
                      onClick={() => handleRemoveItem(index)}
                      disabled={loading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Stack>

                <Stack spacing={2}>
                  <ProductNameAutocomplete
                    value={item.name}
                    onNameChange={(name) => handleItemChange(index, 'name', name)}
                    onProductSelect={(product) => {
                      handleItemChange(index, 'name', product.name)
                      handleItemChange(index, 'characteristics', product.characteristics)
                    }}
                    disabled={loading}
                  />

                  <TextField
                    label="Xususiyati"
                    value={item.characteristics}
                    onChange={(event) =>
                      handleItemChange(index, 'characteristics', event.target.value)
                    }
                    disabled={loading}
                    required
                    multiline
                    minRows={2}
                    fullWidth
                    helperText={`${item.characteristics.length}/500`}
                    slotProps={{
                      htmlInput: {
                        style: { resize: 'vertical' },
                        maxLength: 500,
                      },
                    }}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Soni"
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(index, event.target.value)
                      }
                      disabled={loading}
                      placeholder="1"
                      fullWidth
                      slotProps={{
                        htmlInput: {
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          min: 1,
                        },
                      }}
                      sx={{ flex: 1, minWidth: 0 }}
                    />

                    <TextField
                      select
                      label="Birlik"
                      value={item.unit}
                      onChange={(event) =>
                        handleItemChange(index, 'unit', event.target.value)
                      }
                      disabled={loading}
                      fullWidth
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      {MEASUREMENT_UNITS.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Autocomplete
                    options={COUNTRIES}
                    value={item.manufacturingCountry || null}
                    onChange={(_event, value) =>
                      handleItemChange(index, 'manufacturingCountry', value ?? '')
                    }
                    disabled={loading}
                    renderOption={(props, option) => {
                      const { key, optionProps } = splitAutocompleteOptionProps(props)

                      return (
                        <li key={key} {...optionProps}>
                          {option}
                        </li>
                      )
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Ishlab chiqarilgan davlat" required />
                    )}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Saqlash'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
