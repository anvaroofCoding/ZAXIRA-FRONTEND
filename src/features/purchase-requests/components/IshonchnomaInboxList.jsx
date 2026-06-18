import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { PurchaseContractInfoBlock } from '@/features/purchase-requests/components/PurchaseContractInfoBlock'
import { hasPurchaseContractInfo } from '@/features/purchase-requests/utils/purchaseDisplayUtils'
import { formatDateTime } from '@/shared/utils/formatDate'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

export const IshonchnomaInboxList = ({
  items,
  emptyMessage,
  onUpload,
  canUpload = true,
}) => {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    )
  }

  const handleDownloadFile = (requestId, file) => {
    downloadAuthenticatedFile(
      `/purchase-requests/${requestId}/purchase/files/${file.storedName}`,
      file.originalName,
    ).catch(() => {})
  }

  return (
    <Stack spacing={2}>
      {items.map((entry) => {
        const { batch, requestId, requestCode, batchNumber, ishonchnomaSubmitted } = entry
        const statusLabel = ishonchnomaSubmitted
          ? 'Ishonchnoma yuborilgan'
          : 'Ishonchnoma kutilmoqda'
        const statusColor = ishonchnomaSubmitted ? 'success' : 'warning'

        return (
          <Paper key={`${requestId}-${batch.batchId}`} variant="outlined">
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {requestCode}
                  </Typography>
                  <Chip size="small" label={`Xarid #${batchNumber}`} />
                  <Chip size="small" color={statusColor} label={statusLabel} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(batch.purchasedAt)} — {batch.purchasedBy.displayName}
                </Typography>
                {entry.applicant ? (
                  <Typography variant="body2" color="text.secondary">
                    Ariza beruvchi: {entry.applicant.displayName}
                  </Typography>
                ) : null}
              </Stack>

              {canUpload ? (
                <Button
                  size="small"
                  variant={ishonchnomaSubmitted ? 'outlined' : 'contained'}
                  onClick={() => onUpload(entry)}
                >
                  {ishonchnomaSubmitted ? 'Yana yuklash' : 'Ishonchnoma yuklash'}
                </Button>
              ) : null}
            </Box>

            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                {hasPurchaseContractInfo(batch) ? (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                      Tashkilot ma’lumotlari
                    </Typography>
                    <PurchaseContractInfoBlock batch={batch} title="" />
                  </Box>
                ) : null}

                {batch.ishonchnoma?.files?.length ? (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                      Yuklangan ishonchnoma fayllari
                    </Typography>
                    <Stack spacing={0.5}>
                      {batch.ishonchnoma.files.map((file) => (
                        <Link
                          key={file.storedName}
                          component="button"
                          type="button"
                          variant="body2"
                          onClick={() => handleDownloadFile(requestId, file)}
                          sx={{ textAlign: 'left' }}
                        >
                          {file.originalName || file.label}
                        </Link>
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {batch.ishonchnoma.uploadedBy.displayName} —{' '}
                      {formatDateTime(batch.ishonchnoma.uploadedAt)}
                    </Typography>
                  </Box>
                ) : null}

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Xarid qilingan tovarlar
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tovar</TableCell>
                          <TableCell width={110} align="right">
                            Miqdor
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {entry.items.map((item) => (
                          <TableRow key={item.itemIndex}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.name}
                              </Typography>
                              {item.characteristics ? (
                                <Typography variant="caption" color="text.secondary">
                                  {item.characteristics}
                                </Typography>
                              ) : null}
                            </TableCell>
                            <TableCell align="right">
                              {item.quantity} {item.unit}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            </Box>
          </Paper>
        )
      })}
    </Stack>
  )
}
