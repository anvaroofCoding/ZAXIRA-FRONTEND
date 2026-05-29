import { useEffect, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DescriptionIcon from '@mui/icons-material/Description'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
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
import { ApprovalTimelineSteps } from '@/features/purchase-requests/components/ApprovalTimelineSteps'
import { formatMemberLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import { BossDecisionAlert } from '@/features/purchase-requests/components/BossDecisionAlert'
import { useGetPurchaseRequestByIdQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { getStatusChipColor } from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { formatDateTime } from '@/shared/utils/formatDate'

const DetailRow = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ mt: 0.25, whiteSpace: 'pre-wrap' }}>
      {value || '—'}
    </Typography>
  </Box>
)

export const PurchaseRequestDetailDialog = ({
  open,
  requestId,
  onClose,
  onDownloadPdf,
  onDownloadDocx,
  downloading,
  onResubmit,
}) => {
  const [copied, setCopied] = useState(false)
  const detailQuery = useGetPurchaseRequestByIdQuery(requestId, {
    skip: !open || !requestId,
  })

  const request = detailQuery.data

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  const handleCopyId = async () => {
    if (!request?.requestCode) return

    try {
      await navigator.clipboard.writeText(request.requestCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          pr: 2,
        }}
      >
        <Typography variant="h6" component="span" fontWeight={600}>
          Ariza ma’lumotlari
        </Typography>

        {request ? (
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, alignItems: 'center' }}>
            <Typography variant="h6" component="span" fontWeight={600}>
              {request.requestCode}
            </Typography>
            <Tooltip title={copied ? 'Nusxalandi' : 'Nusxalash'}>
              <IconButton
                size="small"
                onClick={handleCopyId}
                aria-label="Ariza ID nusxalash"
              >
                {copied ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <ContentCopyIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null}
      </DialogTitle>

      <DialogContent dividers>
        {detailQuery.isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : null}

        {detailQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(detailQuery.error, 'Arizani yuklab bo‘lmadi')}
          </Alert>
        ) : null}

        {request ? (
          <Stack spacing={2.5} sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Chip
                size="small"
                color={getStatusChipColor(request.status)}
                label={request.statusLabel}
                sx={{ flexShrink: 0 }}
              />
              <Box sx={{ ml: 'auto', textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Yaratilgan sana
                </Typography>
                <Typography variant="body2" noWrap>
                  {formatDateTime(request.createdAt)}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1.5}>
              <DetailRow
                label="Ariza beruvchi"
                value={`${request.applicant.displayName} (${request.applicant.login})`}
              />
              <DetailRow
                label="Ariza beruvchi tarkibiy tuzilma"
                value={
                  request.applicantStructure
                    ? `${request.applicantStructure.fullName} (${request.applicantStructure.shortName})`
                    : '—'
                }
              />
              <DetailRow
                label="Boshliq"
                value={`${request.boss.displayName} (${request.boss.login})`}
              />
            </Stack>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Komissiya a’zolari
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
                {request.commissionMembers.map((member) => (
                  <Typography key={member.userId} component="li" variant="body2">
                    {formatMemberLabel(member)}
                  </Typography>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Tovarlar
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={48}>T/R</TableCell>
                      <TableCell>Tovar nomi</TableCell>
                      <TableCell>Tovar xususiyati</TableCell>
                      <TableCell width={72}>Soni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {request.items.map((item, index) => (
                      <TableRow key={`${item.name}-${index}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                          {item.characteristics}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                Izoh
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {request.comment?.trim() ? request.comment : '—'}
              </Typography>
            </Box>

            <BossDecisionAlert request={request} />

            {request.history?.length ? (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                  Jarayon tarixi
                </Typography>
                <ApprovalTimelineSteps history={request.history} />
              </Box>
            ) : null}
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Yopish</Button>
        {request?.canResubmit && onResubmit ? (
          <Button variant="contained" color="info" onClick={() => onResubmit(request)}>
            Qayta yuborish
          </Button>
        ) : null}
        {request ? (
          <>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              disabled={downloading}
              onClick={() => onDownloadPdf(request)}
            >
              PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              disabled={downloading}
              onClick={() => onDownloadDocx(request)}
            >
              Word
            </Button>
          </>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}
