import SearchIcon from '@mui/icons-material/Search'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

const stickySx = {
  position: 'sticky',
  top: { xs: 56, sm: 64 },
  zIndex: 10,
}

export const TransferPageFilters = ({
  title,
  subtitle,
  headerAction = null,
  search,
  onSearchChange,
  searchPlaceholder = 'Qidiruv',
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  dateFromLabel = 'Dan',
  dateToLabel = 'Gacha',
  structureFilter,
  onStructureFilterChange,
  structures = [],
  viewerStructureId = '',
  onClearFilters,
  hasActiveFilters = false,
}) => (
  <Box sx={stickySx}>
    <Stack spacing={2}>
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
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {headerAction}
          {hasActiveFilters ? (
            <Button
              size="small"
              variant="text"
              startIcon={<FilterAltOffIcon fontSize="small" />}
              onClick={onClearFilters}
              sx={{ flexShrink: 0 }}
            >
              Filtrlarni tozalash
            </Button>
          ) : null}
        </Stack>
      </Box>

      <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: onStructureFilterChange ? 4 : 5 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        {onStructureFilterChange ? (
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="transfer-structure-filter-label">Tuzilma</InputLabel>
              <Select
                labelId="transfer-structure-filter-label"
                label="Tuzilma"
                value={structureFilter ?? ''}
                onChange={(event) => onStructureFilterChange(event.target.value)}
              >
                <MenuItem value="">Barcha tuzilmalar</MenuItem>
                {structures.map((structure) => (
                  <MenuItem key={structure.id} value={structure.id}>
                    {structure.shortName}
                    {structure.id === viewerStructureId ? ' (sizniki)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ) : null}
        <Grid size={{ xs: 12, sm: 6, md: onStructureFilterChange ? 2.75 : 3.5 }}>
          <DatePicker
            label={dateFromLabel}
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
        <Grid size={{ xs: 12, sm: 6, md: onStructureFilterChange ? 2.75 : 3.5 }}>
          <DatePicker
            label={dateToLabel}
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
    </Stack>
  </Box>
)
