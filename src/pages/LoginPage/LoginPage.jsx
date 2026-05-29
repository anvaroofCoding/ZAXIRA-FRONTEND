import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { useLoginMutation } from '@/features/auth/api/authApi'
import { setCredentials } from '@/features/auth/model/authSlice'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'

const getErrorMessage = (error) => {
  const message = error?.data?.message
  if (Array.isArray(message) && message[0]) return message[0]
  if (typeof message === 'string') return message
  return 'Login yoki parol noto‘g‘ri'
}

export const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const data = await login(form).unwrap()
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          user: data.user,
        }),
      )
      navigate('/dashboard', { replace: true })
    } catch (err) {
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
          type="password"
          label="Parol"
          value={form.password}
          onChange={handleChange('password')}
          autoComplete="current-password"
          required
          fullWidth
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
          disabled={isLoading}
          fullWidth
          sx={{ mt: 0.5, py: 0.75 }}
        >
          Kirish
        </Button>
        </Box>
      </AppContainer>
    </Box>
  )
}
