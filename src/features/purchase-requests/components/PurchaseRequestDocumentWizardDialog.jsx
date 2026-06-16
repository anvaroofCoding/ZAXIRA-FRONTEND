import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { ForceLightModeScope } from '@/shared/theme/ForceLightModeScope'
import {
  usePreparePurchaseRequestDocumentsMutation,
  useResubmitPurchaseRequestWithDocumentsMutation,
  useSubmitPurchaseRequestSessionMutation,
  useUpdatePurchaseRequestWithDocumentsMutation,
  useUploadSessionDocumentMutation,
} from '@/features/purchase-requests/api/purchaseRequestsApi'
import { exportSuperDocBlob } from '@/features/purchase-requests/utils/exportSuperDocBlob'
import { fetchSessionDocumentFile } from '@/features/purchase-requests/utils/fetchSessionDocumentFile'

const SuperDocEditorPanel = lazy(() =>
  import('@/features/purchase-requests/components/SuperDocEditorPanel').then((module) => ({
    default: module.SuperDocEditorPanel,
  })),
)
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const STEPS = ['Bildirgi', 'Kelishuv varaqasi']

export const PurchaseRequestDocumentWizardDialog = ({
  open,
  mode = 'create',
  requestId = null,
  sessionId,
  sessionPayload = null,
  onClose,
  onSubmitted,
  onUpdated,
  onResubmitted,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [prepared, setPrepared] = useState(false)
  const [error, setError] = useState('')
  const [documentFile, setDocumentFile] = useState(null)
  const [documentLoading, setDocumentLoading] = useState(false)
  const [superdocInstance, setSuperdocInstance] = useState(null)
  const [saving, setSaving] = useState(false)
  const [bildirgiFile, setBildirgiFile] = useState(null)

  const docType = activeStep === 0 ? 'bildirgi' : 'kelishuv'
  const [prepareDocuments, prepareState] = usePreparePurchaseRequestDocumentsMutation()
  const [uploadDocument, uploadState] = useUploadSessionDocumentMutation()
  const [submitSession, submitState] = useSubmitPurchaseRequestSessionMutation()
  const [updateWithDocuments, updateWithDocumentsState] =
    useUpdatePurchaseRequestWithDocumentsMutation()
  const [resubmitWithDocuments, resubmitWithDocumentsState] =
    useResubmitPurchaseRequestWithDocumentsMutation()

  const isEditMode = mode === 'edit'
  const isResubmitMode = mode === 'resubmit'

  const resetEditorState = useCallback(() => {
    setDocumentFile(null)
    setSuperdocInstance(null)
    setDocumentLoading(false)
  }, [])

  useEffect(() => {
    if (!open) {
      setActiveStep(0)
      setPrepared(false)
      setError('')
      setSaving(false)
      setBildirgiFile(null)
      resetEditorState()
    }
  }, [open, resetEditorState])

  useEffect(() => {
    if (!open || !sessionId || prepared) return

    const runPrepare = async () => {
      try {
        await prepareDocuments({
          sessionId,
          sessionPayload: sessionPayload ?? undefined,
        }).unwrap()
        setPrepared(true)
      } catch (prepareError) {
        setError(getApiErrorMessage(prepareError, 'Hujjatlarni tayyorlab bo‘lmadi'))
      }
    }

    runPrepare()
  }, [open, sessionId, sessionPayload, prepared, prepareDocuments])

  useEffect(() => {
    if (!open || !sessionId || !prepared) return

    const loadDocument = async () => {
      resetEditorState()
      setDocumentLoading(true)
      setError('')

      try {
        const file = await fetchSessionDocumentFile(sessionId, docType)
        setDocumentFile(file)
      } catch (loadError) {
        setError(loadError.message || 'Hujjatni ochib bo‘lmadi')
      } finally {
        setDocumentLoading(false)
      }
    }

    loadDocument()
  }, [open, sessionId, prepared, docType, resetEditorState])

  const stepInfo = useMemo(() => {
    if (activeStep === 0) {
      return {
        title: 'Bildirgi',
        hint: 'Word ko‘rinishida tahrirlang. QR kodni imzo o‘rniga kerakli joyga qo‘ying.',
      }
    }

    return {
      title: 'Kelishuv varaqasi',
      hint: 'Kelishuv matnini tekshiring va kerak bo‘lsa tahrirlang.',
    }
  }, [activeStep])

  const isBusy =
    prepareState.isLoading ||
    documentLoading ||
    uploadState.isLoading ||
    submitSession.isLoading ||
    updateWithDocumentsState.isLoading ||
    resubmitWithDocumentsState.isLoading ||
    saving

  const handleEditorReady = useCallback((instance) => {
    setSuperdocInstance(instance)
  }, [])

  const exportCurrentDocumentFile = async (type = docType) => {
    const blob = await exportSuperDocBlob(superdocInstance)
    return new File([blob], `${type}.docx`, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  }

  const saveCurrentDocument = async () => {
    const file = await exportCurrentDocumentFile()
    await uploadDocument({ sessionId, docType, file }).unwrap()
    return file
  }

  const handleContinue = async () => {
    setError('')
    setSaving(true)

    try {
      const file = await saveCurrentDocument()
      setBildirgiFile(file)

      await prepareDocuments({
        sessionId,
        sessionPayload: sessionPayload ?? undefined,
        regenerateKelishuvOnly: true,
      }).unwrap()

      setActiveStep(1)
    } catch (continueError) {
      setError(getApiErrorMessage(continueError, 'Bildirgini saqlab bo‘lmadi'))
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    setSaving(true)

    try {
      if (!bildirgiFile) {
        throw new Error('Bildirgi saqlanmagan — 1-bosqichni qayta bajaring')
      }

      const kelishuvFile = await saveCurrentDocument()

      if (isEditMode) {
        if (!requestId) {
          throw new Error('Tahrirlanayotgan ariza aniqlanmadi')
        }

        const updated = await updateWithDocuments({
          requestId,
          sessionPayload: sessionPayload ?? undefined,
          bildirgiFile,
          kelishuvFile,
        }).unwrap()

        onUpdated?.(updated)
        onClose?.()
        return
      }

      if (isResubmitMode) {
        if (!requestId) {
          throw new Error('Qayta yuborilayotgan ariza aniqlanmadi')
        }

        const resubmitted = await resubmitWithDocuments({
          requestId,
          sessionPayload: sessionPayload ?? undefined,
          bildirgiFile,
          kelishuvFile,
        }).unwrap()

        onResubmitted?.(resubmitted)
        onClose?.()
        return
      }

      const created = await submitSession({
        sessionId,
        bildirgiFile,
        kelishuvFile,
        sessionPayload: sessionPayload ?? undefined,
      }).unwrap()
      onSubmitted?.(created)
      onClose?.()
    } catch (submitError) {
      setError(
        getApiErrorMessage(
          submitError,
          isResubmitMode
            ? 'Arizani qayta yuborib bo‘lmadi'
            : isEditMode
              ? 'Arizani yangilab bo‘lmadi'
              : 'Arizani yuborib bo‘lmadi',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <ForceLightModeScope active={open}>
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      disableEnforceFocus
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: {
            display: 'flex',
            flexDirection: 'column',
            colorScheme: 'light',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      <DialogTitle component="div" sx={{ pb: 1, flexShrink: 0 }}>
        <Typography component="p" variant="h6" fontWeight={600}>
          {isEditMode
            ? 'Hujjatlarni tahrirlash (ariza yangilash)'
            : isResubmitMode
              ? 'Hujjatlarni tahrirlash (ariza qayta yuborish)'
              : 'Hujjatlarni tahrirlash'}
        </Typography>
        <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {stepInfo.title} — {stepInfo.hint}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          colorScheme: 'light',
          bgcolor: 'background.paper',
        }}
      >
        {error ? <Alert severity="error">{error}</Alert> : null}

        {prepareState.isError ? (
          <Alert severity="error" sx={{ mx: 2, mt: 1 }}>
            {getApiErrorMessage(prepareState.error, 'Hujjatlarni tayyorlab bo‘lmadi')}
          </Alert>
        ) : null}

        <Box sx={{ flex: 1, minHeight: 0, px: 1, pb: 1, display: 'flex', flexDirection: 'column' }}>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            }
          >
            <SuperDocEditorPanel
              documentFile={documentFile}
              loading={prepareState.isLoading || documentLoading}
              error={null}
              onReady={handleEditorReady}
            />
          </Suspense>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          flexShrink: 0,
          colorScheme: 'light',
          bgcolor: 'background.paper',
        }}
      >
        <Button onClick={onClose} disabled={isBusy}>
          Bekor qilish
        </Button>
        {activeStep === 0 ? (
          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={isBusy || !superdocInstance}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Davom etish'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={isBusy || !superdocInstance}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEditMode || isResubmitMode ? (
              'Saqlash'
            ) : (
              'Saqlash va yuborish'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
    </ForceLightModeScope>
  )
}
