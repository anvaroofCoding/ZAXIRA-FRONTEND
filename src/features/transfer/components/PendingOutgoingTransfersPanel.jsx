import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useGetTransferHistoryQuery } from '@/features/transfer/api/transferApi'
import { getDispatchStatusChipProps } from '@/features/warehouse-dispatches/utils/dispatchStatusDisplay'
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import { formatDateTime } from '@/shared/utils/formatDate'
import { canCancelDispatchForUser } from '@/features/transfer/utils/transferCancel'
import { usePermissions } from '@/shared/hooks/usePermissions'

export const PendingOutgoingTransfersPanel = ({
  viewerStructureId,
  onCancel,
}) => {
  const { user } = usePermissions()
  const historyQuery = useGetTransferHistoryQuery(
    {
      page: 1,
      limit: 25,
      structureId: viewerStructureId || undefined,
    },
    { skip: !viewerStructureId },
  )

  const pendingOutgoing = (historyQuery.data?.items ?? []).filter((item) =>
    canCancelDispatchForUser(item, user),
  )

  if (!viewerStructureId || historyQuery.isLoading || !pendingOutgoing.length) {
    return null
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Kutilayotgan jo‘natilgan transferlar
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Qabul qilinishi kutilayotgan transferlarni bekor qilishingiz mumkin
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={180}>Nakladnoy</TableCell>
              <TableCell width={120}>Qabul qiluvchi</TableCell>
              <TableCell width={160}>Sana</TableCell>
              <TableCell width={140}>Holat</TableCell>
              <TableCell width={90} align="right">
                Tovar
              </TableCell>
              <TableCell width={56} align="center">
                Amal
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingOutgoing.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography component="span" variant="body2" sx={dispatchCodeSx}>
                    {item.dispatchCode}
                  </Typography>
                </TableCell>
                <TableCell>{item.targetStructure?.shortName ?? '—'}</TableCell>
                <TableCell>{formatDateTime(item.dispatchedAt)}</TableCell>
                <TableCell>
                  <Chip size="small" {...getDispatchStatusChipProps(item.status, item.statusLabel)} />
                </TableCell>
                <TableCell align="right">{item.items?.length ?? 0}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Bekor qilish">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onCancel(item)}
                      aria-label="Bekor qilish"
                    >
                      <BlockOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
