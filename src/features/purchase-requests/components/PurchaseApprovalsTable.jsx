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
import { formatDateTime } from '@/shared/utils/formatDate'

const ROLE_LABELS = {
  commission: 'Komissiya',
  boss: 'Boshliq',
}

export const PurchaseApprovalsTable = ({ items, onView }) => {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Sizga tayinlangan tasdiqlash arizalari topilmadi
        </Typography>
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
            <TableCell width={100}>Tovarlar</TableCell>
            <TableCell width={120}>Rolingiz</TableCell>
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
                  {formatDateTime(item.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap>
                  {item.applicant.displayName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{item.items.length} ta</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {ROLE_LABELS[item.viewerRole] ?? '—'}
                </Typography>
              </TableCell>
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
