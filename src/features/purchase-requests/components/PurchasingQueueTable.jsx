import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
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
import { getPurchaseRequestStatusLabel, getStatusChipColor } from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { formatDateTime } from '@/shared/utils/formatDate'
import { formatUzs } from '@/shared/utils/formatUzs'

const stopRowClick = (event) => {
  event.stopPropagation()
}

const countDispatchableBatches = (item) =>
  (item.purchaseBatches ?? []).filter((batch) => batch.canDispatchToWarehouse).length

const ActionIconButton = ({ title, color = 'default', onClick, children }) => (
  <Tooltip title={title} arrow>
    <IconButton size="small" color={color} aria-label={title} onClick={onClick}>
      {children}
    </IconButton>
  </Tooltip>
)

export const PurchasingQueueTable = ({
  items,
  emptyMessage,
  onView,
  onPurchase,
  onReject,
  onDispatch,
}) => {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={120}>Ariza ID</TableCell>
            <TableCell width={130}>Holat</TableCell>
            <TableCell>Ariza beruvchi</TableCell>
            <TableCell width={100}>Tuzilma</TableCell>
            <TableCell width={80} align="right">
              Tovarlar
            </TableCell>
            <TableCell width={150}>Sana</TableCell>
            <TableCell width={160}>Yetkazuvchi</TableCell>
            <TableCell width={130} align="right">
              Jami summa
            </TableCell>
            <TableCell width={128} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => {
            const purchasedCount = item.items.filter((row) => row.isPurchased).length
            const pendingCount =
              item.pendingPurchaseItemCount ??
              item.items.filter((row) => !row.isPurchased && !row.isPurchaseUnavailable).length
            const pendingQuantity =
              item.pendingPurchaseQuantity ??
              item.items
                .filter((row) => !row.isPurchased && !row.isPurchaseUnavailable)
                .reduce((sum, row) => sum + Number(row.quantity ?? 0), 0)
            const hasPurchase = purchasedCount > 0
            const dispatchableBatchCount = countDispatchableBatches(item)
            const awaitingWarehouseDispatch =
              dispatchableBatchCount > 0 || item.canDispatchToWarehouse
            const displayDate = hasPurchase ? item.purchase?.purchasedAt : item.createdAt

            const itemsSummary =
              pendingCount > 0
                ? pendingQuantity > pendingCount
                  ? `${pendingQuantity} dona qolgan`
                  : hasPurchase
                    ? `${pendingCount} qolgan / ${item.items.length} ta`
                    : `${item.items.length} ta`
                : awaitingWarehouseDispatch
                  ? dispatchableBatchCount > 1
                    ? `${dispatchableBatchCount} partiya omborga jo‘natilmagan`
                    : 'Omborga jo‘natish kutilmoqda'
                  : `${item.items.length} ta`

            return (
              <TableRow
                key={item.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onView(item)}
              >
                <TableCell sx={{ fontWeight: 600 }}>{item.requestCode}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={getStatusChipColor(item.status)}
                    label={getPurchaseRequestStatusLabel(item.status, item.statusLabel)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={item.applicant.login}>
                    {item.applicant.displayName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap fontWeight={600}>
                    {item.applicantStructure?.shortName ?? '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{itemsSummary}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {displayDate ? formatDateTime(displayDate) : '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {item.purchase?.vendorName?.trim() || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" noWrap>
                    {hasPurchase ? formatUzs(item.purchaseTotalAmount) : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right" onClick={stopRowClick} sx={{ whiteSpace: 'nowrap' }}>
                  <Stack
                    direction="row"
                    spacing={0.25}
                    sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
                  >
                    {item.canCompletePurchase && onPurchase ? (
                      <ActionIconButton
                        title="Xarid qilish"
                        color="success"
                        onClick={() => onPurchase(item)}
                      >
                        <ShoppingCartCheckoutOutlinedIcon fontSize="small" />
                      </ActionIconButton>
                    ) : null}
                    {item.canDispatchToWarehouse && onDispatch ? (
                      <ActionIconButton
                        title="Omborga jo‘natish"
                        color="primary"
                        onClick={() => onDispatch(item)}
                      >
                        <LocalShippingOutlinedIcon fontSize="small" />
                      </ActionIconButton>
                    ) : null}
                    {item.canRejectPurchase && onReject ? (
                      <ActionIconButton
                        title="Rad etish"
                        color="error"
                        onClick={() => onReject(item)}
                      >
                        <BlockOutlinedIcon fontSize="small" />
                      </ActionIconButton>
                    ) : null}
                    <ActionIconButton title="Batafsil" onClick={() => onView(item)}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </ActionIconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
