import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
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

export const PurchasingQueueTable = ({ items, emptyMessage, onView, showPurchaseTotal }) => {
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
            <TableCell width={150}>Sana</TableCell>
            <TableCell>Ariza beruvchi</TableCell>
            <TableCell width={110}>Tuzilma</TableCell>
            <TableCell width={100}>Tovarlar</TableCell>
            <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>Nakladnoy</TableCell>
            <TableCell width={140}>Yetkazuvchi</TableCell>
            {showPurchaseTotal ? <TableCell width={160}>Jami summa</TableCell> : null}
            <TableCell width={200}>Holat</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => onView(item)}
            >
              <TableCell sx={{ fontWeight: 600 }}>{item.requestCode}</TableCell>
              <TableCell>
                <Typography variant="body2" noWrap>
                  {formatDateTime(showPurchaseTotal ? item.purchase?.purchasedAt : item.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap>
                  {item.applicant.displayName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap fontWeight={600}>
                  {item.applicantStructure?.shortName ?? '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{item.items.length} ta</Typography>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {item.warehouseDispatch?.dispatchCode ? (
                  <Typography component="span" variant="body2" sx={dispatchCodeSx}>
                    {item.warehouseDispatch.dispatchCode}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap>
                  {item.purchase?.vendorName ?? '—'}
                </Typography>
              </TableCell>
              {showPurchaseTotal ? (
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {formatUzs(item.purchaseTotalAmount)}
                  </Typography>
                </TableCell>
              ) : null}
              <TableCell>
                <Chip
                  size="small"
                  color={getStatusChipColor(item.status)}
                  label={item.statusLabel}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
