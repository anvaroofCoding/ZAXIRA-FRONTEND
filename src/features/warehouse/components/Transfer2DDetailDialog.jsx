import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined'
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useGetTransferByIdQuery } from '@/features/transfer/api/transferApi'
import { WarehouseDispatchSummaryPanel } from '@/features/warehouse-dispatches/components/WarehouseDispatchSummaryPanel'
import {
  getDispatchStatusChipProps,
  resolveTransferDirection,
} from '@/features/warehouse-dispatches/utils/dispatchStatusDisplay'
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import { getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { PurchaseRequestItemCharacteristicsCell } from '@/features/purchase-requests/components/PurchaseRequestItemCharacteristicsCell'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const directionIcons = {
  success: <ArrowDownwardOutlinedIcon fontSize="small" />,
  warning: <ArrowUpwardOutlinedIcon fontSize="small" />,
  default: <SwapHorizOutlinedIcon fontSize="small" />,
}

export const Transfer2DDetailDialog = ({ transferId, viewerStructureId, onClose }) => {
  const detailQuery = useGetTransferByIdQuery(
    { id: transferId, markSeen: false },
    { skip: !transferId },
  )

  const resolveMovement = (item) => {
    const direction = resolveTransferDirection(item, viewerStructureId)
    return {
      tooltip: direction.label,
      color: direction.color,
      icon: directionIcons[direction.color] ?? directionIcons.default,
    }
  }

  return (
    <Dialog open={Boolean(transferId)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Transfer ma&apos;lumotlari</DialogTitle>
      <DialogContent dividers>
        {detailQuery.isLoading ? (
          <Typography color="text.secondary">Yuklanmoqda...</Typography>
        ) : detailQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(detailQuery.error, 'Transfer tafsilotini yuklab bo‘lmadi')}
          </Alert>
        ) : detailQuery.data ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip size="small" label={detailQuery.data.dispatchCode} sx={dispatchCodeSx} />
              <Chip
                size="small"
                {...getDispatchStatusChipProps(
                  detailQuery.data.status,
                  detailQuery.data.statusLabel,
                )}
              />
              {(() => {
                const movement = resolveMovement(detailQuery.data)
                return (
                  <Tooltip title={movement.tooltip}>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color:
                          movement.color === 'default'
                            ? 'text.secondary'
                            : `${movement.color}.main`,
                      }}
                    >
                      {movement.icon}
                    </Box>
                  </Tooltip>
                )
              })()}
            </Stack>

            <WarehouseDispatchSummaryPanel dispatch={detailQuery.data} />

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tovar</TableCell>
                    <TableCell width={140}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                    <TableCell width={120} align="right">
                      Jo‘natilgan
                    </TableCell>
                    <TableCell width={120} align="right">
                      Qabul
                    </TableCell>
                    <TableCell width={120} align="right">
                      Qaytgan
                    </TableCell>
                    <TableCell width={120} align="right">
                      Qolgan
                    </TableCell>
                    <TableCell>Izoh</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailQuery.data.items?.map((row) => (
                    <TableRow key={row.itemIndex}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {row.name}
                        </Typography>
                        {row.characteristics?.trim() ? (
                          <PurchaseRequestItemCharacteristicsCell
                            value={row.characteristics}
                            modalOnly
                          />
                        ) : null}
                      </TableCell>
                      <TableCell sx={nomenclatureTableCellSx}>
                        {getItemNomenclatureCode(row)}
                      </TableCell>
                      <TableCell align="right">{row.quantityDispatched} ta</TableCell>
                      <TableCell align="right">{row.quantityReceived} ta</TableCell>
                      <TableCell align="right">{row.quantityRejected} ta</TableCell>
                      <TableCell align="right">{row.quantityPending} ta</TableCell>
                      <TableCell>{row.rejectReason || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
