import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import { useUploadPurchaseIshonchnomaMutation } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { newFileRow } from '@/features/purchase-requests/utils/completePurchaseFormUtils'

export const IshonchnomaUploadDialog = ({ open, target, onClose, onSaved }) => {
  const [fileRows, setFileRows] = useState([newFileRow()])
  const [error, setError] = useState('')
  const [uploadIshonchnoma, { isLoading }] = useUploadPurchaseIshonchnomaMutation()

  const handleClose = () => {
    if (isLoading) {
      return
    }

    setFileRows([newFileRow()])
    setError('')
    onClose()
  }

  const handleSave = async () => {
    if (!target?.requestId || !target?.batchId) {
      setError('Xarid ma’lumotlari topilmadi')
      return
    }

    const selectedFiles = fileRows.filter((row) => row.file)

    if (!selectedFiles.length) {
      setError('Kamida bitta fayl tanlang')
      return
    }

    setError('')

    const formData = new FormData()
    formData.append('batchId', target.batchId)

    const fileLabels = []

    selectedFiles.forEach((row) => {
      formData.append('files', row.file, row.file.name)
      fileLabels.push(row.file.name)
    })

    formData.append('fileLabels', JSON.stringify(fileLabels))

    try {
      await uploadIshonchnoma({
        id: target.requestId,
        formData,
      }).unwrap()

      setFileRows([newFileRow()])
      onSaved?.()
      onClose()
    } catch (uploadError) {
      const message =
        uploadError?.data?.message ?? 'Ishonchnomani saqlab bo‘lmadi'
      setError(Array.isArray(message) ? message[0] : message)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Ishonchnoma yuklash
        <IconButton
          aria-label="Yopish"
          onClick={handleClose}
          disabled={isLoading}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {target ? (
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {target.requestCode} — Xarid #{target.batchNumber}
              </Typography>
              {target.organizationName ? (
                <Typography variant="body2" color="text.secondary">
                  {target.organizationName}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          <Typography variant="body2" color="text.secondary">
            Ishonchnoma fayllarini yuklang. Saqlangandan so‘ng ma’lumot ro‘yxatda
            ko‘rinadi va holat «Ishonchnoma yuborilgan» deb belgilanadi.
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack spacing={1}>
            {fileRows.map((row) => (
              <Stack key={row.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Button variant="outlined" component="label" size="small" fullWidth>
                  {row.file ? row.file.name : 'Fayl tanlash'}
                  <input
                    type="file"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      setFileRows((prev) =>
                        prev.map((entry) =>
                          entry.id === row.id ? { ...entry, file } : entry,
                        ),
                      )
                    }}
                  />
                </Button>
                <IconButton
                  aria-label="Faylni o‘chirish"
                  size="small"
                  disabled={fileRows.length <= 1}
                  onClick={() =>
                    setFileRows((prev) => prev.filter((entry) => entry.id !== row.id))
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          <Button
            size="small"
            variant="text"
            startIcon={<AddIcon />}
            onClick={() => setFileRows((prev) => [...prev, newFileRow()])}
            disabled={isLoading}
            sx={{ alignSelf: 'flex-start' }}
          >
            Yana fayl qo‘shish
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Bekor qilish
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isLoading}>
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  )
}
