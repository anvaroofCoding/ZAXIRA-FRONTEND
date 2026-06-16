import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '@/shared/utils/formatDate'

export const ActiveSessionsPanel = ({
  sessions,
  loading,
  deletingId,
  maxSessions = 10,
  infoMessage = 'To‘ldirilmagan arizalar saqlanib qoladi. Istagan paytda davom eting yoki o‘chiring.',
  onContinue,
  onDelete,
}) => {
  if (!sessions.length) {
    return null
  }

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ mb: 1.5, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Faol seanslar
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {sessions.length} / {maxSessions}
        </Typography>
      </Stack>

      <Alert severity="info" sx={{ mb: 1.5 }}>
        {infoMessage}
      </Alert>

      <Stack spacing={1}>
        {sessions.map((session) => (
          <Paper
            key={session.id}
            variant="outlined"
            sx={{
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mb: 0.25, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {session.title || 'Nomsiz ariza'}
                </Typography>
                {session.pendingServerSync || session.isLocal ? (
                  <Chip
                    size="small"
                    label={session.pendingServerSync ? 'Sinxronlash kutilmoqda' : 'Qurilmada'}
                    color="warning"
                    variant="outlined"
                  />
                ) : null}
              </Stack>
              <Typography variant="caption" color="text.secondary" component="div">
                {session.preview?.trim()
                  ? session.preview
                  : 'Hali to‘ldirilmagan'}
              </Typography>
              {session.updatedAt ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                  sx={{ mt: 0.25 }}
                >
                  Yangilangan: {formatDateTime(session.updatedAt)}
                </Typography>
              ) : null}
            </Box>

            <Stack direction="row" spacing={0.5}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditOutlinedIcon fontSize="small" />}
                onClick={() => onContinue(session)}
                disabled={loading}
              >
                Davom etish
              </Button>
              <IconButton
                size="small"
                color="error"
                aria-label="Faol seansni o‘chirish"
                onClick={() => onDelete(session)}
                disabled={deletingId === session.id}
              >
                {deletingId === session.id ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <DeleteOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}
