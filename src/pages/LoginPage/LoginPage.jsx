import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { useLoginMutation } from '@/features/auth/api/authApi'
import { setCredentials } from '@/features/auth/model/authSlice'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'

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

export const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const [form, setForm] = useState({ login: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [lockUntil, setLockUntil] = useState(() => {
    const localValue = window.localStorage.getItem(LOGIN_LOCK_STORAGE_KEY)
    return parseLockUntil(localValue)
  })
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    lockUntil ? Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000)) : 0,
  )

  useEffect(() => {
    if (!lockUntil) {
      window.localStorage.removeItem(LOGIN_LOCK_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(
      LOGIN_LOCK_STORAGE_KEY,
      new Date(lockUntil).toISOString(),
    )
  }, [lockUntil])

  useEffect(() => {
    if (!lockUntil) return undefined

    setRemainingSeconds(Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000)))
    const timerId = window.setInterval(() => {
      const nextSeconds = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
      setRemainingSeconds(nextSeconds)

      if (nextSeconds <= 0) {
        setLockUntil(null)
        setError('')
      }
    }, ONE_SECOND_MS)

    return () => window.clearInterval(timerId)
  }, [lockUntil])

  useEffect(() => {
    if (!lockUntil) {
      setRemainingSeconds(0)
    }
  }, [lockUntil])

  const lockCountdownLabel = useMemo(() => {
    if (!remainingSeconds) return ''
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [remainingSeconds])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (lockUntil && Date.now() < lockUntil) {
      setError(
        `Profil bloklangan. Qolgan vaqt: ${lockCountdownLabel || '00:00'}`,
      )
      return
    }

    try {
      const data = await login(form).unwrap()
      setLockUntil(null)
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
        setLockUntil(parsedLockUntil)
        const seconds =
          Number(err?.data?.remainingSeconds) ||
          Number(
            typeof err?.data?.message === 'object'
              ? err.data.message?.remainingSeconds
              : 0,
          )
        const minutes = Math.max(1, Math.ceil(seconds / 60))
        setError(`Profil bloklangan. Taxminan ${minutes} daqiqa qoldi.`)
        return
      }
      setError(getErrorMessage(err))
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <ThemeToggle sx={{ position: 'fixed', top: 16, right: 16 }} />

      <AppContainer
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: 280,
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
          autoFocus
          required
          fullWidth
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
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    tabIndex={-1}
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
          disabled={isLoading || remainingSeconds > 0}
          fullWidth
          sx={{ mt: 0.5, py: 0.75 }}
        >
          {remainingSeconds > 0
            ? `Bloklangan: ${lockCountdownLabel}`
            : 'Kirish'}
        </Button>
        </Box>
      </AppContainer>
    </Box>
  )
}
