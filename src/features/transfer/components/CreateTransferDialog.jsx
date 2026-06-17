import { useEffect, useMemo, useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { filterStructuresWithWarehouse } from '@/features/structures/utils/structureFilters'
import { useCreateTransferMutation } from '@/features/transfer/api/transferApi'
import { DispatchNakladnoyTable } from '@/features/warehouse-dispatches/components/DispatchNakladnoyTable'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

const formatStructureOption = (structure) =>
  `${structure.shortName} — ${structure.fullName}`

export const CreateTransferDialog = ({ open, request, onClose, onSuccess }) => {
  const [structure, setStructure] = useState(null)
  const [plannedArrivalAt, setPlannedArrivalAt] = useState(null)
  const [error, setError] = useState('')
  const [createdTransfer, setCreatedTransfer] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const structuresQuery = useGetStructuresQuery(undefined, { skip: !open })
  const [createTransfer, { isLoading }] = useCreateTransferMutation()

  useEffect(() => {
    if (!open) {
      setConfirmOpen(false)
      setError('')
      setCreatedTransfer(null)
      setStructure(null)
      setPlannedArrivalAt(null)
    }
  }, [open])

  const activeStructures = useMemo(
    () => filterStructuresWithWarehouse(structuresQuery.data),
    [structuresQuery.data],
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!structure?.id) {
      setError('Qabul qiluvchi tuzilmani tanlang')
      return
    }

    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!structure?.id) return

    setError('')

    try {
      const result = await createTransfer({
        structureId: structure.id,
        plannedArrivalAt:
          plannedArrivalAt && dayjs(plannedArrivalAt).isValid()
            ? dayjs(plannedArrivalAt).format('YYYY-MM-DD')
            : undefined,
        items: (request.items ?? []).map((item) => ({
          locationId: item.locationId,
          barcode: item.barcode,
          quantity: item.quantity,
        })),
      }).unwrap()

      setConfirmOpen(false)
      setCreatedTransfer(result)
      onSuccess?.()
    } catch (submitError) {
      setConfirmOpen(false)
      setError(getApiErrorMessage(submitError, 'Transfer saqlashda xatolik'))
    }
  }

  const handleDownload = (type) => {
    if (!createdTransfer) return
    const extension = type === 'pdf' ? 'pdf' : 'docx'
    downloadAuthenticatedFile(
      `/warehouse-dispatches/${createdTransfer.id}/nakladnoy/${extension}`,
      `nakladnoy-${createdTransfer.dispatchCode}.${extension}`,
    ).catch(() => {})
  }

  if (!request) return null

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Transfer qilish
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {createdTransfer ? (
              <Alert severity="success">
                Saqlandi. Status: <b>Jo‘natilmoqda</b> ({createdTransfer.dispatchCode})
              </Alert>
            ) : null}

            <Typography variant="body2" color="text.secondary">
              Transfer qilinadigan tovarlar ro‘yxati:
            </Typography>

            <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={56}>T/R</TableCell>
                    <TableCell>Tovar</TableCell>
                    <TableCell width={140}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                    <TableCell width={120} align="right">
                      Soni
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(request.items ?? []).map((item, index) => (
                    <TableRow key={`${item.locationId}-${item.barcode}-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell sx={nomenclatureTableCellSx}>
                        {getItemNomenclatureCode(item)}
                      </TableCell>
                      <TableCell align="right">{item.quantity} ta</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Autocomplete
              options={activeStructures}
              value={structure}
              onChange={(_event, value) => setStructure(value)}
              getOptionLabel={(option) =>
                createdTransfer
                  ? option.shortName || option.fullName || '—'
                  : formatStructureOption(option)
              }
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              disabled={Boolean(createdTransfer)}
              renderInput={(params) => (
                <TextField {...params} label="Qabul qiluvchi tuzilma" required />
              )}
            />

            <DatePicker
              label="Rejalashtirilgan kelish sanasi (ixtiyoriy)"
              value={plannedArrivalAt}
              onChange={(value) => setPlannedArrivalAt(value)}
              format="DD.MM.YYYY"
              disablePast
              disabled={Boolean(createdTransfer)}
              slotProps={{
                textField: { fullWidth: true },
                field: { clearable: true },
              }}
            />

            {createdTransfer ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Holat:
                  </Typography>
                  <Chip size="small" color="info" label="Jo‘natilmoqda" />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Button type="button" size="small" variant="outlined" onClick={() => handleDownload('pdf')}>
                    Nakladnoy PDF
                  </Button>
                  <Button type="button" size="small" variant="outlined" onClick={() => handleDownload('docx')}>
                    Nakladnoy Word
                  </Button>
                </Stack>
                <DispatchNakladnoyTable dispatch={createdTransfer} structureNameMode="short" />
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Yopish
          </Button>
          {!createdTransfer ? (
            <Button type="submit" variant="contained" disabled={isLoading}>
              Saqlash
            </Button>
          ) : null}
        </DialogActions>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={isLoading ? undefined : () => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tasdiqlash</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rostdan ham <strong>{structure?.shortName}</strong>ga transfer qilasizmi?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button variant="contained" onClick={handleConfirmSubmit} disabled={isLoading}>
            Ha, transfer qilaman
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}
