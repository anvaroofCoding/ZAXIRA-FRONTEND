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
import {
  getLocalImportSessionById,
  mergeImportSessionSources,
} from '@/features/product-import/utils/activeSessionsStorage'
import { useGetWarehouseLocationsQuery } from '@/features/warehouse/api/warehouseApi'
import { COUNTRIES } from '@/features/purchase-requests/constants/countries'
import { UnitSelectField } from '@/shared/components/inputs/UnitSelectField'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { parseUzsInput } from '@/shared/utils/formatUzs'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { splitAutocompleteOptionProps } from '@/shared/utils/autocompleteOptionProps'
import { nomenclatureManualInputSx } from '@/features/warehouse/utils/itemNomenclature'

const SESSION_AUTOSAVE_DEBOUNCE_MS = 1000
const BULK_ADD_OPTIONS = [3, 5, 10]

const emptyItem = () => ({
  name: '',
  characteristics: '',
  quantity: '1',
  unit: 'dona',
  manufacturingCountry: '',
  nomenclatureCode: '',
  unitPrice: '',
})

const mapItemFromSource = (item) => ({
  name: item.name ?? '',
  characteristics: item.characteristics ?? '',
  quantity: String(item.quantity ?? 1),
  unit: item.unit ?? 'dona',
  manufacturingCountry: item.manufacturingCountry ?? '',
  nomenclatureCode: item.nomenclatureCode ?? item.receiptNomenclatureCode ?? '',
  unitPrice:
    item.unitPrice && Number(item.unitPrice) > 0
      ? new Intl.NumberFormat('uz-UZ').format(Math.round(Number(item.unitPrice)))
      : '',
})

const collectItemValidationErrors = (normalizedItems) => {
  const invalidFields = {}

  normalizedItems.forEach((item, index) => {
    const fields = []

    if (!item.name) fields.push('name')
    if (!item.characteristics) fields.push('characteristics')
    if (!Number.isFinite(item.quantity) || item.quantity < 1) fields.push('quantity')
    if (!item.unit) fields.push('unit')
    if (!item.manufacturingCountry) fields.push('manufacturingCountry')
    if (!item.nomenclatureCode) fields.push('nomenclatureCode')
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 1) fields.push('unitPrice')

    if (fields.length) {
      invalidFields[index] = fields
    }
  })

  return invalidFields
}

const firstValidationMessage = (invalidFields, normalizedItems) => {
  const firstIndex = Number(Object.keys(invalidFields)[0])
  const firstField = invalidFields[firstIndex]?.[0]

  if (firstField === 'name') return 'Har bir tovar uchun nom kiriting'
  if (firstField === 'characteristics') return 'Har bir tovar uchun xususiyat kiriting'
  if (firstField === 'quantity') return 'Tovar soni kamida 1 bo‘lishi kerak'
  if (firstField === 'unit') return 'Har bir tovar uchun birlikni tanlang'
  if (firstField === 'manufacturingCountry') {
    return 'Har bir tovar uchun ishlab chiqarilgan davlatni tanlang'
  }
  if (firstField === 'nomenclatureCode') {
    return `Tovar ${firstIndex + 1} uchun nomeklatura raqamini kiriting`
  }
  if (firstField === 'unitPrice') return 'Har bir tovar uchun narx kiriting'

  return normalizedItems.length
    ? 'Ma’lumotlarni to‘ldiring'
    : 'Kamida bitta tovar kiriting'
}

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
  const [invalidItemFields, setInvalidItemFields] = useState({})
  const [sessionNotice, setSessionNotice] = useState('')
  const [bulkAddCount, setBulkAddCount] = useState(5)
  const [saveSession, saveSessionState] = useSaveProductImportSessionMutation()
  const skipNextAutosaveRef = useRef(true)
  const autosaveTimerRef = useRef(null)
  const initializedForRef = useRef(null)

  const resolvedSession = useMemo(() => {
    const localSession =
      sessionId && userId ? getLocalImportSessionById(userId, sessionId) : null

    if (session && localSession) {
      return mergeImportSessionSources(session, localSession)
    }

    return localSession ?? session ?? null
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
    setInvalidItemFields({})
    setSessionNotice('')
    skipNextAutosaveRef.current = true
  }, [open, sessionId, resolvedSession, locations])

  useEffect(() => {
    if (!open || !locations.length) return

    if (!locationId || !locations.some((location) => location.id === locationId)) {
      setLocationId(locations[0].id)
    }
  }, [open, locations, locationId])

  const selectedLocationId = useMemo(() => {
    if (!locations.length) return ''
    if (locationId && locations.some((location) => location.id === locationId)) {
      return locationId
    }
    return locations[0]?.id ?? ''
  }, [locationId, locations])

  const buildPayload = useCallback(
    () => ({
      locationId: selectedLocationId,
      comment: comment.trim(),
      items: items.map((item) => ({
        name: item.name.trim(),
        characteristics: item.characteristics.trim(),
        quantity: Number.parseInt(item.quantity, 10) || 1,
        unit: item.unit.trim(),
        manufacturingCountry: item.manufacturingCountry.trim(),
        nomenclatureCode: item.nomenclatureCode.trim(),
        unitPrice: parseUzsInput(item.unitPrice) ?? 0,
      })),
    }),
    [comment, items, selectedLocationId],
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

    setInvalidItemFields((prev) => {
      if (!prev[index]?.includes(field)) return prev

      const nextFields = prev[index].filter((entry) => entry !== field)
      if (!nextFields.length) {
        const next = { ...prev }
        delete next[index]
        return next
      }

      return { ...prev, [index]: nextFields }
    })
  }

  const handleQuantityChange = (index, rawValue) => {
    const digitsOnly = rawValue.replace(/\D/g, '')
    handleItemChange(index, 'quantity', digitsOnly)
  }

  const handleUnitPriceChange = (index, rawValue) => {
    const digits = rawValue.replace(/\D/g, '')
    const formatted = digits
      ? new Intl.NumberFormat('uz-UZ').format(Number(digits))
      : ''
    handleItemChange(index, 'unitPrice', formatted)
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

  const flushSessionSave = useCallback(async () => {
    if (!usesSession || !sessionId) return

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }

    await saveSession({
      id: sessionId,
      ...buildPayload(),
    }).unwrap()
  }, [buildPayload, saveSession, sessionId, usesSession])

  const handleDialogClose = async () => {
    if (loading) return

    try {
      await flushSessionSave()
    } catch {
      // saveSession avval local cache ga yozadi
    }

    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInvalidItemFields({})

    if (!selectedLocationId) {
      setError('Ombor joyini tanlang')
      return
    }

    const normalizedItems = items.map((item) => ({
      name: item.name.trim(),
      characteristics: item.characteristics.trim(),
      quantity: Number.parseInt(item.quantity, 10),
      unit: item.unit.trim(),
      manufacturingCountry: item.manufacturingCountry.trim(),
      nomenclatureCode: item.nomenclatureCode.trim(),
      unitPrice: parseUzsInput(item.unitPrice) ?? 0,
    }))

    const validationErrors = collectItemValidationErrors(normalizedItems)
    if (Object.keys(validationErrors).length) {
      setInvalidItemFields(validationErrors)
      setError(firstValidationMessage(validationErrors, normalizedItems))
      return
    }

    const payload = {
      locationId: selectedLocationId,
      comment: comment.trim(),
      items: normalizedItems,
    }

    if (usesSession && sessionId) {
      try {
        await saveSession({ id: sessionId, syncServer: true, ...payload }).unwrap()
      } catch (saveError) {
        setError(getApiErrorMessage(saveError, 'Seansni saqlab bo‘lmadi'))
        return
      }
    }

    try {
      await onSubmit(payload, { sessionId })
    } catch (submitError) {
      const message = getApiErrorMessage(submitError, 'Saqlashda xatolik')
      setError(message)

      if (message.includes('nomeklatura')) {
        const nextInvalidFields = {}
        normalizedItems.forEach((item, index) => {
          if (!item.nomenclatureCode) {
            nextInvalidFields[index] = ['nomenclatureCode']
          }
        })
        setInvalidItemFields(nextInvalidFields)
      }
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : handleDialogClose} maxWidth="md" fullWidth>
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
                value={selectedLocationId}
                onChange={(event) => setLocationId(event.target.value)}
                disabled={loading || locationsQuery.isLoading || !locations.length}
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
                      label="Nomeklatura raqami"
                      value={item.nomenclatureCode}
                      onChange={(event) =>
                        handleItemChange(index, 'nomenclatureCode', event.target.value)
                      }
                      disabled={loading}
                      required
                      placeholder="Qo‘lda kiriting"
                      fullWidth
                      error={invalidItemFields[index]?.includes('nomenclatureCode')}
                      helperText={
                        invalidItemFields[index]?.includes('nomenclatureCode')
                          ? 'Nomeklatura raqamini kiriting'
                          : ' '
                      }
                      slotProps={{ htmlInput: { maxLength: 64 } }}
                      sx={nomenclatureManualInputSx}
                    />

                    <TextField
                      label="Narxi (so‘m)"
                      value={item.unitPrice}
                      onChange={(event) =>
                        handleUnitPriceChange(index, event.target.value)
                      }
                      disabled={loading}
                      required
                      placeholder="0"
                      fullWidth
                      slotProps={{
                        htmlInput: {
                          inputMode: 'numeric',
                        },
                      }}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Soni"
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(index, event.target.value)
                      }
                      disabled={loading}
                      required
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

                    <UnitSelectField
                      label="Birlik"
                      value={item.unit}
                      onChange={(nextUnit) =>
                        handleItemChange(index, 'unit', nextUnit)
                      }
                      disabled={loading}
                      required
                      sx={{ flex: 1, minWidth: 0 }}
                    />
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
          <Button onClick={handleDialogClose} disabled={loading}>
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
