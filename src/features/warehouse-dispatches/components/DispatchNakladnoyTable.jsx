import Box from '@mui/material/Box'
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
import { NomenclatureTableCell } from '@/features/warehouse/components/NomenclatureTableCell'
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import { getDispatchRequestLabel } from '@/features/warehouse-dispatches/utils/dispatchContext'
import { NOMENCLATURE_COLUMN_LABEL } from '@/features/warehouse/utils/itemNomenclature'
import { formatDateTime } from '@/shared/utils/formatDate'

const MetaItem = ({ label, value }) => (
  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={600}
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={value}
    >
      {value}
    </Typography>
  </Stack>
)

export const DispatchNakladnoyTable = ({ dispatch }) => {
  if (!dispatch) {
    return null
  }

  const items = dispatch.items ?? []
  const showCharacteristics = items.some((item) => item.characteristics?.trim())
  const requestLabel = getDispatchRequestLabel(dispatch)

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <BoxHeader dispatch={dispatch} requestLabel={requestLabel} />

      <TableContainer>
        <Table
          size="small"
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            '& .MuiTableCell-root': {
              px: 2,
              py: 1.25,
              verticalAlign: 'middle',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell width={56}>T/R</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Tovar</TableCell>
              {showCharacteristics ? <TableCell width={140}>Xususiyat</TableCell> : null}
              <TableCell width={200}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
              <TableCell width={96} align="right">
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
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.name}
                    >
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
                  <NomenclatureTableCell item={item} />
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

const BoxHeader = ({ dispatch, requestLabel }) => (
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

    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <MetaItem label={requestLabel} value={dispatch.requestCode || '—'} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <MetaItem
          label="Rejalashtirilgan kelish"
          value={formatDateTime(dispatch.plannedArrivalAt)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <MetaItem label="Holat" value={dispatch.statusLabel || '—'} />
      </Grid>
    </Grid>
  </Stack>
)
