import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { formatMemberLabel as formatUserLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import {
  usePolishPurchaseRequestItemTextMutation,
  useSavePurchaseRequestSessionMutation,
} from '@/features/purchase-requests/api/purchaseRequestsApi'
import { useGetCommissionsPagedQuery } from '@/features/commissions/api/commissionsApi'
import { expandCommissionToSelection } from '@/features/commissions/utils/expandCommissionSelection'
import { useGetUsersLookupQuery } from '@/features/users/api/usersApi'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { ProductNameAutocomplete } from '@/features/products/components/ProductNameAutocomplete'
import { COUNTRIES } from '@/features/purchase-requests/constants/countries'
import { MEASUREMENT_UNITS } from '@/features/purchase-requests/constants/measurementUnits'
import { PurchasePeriodFields } from '@/features/purchase-requests/components/PurchasePeriodFields'
import { getLocalActiveSessionById } from '@/features/purchase-requests/utils/activeSessionsStorage'
import { splitAutocompleteOptionProps } from '@/shared/utils/autocompleteOptionProps'
import { buildYearOptions } from '@/features/purchase-requests/utils/formatPurchasePeriod'

const SESSION_AUTOSAVE_DEBOUNCE_MS = 2000

const emptyItem = () => ({
  name: '',
  characteristics: '',
  quantity: '1',
  unit: 'dona',
  manufacturingCountry: '',
})

const mapMemberToUserOption = (member) => ({
  id: member.userId,
  displayName: member.displayName,
  login: member.login,
  structureShortName: member.structureShortName ?? null,
})

const mapItemFromSource = (item) => ({
  name: item.name ?? '',
  characteristics: item.characteristics ?? '',
  quantity: String(item.quantity ?? 1),
  unit: item.unit ?? 'dona',
  manufacturingCountry: item.manufacturingCountry ?? '',
})

export const PurchaseRequestFormDialog = ({
  open,
  loading,
  request,
  session,
  sessionId,
  onClose,
  onSubmit,
  submitLabel,
}) => {
  const isEdit = Boolean(request?.id)
  const usesSession = !isEdit && Boolean(sessionId)
  const { user: authUser } = usePermissions()
  const currentUserId = authUser?.id

  const usersQuery = useGetUsersLookupQuery(undefined, { skip: !open })
  const commissionsQuery = useGetCommissionsPagedQuery(
    { page: 1, limit: 100 },
    { skip: !open || isEdit },
  )
  const users = useMemo(
    () => (usersQuery.data ?? []).filter((user) => user.id !== currentUserId),
    [usersQuery.data, currentUserId],
  )
  const commissionOptions = useMemo(
    () =>
      (commissionsQuery.data?.items ?? []).filter(
        (commission) => commission.isActive !== false,
      ),
    [commissionsQuery.data?.items],
  )

  const [selectedCommission, setSelectedCommission] = useState(null)
  const [commissionMembers, setCommissionMembers] = useState([])
  const [bossId, setBossId] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [comment, setComment] = useState('')
  const [commissionAgreementText, setCommissionAgreementText] = useState('')
  const [periodType, setPeriodType] = useState('plain')
  const [periodYear, setPeriodYear] = useState(buildYearOptions(1)[0])
  const [periodQuarter, setPeriodQuarter] = useState(1)
  const [periodMonth, setPeriodMonth] = useState(1)
  const [error, setError] = useState('')
  const [sessionNotice, setSessionNotice] = useState('')
  const [aiLoadingByIndex, setAiLoadingByIndex] = useState({})
  const [polishItemText] = usePolishPurchaseRequestItemTextMutation()
  const [saveSession, saveSessionState] = useSavePurchaseRequestSessionMutation()
  const skipNextAutosaveRef = useRef(true)
  const autosaveTimerRef = useRef(null)
  const initializedForRef = useRef(null)
  const commissionHydratedRef = useRef(false)

  const bossOptions = useMemo(
    () => users.filter((user) => !commissionMembers.some((member) => member.id === user.id)),
    [users, commissionMembers],
  )

  const buildSessionPayload = useCallback(
    () => ({
      commissionMemberIds: commissionMembers
        .map((member) => member.id)
        .filter((memberId) => /^[a-f\d]{24}$/i.test(String(memberId))),
      bossId: /^[a-f\d]{24}$/i.test(String(bossId)) ? bossId : undefined,
      items: items.map((item) => ({
        name: item.name,
        characteristics: item.characteristics,
        quantity: Number.parseInt(item.quantity, 10) || 1,
        unit: item.unit,
        manufacturingCountry: item.manufacturingCountry,
      })),
      comment: comment.trim(),
      commissionAgreementText: commissionAgreementText.trim(),
      purchasePeriodType: periodType,
      purchasePeriodYear:
        periodType === 'plain' ? undefined : Number(periodYear) || undefined,
      purchasePeriodQuarter:
        periodType === 'quarter' ? Number(periodQuarter) || undefined : undefined,
      purchasePeriodMonth: periodType === 'month' ? Number(periodMonth) || undefined : undefined,
    }),
    [
      bossId,
      comment,
      commissionAgreementText,
      commissionMembers,
      items,
      periodMonth,
      periodQuarter,
      periodType,
      periodYear,
    ],
  )

  const persistSession = useCallback(async () => {
    if (!usesSession || !open || !sessionId) return

    const payload = buildSessionPayload()

    try {
      const saved = await saveSession({ id: sessionId, ...payload }).unwrap()

      if (saved?.serverSaved === false) {
        if (saved?.pendingServerSync) {
          setSessionNotice(
            'Qurilmada saqlandi. Server ishga tushgach avtomatik sinxronlanadi.',
          )
        } else {
          setSessionNotice('Qurilmada saqlandi')
        }
        return
      }

      setSessionNotice('Saqlangan')
    } catch {
      const cached = getLocalActiveSessionById(currentUserId, sessionId)
      if (cached) {
        setSessionNotice('Qurilmada saqlandi')
        return
      }

      setSessionNotice('Saqlashda xatolik')
    }
  }, [buildSessionPayload, currentUserId, open, saveSession, sessionId, usesSession])

  useEffect(() => {
    if (!open) {
      initializedForRef.current = null
      commissionHydratedRef.current = false
      return
    }

    const sourceKey = request?.id ?? session?.id ?? 'new'
    if (initializedForRef.current === sourceKey) {
      return
    }

    initializedForRef.current = sourceKey
    commissionHydratedRef.current = false
    skipNextAutosaveRef.current = true
    setSelectedCommission(null)

    if (request) {
      setCommissionMembers((request.commissionMembers ?? []).map(mapMemberToUserOption))
      commissionHydratedRef.current = true
      setBossId(request.boss?.userId ?? '')
      setItems(
        request.items?.length
          ? request.items.map(mapItemFromSource)
          : [emptyItem()],
      )
      setComment(request.comment ?? '')
      setCommissionAgreementText(request.commissionAgreementText ?? '')
      setPeriodType(request.purchasePeriodType ?? 'plain')
      setPeriodYear(request.purchasePeriodYear ?? buildYearOptions(1)[0])
      setPeriodQuarter(request.purchasePeriodQuarter ?? 1)
      setPeriodMonth(request.purchasePeriodMonth ?? 1)
    } else if (session) {
      const sessionSource =
        getLocalActiveSessionById(currentUserId, session.id) ?? session

      setCommissionMembers([])
      setBossId(sessionSource.bossId ?? '')
      setItems(
        sessionSource.items?.length
          ? sessionSource.items.map(mapItemFromSource)
          : [emptyItem()],
      )
      setComment(sessionSource.comment ?? '')
      setCommissionAgreementText(sessionSource.commissionAgreementText ?? '')
      setPeriodType(sessionSource.purchasePeriodType ?? 'plain')
      setPeriodYear(sessionSource.purchasePeriodYear ?? buildYearOptions(1)[0])
      setPeriodQuarter(sessionSource.purchasePeriodQuarter ?? 1)
      setPeriodMonth(sessionSource.purchasePeriodMonth ?? 1)
    } else {
      setCommissionMembers([])
      setBossId('')
      setItems([emptyItem()])
      setComment('')
      setCommissionAgreementText('')
      setPeriodType('plain')
      setPeriodYear(buildYearOptions(1)[0])
      setPeriodQuarter(1)
      setPeriodMonth(1)
    }

    setError('')
    setSessionNotice('')
    setAiLoadingByIndex({})
  }, [open, request?.id, session?.id, request, session]) // request/session: init ma'lumotlari

  useEffect(() => {
    if (!open || commissionHydratedRef.current || !users.length) {
      return
    }

    if (request?.commissionMembers?.length) {
      setCommissionMembers(request.commissionMembers.map(mapMemberToUserOption))
      commissionHydratedRef.current = true
      return
    }

    const sessionSource = session?.id
      ? getLocalActiveSessionById(currentUserId, session.id) ?? session
      : session

    if (sessionSource?.commissionMemberIds?.length) {
      const memberIds = new Set(sessionSource.commissionMemberIds)
      setCommissionMembers(users.filter((user) => memberIds.has(user.id)))
      commissionHydratedRef.current = true
    }
  }, [open, request?.id, session?.id, request?.commissionMembers, session?.commissionMemberIds, users])

  useEffect(() => {
    if (!usesSession || !open) return undefined

    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false
      return undefined
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      persistSession()
    }, SESSION_AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [
    usesSession,
    open,
    commissionMembers,
    bossId,
    items,
    comment,
    commissionAgreementText,
    periodType,
    periodYear,
    periodQuarter,
    periodMonth,
    persistSession,
  ])

  const handleClose = () => {
    if (loading) return

    onClose()

    if (usesSession && sessionId) {
      void persistSession()
    }
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

    if (periodType !== 'plain' && !periodYear) {
      setError('Sotib olish yilini tanlang')
      return
    }

    if (periodType === 'quarter' && !periodQuarter) {
      setError('Chorakni tanlang')
      return
    }

    if (periodType === 'month' && !periodMonth) {
      setError('Oyni tanlang')
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
      commissionMemberIds: commissionMembers.map((member) => member.id),
      bossId,
      items: normalizedItems,
      comment: comment.trim(),
      commissionAgreementText: commissionAgreementText.trim(),
      purchasePeriodType: periodType,
      purchasePeriodYear: periodType === 'plain' ? undefined : periodYear,
      purchasePeriodQuarter: periodType === 'quarter' ? periodQuarter : undefined,
      purchasePeriodMonth: periodType === 'month' ? periodMonth : undefined,
    }

    try {
      if (usesSession && sessionId) {
        await saveSession({ id: sessionId, syncServer: true, ...payload }).unwrap()
      }

      await onSubmit(payload, { sessionId })
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
          {isEdit
            ? `Arizani tahrirlash — ${request.requestCode}`
            : session?.reservedRequestCode
              ? `Yangi ariza — ${session.reservedRequestCode}`
              : 'Yangi ariza'}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            {isEdit ? (
              <Alert severity="info">
                O‘zgartirishlar saqlangach faqat rad etgan yoki qisman kelishgan komissiya
                a’zolari qayta qaror beradi. To‘liq kelishgan a’zolar qarori o‘zgarmaydi.
              </Alert>
            ) : null}

            {usesSession && sessionNotice ? (
              <Alert severity={saveSessionState.isError ? 'warning' : 'info'}>
                {sessionNotice}
              </Alert>
            ) : null}

            {usesSession ? (
              <Alert severity="info" variant="outlined">
                Faol seans: yozganlaringiz 2 soniyadan keyin avtomatik saqlanadi. Internet
                bo‘lmasa ma’lumot qurilmada saqlanib qoladi va server tiklangach sinxronlanadi.
              </Alert>
            ) : null}

            <TextField
              label="Sotib olish sababi"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              multiline
              minRows={3}
              maxRows={10}
              fullWidth
              disabled={loading}
              placeholder="Nima uchun sotib olinishi kerak?"
              slotProps={{
                htmlInput: {
                  style: { resize: 'vertical' },
                },
              }}
            />

            <TextField
              label="Komissiya a'zolari uchun kelishuv matni"
              value={commissionAgreementText}
              onChange={(event) => setCommissionAgreementText(event.target.value)}
              multiline
              minRows={4}
              maxRows={12}
              fullWidth
              disabled={loading}
              placeholder="Kelishuv varaqasidagi 1 va 2-bandlar matnini kiriting..."
              slotProps={{
                htmlInput: {
                  style: { resize: 'vertical' },
                },
              }}
            />

            <PurchasePeriodFields
              periodType={periodType}
              year={periodYear}
              quarter={periodQuarter}
              month={periodMonth}
              onPeriodTypeChange={(value) => setPeriodType(value)}
              onYearChange={(value) => setPeriodYear(Number(value))}
              onQuarterChange={(value) => setPeriodQuarter(Number(value))}
              onMonthChange={(value) => setPeriodMonth(Number(value))}
              disabled={loading}
            />

            {!isEdit ? (
              <Autocomplete
                options={commissionOptions}
                value={selectedCommission}
                loading={commissionsQuery.isLoading}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_event, commission) => {
                  setSelectedCommission(commission)

                  if (!commission) {
                    return
                  }

                  const { members, bossId: nextBossId } = expandCommissionToSelection(
                    commission,
                    usersQuery.data ?? [],
                    { excludeUserId: currentUserId },
                  )

                  setCommissionMembers(members)

                  if (nextBossId) {
                    setBossId(nextBossId)
                  }

                  if (
                    members.length > 0 &&
                    error === 'Kamida bitta komissiya a’zosini tanlang'
                  ) {
                    setError('')
                  }
                }}
                renderOption={(props, option) => {
                  const { key, optionProps } = splitAutocompleteOptionProps(props)
                  const memberPreview = (option.members ?? [])
                    .map((member) => member.displayName || member.login)
                    .filter(Boolean)
                    .join(', ')

                  return (
                    <li key={key} {...optionProps}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {option.name}
                        </Typography>
                        {memberPreview ? (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {memberPreview}
                          </Typography>
                        ) : null}
                      </Box>
                    </li>
                  )
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Saqlangan komissiyadan tanlash"
                    placeholder="Komissiya guruhini tanlang (ixtiyoriy)"
                  />
                )}
              />
            ) : null}

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
                setSelectedCommission(null)
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
              renderOption={(props, option) => {
                const { key, optionProps } = splitAutocompleteOptionProps(props)

                return (
                  <li key={key} {...optionProps}>
                    {formatUserLabel(option)}
                  </li>
                )
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
                        placeholder="Model, o‘lcham, rang va boshqalar"
                        helperText={`${item.characteristics.length}/500`}
                        slotProps={{
                          htmlInput: {
                            style: { resize: 'vertical' },
                            maxLength: 500,
                          },
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

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="Soni"
                          value={item.quantity}
                          onChange={(event) =>
                            handleQuantityChange(index, event.target.value)
                          }
                          disabled={loading || Boolean(aiLoadingByIndex[index])}
                          placeholder="1"
                          fullWidth
                          slotProps={{
                            htmlInput: {
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              min: 1,
                              style: { textAlign: 'left' },
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
                          disabled={loading || Boolean(aiLoadingByIndex[index])}
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
                        disabled={loading || Boolean(aiLoadingByIndex[index])}
                        renderOption={(props, option) => {
                          const { key, optionProps } = splitAutocompleteOptionProps(props)

                          return (
                            <li key={key} {...optionProps}>
                              {option}
                            </li>
                          )
                        }}
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              submitLabel || (isEdit ? 'Davom etish' : 'Yuborish')
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
