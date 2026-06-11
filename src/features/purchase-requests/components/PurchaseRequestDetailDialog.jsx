import { useEffect, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PurchaseRequestDocumentDownloadButtons } from '@/features/purchase-requests/components/PurchaseRequestDocumentDownloadButtons'
import { SubmittedDocumentsSection } from '@/features/purchase-requests/components/SubmittedDocumentsSection'
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
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { ProductPriceCompareDialog } from '@/features/product-prices/components/ProductPriceCompareDialog'
import { PurchaseRequestItemsTable } from '@/features/purchase-requests/components/PurchaseRequestItemsTable'
import Typography from '@mui/material/Typography'
import { ApprovalTimelineSteps } from '@/features/purchase-requests/components/ApprovalTimelineSteps'
import { PurchaseDeadlineDetailRow } from '@/features/purchase-requests/components/PurchaseDeadlineDetailRow'
import { PurchasePeriodDetailRow } from '@/features/purchase-requests/components/PurchasePeriodDetailRow'
import { formatMemberLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import { BossDecisionAlert } from '@/features/purchase-requests/components/BossDecisionAlert'
import { useGetPurchaseRequestByIdQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { canDeletePurchaseRequest } from '@/features/purchase-requests/utils/purchaseRequestDelete'
import {
  canEditPurchaseRequestInReview,
  canResubmitPurchaseRequest,
} from '@/features/purchase-requests/utils/purchaseRequestEdit'
import { getStatusChipColor } from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { formatDateTime } from '@/shared/utils/formatDate'

const SUBMIT_PAGE_PATH = '/xaridlar/arizalar-yuborish'

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
  onDownloadBildirgi,
  onDownloadKelishuv,
  downloading,
  onResubmit,
  onEdit,
  onDelete,
  deleting = false,
}) => {
  const { user: authUser, canDelete: canDeletePage, canUpdate: canUpdatePage } =
    usePermissions()
  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'
  const hasDeletePermission = canDeletePage(SUBMIT_PAGE_PATH)
  const [copied, setCopied] = useState(false)
  const [priceItem, setPriceItem] = useState(null)
  const detailQuery = useGetPurchaseRequestByIdQuery(requestId, {
    skip: !open || !requestId,
  })

  const request = detailQuery.data
  const showDelete =
    hasDeletePermission &&
    Boolean(onDelete && request) &&
    canDeletePurchaseRequest(request, { isSuperAdmin })

  const showEdit = Boolean(
    onEdit && request && canEditPurchaseRequestInReview(request, authUser, canUpdatePage),
  )
  const showResubmit = Boolean(
    onResubmit && request && canResubmitPurchaseRequest(request, authUser, canUpdatePage),
  )

  useEffect(() => {
    if (!open) {
      setCopied(false)
      setPriceItem(null)
    }
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
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                Sotib olish sababi
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {request.comment?.trim() ? request.comment : '—'}
              </Typography>
            </Box>

            <PurchasePeriodDetailRow request={request} />

            <SubmittedDocumentsSection
              request={request}
              downloading={downloading}
              onDownloadBildirgi={onDownloadBildirgi}
              onDownloadKelishuv={onDownloadKelishuv}
            />

            <PurchaseRequestItemsTable
              items={request.items}
              title="Tovarlar"
              subtitle="Bozor narxini ko‘rish uchun qatorni bosing"
              onItemClick={setPriceItem}
            />

            <PurchaseDeadlineDetailRow
              deadline={request.purchaseDeadline}
              mandatory={request.purchaseDeadlineMandatory}
            />

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
        <Button onClick={onClose} disabled={deleting}>
          Yopish
        </Button>
        {showEdit ? (
          <Button
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            disabled={downloading}
            onClick={() => onEdit(request)}
          >
            Tahrirlash
          </Button>
        ) : null}
        {showDelete ? (
          <Button
            color="error"
            variant="outlined"
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlinedIcon />}
            disabled={deleting || downloading}
            onClick={() => onDelete(request)}
          >
            O‘chirish
          </Button>
        ) : null}
        {showResubmit ? (
          <Button variant="contained" color="info" onClick={() => onResubmit(request)}>
            Qayta yuborish
          </Button>
        ) : null}
        {request ? (
          <PurchaseRequestDocumentDownloadButtons
            request={request}
            downloading={downloading}
            onDownloadBildirgi={onDownloadBildirgi}
            onDownloadKelishuv={onDownloadKelishuv}
          />
        ) : null}
      </DialogActions>

      <ProductPriceCompareDialog
        open={Boolean(priceItem)}
        item={priceItem}
        onClose={() => setPriceItem(null)}
      />
    </Dialog>
  )
}
