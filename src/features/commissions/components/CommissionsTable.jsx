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
import { formatMemberLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import { CommissionRowActionsMenu } from './CommissionRowActionsMenu'

export const CommissionsTable = ({
  commissions,
  canUpdate,
  canDelete,
  statusLoadingId,
  onEdit,
  onDeactivate,
  onActivate,
}) => {
  if (!commissions.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Komissiyalar yo‘q</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={200}>Komissiya nomi</TableCell>
            <TableCell width={180}>Boshliq</TableCell>
            <TableCell>A’zolar</TableCell>
            <TableCell width={80}>Soni</TableCell>
            <TableCell width={120}>Holat</TableCell>
            <TableCell width={120} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {commissions.map((commission) => (
            <TableRow key={commission.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{commission.name}</TableCell>
              <TableCell>
                {commission.boss ? (
                  <Chip
                    size="small"
                    color="primary"
                    variant="filled"
                    label={formatMemberLabel(commission.boss)}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {commission.members.map((member) => (
                    <Chip
                      key={member.userId}
                      size="small"
                      variant="outlined"
                      label={formatMemberLabel(member)}
                    />
                  ))}
                </Stack>
              </TableCell>
              <TableCell>{commission.memberCount}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={commission.isActive ? 'success' : 'default'}
                  label={commission.isActive ? 'Faol' : 'Nofaol'}
                />
              </TableCell>
              <TableCell align="right">
                <CommissionRowActionsMenu
                  commission={commission}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  statusLoadingId={statusLoadingId}
                  onEdit={onEdit}
                  onDeactivate={onDeactivate}
                  onActivate={onActivate}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
