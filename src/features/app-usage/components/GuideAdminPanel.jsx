import { useCallback, useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  appUsageApi,
  useDeleteAppGuideMutation,
  useGetAppGuidesAdminQuery,
  useUpdateAppGuideMutation,
} from '@/features/app-usage/api/appUsageApi'
import {
  GUIDE_VIDEO_ACCEPT,
  MAX_GUIDE_VIDEO_BYTES,
  MAX_GUIDE_VIDEO_LABEL,
} from '@/features/app-usage/constants/guideVideo'
import {
  buildGuideFormData,
  getGuideUploadUrl,
  uploadAppGuide,
} from '@/features/app-usage/utils/uploadAppGuide'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { API_TAGS } from '@/shared/constants/apiTags'
import { showNotification } from '@/shared/model/notificationSlice'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const emptyForm = {
  title: '',
  description: '',
  externalLink: '',
  sortOrder: '0',
  isActive: true,
  video: null,
}

const createUploadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`

const GuideFormDialog = ({ open, onClose, initialGuide, onSave, isSaving }) => {
  const [form, setForm] = useState(emptyForm)
  const isEdit = Boolean(initialGuide?.id)

  useEffect(() => {
    if (!open) return
    if (initialGuide) {
      setForm({
        title: initialGuide.title ?? '',
        description: initialGuide.description ?? '',
        externalLink: initialGuide.externalLink ?? '',
        sortOrder: String(initialGuide.sortOrder ?? 0),
        isActive: initialGuide.isActive !== false,
        video: null,
      })
      return
    }
    setForm(emptyForm)
  }, [open, initialGuide])

  const handleSubmit = async () => {
    await onSave({
      form,
      guideId: initialGuide?.id,
      isEdit,
    })
  }

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Qo‘llanmani tahrirlash' : 'Yangi qo‘llanma'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            label="Sarlavha"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Tavsif"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            fullWidth
            required
            multiline
            minRows={3}
          />
          <TextField
            label="Qo‘shimcha havola"
            value={form.externalLink}
            onChange={(e) => setForm((prev) => ({ ...prev, externalLink: e.target.value }))}
            fullWidth
            placeholder="https://"
          />
          <TextField
            label="Tartib raqami"
            value={form.sortOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
            type="number"
            fullWidth
          />
          {isEdit ? (
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Faol"
            />
          ) : null}
          <Box>
            <Button variant="outlined" component="label" fullWidth>
              {form.video ? form.video.name : isEdit ? 'Videoni almashtirish (ixtiyoriy)' : 'Video tanlash'}
              <input
                hidden
                type="file"
                accept={GUIDE_VIDEO_ACCEPT}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    video: e.target.files?.[0] ?? null,
                  }))
                }
              />
            </Button>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
              MP4, WebM yoki MOV. Maksimal hajm: {MAX_GUIDE_VIDEO_LABEL}.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const GuideAdminPanel = () => {
  const dispatch = useAppDispatch()
  const guidesQuery = useGetAppGuidesAdminQuery()
  const [updateGuide, updateState] = useUpdateAppGuideMutation()
  const [deleteGuide, deleteState] = useDeleteAppGuideMutation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGuide, setEditingGuide] = useState(null)
  const [metadataSaving, setMetadataSaving] = useState(false)
  const [pendingUploads, setPendingUploads] = useState([])

  const guides = guidesQuery.data ?? []

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingGuide(null)
  }, [])

  const startBackgroundUpload = useCallback(
    async ({ uploadId, title, guideId, formData, isEdit }) => {
      try {
        await uploadAppGuide({
          url: getGuideUploadUrl(guideId),
          method: isEdit ? 'PATCH' : 'POST',
          formData,
          onProgress: (progress) => {
            setPendingUploads((prev) =>
              prev.map((item) => (item.id === uploadId ? { ...item, progress } : item)),
            )
          },
        })

        setPendingUploads((prev) => prev.filter((item) => item.id !== uploadId))
        dispatch(appUsageApi.util.invalidateTags([API_TAGS.APP_GUIDE]))
        dispatch(
          showNotification({
            severity: 'success',
            message: isEdit ? 'Qo‘llanma yangilandi' : 'Qo‘llanma qo‘shildi',
          }),
        )
      } catch (error) {
        setPendingUploads((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? {
                  ...item,
                  status: 'error',
                  error: getApiErrorMessage(error, 'Video yuklashda xatolik'),
                }
              : item,
          ),
        )
        dispatch(
          showNotification({
            severity: 'error',
            message: getApiErrorMessage(error, 'Video yuklashda xatolik'),
          }),
        )
      }
    },
    [dispatch],
  )

  const handleGuideSave = async ({ form, guideId, isEdit }) => {
    if (!form.title.trim() || !form.description.trim()) {
      dispatch(
        showNotification({
          severity: 'warning',
          message: 'Sarlavha va tavsifni to‘ldiring',
        }),
      )
      return
    }

    if (!isEdit && !form.video) {
      dispatch(
        showNotification({
          severity: 'warning',
          message: 'Video fayl tanlang',
        }),
      )
      return
    }

    if (form.video && form.video.size > MAX_GUIDE_VIDEO_BYTES) {
      dispatch(
        showNotification({
          severity: 'warning',
          message: `Video hajmi ${MAX_GUIDE_VIDEO_LABEL} dan oshmasligi kerak`,
        }),
      )
      return
    }

    if (form.video) {
      const uploadId = createUploadId()
      const title = form.title.trim()

      setPendingUploads((prev) => [
        ...prev,
        {
          id: uploadId,
          title,
          progress: 0,
          status: 'uploading',
        },
      ])
      closeDialog()

      const formData = buildGuideFormData(form, { isEdit })
      void startBackgroundUpload({
        uploadId,
        title,
        guideId,
        formData,
        isEdit,
      })
      return
    }

    if (!isEdit) return

    setMetadataSaving(true)
    try {
      const formData = buildGuideFormData(form, { isEdit: true })
      await updateGuide({ id: guideId, formData }).unwrap()
      dispatch(showNotification({ severity: 'success', message: 'Qo‘llanma yangilandi' }))
      closeDialog()
    } catch (error) {
      dispatch(
        showNotification({
          severity: 'error',
          message: getApiErrorMessage(error, 'Saqlashda xatolik'),
        }),
      )
    } finally {
      setMetadataSaving(false)
    }
  }

  const handleDelete = async (guide) => {
    if (!window.confirm(`«${guide.title}» qo‘llanmasini o‘chirishni tasdiqlaysizmi?`)) {
      return
    }

    try {
      await deleteGuide(guide.id).unwrap()
      dispatch(showNotification({ severity: 'success', message: 'Qo‘llanma o‘chirildi' }))
    } catch (error) {
      dispatch(
        showNotification({
          severity: 'error',
          message: getApiErrorMessage(error, 'O‘chirishda xatolik'),
        }),
      )
    }
  }

  const dismissFailedUpload = (uploadId) => {
    setPendingUploads((prev) => prev.filter((item) => item.id !== uploadId))
  }

  const hasRows = guides.length > 0 || pendingUploads.length > 0

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            width: '100%',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800}>
              Qo‘llanmalarni boshqarish
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administrator video qo‘llanmalarni yuklaydi va tahrirlaydi.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingGuide(null)
              setDialogOpen(true)
            }}
            sx={{ ml: { sm: 'auto' }, flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Qo‘llanma qo‘shish
          </Button>
        </Box>

        {guidesQuery.error ? (
          <Alert severity="error">
            {getApiErrorMessage(guidesQuery.error, 'Qo‘llanmalarni yuklashda xatolik')}
          </Alert>
        ) : null}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sarlavha</TableCell>
                <TableCell width={90}>Tartib</TableCell>
                <TableCell width={120}>Holat</TableCell>
                <TableCell width={110} align="right">
                  Amallar
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!hasRows ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      Hozircha qo‘llanmalar yo‘q
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {pendingUploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {upload.title}
                        </Typography>
                        <Box sx={{ mt: 1, maxWidth: 360 }}>
                          <LinearProgress
                            variant="determinate"
                            value={upload.progress}
                            color={upload.status === 'error' ? 'error' : 'primary'}
                            sx={{ height: 6, borderRadius: 99 }}
                          />
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {upload.status === 'error'
                              ? upload.error
                              : `Video yuklanmoqda... ${upload.progress}%`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={upload.status === 'error' ? 'Xatolik' : 'Yuklanmoqda'}
                          color={upload.status === 'error' ? 'error' : 'primary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {upload.status === 'error' ? (
                          <Button size="small" onClick={() => dismissFailedUpload(upload.id)}>
                            Yopish
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {upload.progress}%
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {guides.map((guide) => (
                    <TableRow key={guide.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {guide.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {guide.hasVideo ? 'Video mavjud' : 'Video yo‘q'}
                        </Typography>
                      </TableCell>
                      <TableCell>{guide.sortOrder}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={guide.isActive ? 'Faol' : 'Yashirin'}
                          color={guide.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="Tahrirlash"
                          onClick={() => {
                            setEditingGuide(guide)
                            setDialogOpen(true)
                          }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="O‘chirish"
                          disabled={deleteState.isLoading}
                          onClick={() => handleDelete(guide)}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <GuideFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        initialGuide={editingGuide}
        onSave={handleGuideSave}
        isSaving={metadataSaving || updateState.isLoading}
      />
    </Paper>
  )
}
