import { useMemo, useState } from 'react'
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
import { useCreateWarehouseDispatchMutation } from '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import { DispatchQrSection } from '@/features/warehouse-dispatches/components/DispatchQrSection'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

const formatStructureOption = (structure) =>
  `${structure.shortName} — ${structure.fullName}`

const resolveBatchItems = (batch, items) => {
  const indexedItems = (items ?? []).map((item, itemIndex) => ({ ...item, itemIndex }))

  if (!batch) {
    return indexedItems.filter((item) => item.isPurchased)
  }

  if (batch.batchId === 'legacy') {
    const indexes = new Set(batch.itemAmounts.map((row) => row.itemIndex))
    return indexedItems.filter((item) => indexes.has(item.itemIndex))
  }

  return indexedItems.filter((item) => item.purchaseBatchId === batch.batchId)
}

export const DispatchToWarehouseDialog = ({
  open,
  request,
  purchaseBatch = null,
  onClose,
  onSuccess,
}) => {
  const [structure, setStructure] = useState(null)
  const [plannedArrivalAt, setPlannedArrivalAt] = useState(null)
  const [error, setError] = useState('')
  const [createdDispatch, setCreatedDispatch] = useState(null)

  const structuresQuery = useGetStructuresQuery(undefined, { skip: !open })
  const [createDispatch, { isLoading }] = useCreateWarehouseDispatchMutation()

  const activeStructures = useMemo(
    () => filterStructuresWithWarehouse(structuresQuery.data),
    [structuresQuery.data],
  )

  const batchItems = useMemo(
    () => resolveBatchItems(purchaseBatch, request?.items),
    [purchaseBatch, request?.items],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!structure?.id) {
      setError('Qabul qiluvchi tuzilmani tanlang')
      return
    }

    try {
      const result = await createDispatch({
        purchaseRequestId: request.id,
        purchaseBatchId: purchaseBatch?.batchId,
        structureId: structure.id,
        plannedArrivalAt:
          plannedArrivalAt && dayjs(plannedArrivalAt).isValid()
            ? dayjs(plannedArrivalAt).format('YYYY-MM-DD')
            : undefined,
      }).unwrap()

      setCreatedDispatch(result)
      onSuccess?.()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Omborga jo‘natishda xatolik'))
    }
  }

  const handleDownload = (type) => {
    if (!createdDispatch) {
      return
    }

    const extension = type === 'pdf' ? 'pdf' : 'docx'
    downloadAuthenticatedFile(
      `/warehouse-dispatches/${createdDispatch.id}/nakladnoy/${extension}`,
      `nakladnoy-${createdDispatch.dispatchCode}.${extension}`,
    ).catch(() => {})
  }

  if (!request) {
    return null
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Omborga jo‘natish — {request.requestCode}
          {purchaseBatch?.batchNumber ? ` / partiya #${purchaseBatch.batchNumber}` : ''}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {createdDispatch ? (
              <Alert severity="success">
                Saqlandi. Status: <b>Jo‘natilmoqda</b> ({createdDispatch.dispatchCode})
              </Alert>
            ) : null}

            <Typography variant="body2" color="text.secondary">
              Ichida bir nechta tovar va soni ko‘rsatiladi. Xususiyatlar yashirin holda turadi.
              Saqlanganda nakladnoy avtomatik shakllanadi.
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
                  {batchItems.map((item, index) => (
                    <TableRow key={`${request.id}-${item.itemIndex}-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell sx={nomenclatureTableCellSx}>
                        {getItemNomenclatureCode(item)}
                      </TableCell>
                      <TableCell align="right">
                        {item.quantity} {item.unit || 'dona'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Autocomplete
              options={activeStructures}
              value={structure}
              onChange={(_event, value) => setStructure(value)}
              getOptionLabel={(option) => formatStructureOption(option)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              disabled={Boolean(createdDispatch)}
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
              disabled={Boolean(createdDispatch)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
                field: { clearable: true },
              }}
            />

            {createdDispatch ? (
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

                <DispatchQrSection dispatch={createdDispatch} />
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Yopish
          </Button>
          {!createdDispatch ? (
            <Button type="submit" variant="contained" disabled={isLoading}>
              Saqlash va jo‘natish
            </Button>
          ) : null}
        </DialogActions>
      </Box>
    </Dialog>
  )
}
