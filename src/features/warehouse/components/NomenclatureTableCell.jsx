import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  getItemNomenclatureCode,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'

export const NomenclatureTableCell = ({ item, align }) => {
  const value = getItemNomenclatureCode(item)

  return (
    <TableCell align={align} sx={nomenclatureTableCellSx}>
      <Tooltip title={value !== '—' ? value : ''} placement="top-start" arrow>
        <Typography component="span" variant="body2" sx={nomenclatureTableCellSx}>
          {value}
        </Typography>
      </Tooltip>
    </TableCell>
  )
}
