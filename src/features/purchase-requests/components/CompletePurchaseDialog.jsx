import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCompletePurchaseMutation } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { parseUzsInput } from '@/shared/utils/formatUzs'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const newLink = () => ({ id: crypto.randomUUID(), label: '', url: '' })
const newFileRow = () => ({ id: crypto.randomUUID(), label: '', file: null })

export const CompletePurchaseDialog = ({ open, request, onClose, onSuccess }) => {
  const [vendorName, setVendorName] = useState('')
  const [comment, setComment] = useState('')
  const [links, setLinks] = useState([])
  const [fileRows, setFileRows] = useState([])
  const [amountInputs, setAmountInputs] = useState([])
  const [error, setError] = useState('')

  const [completePurchase, { isLoading }] = useCompletePurchaseMutation()

  useEffect(() => {
    if (!open || !request) {
      return
    }

    setVendorName('')
    setComment('')
    setLinks([])
    setFileRows([])
    setAmountInputs(request.items.map(() => ''))
    setError('')
  }, [open, request])

  const itemAmounts = useMemo(
    () =>
      amountInputs.map((value, itemIndex) => ({
        itemIndex,
        amount: parseUzsInput(value),
      })),
    [amountInputs],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const trimmedVendor = vendorName.trim()
    const preparedLinks = links
      .map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      }))
      .filter((link) => link.url)

    if (trimmedVendor.length < 2) {
      setError('Firma nomi kiritilishi shart')
      return
    }

    if (itemAmounts.some((row) => !row.amount || row.amount < 1)) {
      setError('Har bir tovar uchun summa kiritilishi shart')
      return
    }

    const formData = new FormData()
    formData.append('vendorName', trimmedVendor)
    formData.append('comment', comment.trim())
    formData.append('links', JSON.stringify(preparedLinks))
    formData.append(
      'itemAmounts',
      JSON.stringify(itemAmounts.map((row) => ({ itemIndex: row.itemIndex, amount: row.amount }))),
    )

    const fileLabels = []

    fileRows.forEach((row) => {
      if (row.file) {
        formData.append('files', row.file)
        fileLabels.push(row.label.trim() || row.file.name)
      }
    })

    formData.append('fileLabels', JSON.stringify(fileLabels))

    try {
      await completePurchase({ id: request.id, formData }).unwrap()
      onSuccess?.()
      onClose()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Xarid qilishda xatolik'))
    }
  }

  if (!request) {
    return null
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pr: 2,
          }}
        >
          <Typography variant="h6" component="span" sx={{ flex: 1, fontWeight: 600 }}>
            Sotib olish — {request.requestCode}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={isLoading}
              onClick={() => setLinks((prev) => [...prev, newLink()])}
            >
              Havola qo‘shish
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={isLoading}
              onClick={() => setFileRows((prev) => [...prev, newFileRow()])}
            >
              Fayl qo‘shish
            </Button>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Firma / sotib olinadigan joy nomi"
              value={vendorName}
              onChange={(event) => setVendorName(event.target.value)}
              required
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Havolalar (ixtiyoriy)
              </Typography>

              {links.length ? (
                <Stack spacing={1}>
                  {links.map((link, index) => (
                    <Stack key={link.id} direction="row" spacing={1} alignItems="flex-start">
                      <TextField
                        label="Nom (ixtiyoriy)"
                        value={link.label}
                        onChange={(event) =>
                          setLinks((prev) =>
                            prev.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, label: event.target.value } : row,
                            ),
                          )
                        }
                        sx={{ width: 180 }}
                      />
                      <TextField
                        label="Havola"
                        value={link.url}
                        onChange={(event) =>
                          setLinks((prev) =>
                            prev.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, url: event.target.value } : row,
                            ),
                          )
                        }
                        fullWidth
                      />
                      <IconButton
                        aria-label="Havolani o‘chirish"
                        onClick={() =>
                          setLinks((prev) => prev.filter((row) => row.id !== link.id))
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Havola qo‘shilmagan
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Fayllar (ixtiyoriy)
              </Typography>

              {fileRows.length ? (
                <Stack spacing={1}>
                  {fileRows.map((row, index) => (
                    <Stack key={row.id} direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="Fayl nomi"
                        value={row.label}
                        onChange={(event) =>
                          setFileRows((prev) =>
                            prev.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, label: event.target.value }
                                : entry,
                            ),
                          )
                        }
                        sx={{ width: 220 }}
                      />
                      <Button component="label" variant="outlined" sx={{ flex: 1 }}>
                        {row.file ? row.file.name : 'Fayl tanlash'}
                        <input
                          hidden
                          type="file"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null
                            setFileRows((prev) =>
                              prev.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, file } : entry,
                              ),
                            )
                          }}
                        />
                      </Button>
                      <IconButton
                        aria-label="Faylni olib tashlash"
                        onClick={() =>
                          setFileRows((prev) => prev.filter((entry) => entry.id !== row.id))
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Hujjat yuklash shart emas
                </Typography>
              )}
            </Box>

            <TextField
              label="Izoh (ixtiyoriy)"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              multiline
              minRows={2}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Har bir tovar summasi (majburiy)
              </Typography>
              <Stack spacing={2}>
                {request.items.map((item, index) => (
                  <Paper
                    key={`${item.name}-${index}`}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                        >
                          {index + 1}-tovar
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.25 }}>
                          {item.name}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                          gap: 1.5,
                          alignItems: 'start',
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Xususiyat
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.25 }}>
                            {item.characteristics}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: { sm: 72 } }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Soni
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                            {item.quantity} ta
                          </Typography>
                        </Box>
                      </Box>

                      <TextField
                        label="Summa"
                        value={amountInputs[index] ?? ''}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, '')
                          const formatted = digits
                            ? new Intl.NumberFormat('uz-UZ').format(Number(digits))
                            : ''
                          setAmountInputs((prev) =>
                            prev.map((value, valueIndex) =>
                              valueIndex === index ? formatted : value,
                            ),
                          )
                        }}
                        placeholder="10 000 000"
                        fullWidth
                        required
                        size="small"
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            Xarid qilindi deb belgilash
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
