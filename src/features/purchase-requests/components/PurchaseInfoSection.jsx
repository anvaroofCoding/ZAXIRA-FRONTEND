import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '@/shared/utils/formatDate'
import { formatUzs } from '@/shared/utils/formatUzs'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

export const PurchaseInfoSection = ({ request }) => {
  const purchase = request?.purchase

  if (!purchase) {
    return null
  }

  const handleDownloadFile = (file) => {
    downloadAuthenticatedFile(
      `/purchase-requests/${request.id}/purchase/files/${file.storedName}`,
      file.originalName,
    ).catch(() => {})
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        Xarid ma’lumotlari
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2">
            <Typography component="span" color="text.secondary">
              Firma / joy nomi:{' '}
            </Typography>
            {purchase.vendorName}
          </Typography>

          <Typography variant="body2">
            <Typography component="span" color="text.secondary">
              Xarid qilgan:{' '}
            </Typography>
            {purchase.purchasedBy.displayName} — {formatDateTime(purchase.purchasedAt)}
          </Typography>

          {purchase.comment?.trim() ? (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              <Typography component="span" color="text.secondary">
                Izoh:{' '}
              </Typography>
              {purchase.comment}
            </Typography>
          ) : null}

          {purchase.links?.length ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Havolalar
              </Typography>
              {purchase.links.map((link, index) => (
                <Link
                  key={`${link.url}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                >
                  {link.label?.trim() ? `${link.label}: ` : ''}
                  {link.url}
                </Link>
              ))}
            </Stack>
          ) : null}

          {purchase.files?.length ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Fayllar
              </Typography>
              {purchase.files.map((file) => (
                <Link
                  key={file.storedName}
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => handleDownloadFile(file)}
                  sx={{ textAlign: 'left' }}
                >
                  {file.label} ({file.originalName})
                </Link>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tovar</TableCell>
              <TableCell width={140} align="right">
                Miqdor
              </TableCell>
              <TableCell width={160} align="right">
                1 dona narxi
              </TableCell>
              <TableCell width={190} align="right">
                Jami
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {request.items.map((item, index) => (
              (() => {
                const unit = Number(item.purchaseAmount ?? 0)
                const total = unit * Number(item.quantity ?? 0)
                return (
              <TableRow key={`${item.name}-${index}`}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {item.characteristics}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{item.quantity} ta</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{formatUzs(unit)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>
                    {formatUzs(total)}
                  </Typography>
                </TableCell>
              </TableRow>
                )
              })()
            ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Jami</TableCell>
              <TableCell />
              <TableCell />
              <TableCell sx={{ fontWeight: 700 }} align="right">
                <Typography variant="body2">{formatUzs(request.purchaseTotalAmount)}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
