import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  buildYearOptions,
  QUARTER_OPTIONS,
  UZ_MONTH_OPTIONS,
} from '@/features/purchase-requests/utils/formatPurchasePeriod'

export const PurchasePeriodFields = ({
  periodType,
  year,
  quarter,
  month,
  onPeriodTypeChange,
  onYearChange,
  onQuarterChange,
  onMonthChange,
  disabled = false,
  error,
}) => {
  const yearOptions = buildYearOptions(6)
  const isPlain = periodType === 'plain'

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" fontWeight={600}>
        Sotib olish davri
      </Typography>

      <RadioGroup
        row
        value={periodType}
        onChange={(event) => onPeriodTypeChange(event.target.value)}
        sx={{ flexWrap: 'wrap', gap: 0.5 }}
      >
        <FormControlLabel
          value="plain"
          control={<Radio size="small" disabled={disabled} />}
          label="Oddiy"
        />
        <FormControlLabel
          value="quarter"
          control={<Radio size="small" disabled={disabled} />}
          label="Chorak bo‘yicha"
        />
        <FormControlLabel
          value="month"
          control={<Radio size="small" disabled={disabled} />}
          label="Oy bo‘yicha"
        />
      </RadioGroup>

      {isPlain ? null : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <FormControl fullWidth>
            <InputLabel id="purchase-period-year-label">Yil</InputLabel>
            <Select
              labelId="purchase-period-year-label"
              label="Yil"
              value={year}
              onChange={(event) => onYearChange(event.target.value)}
              disabled={disabled}
            >
              {yearOptions.map((optionYear) => (
                <MenuItem key={optionYear} value={optionYear}>
                  {optionYear}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {periodType === 'quarter' ? (
            <FormControl fullWidth error={Boolean(error)}>
              <InputLabel id="purchase-period-quarter-label">Chorak</InputLabel>
              <Select
                labelId="purchase-period-quarter-label"
                label="Chorak"
                value={quarter}
                onChange={(event) => onQuarterChange(event.target.value)}
                disabled={disabled}
              >
                {QUARTER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth error={Boolean(error)}>
              <InputLabel id="purchase-period-month-label">Oy</InputLabel>
              <Select
                labelId="purchase-period-month-label"
                label="Oy"
                value={month}
                onChange={(event) => onMonthChange(event.target.value)}
                disabled={disabled}
              >
                {UZ_MONTH_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      )}
    </Stack>
  )
}
