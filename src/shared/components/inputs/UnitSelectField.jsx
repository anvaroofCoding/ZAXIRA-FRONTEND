import { useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { MEASUREMENT_UNITS } from '@/features/purchase-requests/constants/measurementUnits'
import {
  useCreateCustomMeasurementUnitMutation,
  useGetMeasurementUnitOptionsQuery,
} from '@/features/measurement-units/api/measurementUnitsApi'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ADD_VALUE = '__add_custom_unit__'

const buildUnitOptions = (systemUnits, customUnits, currentValue) => {
  const all = [...systemUnits]

  for (const unit of customUnits) {
    if (!all.includes(unit)) {
      all.push(unit)
    }
  }

  const trimmed = currentValue?.trim()

  if (trimmed && !all.includes(trimmed)) {
    return [trimmed, ...all]
  }

  return all
}

export const UnitSelectField = ({
  value,
  onChange,
  label = 'Birlik',
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'medium',
  sx,
}) => {
  const optionsQuery = useGetMeasurementUnitOptionsQuery()
  const [createCustomUnit] = useCreateCustomMeasurementUnitMutation()
  const [isAdding, setIsAdding] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const unitOptions = useMemo(() => {
    const system = optionsQuery.data?.system ?? MEASUREMENT_UNITS
    const custom = optionsQuery.data?.custom ?? []

    return buildUnitOptions(system, custom, value)
  }, [optionsQuery.data?.custom, optionsQuery.data?.system, value])

  const resetAddState = () => {
    setIsAdding(false)
    setDraftName('')
    setError('')
  }

  const handleConfirmAdd = async () => {
    const name = draftName.trim()

    if (!name) {
      setError('Birlik nomini kiriting')
      return
    }

    setSaving(true)
    setError('')

    try {
      await createCustomUnit({ name }).unwrap()
      onChange(name)
      resetAddState()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Saqlashda xatolik'))
    } finally {
      setSaving(false)
    }
  }

  if (isAdding) {
    return (
      <TextField
        label={label}
        value={draftName}
        onChange={(event) => {
          setDraftName(event.target.value)
          if (error) {
            setError('')
          }
        }}
        disabled={disabled || saving}
        required={required}
        fullWidth={fullWidth}
        size={size}
        error={Boolean(error)}
        helperText={error}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleConfirmAdd()
          }

          if (event.key === 'Escape') {
            event.preventDefault()
            resetAddState()
          }
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Bekor qilish"
                  onClick={resetAddState}
                  disabled={disabled || saving}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Saqlash"
                  color="primary"
                  onClick={handleConfirmAdd}
                  disabled={disabled || saving}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={sx}
      />
    )
  }

  return (
    <TextField
      select
      label={label}
      value={value || ''}
      onChange={(event) => {
        const nextValue = event.target.value

        if (nextValue === ADD_VALUE) {
          setIsAdding(true)
          return
        }

        onChange(nextValue)
      }}
      disabled={disabled || optionsQuery.isLoading}
      required={required}
      fullWidth={fullWidth}
      size={size}
      sx={sx}
    >
      {unitOptions.map((unit) => (
        <MenuItem key={unit} value={unit}>
          {unit}
        </MenuItem>
      ))}

      <Divider sx={{ my: 0.5 }} />

      <MenuItem
        value={ADD_VALUE}
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          gap: 1,
        }}
      >
        <AddIcon fontSize="small" />
        Qo'shish
      </MenuItem>
    </TextField>
  )
}
