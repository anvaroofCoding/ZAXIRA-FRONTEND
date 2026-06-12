import { useEffect, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import GavelIcon from '@mui/icons-material/Gavel'
import { PurchaseRequestDocumentDownloadButtons } from '@/features/purchase-requests/components/PurchaseRequestDocumentDownloadButtons'
import VerifiedIcon from '@mui/icons-material/Verified'
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
import { ApprovalDecisionDialog } from '@/features/purchase-requests/components/ApprovalDecisionDialog'
import { ApprovalTimelineSteps } from '@/features/purchase-requests/components/ApprovalTimelineSteps'
import { PurchaseDeadlineDetailRow } from '@/features/purchase-requests/components/PurchaseDeadlineDetailRow'
import { PurchasePeriodDetailRow } from '@/features/purchase-requests/components/PurchasePeriodDetailRow'
import { PurchaseRequestItemsTable } from '@/features/purchase-requests/components/PurchaseRequestItemsTable'
import { ProductPriceCompareDialog } from '@/features/product-prices/components/ProductPriceCompareDialog'
import {
  useConfirmBossDecisionMutation,
  useGetPurchaseRequestByIdQuery,
  useSubmitApprovalDecisionMutation,
} from '@/features/purchase-requests/api/purchaseRequestsApi'
import { formatMemberLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import {
  getDecisionChipColor,
  getStatusChipColor,
} from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { formatDateTime } from '@/shared/utils/formatDate'

const APPROVAL_PAGE_PATH = '/xaridlar/arizalarni-tasdiqlash'

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

export const PurchaseRequestApprovalDetailDialog = ({
  open,
  requestId,
  onClose,
  onDownloadBildirgi,
  onDownloadKelishuv,
  downloading,
  onSuccess,
}) => {
  const [copied, setCopied] = useState(false)
  const [priceItem, setPriceItem] = useState(null)
  const [decisionOpen, setDecisionOpen] = useState(false)
  const [bossOpen, setBossOpen] = useState(false)
  const [bossPreset, setBossPreset] = useState(null)

  const detailQuery = useGetPurchaseRequestByIdQuery(requestId, {
    skip: !open || !requestId,
  })
  const [submitDecision, submitState] = useSubmitApprovalDecisionMutation()
  const [confirmBoss, bossState] = useConfirmBossDecisionMutation()
  const { canCreate } = usePermissions()
  const canSubmitApproval = canCreate(APPROVAL_PAGE_PATH)

  const request = detailQuery.data

  useEffect(() => {
    if (!open) {
      setCopied(false)
      setPriceItem(null)
      setDecisionOpen(false)
      setBossOpen(false)
      setBossPreset(null)
    }
  }, [open])

  const openBossDecision = (decision) => {
    setBossPreset(decision)
    setBossOpen(true)
  }

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

  const handleSubmitDecision = async (payload) => {
    try {
      await submitDecision({ id: requestId, ...payload }).unwrap()
      setDecisionOpen(false)
      onSuccess?.('Qaror saqlandi')
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Qarorni saqlab bo‘lmadi'))
    }
  }

  const handleBossConfirm = async (payload) => {
    const successMessages = {
      APPROVED: 'Ariza tasdiqlandi — sotib olinmoqda',
      PARTIAL: 'Qisman tasdiqlangan — ariza beruvchi tuzatishi kerak',
      REJECTED: 'Ariza rad etildi',
    }

    try {
      await confirmBoss({ id: requestId, ...payload }).unwrap()
      setBossOpen(false)
      setBossPreset(null)
      onSuccess?.(successMessages[payload.decision] ?? 'Qaror saqlandi')
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Qarorni saqlab bo‘lmadi'))
    }
  }

  return (
    <>
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
            Ariza tasdiqlash
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
                  label={request.statusLabel}
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
                  label="Boshliq"
                  value={`${request.boss.displayName} (${request.boss.login})`}
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
                                label={member.decisionLabel}
                              />
                            ) : (
                              <Chip size="small" variant="outlined" label="Kutilmoqda" />
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

              <PurchaseRequestItemsTable
                items={request.items}
                title="Tovarlar va xususiyatlar (ustavga mosligi)"
                subtitle="Bozor narxini ko‘rish uchun qatorni bosing · uzun matn — «To‘liq ko‘rish»"
                onItemClick={setPriceItem}
              />

              <DetailRow label="Sotib olish sababi" value={request.comment} />

              <PurchasePeriodDetailRow request={request} />

              <PurchaseDeadlineDetailRow
                deadline={request.purchaseDeadline}
                mandatory={request.purchaseDeadlineMandatory}
              />

              <BossDecisionAlert request={request} />

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                  Jarayon tarixi va izohlar
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

          {request?.canConfirmBossDecision ? (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<VerifiedIcon fontSize="small" />}
                onClick={() => openBossDecision('APPROVED')}
              >
                Qarorni tasdiqlash
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="info"
                onClick={() => openBossDecision('PARTIAL')}
              >
                Qisman tasdiqlash
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => openBossDecision('REJECTED')}
              >
                Rad etish
              </Button>
            </Box>
          ) : null}

          {request ? (
            <>
              <PurchaseRequestDocumentDownloadButtons
                request={request}
                downloading={downloading}
                size="small"
                onDownloadBildirgi={onDownloadBildirgi}
                onDownloadKelishuv={onDownloadKelishuv}
              />

              {request.canSubmitDecision && canSubmitApproval ? (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<GavelIcon fontSize="small" />}
                  onClick={() => setDecisionOpen(true)}
                >
                  Qaror
                </Button>
              ) : null}
            </>
          ) : null}
        </DialogActions>
      </Dialog>

      <ApprovalDecisionDialog
        open={decisionOpen}
        loading={submitState.isLoading}
        onClose={() => setDecisionOpen(false)}
        onSubmit={handleSubmitDecision}
      />

      <ProductPriceCompareDialog
        open={Boolean(priceItem)}
        item={priceItem}
        onClose={() => setPriceItem(null)}
      />

      <ApprovalDecisionDialog
        open={bossOpen}
        loading={bossState.isLoading}
        title="Boshliq qarori"
        presetDecision={bossPreset}
        onClose={() => {
          setBossOpen(false)
          setBossPreset(null)
        }}
        onSubmit={handleBossConfirm}
      />
    </>
  )
}
