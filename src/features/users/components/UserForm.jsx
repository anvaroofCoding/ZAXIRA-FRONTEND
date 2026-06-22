import { useEffect, useMemo, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { PermissionTreeTable } from '@/features/permissions/components/PermissionTreeTable'
import { WAREHOUSE_PERMISSION_BLOCKED_MESSAGE } from '@/features/permissions/constants'
import { TableSkeleton } from '@/shared/components/skeleton'
import {
  createEmptyPermissions,
  hasGrantedWarehousePermission,
  normalizePermissions,
  pickGrantedPermissions,
  setPageAccess,
  stripWarehousePermissions,
} from '@/features/permissions/utils/permissions'

const DASHBOARD_PATH = '/dashboard'

const buildFormState = (mode, initialUser) => ({
  login: mode === 'edit' ? (initialUser?.login ?? '') : '',
  password: '',
  displayName: initialUser?.displayName ?? '',
  position: initialUser?.position ?? '',
  structureId: initialUser?.structureId ?? '',
})

const buildPermissionsState = (catalog, mode, initialUser) => {
  if (!catalog) return {}

  if (mode === 'edit' && initialUser) {
    return normalizePermissions(catalog, initialUser.permissions)
  }

  return createEmptyPermissions(catalog)
}

export const UserForm = ({
  mode = 'create',
  initialUser = null,
  catalog,
  catalogLoading = false,
  structures = [],
  structuresLoading = false,
  loading = false,
  onCancel,
  onSubmit,
}) => {
  const showStructureField =
    mode === 'create' || (mode === 'edit' && initialUser?.role !== 'SUPER_ADMIN')
  const activeStructures = structures.filter((item) => item.isActive)
  const formKey = `${mode}-${initialUser?.id ?? 'new'}`

  const title =
    mode === 'create' ? 'Foydalanuvchi qo‘shish' : 'Foydalanuvchini tahrirlash'
  const subtitle =
    mode === 'create'
      ? 'Yangi profil ochish va sahifa ruxsatlarini belgilash'
      : 'Profil ma’lumotlari va sahifa ruxsatlarini yangilash'

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack spacing={0.25}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={onCancel}
              disabled={loading}
              sx={{ alignSelf: 'flex-start', ml: -1 }}
            >
              Orqaga
            </Button>
            <Typography variant="h5" component="h1" fontWeight={600}>
              {title}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ pl: { xs: 0, sm: 1 } }}>
            {subtitle}
          </Typography>
        </Stack>
      </Paper>

      <UserFormFields
        key={formKey}
        mode={mode}
        initialUser={initialUser}
        catalog={catalog}
        catalogLoading={catalogLoading}
        structures={structures}
        structuresLoading={structuresLoading}
        loading={loading}
        showStructureField={showStructureField}
        activeStructures={activeStructures}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Box>
  )
}

const UserFormFields = ({
  mode,
  initialUser,
  catalog,
  catalogLoading,
  structuresLoading,
  loading,
  showStructureField,
  activeStructures,
  onCancel,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => buildFormState(mode, initialUser))
  const [permissions, setPermissions] = useState(() =>
    buildPermissionsState(catalog, mode, initialUser),
  )
  const [error, setError] = useState('')
  const dashboardChecked = Boolean(permissions?.[DASHBOARD_PATH]?.access)

  const selectedStructure = useMemo(
    () => activeStructures.find((item) => item.id === form.structureId) ?? null,
    [activeStructures, form.structureId],
  )

  const warehousePermissionMode = useMemo(() => {
    if (!showStructureField) return 'allowed'
    if (!selectedStructure) return 'pending'
    return selectedStructure.hasWarehouse === true ? 'allowed' : 'blocked'
  }, [showStructureField, selectedStructure])

  useEffect(() => {
    if (warehousePermissionMode === 'allowed') return
    setPermissions((prev) => stripWarehousePermissions(prev))
  }, [warehousePermissionMode])

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

    if (warehousePermissionMode === 'blocked' && hasGrantedWarehousePermission(permissions)) {
      setError(WAREHOUSE_PERMISSION_BLOCKED_MESSAGE)
      return
    }

    const payload = {
      displayName: form.displayName.trim() || login,
      position: form.position.trim(),
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
    <Paper
      component="form"
      variant="outlined"
      onSubmit={handleSubmit}
      sx={{ width: '100%', p: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Asosiy ma&apos;lumotlar
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
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
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
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

            <TextField
              variant="filled"
              size="small"
              label="Lavozim"
              value={form.position}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, position: event.target.value }))
              }
              disabled={loading}
              fullWidth
              placeholder="Masalan: Buxgalter"
            />

            {showStructureField ? (
              <FormControl
                variant="filled"
                size="small"
                fullWidth
                required
                disabled={loading || structuresLoading}
                sx={{ gridColumn: { md: '1 / -1' } }}
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
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
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
            <TableSkeleton rows={8} columns={5} />
          ) : (
            <PermissionTreeTable
              catalog={catalog}
              permissions={permissions}
              onChange={setPermissions}
              disabled={loading}
              warehousePermissionMode={warehousePermissionMode}
            />
          )}
        </Box>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={loading}>
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
        </Stack>
      </Stack>
    </Paper>
  )
}
