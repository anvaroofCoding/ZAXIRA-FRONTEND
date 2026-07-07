import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { CustomUnitRowActionsMenu } from './CustomUnitRowActionsMenu'

const formatDate = (value) => {
  if (!value) return '—'

  try {
    return new Intl.DateTimeFormat('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return '—'
  }
}

export const CustomUnitsTable = ({
  units,
  canUpdate,
  canDelete,
  statusLoadingId,
  onEdit,
  onDelete,
}) => {
  if (!units.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Maxsus birliklar yo‘q</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Birlik nomi</TableCell>
            <TableCell width={220}>Foydalanuvchi</TableCell>
            <TableCell width={180}>Yaratilgan</TableCell>
            <TableCell width={140}>Holat</TableCell>
            <TableCell width={120} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {units.map((unit) => (
            <TableRow key={unit.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{unit.name}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {unit.ownerName}
                </Typography>
                {unit.ownerLogin ? (
                  <Typography variant="caption" color="text.secondary">
                    {unit.ownerLogin}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell>{formatDate(unit.createdAt)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={unit.isUsed ? 'warning' : 'success'}
                  variant={unit.isUsed ? 'filled' : 'outlined'}
                  label={unit.isUsed ? 'Ishlatilgan' : 'Ishlatilmagan'}
                />
              </TableCell>
              <TableCell align="right">
                <CustomUnitRowActionsMenu
                  unit={unit}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  statusLoadingId={statusLoadingId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
