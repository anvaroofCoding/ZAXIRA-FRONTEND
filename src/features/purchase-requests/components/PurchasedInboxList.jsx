import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { getStatusChipColor } from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import { formatDateTime } from '@/shared/utils/formatDate'
import { formatUzs } from '@/shared/utils/formatUzs'

const MetaItem = ({ label, value, monospace }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={600}
      sx={monospace ? dispatchCodeSx : undefined}
    >
      {value || '—'}
    </Typography>
  </Box>
)

const buildItemRows = (request) => {
  const receiptItems = request.warehouseReceipt?.items ?? []

  if (!receiptItems.length) {
    return request.items.map((item, index) => ({
      itemIndex: index,
      name: item.name,
      characteristics: item.characteristics,
      quantityRequested: item.quantity,
      quantityDispatched: null,
      quantityReceived: null,
      quantityRejected: null,
      rejectReason: null,
      purchaseAmount: item.purchaseAmount ?? null,
    }))
  }

  return receiptItems.map((receiptItem) => {
    const requestItem = request.items[receiptItem.itemIndex]

    return {
      ...receiptItem,
      quantityRequested: requestItem?.quantity ?? null,
      purchaseAmount: requestItem?.purchaseAmount ?? null,
    }
  })
}

export const PurchasedInboxList = ({ items, emptyMessage, onView }) => {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    )
  }

  return (
    <Stack spacing={2}>
      {items.map((request) => {
        const rows = buildItemRows(request)
        const receipt = request.warehouseReceipt
        const displayTotalAmount = receipt?.items?.length
          ? rows.reduce((sum, row) => {
              const unit = Number(row.purchaseAmount ?? 0)
              const qty = Number(row.quantityReceived ?? 0)
              return sum + unit * qty
            }, 0)
          : Number(request.purchaseTotalAmount ?? 0)

        return (
          <Paper key={request.id} variant="outlined">
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
              {/* layout props must be inside sx to avoid DOM warnings */}
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {request.requestCode}
                </Typography>
                <Chip
                  size="small"
                  color={getStatusChipColor(request.status)}
                  label={request.statusLabel}
                />
              </Stack>
              <Button size="small" variant="outlined" onClick={() => onView(request)}>
                Batafsil
              </Button>
            </Box>

            <Box sx={{ p: 2 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetaItem
                    label="Nakladnoy"
                    value={receipt?.dispatchCode ?? request.warehouseDispatch?.dispatchCode}
                    monospace
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetaItem label="Yetkazuvchi" value={request.purchase?.vendorName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetaItem
                    label="Ariza beruvchi tuzilma"
                    value={request.applicantStructure?.shortName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetaItem
                    label="Qabul qiluvchi ombor"
                    value={receipt?.targetStructure?.shortName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetaItem
                    label="Jo‘natilgan"
                    value={receipt?.dispatchedAt ? formatDateTime(receipt.dispatchedAt) : null}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetaItem
                    label="Xarid qilingan"
                    value={
                      request.purchase?.purchasedAt
                        ? formatDateTime(request.purchase.purchasedAt)
                        : null
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetaItem
                    label="Jo‘natuvchi"
                    value={receipt?.dispatchedBy?.displayName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetaItem label="Jami summa" value={formatUzs(displayTotalAmount)} />
                </Grid>
              </Grid>

              {request.purchase?.comment?.trim() ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Xarid izohi: {request.purchase.comment}
                </Typography>
              ) : null}

              <Divider sx={{ mb: 1.5 }} />

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Tovarlar — qabul va rad holati
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={48}>T/R</TableCell>
                      <TableCell>Tovar</TableCell>
                      <TableCell width={80} align="right">
                        So‘ralgan
                      </TableCell>
                      <TableCell width={90} align="right">
                        Jo‘natilgan
                      </TableCell>
                      <TableCell width={80} align="right">
                        Qabul
                      </TableCell>
                      <TableCell width={70} align="right">
                        Rad
                      </TableCell>
                      <TableCell>Sabab</TableCell>
                      <TableCell width={130} align="right">
                        Xarid summasi
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => (
                      (() => {
                        const unit = Number(row.purchaseAmount ?? 0)
                        const qty = Number(
                          receipt?.items?.length ? row.quantityReceived ?? 0 : row.quantityRequested ?? 0,
                        )
                        const total = unit * qty
                        return (
                      <TableRow key={`${request.id}-${row.itemIndex}-${index}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {row.characteristics}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {row.quantityRequested != null ? `${row.quantityRequested} ta` : '—'}
                        </TableCell>
                        <TableCell align="right">
                          {row.quantityDispatched != null ? `${row.quantityDispatched} ta` : '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {row.quantityReceived != null ? `${row.quantityReceived} ta` : '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                          {row.quantityRejected != null ? `${row.quantityRejected} ta` : '—'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {row.rejectReason || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatUzs(unit)}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Jami: {formatUzs(total)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                        )
                      })()
                    ))}
                    <TableRow>
                      <TableCell colSpan={7} sx={{ fontWeight: 700 }}>
                        Jami
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatUzs(displayTotalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        )
      })}
    </Stack>
  )
}
