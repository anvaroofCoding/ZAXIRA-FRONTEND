import VerifiedIcon from '@mui/icons-material/Verified'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '@/shared/utils/formatDate'

export const BossDecisionAlert = ({ request }) => {
  if (!request?.bossDecision) {
    return null
  }

  const severity =
    request.bossDecision === 'APPROVED'
      ? 'success'
      : request.bossDecision === 'PARTIAL'
        ? 'info'
        : 'error'

  return (
    <Alert
      severity={severity}
      icon={<VerifiedIcon />}
      sx={{
        alignItems: 'flex-start',
        '& .MuiAlert-icon': { mt: 0.25, mr: 1.5 },
        '& .MuiAlert-message': { width: '100%', pt: 0.25 },
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Typography variant="body2" fontWeight={600}>
          Boshliq qarori: {request.bossDecisionLabel}
        </Typography>
        {request.bossConfirmedAt ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {formatDateTime(request.bossConfirmedAt)}
          </Typography>
        ) : null}
        {request.bossConfirmComment?.trim() ? (
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            <Box component="span" fontWeight={600}>
              Izoh:{' '}
            </Box>
            {request.bossConfirmComment}
          </Typography>
        ) : null}
      </Box>
    </Alert>
  )
}
