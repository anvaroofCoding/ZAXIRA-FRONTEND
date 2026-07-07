import { useMemo, useState } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import {
  useCreateAssignedTasksMutation,
  useGetStructureUsersForAssignmentQuery,
} from '@/features/tasks/api/tasksApi'
import { useIsTasksApiUnavailable } from '@/features/tasks/utils/tasksApiAvailability'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import { formatMemberLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const formatUserLabel = (user) => formatMemberLabel(user)

const buildInitialState = () => ({
  structureId: '',
  selectedUsers: [],
  title: '',
  description: '',
  dueDate: dayjs().add(7, 'day'),
  files: [],
})

const VazifaBerishFormFields = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(buildInitialState)
  const [error, setError] = useState('')

  const structuresQuery = useGetStructuresQuery()
  const tasksApiUnavailable = useIsTasksApiUnavailable()
  const usersQuery = useGetStructureUsersForAssignmentQuery(form.structureId, {
    skip: !form.structureId,
  })
  const fallbackUsersQuery = useGetUsersQuery(
    { structureId: form.structureId, page: 1, limit: 200 },
    { skip: !form.structureId || !tasksApiUnavailable },
  )
  const [createTasks, createState] = useCreateAssignedTasksMutation()

  const structures = useMemo(
    () => (structuresQuery.data ?? []).filter((structure) => structure.isActive),
    [structuresQuery.data],
  )
  const structureUsers = useMemo(() => {
    if (tasksApiUnavailable) {
      return (fallbackUsersQuery.data?.items ?? []).filter((user) => user.isActive !== false)
    }

    return usersQuery.data ?? []
  }, [tasksApiUnavailable, fallbackUsersQuery.data, usersQuery.data])
  const usersLoading = tasksApiUnavailable
    ? fallbackUsersQuery.isLoading || fallbackUsersQuery.isFetching
    : usersQuery.isLoading || usersQuery.isFetching
  const usersError = tasksApiUnavailable ? fallbackUsersQuery.error : usersQuery.error
  const isSubmitting = createState.isLoading

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.structureId) {
      setError('Tuzilmani tanlang')
      return
    }

    if (!form.selectedUsers.length) {
      setError('Kamida bitta foydalanuvchini tanlang')
      return
    }

    if (!form.title.trim()) {
      setError('Vazifa nomini kiriting')
      return
    }

    if (!form.description.trim()) {
      setError('Vazifa mazmunini kiriting')
      return
    }

    if (!form.dueDate || !form.dueDate.isValid()) {
      setError('Bajarilish sanasini tanlang')
      return
    }

    const formData = new FormData()
    formData.append('structureId', form.structureId)
    formData.append(
      'assigneeIds',
      JSON.stringify(form.selectedUsers.map((user) => user.id)),
    )
    formData.append('title', form.title.trim())
    formData.append('description', form.description.trim())
    formData.append('dueDate', form.dueDate.format('YYYY-MM-DD'))
    form.files.forEach((file) => formData.append('files', file))

    try {
      const result = await createTasks(formData).unwrap()
      setForm(buildInitialState())
      onCreated?.(result)
      onClose?.()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Vazifa berishda xatolik'))
    }
  }

  const handleAddFiles = (event) => {
    const picked = Array.from(event.target.files ?? [])
    if (!picked.length) return

    setForm((prev) => ({
      ...prev,
      files: [...prev.files, ...picked],
    }))
    event.target.value = ''
  }

  const handleRemoveFile = (index) => {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, fileIndex) => fileIndex !== index),
    }))
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {usersError ? (
            <Alert severity="warning">
              {getApiErrorMessage(usersError, 'Foydalanuvchilarni yuklab bo‘lmadi')}
            </Alert>
          ) : null}

          {tasksApiUnavailable ? (
            <Alert severity="info">
              Foydalanuvchilar vaqtincha umumiy ro‘yxatdan olinmoqda. Vazifa yuborish uchun backend
              yangilangan bo‘lishi kerak.
            </Alert>
          ) : null}

          <FormControl fullWidth size="small" disabled={isSubmitting}>
            <InputLabel id="task-structure-label">Tuzilma</InputLabel>
            <Select
              labelId="task-structure-label"
              label="Tuzilma"
              value={form.structureId}
              onChange={(event) => {
                setForm((prev) => ({
                  ...prev,
                  structureId: event.target.value,
                  selectedUsers: [],
                }))
              }}
            >
              {structures.map((structure) => (
                <MenuItem key={structure.id} value={structure.id}>
                  {structure.shortName} — {structure.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            multiple
            options={structureUsers}
            value={form.selectedUsers}
            onChange={(_event, value) =>
              setForm((prev) => ({ ...prev, selectedUsers: value }))
            }
            getOptionLabel={formatUserLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={!form.structureId || isSubmitting}
            loading={usersLoading}
            noOptionsText={
              form.structureId
                ? usersLoading
                  ? 'Yuklanmoqda...'
                  : 'Bu tuzilmada faol foydalanuvchilar yo‘q'
                : 'Avval tuzilmani tanlang'
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Foydalanuvchilar"
                placeholder={form.structureId ? 'Tanlang' : 'Avval tuzilmani tanlang'}
                size="small"
              />
            )}
          />

          <TextField
            label="Vazifa nomi"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            fullWidth
            size="small"
            required
            disabled={isSubmitting}
          />

          <TextField
            label="Vazifa mazmuni"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            fullWidth
            size="small"
            multiline
            minRows={3}
            required
            disabled={isSubmitting}
          />

          <DatePicker
            label="Bajarilish sanasi"
            value={form.dueDate}
            onChange={(value) => setForm((prev) => ({ ...prev, dueDate: value }))}
            minDate={dayjs()}
            disabled={isSubmitting}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />

          <Box>
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<AddOutlinedIcon />}
              disabled={isSubmitting}
            >
              Fayl biriktirish
              <input hidden type="file" multiple onChange={handleAddFiles} />
            </Button>

            {form.files.length ? (
              <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                {form.files.map((file, index) => (
                  <Stack
                    key={`${file.name}-${index}`}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {file.name}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="Faylni olib tashlash"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSubmitting}
                    >
                      <CloseOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Bekor qilish
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || tasksApiUnavailable}
          startIcon={
            isSubmitting ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          Vazifa berish
        </Button>
      </DialogActions>
    </Box>
  )
}

export const VazifaBerishDialog = ({ open, onClose, onCreated }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ fontWeight: 700 }}>Yangi vazifa berish</DialogTitle>

    {open ? (
      <VazifaBerishFormFields
        key="vazifa-berish-form"
        onClose={onClose}
        onCreated={onCreated}
      />
    ) : null}
  </Dialog>
)
