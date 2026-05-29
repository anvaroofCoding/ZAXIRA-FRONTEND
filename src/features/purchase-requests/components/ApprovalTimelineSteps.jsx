import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditNoteIcon from '@mui/icons-material/EditNote'
import GavelIcon from '@mui/icons-material/Gavel'
import SendIcon from '@mui/icons-material/Send'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Step from '@mui/material/Step'
import StepContent from '@mui/material/StepContent'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { getDecisionChipColor } from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { formatDateTime } from '@/shared/utils/formatDate'

const STEP_META = {
  SUBMITTED: { label: 'Ariza yuborildi', icon: SendIcon, color: 'primary' },
  DECISION: { label: 'Komissiya qarori', icon: GavelIcon, color: 'secondary' },
  RESUBMITTED: { label: 'Qayta yuborildi', icon: EditNoteIcon, color: 'info' },
  BOSS_CONFIRMED: { label: 'Boshliq qarorini tasdiqladi', icon: CheckCircleIcon, color: 'success' },
  BOSS_DECISION: { label: 'Boshliq qarori', icon: GavelIcon, color: 'secondary' },
  PURCHASED: { label: 'Xarid qilindi', icon: ShoppingCartIcon, color: 'success' },
}

export const ApprovalTimelineSteps = ({ history = [] }) => {
  if (!history.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Izohlar tarixi hozircha bo‘sh
      </Typography>
    )
  }

  const steps = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  return (
    <Stepper orientation="vertical" nonLinear activeStep={steps.length}>
      {steps.map((step, index) => {
        const meta = STEP_META[step.type] ?? STEP_META.DECISION
        const Icon = meta.icon

        return (
          <Step key={`${step.type}-${step.createdAt}-${index}`} active completed>
            <StepLabel
              icon={
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${meta.color}.light`,
                    color: `${meta.color}.dark`,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
              }
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {meta.label}
                </Typography>
                {step.decision ? (
                  <Chip
                    size="small"
                    color={getDecisionChipColor(step.decision)}
                    label={step.decisionLabel}
                  />
                ) : null}
              </Box>
            </StepLabel>

            <StepContent>
              <Typography variant="caption" color="text.secondary" display="block">
                {formatDateTime(step.createdAt)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {step.actor.displayName} ({step.actor.login})
              </Typography>
              {step.comment?.trim() ? (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}
                >
                  {step.comment}
                </Typography>
              ) : null}
            </StepContent>
          </Step>
        )
      })}
    </Stepper>
  )
}
