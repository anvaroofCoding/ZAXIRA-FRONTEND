import { useCallback, useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { PurchaseRequestDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestDetailDialog'
import { PurchaseRequestFormDialog } from '@/features/purchase-requests/components/PurchaseRequestFormDialog'
import { ResubmitPurchaseRequestDialog } from '@/features/purchase-requests/components/ResubmitPurchaseRequestDialog'
import { PurchaseRequestsPageSkeleton } from '@/features/purchase-requests/components/PurchaseRequestsPageSkeleton'
import { PurchaseRequestsTable } from '@/features/purchase-requests/components/PurchaseRequestsTable'
import {
  useCreatePurchaseRequestMutation,
  useDeletePurchaseRequestMutation,
  useGetPurchaseRequestsQuery,
  useResubmitPurchaseRequestMutation,
  useUpdatePurchaseRequestMutation,
} from '@/features/purchase-requests/api/purchaseRequestsApi'
import { canDeletePurchaseRequest } from '@/features/purchase-requests/utils/purchaseRequestDelete'
import {
  canEditPurchaseRequestInReview,
  canResubmitPurchaseRequest,
} from '@/features/purchase-requests/utils/purchaseRequestEdit'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = '/xaridlar/arizalar-yuborish'
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const ArizalarYuborishPage = () => {
  const { user: authUser, canDelete: canDeletePage, canUpdate: canUpdatePage } =
    usePermissions()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [downloadingId, setDownloadingId] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [resubmitTarget, setResubmitTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const requestsQuery = useGetPurchaseRequestsQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
  })
  const [createPurchaseRequest, createState] = useCreatePurchaseRequestMutation()
  const [resubmitPurchaseRequest, resubmitState] = useResubmitPurchaseRequestMutation()
  const [deletePurchaseRequest, deleteState] = useDeletePurchaseRequestMutation()
  const [updatePurchaseRequest, updateState] = useUpdatePurchaseRequestMutation()

  const items = useMemo(() => requestsQuery.data?.items ?? [], [requestsQuery.data?.items])
  const total = requestsQuery.data?.total ?? 0

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'
  const canCreate =
    isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'create')

  const canDeleteItem = useCallback(
    (item) =>
      canDeletePage(PAGE_PATH) &&
      canDeletePurchaseRequest(item, { isSuperAdmin }),
    [canDeletePage, isSuperAdmin],
  )

  const canEditItem = useCallback(
    (item) => canEditPurchaseRequestInReview(item, authUser, canUpdatePage),
    [authUser, canUpdatePage],
  )

  const canResubmitItem = useCallback(
    (item) => canResubmitPurchaseRequest(item, authUser, canUpdatePage),
    [authUser, canUpdatePage],
  )

  const isRequestsReady = !requestsQuery.isLoading && !requestsQuery.isUninitialized

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSubmit = async (payload) => {
    try {
      const created = await createPurchaseRequest(payload).unwrap()
      setDialogOpen(false)
      showSnackbar(`Ariza ${created.requestCode} yuborildi`)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Saqlashda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleResubmit = async (payload) => {
    if (!resubmitTarget?.id) return

    try {
      await resubmitPurchaseRequest({ id: resubmitTarget.id, ...payload }).unwrap()
      setResubmitTarget(null)
      setDetailTarget(null)
      showSnackbar('Ariza qayta yuborildi')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Qayta yuborishda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleDeleteRequest = (item) => {
    setDeleteTarget(item)
  }

  const handleEditRequest = (item) => {
    setEditTarget(item)
  }

  const handleUpdate = async (payload) => {
    if (!editTarget?.id) return

    try {
      const updated = await updatePurchaseRequest({ id: editTarget.id, ...payload }).unwrap()
      setEditTarget(null)
      setDetailTarget(null)
      showSnackbar(`Ariza ${updated.requestCode} yangilandi`)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Tahrirlashda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return

    try {
      await deletePurchaseRequest(deleteTarget.id).unwrap()
      setDeleteTarget(null)
      setDetailTarget(null)
      showSnackbar(`Ariza ${deleteTarget.requestCode} o‘chirildi`)
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Arizani o‘chirishda xatolik'), 'error')
    }
  }

  const handleDownload = async (item, type) => {
    setDownloadingId(item.id)

    try {
      const extension = type === 'pdf' ? 'pdf' : 'docx'
      await downloadAuthenticatedFile(
        `/purchase-requests/${item.id}/export/${extension}`,
        `buyurtma-${item.requestCode}.${extension}`,
      )
    } catch (error) {
      showSnackbar(error.message || 'Yuklab olishda xatolik', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={requestsQuery.isLoading}
        isFetching={requestsQuery.isFetching}
        isUninitialized={requestsQuery.isUninitialized}
        hasData={isRequestsReady}
        skeleton={
          <PurchaseRequestsPageSkeleton
            showAddButton={canCreate}
            ariaLabel="Arizalar yuborish yuklanmoqda"
          />
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="h5" component="h1" fontWeight={600}>
              Arizalar yuborish
            </Typography>

            {canCreate ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
              >
                Qo‘shish
              </Button>
            ) : null}
          </Box>

          <TextField
            size="small"
            placeholder="Qidirish"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 280 }, maxWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {requestsQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(requestsQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : (
            <>
              <PurchaseRequestsTable
                items={items}
                downloadingId={downloadingId}
                onView={(item) => setDetailTarget(item)}
                onDownloadPdf={(item) => handleDownload(item, 'pdf')}
                onDownloadDocx={(item) => handleDownload(item, 'docx')}
                onDelete={canDeletePage(PAGE_PATH) ? handleDeleteRequest : undefined}
                canDeleteItem={canDeleteItem}
                onEdit={handleEditRequest}
                canEditItem={canEditItem}
                onResubmit={(item) => setResubmitTarget(item)}
                canResubmitItem={canResubmitItem}
              />

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setPage(0)
                }}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Sahifada:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} / ${count !== -1 ? count : `>${to}`}`
                }
              />
            </>
          )}
        </Box>
      </QuerySkeleton>

      <PurchaseRequestFormDialog
        open={dialogOpen}
        loading={createState.isLoading}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <PurchaseRequestFormDialog
        open={Boolean(editTarget)}
        request={editTarget}
        loading={updateState.isLoading}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />

      <PurchaseRequestDetailDialog
        open={Boolean(detailTarget)}
        requestId={detailTarget?.id}
        downloading={downloadingId === detailTarget?.id}
        deleting={deleteState.isLoading}
        onClose={() => setDetailTarget(null)}
        onDownloadPdf={(item) => handleDownload(item, 'pdf')}
        onDownloadDocx={(item) => handleDownload(item, 'docx')}
        onDelete={canDeletePage(PAGE_PATH) ? handleDeleteRequest : undefined}
        onEdit={handleEditRequest}
        onResubmit={(item) => {
          setResubmitTarget(item)
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleteState.isLoading && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Arizani o‘chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{deleteTarget?.requestCode}</strong> arizasini butunlay o‘chirasizmi? Bu amalni
            qaytarib bo‘lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteState.isLoading}>
            Bekor qilish
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteState.isLoading}
            onClick={handleConfirmDelete}
            startIcon={deleteState.isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            O‘chirish
          </Button>
        </DialogActions>
      </Dialog>

      <ResubmitPurchaseRequestDialog
        open={Boolean(resubmitTarget)}
        request={resubmitTarget}
        loading={resubmitState.isLoading}
        onClose={() => setResubmitTarget(null)}
        onSubmit={handleResubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
