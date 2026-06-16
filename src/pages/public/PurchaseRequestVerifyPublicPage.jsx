import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { env } from '@/shared/config/env'

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const PurchaseRequestVerifyPublicPage = () => {
  const { token } = useParams()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', message: 'Tekshiruv havolasi noto‘g‘ri' })
      return undefined
    }

    let isMounted = true
    const apiBase = env.apiBaseUrl.replace(/\/$/, '')

    fetch(`${apiBase}/public/purchase-requests/verify/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          const message =
            payload?.message?.message ??
            payload?.message ??
            'Tekshiruv ma’lumotlari topilmadi'
          throw new Error(
            typeof message === 'string' ? message : 'Tekshiruv ma’lumotlari topilmadi',
          )
        }

        const data = payload?.data ?? payload
        if (isMounted) {
          setState({ status: 'success', data })
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({
            status: 'error',
            message: error?.message ?? 'Tekshiruvni bajarib bo‘lmadi',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [token])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 480, p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Ariza beruvchini tekshirish
          </Typography>

          {state.status === 'loading' ? (
            <Stack alignItems="center" spacing={1.5} py={3}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                Ma’lumotlar yuklanmoqda...
              </Typography>
            </Stack>
          ) : null}

          {state.status === 'error' ? (
            <Alert severity="error">{state.message}</Alert>
          ) : null}

          {state.status === 'success' ? (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlinedIcon color="success" />
                <Typography fontWeight={600} color="success.main">
                  Imzo tasdiqlandi
                </Typography>
              </Stack>

              {state.data?.applicantName ? (
                <Typography>
                  <strong>Ariza beruvchi:</strong> {state.data.applicantName}
                </Typography>
              ) : null}

              {state.data?.requestCode ? (
                <Typography>
                  <strong>Ariza raqami:</strong> {state.data.requestCode}
                </Typography>
              ) : null}

              {state.data?.title ? (
                <Typography>
                  <strong>Qoralama:</strong> {state.data.title}
                </Typography>
              ) : null}

              {state.data?.submittedAt ? (
                <Typography>
                  <strong>Yuborilgan vaqt:</strong>{' '}
                  {formatDateTime(state.data.submittedAt)}
                </Typography>
              ) : null}

              {state.data?.updatedAt ? (
                <Typography>
                  <strong>Yangilangan vaqt:</strong>{' '}
                  {formatDateTime(state.data.updatedAt)}
                </Typography>
              ) : null}
            </>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  )
}
