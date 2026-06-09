import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '@/shared/utils/formatDate'

const SummaryItem = ({ icon: Icon, label, primary, secondary }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', height: '100%' }}>
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
      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
        {primary}
      </Typography>
      {secondary ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.25, lineHeight: 1.45 }}
        >
          {secondary}
        </Typography>
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
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
          bgcolor: '#fff',
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
  nomenclatureVerified = false,
  confirmedNomenclature = '',
  nomenclatureAnchorRef,
  nomenclatureInput,
  nomenclatureFocusActive = true,
}) => {
  if (!dispatch) {
    return null
  }

  const displayNomenclature = confirmedNomenclature || dispatch.dispatchCode
  const showInlineInput = nomenclatureInput && !nomenclatureVerified && !nomenclatureFocusActive

  return (
    <Paper variant="outlined" sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: 2,
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} sx={{ flexShrink: 0 }}>
          Jo‘natma ma’lumotlari
        </Typography>
        <Chip
          label={dispatch.statusLabel}
          color="info"
          size="small"
          sx={{ flexShrink: 0, ml: 'auto' }}
        />
      </Box>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              ref={nomenclatureAnchorRef}
              sx={{
                visibility:
                  nomenclatureInput && !nomenclatureVerified && nomenclatureFocusActive
                    ? 'hidden'
                    : 'visible',
              }}
            >
              {nomenclatureVerified ? (
                <SummaryItem
                  icon={AssignmentOutlinedIcon}
                  label="Nomeklatura raqami"
                  primary={displayNomenclature}
                  secondary={dispatch.requestCode || undefined}
                />
              ) : showInlineInput ? (
                <NomenclatureTextField {...nomenclatureInput} />
              ) : (
                <SummaryItem
                  icon={AssignmentOutlinedIcon}
                  label="Nomeklatura raqami"
                  primary="—"
                />
              )}
            </Box>
          </Grid>
          {dispatch.sourceStructure ? (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryItem
                icon={BusinessOutlinedIcon}
                label="Jo‘natuvchi"
                primary={dispatch.sourceStructure.shortName}
              />
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 6, md: dispatch.sourceStructure ? 3 : 5 }}>
            <SummaryItem
              icon={BusinessOutlinedIcon}
              label="Qabul qiluvchi"
              primary={dispatch.targetStructure.shortName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryItem
              icon={ScheduleOutlinedIcon}
              label="Jo‘natilgan sana"
              primary={formatDateTime(dispatch.dispatchedAt)}
              secondary={dispatch.dispatchedBy?.displayName}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
