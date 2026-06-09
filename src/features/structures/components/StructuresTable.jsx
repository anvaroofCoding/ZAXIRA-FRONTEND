import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { StructureRowActionsMenu } from './StructureRowActionsMenu'

const BooleanChip = ({ value }) => (
  <Chip
    size="small"
    color={value ? 'primary' : 'default'}
    variant={value ? 'filled' : 'outlined'}
    label={value ? 'Ha' : 'Yo‘q'}
  />
)

export const StructuresTable = ({
  structures,
  canUpdate,
  canDelete,
  statusLoadingId,
  onEdit,
  onDeactivate,
  onActivate,
}) => {
  if (!structures.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Tarkibiy tuzilmalar yo‘q</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>To‘liq nomi</TableCell>
            <TableCell width={140}>Qisqa nomi</TableCell>
            <TableCell width={100}>Ombor</TableCell>
            <TableCell width={100}>Raxbar</TableCell>
            <TableCell width={120}>Holat</TableCell>
            <TableCell width={120} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {structures.map((structure) => (
            <TableRow key={structure.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{structure.fullName}</TableCell>
              <TableCell>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}
                >
                  {structure.shortName}
                </Typography>
              </TableCell>
              <TableCell>
                <BooleanChip value={structure.hasWarehouse} />
              </TableCell>
              <TableCell>
                <BooleanChip value={structure.hasLeader} />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={structure.isActive ? 'success' : 'default'}
                  label={structure.isActive ? 'Faol' : 'Nofaol'}
                />
              </TableCell>
              <TableCell align="right">
                <StructureRowActionsMenu
                  structure={structure}
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
