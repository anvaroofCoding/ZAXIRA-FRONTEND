import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { formatMemberLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import { useGetUsersLookupQuery } from '@/features/users/api/usersApi'

const buildFormState = (initialCommission) => ({
  name: initialCommission?.name ?? '',
  members: initialCommission?.members ?? [],
  bossId: initialCommission?.boss?.userId ?? '',
})

const mapMembersToUsers = (members, users, bossId) => {
  if (!members?.length || !users?.length) {
    return []
  }

  const usersById = new Map(users.map((user) => [user.id, user]))

  return members
    .filter((member) => {
      const userId = member.userId ?? member.id
      return !bossId || userId !== bossId
    })
    .map((member) => {
      const userId = member.userId ?? member.id
      const matched = usersById.get(userId)

      if (matched) {
        return matched
      }

      return {
        id: userId,
        displayName: member.displayName,
        login: member.login,
        structureShortName: member.structureShortName,
      }
    })
    .filter(Boolean)
}

const CommissionFormFields = ({
  mode,
  initialCommission,
  loading,
  onClose,
  onSubmit,
}) => {
  const usersQuery = useGetUsersLookupQuery()
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])

  const [form, setForm] = useState(() => buildFormState(initialCommission))
  const [selectedMembers, setSelectedMembers] = useState(() =>
    mapMembersToUsers(
      initialCommission?.members,
      users,
      initialCommission?.boss?.userId,
    ),
  )
  const [bossId, setBossId] = useState(initialCommission?.boss?.userId ?? '')
  const [error, setError] = useState('')

  const bossOptions = useMemo(
    () => users.filter((user) => !selectedMembers.some((member) => member.id === user.id)),
    [users, selectedMembers],
  )

  useEffect(() => {
    if (!initialCommission || !users.length) {
      return
    }

    const initialBossId = initialCommission.boss?.userId ?? ''

    setBossId((prev) => prev || initialBossId)
    setSelectedMembers((prev) => {
      if (prev.length > 0) {
        return prev
      }

      return mapMembersToUsers(
        initialCommission.members,
        users,
        initialBossId,
      )
    })
  }, [initialCommission, users])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const name = form.name.trim()

    if (!name) {
      setError('Komissiya nomini kiriting')
      return
    }

    if (!selectedMembers.length) {
      setError('Kamida bitta a’zo tanlang')
      return
    }

    if (!bossId) {
      setError('Boshliqni tanlang')
      return
    }

    try {
      await onSubmit({
        name,
        memberIds: selectedMembers.map((member) => member.id),
        bossId,
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
            label="Komissiya nomi"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
            fullWidth
            autoFocus
            disabled={loading}
            placeholder="Masalan: Xarid komissiyasi"
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />

          <Autocomplete
            multiple
            disableCloseOnSelect
            filterSelectedOptions
            options={users}
            value={selectedMembers}
            loading={usersQuery.isLoading}
            getOptionLabel={formatMemberLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, value) => {
              setSelectedMembers(value)
              if (bossId && value.some((member) => member.id === bossId)) {
                setBossId('')
              }
            }}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Komissiya a’zolari"
                placeholder={
                  selectedMembers.length === 0
                    ? 'Xodimlarni tanlang'
                    : 'Yana qo‘shish...'
                }
              />
            )}
          />

          <FormControl fullWidth required disabled={loading || usersQuery.isLoading}>
            <InputLabel id="commission-boss-select-label">Boshliq</InputLabel>
            <Select
              labelId="commission-boss-select-label"
              label="Boshliq"
              value={bossId}
              onChange={(event) => setBossId(event.target.value)}
            >
              {bossOptions.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {formatMemberLabel(user)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

export const CommissionFormDialog = ({
  open,
  mode,
  initialCommission,
  loading,
  onClose,
  onSubmit,
}) => {
  const formKey = `${mode}-${initialCommission?.id ?? 'new'}`
  const title =
    mode === 'create' ? 'Yangi komissiya tuzish' : 'Komissiyani tahrirlash'

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>

      {open ? (
        <CommissionFormFields
          key={formKey}
          mode={mode}
          initialCommission={initialCommission}
          loading={loading}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}
