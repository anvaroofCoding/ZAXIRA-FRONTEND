import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { env } from '@/shared/config/env'

export const PurchaseRequestPdfPublicPage = ({ variant = 'bildirgi' }) => {
  const { id } = useParams()
  const [error, setError] = useState('')

  const pdfApiUrl = useMemo(() => {
    if (!id) return ''
    const apiBase = env.apiBaseUrl.replace(/\/$/, '')
    const suffix = variant === 'kelishuv' ? 'commission-pdf' : 'pdf'
    return `${apiBase}/public/purchase-requests/${id}/${suffix}`
  }, [id, variant])

  useEffect(() => {
    if (!pdfApiUrl) {
      setError('Hujjat havolasi noto‘g‘ri')
      return undefined
    }

    window.location.replace(pdfApiUrl)
    return undefined
  }, [pdfApiUrl])

  const title =
    variant === 'kelishuv' ? 'Kelishuv varaqasi ochilmoqda' : 'Bildirgi ochilmoqda'

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
      <Paper sx={{ width: '100%', maxWidth: 420, p: 3 }}>
        <Stack spacing={2} alignItems="center">
          {error ? (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          ) : (
            <>
              <CircularProgress size={32} />
              <Typography variant="h6" fontWeight={700} textAlign="center">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                PDF fayl avtomatik ochiladi. Agar ochilmasa, havolani brauzerda qayta
                oching.
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}
