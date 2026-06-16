import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
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
import Typography from '@mui/material/Typography'
import {
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} from '@/features/auth/api/authApi'
import { setUser } from '@/features/auth/model/authSlice'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { isRealtimeConnected } from '@/shared/realtime/realtimeConnectionState'
import { formatLastOnline } from '@/shared/utils/formatLastOnline'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { getDeviceId, getDeviceName } from '@/shared/utils/deviceIdentity'

const buildProfileForm = (user) => ({
  displayName: user?.displayName ?? '',
  position: user?.position ?? '',
  structureId: user?.structureId ?? '',
})

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

export const ProfileModal = ({ open, onClose }) => {
  const dispatch = useAppDispatch()
  const { user } = usePermissions()
  const profileQuery = useGetCurrentUserQuery(undefined, {
    skip: !open,
    refetchOnMountOrArgChange: true,
    pollingInterval: open ? 10000 : 0,
  })
  const structuresQuery = useGetStructuresQuery(undefined, { skip: !open })
  const [updateProfile, updateState] = useUpdateProfileMutation()
  const [changePassword, passwordState] = useChangePasswordMutation()

  const [profileForm, setProfileForm] = useState(() => buildProfileForm(user))
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [onlineNow, setOnlineNow] = useState(isRealtimeConnected)

  const profileUser = profileQuery.data ?? user

  const activeDevices = useMemo(() => {
    const remoteDevices = profileUser?.activeDevices ?? []
    const currentDeviceId = getDeviceId()
    const hasCurrentDevice = remoteDevices.some(
      (device) => device.deviceId === currentDeviceId,
    )

    if (hasCurrentDevice) {
      return remoteDevices
    }

    const isOnline = onlineNow || profileUser?.isOnline
    if (!isOnline) {
      return remoteDevices
    }

    return [
      {
        deviceId: currentDeviceId,
        deviceName: getDeviceName(),
        isCurrent: true,
        isOnline: true,
        lastActiveAt: new Date().toISOString(),
      },
      ...remoteDevices,
    ]
  }, [profileUser?.activeDevices, profileUser?.isOnline, onlineNow])

  const onlineDeviceCount = activeDevices.filter((device) => device.isOnline).length

  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'SUPER_ADMIN'
  const showStructureField = !isSuperAdmin

  const activeStructures = useMemo(
    () => (structuresQuery.data ?? []).filter((item) => item.isActive),
    [structuresQuery.data],
  )

  useEffect(() => {
    if (open && profileUser) {
      setProfileForm(buildProfileForm(profileUser))
      setPasswordForm(emptyPasswordForm)
      setShowPasswordSection(false)
      setError('')
      setSuccess('')
    }
  }, [open, profileUser])

  useEffect(() => {
    if (!open) return undefined

    setOnlineNow(isRealtimeConnected())
    const timer = window.setInterval(() => {
      setOnlineNow(isRealtimeConnected())
    }, 5000)

    return () => window.clearInterval(timer)
  }, [open])

  const presenceLabel = useMemo(() => {
    if (onlineNow || profileUser?.isOnline) {
      return 'Hozir onlayn'
    }

    const formatted = formatLastOnline(profileUser?.lastOnline)
    return formatted ? `Oxirgi faollik: ${formatted}` : 'Oxirgi faollik: ma’lumot yo‘q'
  }, [onlineNow, profileUser?.isOnline, profileUser?.lastOnline])

  useEffect(() => {
    if (profileQuery.isSuccess && profileQuery.data) {
      dispatch(setUser(profileQuery.data))
    }
  }, [dispatch, profileQuery.data, profileQuery.isSuccess])

  const handleClose = () => {
    if (updateState.isLoading || passwordState.isLoading) return
    onClose()
  }

  const handleSaveProfile = async () => {
    setError('')
    setSuccess('')

    if (showStructureField && !profileForm.structureId) {
      setError('Tarkibiy tuzilmani tanlang')
      return
    }

    try {
      const body = {
        displayName: profileForm.displayName.trim() || profileUser.login,
        position: profileForm.position.trim(),
        ...(showStructureField ? { structureId: profileForm.structureId } : {}),
      }

      const updated = await updateProfile(body).unwrap()
      dispatch(setUser(updated))
      setSuccess('Ma’lumotlar saqlandi')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Saqlashda xatolik'))
    }
  }

  const handleChangePassword = async () => {
    setError('')
    setSuccess('')

    if (passwordForm.newPassword.length < 6) {
      setError('Yangi parol kamida 6 belgidan iborat bo‘lishi kerak')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setError('Yangi parollar mos emas')
      return
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      }).unwrap()

      setPasswordForm(emptyPasswordForm)
      setShowPasswordSection(false)
      setSuccess('Parol yangilandi')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Parolni yangilab bo‘lmadi'))
    }
  }

  const isSaving = updateState.isLoading
  const isPasswordSaving = passwordState.isLoading

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ fontWeight: 600 }}>Mening profilim</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Asosiy ma&apos;lumotlar
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                label="Login"
                value={profileUser?.login ?? ''}
                size="small"
                fullWidth
                disabled
              />

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  {presenceLabel}
                </Typography>
                {onlineNow || profileUser?.isOnline ? (
                  <Chip label="Onlayn" size="small" color="success" variant="outlined" />
                ) : null}
              </Stack>

              <TextField
                label="Ism"
                value={profileForm.displayName}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    displayName: event.target.value,
                  }))
                }
                size="small"
                fullWidth
                disabled={isSaving}
              />

              <TextField
                label="Lavozim"
                value={profileForm.position}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    position: event.target.value,
                  }))
                }
                size="small"
                fullWidth
                disabled={isSaving}
                placeholder="Masalan: Buxgalter"
              />

              {showStructureField ? (
                <FormControl size="small" fullWidth disabled={isSaving || structuresQuery.isLoading}>
                  <InputLabel id="profile-structure-label">Tarkibiy tuzilma</InputLabel>
                  <Select
                    labelId="profile-structure-label"
                    label="Tarkibiy tuzilma"
                    value={profileForm.structureId}
                    onChange={(event) =>
                      setProfileForm((prev) => ({
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

              {showStructureField ? (
                <Typography variant="caption" color="text.secondary">
                  Tuzilmani o‘zgartirsangiz, avval qilingan amallar eski tuzilma nomi bilan
                  saqlanadi. Yangi amallar yangi tuzilma bo‘yicha ketadi.
                </Typography>
              ) : null}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Faol qurilmalar
              {onlineDeviceCount > 0 ? ` (${onlineDeviceCount})` : ''}
            </Typography>

            {profileQuery.isLoading ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Qurilmalar yuklanmoqda...
                </Typography>
              </Stack>
            ) : activeDevices.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Hozircha faol qurilma yo‘q
              </Typography>
            ) : (
              <Stack spacing={1}>
                {activeDevices.map((device) => (
                  <Box
                    key={device.deviceId}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      px: 1.5,
                      py: 1.25,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {device.deviceName}
                      </Typography>
                      <Stack direction="row" spacing={0.75}>
                        {device.isCurrent ? (
                          <Chip
                            label="Joriy qurilma"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : null}
                        {device.isOnline ? (
                          <Chip
                            label="Onlayn"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : null}
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Oxirgi faollik:{' '}
                      {formatLastOnline(device.lastActiveAt) || 'ma’lumot yo‘q'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowPasswordSection((prev) => !prev)}
            >
              Parolni o‘zgartirish
            </Button>

            <Collapse in={showPasswordSection} sx={{ mt: 1.5 }}>
              <Box
                component="form"
                onSubmit={(event) => {
                  event.preventDefault()
                  handleChangePassword()
                }}
              >
                <Stack spacing={1.5}>
                  <TextField
                    label="Joriy parol"
                    type="password"
                    size="small"
                    fullWidth
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
                    disabled={isPasswordSaving}
                  />
                  <TextField
                    label="Yangi parol"
                    type="password"
                    size="small"
                    fullWidth
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                    disabled={isPasswordSaving}
                  />
                  <TextField
                    label="Yangi parolni takrorlang"
                    type="password"
                    size="small"
                    fullWidth
                    autoComplete="new-password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmNewPassword: event.target.value,
                      }))
                    }
                    disabled={isPasswordSaving}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={isPasswordSaving}
                    startIcon={
                      isPasswordSaving ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : null
                    }
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Parolni saqlash
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isSaving || isPasswordSaving}>
          Yopish
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveProfile}
          disabled={isSaving || isPasswordSaving}
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  )
}
