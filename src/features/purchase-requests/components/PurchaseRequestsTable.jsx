import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import { getStatusChipColor } from '@/features/purchase-requests/utils/purchaseRequestStatus'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { formatBossDocumentName } from '@/features/purchase-requests/utils/formatBossDocumentName'
import { formatDateTime } from '@/shared/utils/formatDate'
import { PurchaseRequestRowActionsMenu } from './PurchaseRequestRowActionsMenu'

export const PurchaseRequestsTable = ({
  items,
  onView,
  onDownloadBildirgi,
  onDownloadKelishuv,
  onDelete,
  canDeleteItem,
  onEdit,
  canEditItem,
  onResubmit,
  canResubmitItem,
  downloadingId,
}) => {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Arizalar topilmadi</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={120}>Ariza ID</TableCell>
            <TableCell width={150}>Sana</TableCell>
            <TableCell width={100}>Tovarlar</TableCell>
            <TableCell>Boshliq</TableCell>
            <TableCell width={160}>Holat</TableCell>
            <TableCell width={72} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => {
            const isDownloading = downloadingId === item.id

            return (
              <TableRow
                key={item.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onView(item)}
              >
                <TableCell sx={{ fontWeight: 600 }}>{item.requestCode}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {formatDateTime(item.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.items.length} ta</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={item.boss.login}>
                    {formatBossDocumentName(item.boss)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={getStatusChipColor(item.status)}
                    label={item.statusLabel}
                  />
                </TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  <PurchaseRequestRowActionsMenu
                    item={item}
                    loading={isDownloading}
                    onView={onView}
                    onDownloadBildirgi={onDownloadBildirgi}
                    onDownloadKelishuv={onDownloadKelishuv}
                    onDelete={onDelete}
                    canDelete={canDeleteItem?.(item) ?? false}
                    onEdit={onEdit}
                    canEdit={canEditItem?.(item) ?? false}
                    onResubmit={onResubmit}
                    canResubmit={canResubmitItem?.(item) ?? false}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
