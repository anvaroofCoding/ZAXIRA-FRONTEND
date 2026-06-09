import { useEffect, useMemo, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import QRCode from 'qrcode'
import { buildNakladnoyPublicUrl } from '@/features/warehouse-dispatches/utils/nakladnoyPublicUrl'

export const DispatchQrSection = ({ dispatch }) => {
  const [qrDataUrl, setQrDataUrl] = useState('')

  const nakladnoyUrl = useMemo(() => {
    if (!dispatch?.id) return ''
    return buildNakladnoyPublicUrl(dispatch.id)
  }, [dispatch])

  useEffect(() => {
    let isMounted = true

    if (!nakladnoyUrl) return undefined

    QRCode.toDataURL(nakladnoyUrl, { width: 220, margin: 1 })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url)
        }
      })
      .catch(() => {
        if (isMounted) {
          setQrDataUrl('')
        }
      })

    return () => {
      isMounted = false
    }
  }, [nakladnoyUrl])

  const handleCopyLink = async () => {
    if (!nakladnoyUrl || !navigator?.clipboard?.writeText) {
      return
    }

    try {
      await navigator.clipboard.writeText(nakladnoyUrl)
    } catch {
      // ignore copy errors in unsupported environments
    }
  }

  if (!dispatch) {
    return null
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        {qrDataUrl ? (
          <Box
            component="img"
            src={qrDataUrl}
            alt={`QR ${dispatch.dispatchCode}`}
            sx={{
              width: 180,
              height: 180,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'common.white',
              p: 1,
            }}
          />
        ) : (
          <Alert severity="warning">QR kodni yaratib bo‘lmadi</Alert>
        )}

        {nakladnoyUrl ? (
          <Link
            href={nakladnoyUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ wordBreak: 'break-all' }}
          >
            {nakladnoyUrl}
          </Link>
        ) : null}

        <Button
          type="button"
          variant="text"
          size="small"
          startIcon={<ContentCopyIcon fontSize="small" />}
          onClick={handleCopyLink}
          sx={{ alignSelf: 'flex-start' }}
        >
          Nakladnoy havolasini nusxalash
        </Button>
      </Stack>
    </Paper>
  )
}
