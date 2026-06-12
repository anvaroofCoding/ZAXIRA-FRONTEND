import Box from '@mui/material/Box'
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

const resolveBatchItems = (batch, items) => {
  const indexedItems = items.map((item, itemIndex) => ({ ...item, itemIndex }))
    return indexedItems.filter((item) => batch.itemIndexes.includes(item.itemIndex))
}

export const PurchaseUnavailableBatchCard = ({
  batch,
  batchNumber,
  items = [],
  compact = false,
}) => {
  const batchItems = resolveBatchItems(batch, items)

  return (
    <Paper
      variant="outlined"
      sx={{
        p: compact ? 1.5 : 2,
        borderRadius: 1.5,
        bgcolor: 'background.default',
        borderColor: 'warning.light',
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
            Xarid qilib bo‘lmaydi #{batchNumber} — {formatDateTime(batch.markedAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {batch.markedBy.displayName} ({batch.markedBy.login})
          </Typography>
        </Stack>

        <Box
          sx={{
            bgcolor: 'action.hover',
            border: 1,
            borderColor: 'warning.main',
            borderRadius: 1,
            p: 1.25,
          }}
        >
          <Typography variant="caption" display="block" sx={{ opacity: 0.9, mb: 0.5 }}>
            Sabab (majburiy izoh)
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {batch.comment}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
            Belgilangan tovarlar
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
                {batchItems.map((item) => (
                  <TableRow key={item.itemIndex}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.characteristics}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {item.quantity} {item.unit || 'dona'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Paper>
  )
}
