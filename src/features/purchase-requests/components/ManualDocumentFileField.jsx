import CloseIcon from '@mui/icons-material/Close'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PURCHASE_REQUEST_DOCUMENT_ACCEPT } from '@/features/purchase-requests/utils/purchaseRequestDocumentFile'

export const ManualDocumentFileField = ({
  label,
  file,
  error = '',
  disabled = false,
  onSelect,
  onClear,
}) => {
  const handleChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    event.target.value = ''
    onSelect(nextFile)
  }

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
        {label}
      </Typography>

      {file ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" noWrap title={file.name} sx={{ flex: 1, minWidth: 0 }}>
            {file.name}
          </Typography>
          <Button
            component="label"
            size="small"
            disabled={disabled}
            sx={{ textTransform: 'none', flexShrink: 0 }}
          >
            Almashtirish
            <input
              hidden
              type="file"
              accept={PURCHASE_REQUEST_DOCUMENT_ACCEPT}
              onChange={handleChange}
            />
          </Button>
          <IconButton
            size="small"
            aria-label={`${label} faylini olib tashlash`}
            onClick={onClear}
            disabled={disabled}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : (
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={<UploadFileIcon fontSize="small" />}
          disabled={disabled}
          sx={{ textTransform: 'none' }}
        >
          Fayl tanlash
          <input
            hidden
            type="file"
            accept={PURCHASE_REQUEST_DOCUMENT_ACCEPT}
            onChange={handleChange}
          />
        </Button>
      )}

      <Typography
        variant="caption"
        color={error ? 'error' : 'text.secondary'}
        sx={{ display: 'block', mt: 0.5 }}
      >
        {error || 'Faqat .docx fayl qabul qilinadi'}
      </Typography>
    </Box>
  )
}
