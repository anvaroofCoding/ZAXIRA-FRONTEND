import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCreateStocktakeMutation } from '@/features/invertarizatsiya/api/stocktakesApi'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { useGetAllWarehousesOverviewQuery, useGetWarehouseLocationsQuery } from '@/features/warehouse/api/warehouseApi'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const formatStructureOption = (structure) =>
  `${structure.shortName} — ${structure.fullName}`

export const CreateStocktakeDialog = ({ open, defaultStructureId, onClose, onCreated }) => {
  const [structure, setStructure] = useState(null)
  const [mode, setMode] = useState('general')
  const [locationId, setLocationId] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const structuresQuery = useGetStructuresQuery(undefined, { skip: !open })
  const overviewQuery = useGetAllWarehousesOverviewQuery(undefined, { skip: !open })
  const ownLocationsQuery = useGetWarehouseLocationsQuery(undefined, {
    skip: !open || mode !== 'location',
  })
  const [createStocktake, { isLoading }] = useCreateStocktakeMutation()

  const activeStructures = useMemo(
    () => (structuresQuery.data ?? []).filter((item) => item.isActive !== false),
    [structuresQuery.data],
  )

  const locationOptions = useMemo(() => {
    if (!structure?.id) return []
    if (structure.id === defaultStructureId) {
      return ownLocationsQuery.data ?? []
    }
    const group = (overviewQuery.data ?? []).find((row) => row.structure.id === structure.id)
    return group?.locations ?? []
  }, [structure, defaultStructureId, ownLocationsQuery.data, overviewQuery.data])

  useEffect(() => {
    if (!open) return
    const match = activeStructures.find((item) => item.id === defaultStructureId)
    setStructure(match ?? activeStructures[0] ?? null)
    setMode('general')
    setLocationId('')
    setComment('')
    setError('')
  }, [open, defaultStructureId, activeStructures])

  useEffect(() => {
    if (mode !== 'location') {
      setLocationId('')
      return
    }
    if (!locationOptions.length) {
      setLocationId('')
      return
    }
    if (!locationOptions.some((loc) => loc.id === locationId)) {
      setLocationId(locationOptions[0].id)
    }
  }, [mode, locationOptions, locationId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!structure?.id) {
      setError('Tuzilmani tanlang')
      return
    }

    if (mode === 'location' && !locationId) {
      setError('Joy tanlang')
      return
    }

    try {
      const result = await createStocktake({
        structureId: structure.id,
        mode,
        ...(mode === 'location' ? { locationId } : {}),
        comment: comment.trim() || undefined,
      }).unwrap()

      onCreated?.(result)
      onClose?.()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Invertarizatsiyani yaratishda xatolik'))
    }
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>Invertarizatsiya yaratish</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Autocomplete
              options={activeStructures}
              value={structure}
              onChange={(_event, value) => setStructure(value)}
              getOptionLabel={(option) => formatStructureOption(option)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField {...params} label="Tuzilma" required size="small" />
              )}
            />

            <FormControl>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                Invertarizatsiya turi
              </Typography>
              <RadioGroup
                value={mode}
                onChange={(event) => setMode(event.target.value)}
              >
                <FormControlLabel
                  value="general"
                  control={<Radio size="small" />}
                  label="Umumiy — barcha joylar aralash, tovar nomi bo‘yicha birlashtiriladi"
                />
                <FormControlLabel
                  value="location"
                  control={<Radio size="small" />}
                  label="Joy bo‘yicha — faqat tanlangan joydagi tovarlar"
                />
              </RadioGroup>
            </FormControl>

            {mode === 'location' ? (
              <FormControl fullWidth size="small" disabled={!locationOptions.length}>
                <InputLabel id="stocktake-location-label">Joy</InputLabel>
                <Select
                  labelId="stocktake-location-label"
                  label="Joy"
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                >
                  {locationOptions.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            <TextField
              size="small"
              label="Izoh (ixtiyoriy)"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            Boshlash
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
