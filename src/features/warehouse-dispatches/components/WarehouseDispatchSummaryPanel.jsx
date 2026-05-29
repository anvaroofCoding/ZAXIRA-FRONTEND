import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
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

export const WarehouseDispatchSummaryPanel = ({ dispatch }) => {
  if (!dispatch) {
    return null
  }

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
            <SummaryItem
              icon={AssignmentOutlinedIcon}
              label="Nakladnoy"
              primary={dispatch.dispatchCode}
              secondary={dispatch.requestCode || undefined}
            />
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
