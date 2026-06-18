import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { env } from '@/shared/config/env'
import { openPdfFromApiUrl } from '@/shared/utils/openPdfFromApiUrl'

export const NakladnoyPdfPublicPage = () => {
  const { id } = useParams()
  const [error, setError] = useState('')

  const pdfApiUrl = useMemo(() => {
    if (!id) return ''
    const apiBase = env.apiBaseUrl.replace(/\/$/, '')
    return `${apiBase}/public/nakladnoy/${id}/pdf`
  }, [id])

  useEffect(() => {
    if (!pdfApiUrl) {
      setError('Nakladnoy havolasi noto‘g‘ri')
      return undefined
    }

    let cancelled = false

    openPdfFromApiUrl(pdfApiUrl).catch((err) => {
      if (!cancelled) {
        setError(err?.message || 'PDF faylni ochib bo‘lmadi')
      }
    })

    return () => {
      cancelled = true
    }
  }, [pdfApiUrl])

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
                Nakladnoy ochilmoqda
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}
