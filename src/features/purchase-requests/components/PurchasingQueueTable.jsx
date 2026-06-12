import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
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
import { formatDateTime } from '@/shared/utils/formatDate'
import { formatUzs } from '@/shared/utils/formatUzs'

const stopRowClick = (event) => {
  event.stopPropagation()
}

export const PurchasingQueueTable = ({
  items,
  emptyMessage,
  onView,
  onPurchase,
  onReject,
  onDispatch,
}) => {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={120}>Ariza ID</TableCell>
            <TableCell width={130}>Holat</TableCell>
            <TableCell>Ariza beruvchi</TableCell>
            <TableCell width={100}>Tuzilma</TableCell>
            <TableCell width={80} align="right">
              Tovarlar
            </TableCell>
            <TableCell width={150}>Sana</TableCell>
            <TableCell width={160}>Yetkazuvchi</TableCell>
            <TableCell width={130} align="right">
              Jami summa
            </TableCell>
            <TableCell width={280} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => {
            const purchasedCount = item.items.filter((row) => row.isPurchased).length
            const hasPurchase = purchasedCount > 0
            const displayDate = hasPurchase ? item.purchase?.purchasedAt : item.createdAt

            return (
              <TableRow
                key={item.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onView(item)}
              >
                <TableCell sx={{ fontWeight: 600 }}>{item.requestCode}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={getStatusChipColor(item.status)}
                    label={item.statusLabel}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={item.applicant.login}>
                    {item.applicant.displayName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap fontWeight={600}>
                    {item.applicantStructure?.shortName ?? '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {hasPurchase
                      ? `${purchasedCount}/${item.items.length}`
                      : `${item.items.length} ta`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {displayDate ? formatDateTime(displayDate) : '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {item.purchase?.vendorName?.trim() || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" noWrap>
                    {hasPurchase ? formatUzs(item.purchaseTotalAmount) : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right" onClick={stopRowClick}>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    justifyContent="flex-end"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {item.canRejectPurchase && onReject ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onReject(item)}
                      >
                        Atkaz qilish
                      </Button>
                    ) : null}
                    {item.canCompletePurchase && onPurchase ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => onPurchase(item)}
                      >
                        Xarid qilish
                      </Button>
                    ) : null}
                    {item.canDispatchToWarehouse && onDispatch ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onDispatch(item)}
                      >
                        Omborga jo‘natish
                      </Button>
                    ) : null}
                    <Button size="small" variant="outlined" onClick={() => onView(item)}>
                      Batafsil
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
