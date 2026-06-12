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
import { formatDateTime } from '@/shared/utils/formatDate'
import { formatUzs } from '@/shared/utils/formatUzs'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

const resolveBatchItems = (batch, items) => {
  const indexedItems = items.map((item, itemIndex) => ({ ...item, itemIndex }))

  if (batch.batchId === 'legacy') {
    const indexes = new Set(batch.itemAmounts.map((row) => row.itemIndex))
    return indexedItems.filter((item) => indexes.has(item.itemIndex))
  }

  return indexedItems.filter((item) => item.purchaseBatchId === batch.batchId)
}

const resolveOriginalName = (substitution, item) => {
  if (substitution?.originalName) {
    return substitution.originalName
  }

  return item.originalRequestedItem?.name ?? null
}

export const PurchaseBatchCard = ({
  batch,
  batchNumber,
  items = [],
  requestId,
  compact = false,
  onDispatch,
}) => {
  const batchItems = resolveBatchItems(batch, items)
  const batchTotal = batchItems.reduce((sum, item) => {
    const unit = Number(item.purchaseAmount ?? 0)
    return sum + unit * Number(item.quantity ?? 0)
  }, 0)

  const handleDownloadFile = (file) => {
    if (!requestId) {
      return
    }

    downloadAuthenticatedFile(
      `/purchase-requests/${requestId}/purchase/files/${file.storedName}`,
      file.originalName,
    ).catch(() => {})
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: compact ? 1.5 : 2,
        borderRadius: 1.5,
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Xarid qilindi #{batchNumber} — {formatDateTime(batch.purchasedAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {batch.purchasedBy.displayName} ({batch.purchasedBy.login})
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            {batch.warehouseDispatch ? (
              <Chip
                size="small"
                color="info"
                label={batch.warehouseDispatch.statusLabel}
              />
            ) : null}
            {batch.canDispatchToWarehouse && onDispatch ? (
              <Button size="small" variant="contained" onClick={() => onDispatch(batch)}>
                Omborga jo‘natish
              </Button>
            ) : null}
          </Stack>
        </Stack>

        {batch.comment?.trim() ? (
          <InfoBlock label="Izoh">
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {batch.comment}
            </Typography>
          </InfoBlock>
        ) : null}

        {batch.links?.length ? (
          <InfoBlock label="Havolalar">
            <Stack spacing={0.5}>
              {batch.links.map((link, index) => (
                <Link
                  key={`${link.url}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                >
                  {link.url}
                </Link>
              ))}
            </Stack>
          </InfoBlock>
        ) : null}

        {batch.files?.length ? (
          <InfoBlock label="Yuklangan fayllar">
            <Stack spacing={0.5}>
              {batch.files.map((file) => (
                <Link
                  key={file.storedName}
                  component={requestId ? 'button' : 'span'}
                  type={requestId ? 'button' : undefined}
                  variant="body2"
                  onClick={requestId ? () => handleDownloadFile(file) : undefined}
                  sx={{ textAlign: 'left' }}
                >
                  {file.originalName || file.label}
                </Link>
              ))}
            </Stack>
          </InfoBlock>
        ) : null}

        <InfoBlock label="Xarid qilingan tovarlar">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tovar</TableCell>
                  <TableCell width={110} align="right">
                    Miqdor
                  </TableCell>
                  <TableCell width={130} align="right">
                    1 dona narxi
                  </TableCell>
                  <TableCell width={140} align="right">
                    Jami
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batchItems.map((item) => {
                  const unit = Number(item.purchaseAmount ?? 0)
                  const total = unit * Number(item.quantity ?? 0)
                  const substitution = batch.itemSubstitutions?.find(
                    (row) => row.itemIndex === item.itemIndex,
                  )
                  const originalName = resolveOriginalName(substitution, item)

                  return (
                    <TableRow key={item.itemIndex}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.name}
                        </Typography>
                        {originalName && originalName !== item.name ? (
                          <Typography variant="caption" color="warning.main" display="block">
                            Ariza bo‘yicha: {originalName}
                          </Typography>
                        ) : null}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.characteristics}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {item.quantity} {item.unit || 'dona'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{formatUzs(unit)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {formatUzs(total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Partiya jami
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatUzs(batchTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </InfoBlock>
      </Stack>
    </Paper>
  )
}

const InfoBlock = ({ label, children }) => (
  <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.25 }}>
    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    {children}
  </Box>
)
