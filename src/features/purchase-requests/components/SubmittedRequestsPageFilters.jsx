import SearchIcon from '@mui/icons-material/Search'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { PURCHASE_REQUEST_STATUS_OPTIONS } from '@/features/purchase-requests/utils/historyLabels'

export const SubmittedRequestsPageFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
  hasActiveFilters = false,
}) => (
  <Stack spacing={1.5}>
    <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          size="small"
          placeholder="Qidirish"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          fullWidth
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
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormControl size="small" fullWidth>
          <InputLabel id="submitted-status-label">Ariza holati</InputLabel>
          <Select
            labelId="submitted-status-label"
            label="Ariza holati"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            {PURCHASE_REQUEST_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
        <DatePicker
          label="Yuborilgan (dan)"
          value={dateFrom}
          onChange={onDateFromChange}
          format="DD.MM.YYYY"
          maxDate={dateTo || undefined}
          slotProps={{
            textField: { size: 'small', fullWidth: true },
            field: { clearable: true },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
        <DatePicker
          label="Yuborilgan (gacha)"
          value={dateTo}
          onChange={onDateToChange}
          format="DD.MM.YYYY"
          minDate={dateFrom || undefined}
          slotProps={{
            textField: { size: 'small', fullWidth: true },
            field: { clearable: true },
          }}
        />
      </Grid>
    </Grid>

    {hasActiveFilters ? (
      <Button
        size="small"
        variant="text"
        startIcon={<FilterAltOffIcon fontSize="small" />}
        onClick={onClearFilters}
        sx={{ alignSelf: 'flex-start' }}
      >
        Filtrlarni tozalash
      </Button>
    ) : null}
  </Stack>
)
