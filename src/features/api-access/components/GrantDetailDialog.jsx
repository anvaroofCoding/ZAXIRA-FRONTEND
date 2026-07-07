import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { downloadApiGrantPdf } from '@/features/api-access/utils/downloadApiGrantPdf'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { useState } from 'react'

const statusChip = (status) => {
  if (status === 'active') {
    return <Chip size="small" color="success" label="Faol" />
  }
  return <Chip size="small" color="default" label="Bekor qilingan" />
}

export const GrantDetailDialog = ({ open, grant, onClose }) => {
  const [pdfError, setPdfError] = useState('')
  const [downloading, setDownloading] = useState(false)

  if (!grant) return null

  const handleDownloadPdf = async () => {
    setPdfError('')
    setDownloading(true)
    try {
      await downloadApiGrantPdf({
        grantId: grant.id,
        fileName: `api-berish-${grant.institutionName || grant.id}.pdf`,
      })
    } catch (error) {
      setPdfError(getApiErrorMessage(error, 'PDF yuklab bo‘lmadi'))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>API berish tafsilotlari</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Tashkilot
            </Typography>
            <Typography fontWeight={700}>{grant.institutionName}</Typography>
          </Box>

          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                STIR
              </Typography>
              <Typography>{grant.stir}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Holat
              </Typography>
              {statusChip(grant.status)}
            </Box>
          </Stack>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Mas’ul shaxs
            </Typography>
            <Typography>{grant.contactPerson}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Telefon
            </Typography>
            <Typography>{grant.phone}</Typography>
          </Box>

          {grant.email ? (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography>{grant.email}</Typography>
            </Box>
          ) : null}

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Berilgan API’lar
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {(grant.scopeLabels || []).map((label) => (
                <Chip key={label} size="small" label={label} />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              API kalit prefiksi
            </Typography>
            <Typography fontFamily="monospace">{grant.keyPrefix}***</Typography>
          </Box>

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
