import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatTaxIdTypeLabel } from '@/features/purchase-requests/utils/purchaseDisplayUtils'

const Field = ({ label, value }) => (
  <Stack spacing={0.25}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
      {value || '—'}
    </Typography>
  </Stack>
)

export const PurchaseContractInfoBlock = ({
  batch,
  title = 'Tashkilot ma’lumotlari',
  showPlaceholders = false,
}) => {
  const hasContractNumber = Boolean(batch?.contractNumber?.trim())
  const hasOrganizationName = Boolean(batch?.organizationName?.trim())
  const hasTaxId = Boolean(batch?.innOrPinfl?.trim())

  if (!showPlaceholders && !hasContractNumber && !hasOrganizationName && !hasTaxId) {
    return null
  }

  const taxIdLabel = hasTaxId
    ? formatTaxIdTypeLabel(batch.innOrPinflType)
    : batch?.innOrPinflType
      ? formatTaxIdTypeLabel(batch.innOrPinflType)
      : 'INN/PINFL'

  return (
    <Stack spacing={1}>
      {title ? (
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      ) : null}
      <Grid container spacing={2}>
        {showPlaceholders || hasContractNumber ? (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Shartnoma raqami" value={batch?.contractNumber} />
          </Grid>
        ) : null}
        {showPlaceholders || hasOrganizationName ? (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Tashkilot nomi" value={batch?.organizationName} />
          </Grid>
        ) : null}
        {showPlaceholders || hasTaxId ? (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label={taxIdLabel} value={batch?.innOrPinfl} />
          </Grid>
        ) : null}
      </Grid>
    </Stack>
  )
}
