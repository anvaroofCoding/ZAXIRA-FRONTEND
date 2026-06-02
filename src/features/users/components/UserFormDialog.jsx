import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { PermissionTreeTable } from '@/features/permissions/components/PermissionTreeTable'
import { TableSkeleton } from '@/shared/components/skeleton'
import {
  createEmptyPermissions,
  normalizePermissions,
  pickGrantedPermissions,
  setPageAccess,
} from '@/features/permissions/utils/permissions'

const DASHBOARD_PATH = '/dashboard'

const buildFormState = (mode, initialUser) => ({
  login: mode === 'edit' ? (initialUser?.login ?? '') : '',
  password: '',
  displayName: initialUser?.displayName ?? '',
  structureId: initialUser?.structureId ?? '',
})

const buildPermissionsState = (catalog, mode, initialUser) => {
  if (!catalog) return {}

  if (mode === 'edit' && initialUser) {
    return normalizePermissions(catalog, initialUser.permissions)
  }

  return createEmptyPermissions(catalog)
}

const UserFormFields = ({
  mode,
  initialUser,
  catalog,
  catalogLoading,
  structures,
  structuresLoading,
  loading,
  onClose,
  onSubmit,
}) => {
  const showStructureField =
    mode === 'create' || (mode === 'edit' && initialUser?.role !== 'SUPER_ADMIN')
  const activeStructures = structures.filter((item) => item.isActive)
  const [form, setForm] = useState(() => buildFormState(mode, initialUser))
  const [permissions, setPermissions] = useState(() =>
    buildPermissionsState(catalog, mode, initialUser),
  )
  const [error, setError] = useState('')
  const dashboardChecked = Boolean(permissions?.[DASHBOARD_PATH]?.access)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!catalog) {
      setError('Ruxsatlar katalogi yuklanmadi')
      return
    }

    const login = form.login.trim()

    if (!login) {
      setError('Login kiriting')
      return
    }

    if (mode === 'create' && form.password.length < 6) {
      setError('Parol kamida 6 belgidan iborat bo‘lishi kerak')
      return
    }

    if (showStructureField && !form.structureId) {
      setError('Tarkibiy tuzilmani tanlang')
      return
    }

    const payload = {
      displayName: form.displayName.trim() || login,
      permissions: pickGrantedPermissions(
        normalizePermissions(catalog, permissions),
      ),
      ...(showStructureField ? { structureId: form.structureId } : {}),
    }

    try {
      if (mode === 'create') {
        await onSubmit({
          ...payload,
          login,
          password: form.password,
        })
      } else {
        await onSubmit({
          ...payload,
          ...(form.password ? { password: form.password } : {}),
        })
      }
    } catch (err) {
      setError(err?.message ?? 'Saqlashda xatolik')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Asosiy ma&apos;lumotlar
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                variant="filled"
                size="small"
                label="Login"
                value={form.login}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, login: event.target.value }))
                  if (error) setError('')
                }}
                required
                disabled={mode === 'edit' || loading}
                fullWidth
              />

              <TextField
                variant="filled"
                size="small"
                label={mode === 'create' ? 'Parol' : 'Yangi parol (ixtiyoriy)'}
                type="password"
                value={form.password}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                  if (error) setError('')
                }}
                required={mode === 'create'}
                disabled={loading}
                fullWidth
              />

              <TextField
                variant="filled"
                size="small"
                label="Ism"
                value={form.displayName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, displayName: event.target.value }))
                }
                disabled={loading}
                fullWidth
              />

              {showStructureField ? (
                <FormControl
                  variant="filled"
                  size="small"
                  fullWidth
                  required
                  disabled={loading || structuresLoading}
                >
                  <InputLabel id="user-structure-label">Tarkibiy tuzilma</InputLabel>
                  <Select
                    labelId="user-structure-label"
                    label="Tarkibiy tuzilma"
                    value={form.structureId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        structureId: event.target.value,
                      }))
                    }
                  >
                    {activeStructures.map((structure) => (
                      <MenuItem key={structure.id} value={structure.id}>
                        {structure.fullName} ({structure.shortName})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Sahifa va amallar ruxsatlari
            </Typography>
            {!catalogLoading && catalog ? (
              <Stack spacing={0.5} alignItems="flex-start">
                <FormControlLabel
                  sx={{ mb: 1 }}
                  control={
                    <Checkbox
                      checked={dashboardChecked}
                      disabled={loading}
                      onChange={(event) =>
                        setPermissions(
                          setPageAccess(permissions, DASHBOARD_PATH, event.target.checked),
                        )
                      }
                    />
                  }
                  label="Dashboard ruxsati"
                />
              </Stack>
            ) : null}

            {catalogLoading || !catalog ? (
              <TableSkeleton rows={5} columns={5} />
            ) : (
              <PermissionTreeTable
                catalog={catalog}
                permissions={permissions}
                onChange={setPermissions}
                disabled={loading}
              />
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Bekor
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || catalogLoading || !catalog}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Saqlash
        </Button>
      </DialogActions>
    </Box>
  )
}

export const UserFormDialog = ({
  open,
  mode = 'create',
  initialUser = null,
  catalog,
  catalogLoading = false,
  structures = [],
  structuresLoading = false,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const formKey = `${mode}-${initialUser?.id ?? 'new'}`

  const handleSubmit = async (payload) => {
    await onSubmit(payload)
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {mode === 'create' ? 'Foydalanuvchi qo‘shish' : 'Foydalanuvchini tahrirlash'}
      </DialogTitle>

      {open ? (
        <UserFormFields
          key={formKey}
          mode={mode}
          initialUser={initialUser}
          catalog={catalog}
          catalogLoading={catalogLoading}
          structures={structures}
          structuresLoading={structuresLoading}
          loading={loading}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      ) : null}
    </Dialog>
  )
}
