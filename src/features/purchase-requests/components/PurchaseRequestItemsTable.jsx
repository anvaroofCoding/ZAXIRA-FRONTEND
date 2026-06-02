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
import { PurchaseRequestItemCharacteristicsCell } from '@/features/purchase-requests/components/PurchaseRequestItemCharacteristicsCell'

export const PurchaseRequestItemsTable = ({
  items,
  title,
  subtitle,
  onItemClick,
}) => {
  const clickable = Boolean(onItemClick)

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ mb: 1, alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={48}>T/R</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Tovar nomi</TableCell>
              <TableCell sx={{ maxWidth: 360 }}>Tovar xususiyati</TableCell>
              <TableCell width={72}>Soni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={`${item.name}-${index}`}
                hover={clickable}
                onClick={clickable ? () => onItemClick(item) : undefined}
                sx={{
                  ...(clickable
                    ? {
                        cursor: 'pointer',
                        '&:last-child td': { borderBottom: 0 },
                      }
                    : {}),
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell sx={{ fontWeight: 500, verticalAlign: 'top' }}>{item.name}</TableCell>
                <TableCell sx={{ verticalAlign: 'top', maxWidth: 360 }}>
                  <PurchaseRequestItemCharacteristicsCell value={item.characteristics} />
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{item.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
