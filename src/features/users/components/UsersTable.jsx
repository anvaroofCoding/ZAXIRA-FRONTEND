import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '@/shared/utils/formatDate'
import { UserRowActionsMenu } from './UserRowActionsMenu'

export const UsersTable = ({
  users,
  currentUserId,
  isSuperAdmin,
  canUpdate,
  canDelete,
  statusLoadingId,
  onEdit,
  onDeactivate,
  onActivate,
  onPermanentDelete,
}) => {
  if (!users.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Foydalanuvchilar topilmadi</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Login</TableCell>
            <TableCell>Ism</TableCell>
            <TableCell width={140}>Tuzilma</TableCell>
            <TableCell width={150}>Yaratilgan sana</TableCell>
            <TableCell width={140}>Kim yaratdi</TableCell>
            <TableCell width={100}>Holat</TableCell>
            <TableCell width={72} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{user.login}</TableCell>
              <TableCell>{user.displayName}</TableCell>
              <TableCell>
                {user.structure ? (
                  <Typography variant="body2" noWrap title={user.structure.fullName}>
                    {user.structure.shortName}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap>
                  {formatDateTime(user.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                {user.createdBy ? (
                  <Typography variant="body2" noWrap title={user.createdBy.login}>
                    {user.createdBy.displayName}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={user.isActive ? 'success' : 'default'}
                  label={user.isActive ? 'Faol' : 'Nofaol'}
                />
              </TableCell>
              <TableCell align="right">
                <UserRowActionsMenu
                  user={user}
                  currentUserId={currentUserId}
                  isSuperAdmin={isSuperAdmin}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  statusLoadingId={statusLoadingId}
                  onEdit={onEdit}
                  onDeactivate={onDeactivate}
                  onActivate={onActivate}
                  onPermanentDelete={onPermanentDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
