import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '@/shared/utils/formatDate'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

export const DispatchIshonchnomaFilesBlock = ({
  purchaseRequestId,
  ishonchnoma,
}) => {
  if (!purchaseRequestId) {
    return null
  }

  const files = ishonchnoma?.files ?? []

  const handleDownload = (file) => {
    downloadAuthenticatedFile(
      `/purchase-requests/${purchaseRequestId}/purchase/files/${file.storedName}`,
      file.originalName || file.label,
    ).catch(() => {})
  }

  if (!files.length) {
    return (
      <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: 'background.default' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Ishonchnoma
          </Typography>
          <Chip size="small" color="warning" variant="outlined" label="Yuklanmagan" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Ushbu xarid uchun ishonchnoma fayllari hali yuklanmagan.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: 'background.default' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Ishonchnoma fayllari
        </Typography>
        <Chip size="small" color="success" label="Ishonchnoma yuborilgan" />
      </Stack>

      <Stack spacing={0.75}>
        {files.map((file) => (
          <Link
            key={file.storedName}
            component="button"
            type="button"
            variant="body2"
            onClick={() => handleDownload(file)}
            sx={{ textAlign: 'left' }}
          >
            {file.originalName || file.label}
          </Link>
        ))}
      </Stack>

      {ishonchnoma?.uploadedBy ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {ishonchnoma.uploadedBy.displayName} — {formatDateTime(ishonchnoma.uploadedAt)}
        </Typography>
      ) : null}
    </Paper>
  )
}
