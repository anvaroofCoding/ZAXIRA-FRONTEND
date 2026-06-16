import { useEffect, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { PurchaseRequestDocumentDownloadButtons } from '@/features/purchase-requests/components/PurchaseRequestDocumentDownloadButtons'
import { BossDecisionAlert } from '@/features/purchase-requests/components/BossDecisionAlert'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
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
import { PurchaseDeadlineDetailRow } from '@/features/purchase-requests/components/PurchaseDeadlineDetailRow'
import { PurchasePeriodDetailRow } from '@/features/purchase-requests/components/PurchasePeriodDetailRow'
import { PurchaseInfoSection } from '@/features/purchase-requests/components/PurchaseInfoSection'
import { PurchaseRequestItemsTable } from '@/features/purchase-requests/components/PurchaseRequestItemsTable'
import { useGetPurchaseRequestByIdQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { formatMemberLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import { formatBossDocumentName } from '@/features/purchase-requests/utils/formatBossDocumentName'
import {
  getApprovalDecisionLabel,
  getDecisionChipColor,
  getPurchaseRequestStatusLabel,
  getStatusChipColor,
} from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'
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

export const PurchaseRequestReadOnlyDetailDialog = ({
  open,
  requestId,
  purchasingView = false,
  historyView = false,
  onClose,
  onDownloadBildirgi,
  onDownloadKelishuv,
  downloading,
  onPurchase,
  onReject,
  onDispatch,
  onDispatchBatch,
}) => {
  const [copied, setCopied] = useState(false)
  const detailQuery = useGetPurchaseRequestByIdQuery(
    { id: requestId, purchasingView, historyView },
    {
      skip: !open || !requestId,
    },
  )

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
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
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
              <IconButton size="small" onClick={handleCopyId} aria-label="Ariza ID nusxalash">
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
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Chip
                size="small"
                color={getStatusChipColor(request.status)}
                label={getPurchaseRequestStatusLabel(request.status, request.statusLabel)}
              />
              <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Yaratilgan sana
                </Typography>
                <Typography variant="body2">{formatDateTime(request.createdAt)}</Typography>
              </Box>
            </Box>

            <Stack spacing={1.5}>
              <DetailRow
                label="Ariza beruvchi"
                value={`${request.applicant.displayName} (${request.applicant.login})`}
              />
              <DetailRow
                label="Tarkibiy tuzilma"
                value={
                  request.applicantStructure
                    ? `${request.applicantStructure.fullName} (${request.applicantStructure.shortName})`
                    : '—'
                }
              />
              <DetailRow
                label="Tuzilma raxbari"
                value={request.applicantStructure?.leaderName?.trim() || '—'}
              />
              <DetailRow
                label="Boshliq"
                value={`${formatBossDocumentName(request.boss)} (${request.boss.login})`}
              />
            </Stack>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Komissiya a’zolari va qarorlari
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>F.I.Sh</TableCell>
                      <TableCell width={160}>Qaror</TableCell>
                      <TableCell>Izoh</TableCell>
                      <TableCell width={140}>Sana</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {request.memberDecisions.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell>{formatMemberLabel(member)}</TableCell>
                        <TableCell>
                            {member.decision ? (
                              <Chip
                                size="small"
                                color={getDecisionChipColor(member.decision)}
                                label={getApprovalDecisionLabel(
                                  member.decision,
                                  member.decisionLabel,
                                )}
                              />
                            ) : (
                              <Chip
                                size="small"
                                variant="outlined"
                                color="warning"
                                label={getApprovalDecisionLabel(
                                  member.decision,
                                  member.decisionLabel,
                                )}
                              />
                            )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                          {member.comment?.trim() || '—'}
                        </TableCell>
                        <TableCell>
                          {member.decidedAt ? formatDateTime(member.decidedAt) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <PurchaseRequestItemsTable items={request.items} title="Tovarlar" />

            <DetailRow label="Sotib olish sababi" value={request.comment} />

            <PurchasePeriodDetailRow request={request} />

            <PurchaseDeadlineDetailRow
              deadline={request.purchaseDeadline}
              mandatory={request.purchaseDeadlineMandatory}
            />

            <BossDecisionAlert request={request} />

            {request.purchaseBatches?.length || request.purchaseUnavailableBatches?.length ? (
              <>
                <Divider />
                <PurchaseInfoSection
                  request={request}
                  onDispatchBatch={
                    onDispatchBatch
                      ? (batch) => onDispatchBatch(request, batch)
                      : undefined
                  }
                />
              </>
            ) : null}

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Jarayon tarixi
              </Typography>
              <ApprovalTimelineSteps history={request.history} />
            </Box>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button size="small" onClick={onClose}>
          Yopish
        </Button>
        {request?.canRejectPurchase && onReject ? (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onReject(request)}
          >
            Rad etish
          </Button>
        ) : null}
        {request?.canCompletePurchase && onPurchase ? (
          <Button size="small" variant="contained" color="success" onClick={() => onPurchase(request)}>
            Xarid qilish
          </Button>
        ) : null}
        {request?.warehouseDispatch ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              downloadAuthenticatedFile(
                `/warehouse-dispatches/${request.warehouseDispatch.id}/nakladnoy/pdf`,
                `nakladnoy-${request.warehouseDispatch.dispatchCode}.pdf`,
              )
            }
          >
            Nakladnoy PDF
          </Button>
        ) : null}
        {request ? (
          <PurchaseRequestDocumentDownloadButtons
            request={request}
            downloading={downloading}
            size="small"
            onDownloadBildirgi={onDownloadBildirgi}
            onDownloadKelishuv={onDownloadKelishuv}
          />
        ) : null}
      </DialogActions>
    </Dialog>
  )
}
