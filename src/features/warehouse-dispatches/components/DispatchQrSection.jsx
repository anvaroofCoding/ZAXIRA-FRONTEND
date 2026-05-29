import { useEffect, useMemo, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import QRCode from 'qrcode'

export const DispatchQrSection = ({ dispatch }) => {
  const [qrDataUrl, setQrDataUrl] = useState('')

  const payload = useMemo(() => {
    if (!dispatch) return ''

    return JSON.stringify(
      {
        dispatchCode: dispatch.dispatchCode,
        requestCode: dispatch.requestCode,
        status: dispatch.status,
        targetStructure: dispatch.targetStructure?.shortName,
        items: (dispatch.items ?? []).map((item) => ({
          name: item.name,
          qty: item.quantityDispatched,
        })),
      },
      null,
      2,
    )
  }, [dispatch])

  useEffect(() => {
    let isMounted = true

    if (!payload) return undefined

    QRCode.toDataURL(payload, { width: 220, margin: 1 })
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
  }, [payload])

  const handleCopyPayload = async () => {
    if (!payload || !navigator?.clipboard?.writeText) {
      return
    }

    try {
      await navigator.clipboard.writeText(payload)
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
        <Typography variant="subtitle2" fontWeight={700}>
          QR kod (telefon bilan skaner qilish uchun)
        </Typography>
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

        <Button
          type="button"
          variant="text"
          size="small"
          startIcon={<ContentCopyIcon fontSize="small" />}
          onClick={handleCopyPayload}
          sx={{ alignSelf: 'flex-start' }}
        >
          QR ichidagi matnni nusxalash
        </Button>
      </Stack>
    </Paper>
  )
}
