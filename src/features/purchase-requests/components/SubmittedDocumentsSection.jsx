import DescriptionIcon from '@mui/icons-material/Description'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  hasSubmittedBildirgi,
  hasSubmittedKelishuv,
} from '@/features/purchase-requests/utils/purchaseRequestExport'

const formatFileSize = (size) => {
  if (!Number.isFinite(size) || size <= 0) return null
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const DocumentCard = ({ label, file, downloading, onDownload }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      borderColor: 'success.light',
      bgcolor: 'success.50',
    }}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <DescriptionIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" fontWeight={700}>
              {label}
            </Typography>
            <Chip label="Word" size="small" color="success" variant="outlined" />
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {file?.originalName || `${label}.docx`}
          </Typography>
          {formatFileSize(file?.size) ? (
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.size)}
            </Typography>
          ) : null}
        </Box>
      </Stack>
      <Button
        size="small"
        variant="contained"
        color="success"
        startIcon={<DescriptionIcon fontSize="small" />}
        disabled={downloading || !onDownload}
        onClick={onDownload}
        sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}
      >
        Yuklab olish
      </Button>
    </Stack>
  </Paper>
)

export const SubmittedDocumentsSection = ({
  request,
  downloading = false,
  onDownloadBildirgi,
  onDownloadKelishuv,
}) => {
  const showBildirgi = hasSubmittedBildirgi(request)
  const showKelishuv = hasSubmittedKelishuv(request)

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Yuborilgan Word hujjatlar
      </Typography>

      {!showBildirgi && !showKelishuv ? (
        <Alert severity="warning" sx={{ mt: 0.5 }}>
          Ushbu arizaga yuborilgan Word hujjatlar biriktirilmagan.
        </Alert>
      ) : (
        <Stack spacing={1.25}>
          {showBildirgi ? (
            <DocumentCard
              label="Bildirgi"
              file={request.submittedBildirgi}
              downloading={downloading}
              onDownload={onDownloadBildirgi ? () => onDownloadBildirgi(request) : undefined}
            />
          ) : null}
          {showKelishuv ? (
            <DocumentCard
              label="Kelishuv varaqasi"
              file={request.submittedKelishuv}
              downloading={downloading}
              onDownload={onDownloadKelishuv ? () => onDownloadKelishuv(request) : undefined}
            />
          ) : null}
        </Stack>
      )}
    </Box>
  )
}
