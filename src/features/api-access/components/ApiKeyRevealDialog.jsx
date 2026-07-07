import { useMemo, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { downloadApiGrantPdf } from '@/features/api-access/utils/downloadApiGrantPdf'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const ApiKeyRevealDialog = ({ open, grant, plainKey, onClose }) => {
  const [copied, setCopied] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [downloading, setDownloading] = useState(false)

  const handleCopy = async () => {
    if (!plainKey) return
    await navigator.clipboard.writeText(plainKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = async () => {
    if (!grant?.id) return
    setPdfError('')
    setDownloading(true)
    try {
      await downloadApiGrantPdf({
        grantId: grant.id,
        fileName: `api-berish-${grant.institutionName || grant.id}.pdf`,
        plainKey,
      })
    } catch (error) {
      setPdfError(getApiErrorMessage(error, 'PDF yuklab bo‘lmadi'))
    } finally {
      setDownloading(false)
    }
  }

  const scopeLabels = useMemo(
    () => grant?.scopeLabels?.join(', ') || '—',
    [grant?.scopeLabels],
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>API kalit yaratildi</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            Kalit faqat bir marta ko‘rsatiladi. Uni xavfsiz joyga saqlang yoki PDF yuklab oling.
          </Alert>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tashkilot
            </Typography>
            <Typography fontWeight={600}>{grant?.institutionName || '—'}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Berilgan API’lar
            </Typography>
            <Typography variant="body2">{scopeLabels}</Typography>
          </Box>

          <TextField
            label="API kalit"
            value={plainKey || ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopy} edge="end" aria-label="Nusxalash">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
                ),
              },
            }}
          />

          {copied ? (
            <Typography variant="caption" color="success.main">
              Kalit nusxalandi
            </Typography>
          ) : null}

          {pdfError ? <Alert severity="error">{pdfError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleDownloadPdf}
          disabled={downloading}
        >
          PDF yuklab olish
        </Button>
        <Button variant="contained" onClick={onClose}>
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  )
}
