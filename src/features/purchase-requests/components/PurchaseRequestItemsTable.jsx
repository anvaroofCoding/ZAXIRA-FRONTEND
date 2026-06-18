import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
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
import {
  formatPurchaseVatRateLabel,
  getPurchaseLineTotal,
} from '@/features/purchase-requests/utils/purchaseDisplayUtils'
import { formatUzs } from '@/shared/utils/formatUzs'

export const PurchaseRequestItemsTable = ({
  items,
  title,
  subtitle,
  onItemClick,
  showPurchaseInfo = false,
}) => {
  const clickable = Boolean(onItemClick)
  const hasPurchasedItems = items.some((item) => item.isPurchased)

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

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={48}>T/R</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Tovar nomi</TableCell>
              <TableCell sx={{ maxWidth: 360 }}>Tovar xususiyati</TableCell>
              <TableCell width={72}>Soni</TableCell>
              <TableCell width={100}>Birlik</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Ishlab chiqarilgan davlati</TableCell>
              {showPurchaseInfo && hasPurchasedItems ? (
                <>
                  <TableCell width={120} align="right">
                    Summa (1 dona)
                  </TableCell>
                  <TableCell width={90} align="right">
                    % QQS
                  </TableCell>
                  <TableCell width={120} align="right">
                    QQS (1 dona)
                  </TableCell>
                  <TableCell width={130} align="right">
                    Xarid jami
                  </TableCell>
                </>
              ) : null}
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
                <TableCell sx={{ fontWeight: 500, verticalAlign: 'top', minWidth: 200, maxWidth: 280 }}>
                  <Stack spacing={0.5}>
                    <PurchaseRequestItemCharacteristicsCell
                      value={item.name}
                      dialogTitle="Tovar nomi"
                      emphasized
                    />
                    {item.isPurchased ? (
                      <Chip size="small" color="success" label="Xarid qilindi" sx={{ width: 'fit-content' }} />
                    ) : null}
                    {item.isPurchaseUnavailable ? (
                      <Chip
                        size="small"
                        color="warning"
                        label="Xarid qilib bo‘lmaydi"
                        sx={{ width: 'fit-content' }}
                      />
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top', minWidth: 220, maxWidth: 300 }}>
                  <PurchaseRequestItemCharacteristicsCell value={item.characteristics} />
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{item.quantity}</TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{item.unit || '—'}</TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{item.manufacturingCountry || '—'}</TableCell>
                {showPurchaseInfo && hasPurchasedItems ? (
                  <>
                    <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                      {item.isPurchased ? formatUzs(item.purchaseAmount ?? 0) : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                      {item.isPurchased ? formatPurchaseVatRateLabel(item.purchaseVatRate) : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                      {item.isPurchased ? formatUzs(item.purchaseVatAmount ?? 0) : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                      {item.isPurchased ? (
                        <Typography variant="body2" fontWeight={700}>
                          {formatUzs(getPurchaseLineTotal(item))}
                        </Typography>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
