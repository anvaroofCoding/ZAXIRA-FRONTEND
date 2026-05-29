import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import {
  getDecisionChipColor,
  getStatusChipColor,
} from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { formatDateTime } from '@/shared/utils/formatDate'

export const PurchaseRequestHistoryTable = ({ items, onView }) => {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Hodisalar topilmadi</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={120}>Ariza ID</TableCell>
            <TableCell width={150}>Hodisa vaqti</TableCell>
            <TableCell width={180}>Hodisa turi</TableCell>
            <TableCell width={160}>Kim</TableCell>
            <TableCell width={140}>Qaror</TableCell>
            <TableCell>Izoh</TableCell>
            <TableCell width={180}>Ariza holati</TableCell>
            <TableCell width={140}>Ariza beruvchi</TableCell>
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
                  {formatDateTime(item.eventAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{item.eventTypeLabel}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap title={item.actor.login}>
                  {item.actor.displayName}
                </Typography>
              </TableCell>
              <TableCell>
                {item.decision ? (
                  <Chip
                    size="small"
                    color={getDecisionChipColor(item.decision)}
                    label={item.decisionLabel}
                  />
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 320,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.comment}
                >
                  {item.comment?.trim() || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={getStatusChipColor(item.requestStatus)}
                  label={item.requestStatusLabel}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap>
                  {item.applicant.displayName}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
