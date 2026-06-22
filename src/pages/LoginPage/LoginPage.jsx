import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { useLoginMutation } from '@/features/auth/api/authApi'
import { setCredentials } from '@/features/auth/model/authSlice'
import { clearLegacyActiveSessionsStorage } from '@/features/purchase-requests/utils/activeSessionsStorage'
import { baseApi } from '@/shared/api/baseApi'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { getDeviceId, getDeviceName } from '@/shared/utils/deviceIdentity'
import {
  clearAttemptLock,
  getAttemptLockUntil,
  recordFailedLoginAttempt,
} from './loginAttemptGuard'
import {
  clearRefreshLock,
  getRefreshLockUntil,
  recordLoginPageRefresh,
} from './loginRefreshGuard'

const getErrorMessage = (error) => {
  const message = error?.data?.message
  if (message && typeof message === 'object' && message.message) {
    return message.message
  }
  if (Array.isArray(message) && message[0]) return message[0]
  if (typeof message === 'string') return message
  return 'Login yoki parol noto‘g‘ri'
}

const LOGIN_LOCK_STORAGE_KEY = 'zaxira_login_lock_until'
const ONE_SECOND_MS = 1000

const parseLockUntil = (value) => {
  if (!value) return null
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return null
  if (timestamp <= Date.now()) return null
  return timestamp
}

const readInitialLoginLockUntil = () => {
  const localValue = window.localStorage.getItem(LOGIN_LOCK_STORAGE_KEY)
  return parseLockUntil(localValue)
}

const readInitialRefreshLockUntil = () => getRefreshLockUntil()

const readInitialAttemptLockUntil = () => getAttemptLockUntil()

const mergeLockUntil = (...values) => {
  const active = values.filter(Boolean)
  if (!active.length) return null
  return Math.max(...active)
}

const formatCountdown = (totalSeconds) => {
  if (!totalSeconds) return ''
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const [form, setForm] = useState({ login: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loginLockUntil, setLoginLockUntil] = useState(readInitialLoginLockUntil)
  const [refreshLockUntil, setRefreshLockUntil] = useState(readInitialRefreshLockUntil)
  const [attemptLockUntil, setAttemptLockUntil] = useState(readInitialAttemptLockUntil)
  const lockUntil = useMemo(
    () => mergeLockUntil(loginLockUntil, refreshLockUntil, attemptLockUntil),
    [loginLockUntil, refreshLockUntil, attemptLockUntil],
  )
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    lockUntil ? Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000)) : 0,
  )

  const isLocked = remainingSeconds > 0

  useEffect(() => {
    const html = document.documentElement
    const { body } = document
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow
    const previousHtmlHeight = html.style.height
    const previousBodyHeight = body.style.height

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.style.height = '100%'
    body.style.height = '100%'

    return () => {
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
      html.style.height = previousHtmlHeight
      body.style.height = previousBodyHeight
    }
  }, [])

  useEffect(() => {
    const refreshResult = recordLoginPageRefresh()
    if (refreshResult.lockUntil) {
      setRefreshLockUntil(refreshResult.lockUntil)
      if (refreshResult.triggered) {
        setError('Sahifa juda ko‘p yangilandi. Ekran vaqtincha bloklandi.')
      }
    }
  }, [])

  useEffect(() => {
    const preventContextMenu = (event) => {
      event.preventDefault()
    }

    document.addEventListener('contextmenu', preventContextMenu)

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu)
    }
  }, [])

  useEffect(() => {
    if (!loginLockUntil) {
      window.localStorage.removeItem(LOGIN_LOCK_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(
      LOGIN_LOCK_STORAGE_KEY,
      new Date(loginLockUntil).toISOString(),
    )
  }, [loginLockUntil])

  useEffect(() => {
    if (!refreshLockUntil) {
      clearRefreshLock()
      return
    }
    window.localStorage.setItem(
      'zaxira_login_refresh_lock_until',
      new Date(refreshLockUntil).toISOString(),
    )
  }, [refreshLockUntil])

  useEffect(() => {
    if (!lockUntil) return undefined

    setRemainingSeconds(Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000)))

    const timerId = window.setInterval(() => {
      const nextSeconds = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
      setRemainingSeconds(nextSeconds)

      if (nextSeconds <= 0) {
        if (loginLockUntil && Date.now() >= loginLockUntil) {
          setLoginLockUntil(null)
        }
        if (refreshLockUntil && Date.now() >= refreshLockUntil) {
          setRefreshLockUntil(null)
        }
        if (attemptLockUntil && Date.now() >= attemptLockUntil) {
          setAttemptLockUntil(null)
        }
        setError('')
      }
    }, ONE_SECOND_MS)

    return () => window.clearInterval(timerId)
  }, [lockUntil, loginLockUntil, refreshLockUntil, attemptLockUntil])

  useEffect(() => {
    if (!lockUntil) {
      setRemainingSeconds(0)
    }
  }, [lockUntil])

  const lockCountdownLabel = useMemo(
    () => formatCountdown(remainingSeconds),
    [remainingSeconds],
  )

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (lockUntil && Date.now() < lockUntil) {
      setError('Kirish vaqtincha bloklangan. Qolgan vaqtni kuting.')
      return
    }

    try {
      const data = await login({
        ...form,
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
      }).unwrap()
      setLoginLockUntil(null)
      setRefreshLockUntil(null)
      setAttemptLockUntil(null)
      clearRefreshLock()
      clearAttemptLock()
      clearLegacyActiveSessionsStorage()
      dispatch(baseApi.util.resetApiState())
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          user: data.user,
        }),
      )
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const lockValue =
        err?.data?.lockUntil ||
        (typeof err?.data?.message === 'object' ? err.data.message?.lockUntil : null)
      const parsedLockUntil = parseLockUntil(lockValue)
      if (parsedLockUntil) {
        setLoginLockUntil(parsedLockUntil)
        setError(getErrorMessage(err))
        return
      }

      const attemptResult = recordFailedLoginAttempt()
      if (attemptResult.lockUntil) {
        setAttemptLockUntil(attemptResult.lockUntil)
        if (attemptResult.triggered) {
          setError('Juda ko‘p xato urinish. API 30 soniyaga bloklandi.')
          return
        }
      }

      setError(getErrorMessage(err))
    }
  }

  return (
    <Box
      sx={{
        height: '100dvh',
        width: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1500,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {isLocked ? (
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              color: 'text.primary',
              fontVariantNumeric: 'tabular-nums',
              minWidth: 48,
              textAlign: 'right',
            }}
          >
            {lockCountdownLabel}
          </Typography>
        ) : null}
        <ThemeToggle sx={{ color: 'text.primary' }} />
      </Box>

      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          height: '100%',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/login.png"
          alt="ZAXIRA"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </Box>

      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
          overflow: 'hidden',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
        <TextField
          variant="filled"
          size="small"
          name="login"
          label="Login"
          value={form.login}
          onChange={handleChange('login')}
          autoComplete="username"
          autoFocus={!isLocked}
          required
          fullWidth
          disabled={isLocked}
        />

        <TextField
          variant="filled"
          size="small"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Parol"
          value={form.password}
          onChange={handleChange('password')}
          autoComplete="current-password"
          required
          fullWidth
          disabled={isLocked}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    tabIndex={-1}
                    disabled={isLocked}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {error ? (
          <Box component="span" sx={{ color: 'error.main', fontSize: 13 }}>
            {error}
          </Box>
        ) : null}

        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={isLoading || isLocked}
          fullWidth
          sx={{ mt: 0.5, py: 0.75 }}
        >
          Kirish
        </Button>
        </Box>
      </Box>
    </Box>
  )
}
