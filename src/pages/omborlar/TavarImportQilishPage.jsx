import { useCallback, useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { ActiveSessionsPanel } from '@/features/purchase-requests/components/ActiveSessionsPanel'
import { ProductImportFormDialog } from '@/features/product-import/components/ProductImportFormDialog'
import { ProductImportsHistoryTable } from '@/features/product-import/components/ProductImportsHistoryTable'
import {
  useCreateProductImportSessionMutation,
  useDeleteProductImportSessionMutation,
  useGetProductImportSessionsQuery,
  useSubmitProductImportSessionMutation,
} from '@/features/product-import/api/productImportApi'
import { TAVAR_IMPORT_PAGE_PATH } from '@/features/permissions/constants'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = TAVAR_IMPORT_PAGE_PATH
const MAX_ACTIVE_SESSIONS = 10

export const TavarImportQilishPage = () => {
  const { user: authUser, canAccess, canCreate } = usePermissions()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [deleteSessionTarget, setDeleteSessionTarget] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const isSuperAdmin = authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'
  const hasStructure = Boolean(authUser?.structureId ?? authUser?.structure?.id)
  const hasWarehouse = authUser?.structure?.hasWarehouse === true
  const canViewImportPage = isSuperAdmin || canAccess(PAGE_PATH)
  const canImport = isSuperAdmin || canCreate(PAGE_PATH)
  const canLoadImportHistory = canViewImportPage && (isSuperAdmin || (hasStructure && hasWarehouse))

  const sessionsQuery = useGetProductImportSessionsQuery(undefined, {
    skip: !canImport,
  })

  const [createSession, createSessionState] = useCreateProductImportSessionMutation()
  const [submitImportSession, submitSessionState] = useSubmitProductImportSessionMutation()
  const [deleteImportSession, deleteSessionState] = useDeleteProductImportSessionMutation()

  const activeSessions = useMemo(
    () => sessionsQuery.data?.items ?? [],
    [sessionsQuery.data?.items],
  )

  const activeSession = useMemo(
    () => activeSessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessions, activeSessionId],
  )

  useEffect(() => {
    if (!canImport) return undefined

    const handleOnline = () => {
      void sessionsQuery.refetch()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [canImport, sessionsQuery.refetch])

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

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
      await deleteImportSession(deleteSessionTarget.id).unwrap()

      if (activeSessionId === deleteSessionTarget.id) {
        closeFormDialog()
      }

      setDeleteSessionTarget(null)
      showSnackbar('Faol seans o‘chirildi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Faol seansni o‘chirib bo‘lmadi'), 'error')
    }
  }

  const handleSubmit = useCallback(
    async (payload, { sessionId } = {}) => {
      if (!sessionId) {
        throw new Error('Import seansi topilmadi')
      }

      try {
        const result = await submitImportSession({
          sessionId,
          ...payload,
        }).unwrap()

        closeFormDialog()
        showSnackbar(
          `${result.code} — ${result.itemCount} ta tovar omborga qo‘shildi (${result.totalQuantity} dona)`,
        )
      } catch (error) {
        throw error
      }
    },
    [submitImportSession],
  )

  return (
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
        <Box>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Tavar import qilish
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tovarlarni to‘g‘ridan-to‘g‘ri omborga kiritish. Saqlanganda «Mening omborim»da
            ko‘rinadi va tovar tarixida «Import qilingan» qadam sifatida saqlanadi.
          </Typography>
        </Box>

        {canImport ? (
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
            Import
          </Button>
        ) : null}
      </Box>

      {canImport && activeSessions.length > 0 ? (
        <ActiveSessionsPanel
          sessions={activeSessions}
          loading={sessionsQuery.isLoading}
          deletingId={deleteSessionState.isLoading ? deleteSessionTarget?.id : null}
          maxSessions={sessionsQuery.data?.limit ?? MAX_ACTIVE_SESSIONS}
          infoMessage="To‘ldirilmagan importlar saqlanib qoladi. Istagan paytda davom eting yoki o‘chiring."
          onContinue={handleContinueSession}
          onDelete={handleDeleteSession}
        />
      ) : null}

      {!canImport ? (
        <Alert severity="info">
          Tovar import qilish uchun «Tavar import qilish» sahifasida «Jo‘natish» ruxsatini
          yoqing. Administrator bilan bog‘laning.
        </Alert>
      ) : null}

      <ProductImportsHistoryTable disabled={!canLoadImportHistory} />

      <ProductImportFormDialog
        open={dialogOpen}
        loading={submitSessionState.isLoading}
        session={activeSession}
        sessionId={activeSessionId}
        onClose={closeFormDialog}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={Boolean(deleteSessionTarget)}
        onClose={() => setDeleteSessionTarget(null)}
      >
        <DialogTitle>Faol seansni o‘chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            «{deleteSessionTarget?.title || 'Nomsiz import'}» seansini o‘chirmoqchimisiz?
            Kiritilgan ma’lumotlar saqlanmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSessionTarget(null)}>Bekor qilish</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDeleteSession}
            disabled={deleteSessionState.isLoading}
          >
            O‘chirish
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
