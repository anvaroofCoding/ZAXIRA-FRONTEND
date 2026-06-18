import Grid from '@mui/material/Grid'
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
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { formatDateTime } from '@/shared/utils/formatDate'

const MetaItem = ({ label, value }) => (
  <Stack spacing={0.25}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Stack>
)

const formatStructureDisplay = (structure, mode = 'full') => {
  if (!structure) return '—'
  if (mode === 'short') {
    return structure.shortName || structure.fullName || '—'
  }
  const shortName = structure.shortName || '—'
  const fullName = structure.fullName || '—'
  return `${shortName} — ${fullName}`
}

export const DispatchNakladnoyTable = ({ dispatch, structureNameMode = 'full' }) => {
  if (!dispatch) {
    return null
  }

  const items = dispatch.items ?? []
  const showCharacteristics = items.some((item) => item.characteristics?.trim())

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <BoxHeader dispatch={dispatch} structureNameMode={structureNameMode} />

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={48}>T/R</TableCell>
              <TableCell>Tovar</TableCell>
              {showCharacteristics ? <TableCell>Xususiyat</TableCell> : null}
              <TableCell width={160}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
              <TableCell width={90} align="right">
                Soni
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length ? (
              items.map((item, index) => (
                <TableRow key={item.itemIndex ?? index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  {showCharacteristics ? (
                    <TableCell>
                      <PurchaseRequestItemCharacteristicsCell
                        value={item.characteristics}
                        modalOnly
                      />
                    </TableCell>
                  ) : null}
                  <TableCell sx={nomenclatureTableCellSx}>
                    {getItemNomenclatureCode(item)}
                  </TableCell>
                  <TableCell align="right">{item.quantityDispatched} ta</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showCharacteristics ? 5 : 4}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    Tovarlar yo‘q
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

const BoxHeader = ({ dispatch, structureNameMode = 'full' }) => (
  <Stack
    spacing={2}
    sx={{
      px: 2,
      py: 1.5,
      borderBottom: 1,
      borderColor: 'divider',
      bgcolor: 'action.hover',
    }}
  >
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <Typography variant="subtitle2" fontWeight={700}>
        Nakladnoy
      </Typography>
      <Typography component="span" variant="body2" sx={dispatchCodeSx}>
        {dispatch.dispatchCode}
      </Typography>
    </Stack>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetaItem label="Ariza" value={dispatch.requestCode || '—'} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetaItem
          label="Qabul qiluvchi"
          value={formatStructureDisplay(dispatch.targetStructure, structureNameMode)}
        />
      </Grid>
      {dispatch.sourceStructure ? (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetaItem
            label="Jo‘natuvchi"
            value={formatStructureDisplay(dispatch.sourceStructure, structureNameMode)}
          />
        </Grid>
      ) : null}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetaItem label="Jo‘natilgan sana" value={formatDateTime(dispatch.dispatchedAt)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetaItem
          label="Rejalashtirilgan kelish"
          value={formatDateTime(dispatch.plannedArrivalAt)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetaItem label="Holat" value={dispatch.statusLabel || '—'} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetaItem
          label="Jo‘natuvchi xodim"
          value={dispatch.dispatchedBy?.displayName || dispatch.dispatchedBy?.login || '—'}
        />
      </Grid>
    </Grid>
  </Stack>
)
