import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { isTransferDispatch } from '@/features/warehouse-dispatches/utils/dispatchContext'
import { formatDateTime } from '@/shared/utils/formatDate'

const SummaryItem = ({ icon: Icon, label, primary, secondary }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', height: '100%', minWidth: 0 }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'primary.main',
        pt: 0.25,
      }}
    >
      <Icon fontSize="small" />
    </Box>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ lineHeight: 1.4, letterSpacing: 0.6, display: 'block' }}
      >
        {label}
      </Typography>
      <Tooltip title={primary || ''} placement="top-start" arrow>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            mt: 0.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {primary}
        </Typography>
      </Tooltip>
      {secondary ? (
        <Tooltip title={secondary} placement="top-start" arrow>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 0.25,
              lineHeight: 1.45,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {secondary}
          </Typography>
        </Tooltip>
      ) : null}
    </Box>
  </Stack>
)

export const NomenclatureTextField = ({
  value,
  onChange,
  onSubmit,
  inputRef,
  error = '',
  loading = false,
  disabled = false,
  stacked = false,
}) => {
  const textField = (
    <TextField
      inputRef={inputRef}
      label="Nomeklatura raqami"
      placeholder="Istalgan raqamni kiriting"
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ htmlInput: { maxLength: 64 } }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          onSubmit()
        }
      }}
      disabled={disabled || loading}
      error={Boolean(error)}
      helperText={error || undefined}
      autoComplete="off"
      fullWidth={stacked}
      sx={{
        width: stacked ? '100%' : 220,
        '& .MuiOutlinedInput-root': {
          bgcolor: 'background.paper',
        },
      }}
    />
  )

  if (stacked) {
    return (
      <Stack spacing={1} sx={{ width: '100%' }}>
        {textField}
        <Button
          type="button"
          variant="contained"
          size="small"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
          disabled={disabled || loading || !value.trim()}
          onClick={onSubmit}
          sx={{ alignSelf: 'flex-start' }}
        >
          Saqlash
        </Button>
      </Stack>
    )
  }

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      {textField}
      <Tooltip title="Saqlash">
        <span>
          <IconButton
            type="button"
            size="small"
            color="primary"
            disabled={disabled || loading || !value.trim()}
            onClick={onSubmit}
            sx={{ mt: 0.75 }}
          >
            {loading ? <CircularProgress size={18} /> : <SaveOutlinedIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  )
}

export const WarehouseDispatchSummaryPanel = ({
  dispatch,
  summaryPrimaryField = 'nakladnoy',
}) => {
  if (!dispatch) {
    return null
  }

  const isTransfer = isTransferDispatch(dispatch)
  const isNakladnoySummary = summaryPrimaryField === 'nakladnoy'
  const employeeName =
    dispatch.dispatchedBy?.displayName || dispatch.dispatchedBy?.login || '—'

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Jo‘natma ma’lumotlari
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {isNakladnoySummary ? (
              <SummaryItem
                icon={AssignmentOutlinedIcon}
                label="Nakladnoy raqami"
                primary={dispatch.dispatchCode}
              />
            ) : (
              <SummaryItem
                icon={AssignmentOutlinedIcon}
                label="Nomeklatura raqami"
                primary={dispatch.dispatchCode}
              />
            )}
          </Grid>

          {isTransfer && dispatch.sourceStructure ? (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryItem
                icon={BusinessOutlinedIcon}
                label="Jo‘natuvchi ombor"
                primary={dispatch.sourceStructure.shortName}
                secondary={dispatch.sourceStructure.fullName}
              />
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, sm: 6, md: isTransfer && dispatch.sourceStructure ? 3 : 4 }}>
            <SummaryItem
              icon={BusinessOutlinedIcon}
              label="Qabul qiluvchi ombor"
              primary={dispatch.targetStructure.shortName}
              secondary={dispatch.targetStructure.fullName}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryItem
              icon={ScheduleOutlinedIcon}
              label="Jo‘natilgan sana"
              primary={formatDateTime(dispatch.dispatchedAt)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryItem
              icon={PersonOutlinedIcon}
              label="Jo‘natuvchi xodim"
              primary={employeeName}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
