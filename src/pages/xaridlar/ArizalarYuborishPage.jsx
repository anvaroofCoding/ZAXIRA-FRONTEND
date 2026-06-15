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
import { ActiveSessionsPanel } from '@/features/purchase-requests/components/ActiveSessionsPanel'
import { PurchaseRequestDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestDetailDialog'
import { PurchaseRequestDocumentWizardDialog } from '@/features/purchase-requests/components/PurchaseRequestDocumentWizardDialog'
import { PurchaseRequestFormDialog } from '@/features/purchase-requests/components/PurchaseRequestFormDialog'
import { ResubmitPurchaseRequestDialog } from '@/features/purchase-requests/components/ResubmitPurchaseRequestDialog'
import { PurchaseRequestsPageSkeleton } from '@/features/purchase-requests/components/PurchaseRequestsPageSkeleton'
import { PurchaseRequestsTable } from '@/features/purchase-requests/components/PurchaseRequestsTable'
import {
  useCreatePurchaseRequestMutation,
  useCreateEditPurchaseRequestSessionMutation,
  useCreatePurchaseRequestSessionMutation,
  useDeletePurchaseRequestMutation,
  useDeletePurchaseRequestSessionMutation,
  useGetPurchaseRequestSessionsQuery,
  useGetPurchaseRequestsQuery,
  useResubmitPurchaseRequestMutation,
  useSavePurchaseRequestSessionMutation,
  useSubmitPurchaseRequestSessionMutation,
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
import { useSubmittedDocumentDownload } from '@/features/purchase-requests/hooks/useSubmittedDocumentDownload'
import { isLocalActiveSessionId } from '@/features/purchase-requests/utils/activeSessionsStorage'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = '/xaridlar/arizalar-yuborish'
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]
const MAX_ACTIVE_SESSIONS = 10

export const ArizalarYuborishPage = () => {
  const { user: authUser, canDelete: canDeletePage, canUpdate: canUpdatePage } =
    usePermissions()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [deleteSessionTarget, setDeleteSessionTarget] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [detailTarget, setDetailTarget] = useState(null)
  const [resubmitTarget, setResubmitTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [documentWizardSessionId, setDocumentWizardSessionId] = useState(null)
  const [documentWizardPayload, setDocumentWizardPayload] = useState(null)
  const [editDocumentWizard, setEditDocumentWizard] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'
  const canCreate =
    isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'create')

  const requestsQuery = useGetPurchaseRequestsQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
  })
  const sessionsQuery = useGetPurchaseRequestSessionsQuery(undefined, {
    skip: !canCreate,
  })

  useEffect(() => {
    if (!canCreate) return undefined

    const handleOnline = () => {
      void sessionsQuery.refetch()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [canCreate, sessionsQuery.refetch])
  const [createSession, createSessionState] = useCreatePurchaseRequestSessionMutation()
  const [submitPurchaseRequestSession, submitSessionState] =
    useSubmitPurchaseRequestSessionMutation()
  const [createPurchaseRequest, createState] = useCreatePurchaseRequestMutation()
  const [savePurchaseRequestSession] = useSavePurchaseRequestSessionMutation()
  const [deletePurchaseRequestSession, deleteSessionState] =
    useDeletePurchaseRequestSessionMutation()
  const [resubmitPurchaseRequest, resubmitState] = useResubmitPurchaseRequestMutation()
  const [deletePurchaseRequest, deleteState] = useDeletePurchaseRequestMutation()
  const [createEditSession, createEditSessionState] =
    useCreateEditPurchaseRequestSessionMutation()

  const items = useMemo(() => requestsQuery.data?.items ?? [], [requestsQuery.data?.items])
  const total = requestsQuery.data?.total ?? 0
  const activeSessions = useMemo(
    () => sessionsQuery.data?.items ?? [],
    [sessionsQuery.data?.items],
  )
  const activeSession = useMemo(
    () => activeSessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessions, activeSessionId],
  )

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

  const { downloadingId, downloadHandlers } = useSubmittedDocumentDownload({
    onError: (error) => showSnackbar(error.message || 'Yuklab olishda xatolik', 'error'),
  })

  const closeFormDialog = () => {
    setDialogOpen(false)
    setActiveSessionId(null)
  }

  const handleOpenNewSession = async () => {
    if (activeSessions.length >= MAX_ACTIVE_SESSIONS) {
      showSnackbar(
        `Ko‘pi bilan ${MAX_ACTIVE_SESSIONS} ta faol seans bo‘lishi mumkin`,
        'warning',
      )
      return
    }

    try {
      const created = await createSession().unwrap()
      setActiveSessionId(created.id)
      setDialogOpen(true)
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Yangi seans ochib bo‘lmadi'), 'error')
    }
  }

  const handleContinueSession = (session) => {
    setActiveSessionId(session.id)
    setDialogOpen(true)
  }

  const handleDeleteSession = (session) => {
    setDeleteSessionTarget(session)
  }

  const handleConfirmDeleteSession = async () => {
    if (!deleteSessionTarget?.id) return

    try {
      await deletePurchaseRequestSession(deleteSessionTarget.id).unwrap()

      if (activeSessionId === deleteSessionTarget.id) {
        closeFormDialog()
      }

      setDeleteSessionTarget(null)
      showSnackbar('Faol seans o‘chirildi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Faol seansni o‘chirib bo‘lmadi'), 'error')
    }
  }

  const handleContinueToDocuments = async (payload, { sessionId } = {}) => {
    if (!sessionId || isLocalActiveSessionId(sessionId)) {
      throw new Error(
        'Hujjat tahriri uchun server seansi kerak. Yangi ariza ochib qayta urinib ko‘ring.',
      )
    }

    closeFormDialog()
    setDocumentWizardPayload(payload)
    setDocumentWizardSessionId(sessionId)
  }

  const handleWizardSubmitted = (created) => {
    setDocumentWizardSessionId(null)
    setDocumentWizardPayload(null)
    setActiveSessionId(null)

    if (created?.id) {
      setDetailTarget(created)
    }

    showSnackbar(`Ariza ${created.requestCode} yuborildi`)
  }

  const handleSubmit = async (payload, { sessionId } = {}) => {
    try {
      let created

      if (sessionId) {
        if (isLocalActiveSessionId(sessionId)) {
          created = await createPurchaseRequest(payload).unwrap()
          await deletePurchaseRequestSession(sessionId).unwrap()
        } else {
          try {
            created = await submitPurchaseRequestSession(sessionId).unwrap()
          } catch (sessionError) {
            const status = sessionError?.status ?? sessionError?.originalStatus

            if (status === 404) {
              try {
                await savePurchaseRequestSession({ id: sessionId, ...payload }).unwrap()
              } catch {
                // Eski backend — to‘g‘ridan-to‘g‘ri yuborish
              }

              created = await createPurchaseRequest(payload).unwrap()
            } else {
              throw sessionError
            }
          }
        }
      } else {
        created = await createPurchaseRequest(payload).unwrap()
      }

      closeFormDialog()
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

  const handleContinueToEditDocuments = async (payload) => {
    if (!editTarget?.id) return

    try {
      const session = await createEditSession(editTarget.id).unwrap()

      await savePurchaseRequestSession({ id: session.id, ...payload }).unwrap()

      setEditTarget(null)
      setEditDocumentWizard({
        sessionId: session.id,
        requestId: editTarget.id,
        payload,
      })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Tahrirlash seansini ochib bo‘lmadi')
      throw new Error(message, { cause: error })
    }
  }

  const handleEditWizardUpdated = async (updated) => {
    const sessionId = editDocumentWizard?.sessionId

    setEditDocumentWizard(null)

    if (sessionId) {
      try {
        await deletePurchaseRequestSession(sessionId).unwrap()
      } catch {
        // seans allaqachon o‘chirilgan bo‘lishi mumkin
      }
    }

    if (updated?.id) {
      setDetailTarget(updated)
    }

    showSnackbar(`Ariza ${updated?.requestCode ?? ''} yangilandi`)
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
                startIcon={
                  createSessionState.isLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                disabled={createSessionState.isLoading}
                onClick={handleOpenNewSession}
              >
                Yangi ariza
              </Button>
            ) : null}
          </Box>

          {canCreate && activeSessions.length > 0 ? (
            <ActiveSessionsPanel
              sessions={activeSessions}
              loading={sessionsQuery.isLoading}
              deletingId={deleteSessionState.isLoading ? deleteSessionTarget?.id : null}
              maxSessions={sessionsQuery.data?.limit ?? MAX_ACTIVE_SESSIONS}
              onContinue={handleContinueSession}
              onDelete={handleDeleteSession}
            />
          ) : null}

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
                {...downloadHandlers}
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
        loading={submitSessionState.isLoading || createState.isLoading}
        session={activeSession}
        sessionId={activeSessionId}
        onClose={closeFormDialog}
        onSubmit={handleContinueToDocuments}
        submitLabel="Davom etish"
      />

      <PurchaseRequestDocumentWizardDialog
        open={Boolean(documentWizardSessionId)}
        mode="create"
        sessionId={documentWizardSessionId}
        sessionPayload={documentWizardPayload}
        onClose={() => {
          setDocumentWizardSessionId(null)
          setDocumentWizardPayload(null)
        }}
        onSubmitted={handleWizardSubmitted}
      />

      <PurchaseRequestDocumentWizardDialog
        open={Boolean(editDocumentWizard)}
        mode="edit"
        requestId={editDocumentWizard?.requestId ?? null}
        sessionId={editDocumentWizard?.sessionId ?? null}
        sessionPayload={editDocumentWizard?.payload ?? null}
        onClose={() => setEditDocumentWizard(null)}
        onUpdated={handleEditWizardUpdated}
      />

      <PurchaseRequestFormDialog
        open={Boolean(editTarget)}
        request={editTarget}
        loading={createEditSessionState.isLoading}
        onClose={() => setEditTarget(null)}
        onSubmit={handleContinueToEditDocuments}
        submitLabel="Davom etish"
      />

      <PurchaseRequestDetailDialog
        open={Boolean(detailTarget)}
        requestId={detailTarget?.id}
        downloading={downloadingId === detailTarget?.id}
        deleting={deleteState.isLoading}
        onClose={() => setDetailTarget(null)}
        {...downloadHandlers}
        onDelete={canDeletePage(PAGE_PATH) ? handleDeleteRequest : undefined}
        onEdit={handleEditRequest}
        onResubmit={(item) => {
          setResubmitTarget(item)
        }}
      />

      <Dialog
        open={Boolean(deleteSessionTarget)}
        onClose={() => !deleteSessionState.isLoading && setDeleteSessionTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Faol seansni o‘chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{deleteSessionTarget?.title || 'Faol seans'}</strong> o‘chirilsinmi? Saqlangan
            ma’lumotlar yo‘qoladi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteSessionTarget(null)}
            disabled={deleteSessionState.isLoading}
          >
            Bekor qilish
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteSessionState.isLoading}
            onClick={handleConfirmDeleteSession}
            startIcon={
              deleteSessionState.isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            O‘chirish
          </Button>
        </DialogActions>
      </Dialog>

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
