import ReplayIcon from '@mui/icons-material/Replay'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { formatMemberLabel } from '@/features/purchase-requests/utils/formatMemberLabel'
import {
  getApprovalDecisionLabel,
  getDecisionChipColor,
} from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { formatDateTime } from '@/shared/utils/formatDate'

export const CommissionMemberDecisionsTable = ({
  memberDecisions = [],
  showResubmitActions = false,
  onResubmitToMember,
  resubmittingMemberId = null,
}) => {
  if (!memberDecisions.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Komissiya a’zolari topilmadi
      </Typography>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>F.I.Sh</TableCell>
            <TableCell width={160}>Holat</TableCell>
            <TableCell width={140}>Kelishilgan sana</TableCell>
            {showResubmitActions ? <TableCell width={150} align="right" /> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {memberDecisions.map((member) => {
            const isRejected = member.decision === 'REJECTED'
            const isResubmitting = resubmittingMemberId === member.userId

            return (
              <TableRow key={member.userId}>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{formatMemberLabel(member)}</Typography>
                    {member.comment?.trim() && isRejected ? (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {member.comment}
                      </Typography>
                    ) : null}
                  </Box>
                </TableCell>
                <TableCell>
                  {member.decision ? (
                    <Chip
                      size="small"
                      color={getDecisionChipColor(member.decision)}
                      label={getApprovalDecisionLabel(member.decision, member.decisionLabel)}
                    />
                  ) : (
                    <Chip
                      size="small"
                      variant="outlined"
                      color="warning"
                      label={getApprovalDecisionLabel(member.decision, member.decisionLabel)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {member.decidedAt ? formatDateTime(member.decidedAt) : '—'}
                </TableCell>
                {showResubmitActions ? (
                  <TableCell align="right">
                    {isRejected && onResubmitToMember ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        disabled={Boolean(resubmittingMemberId)}
                        startIcon={
                          isResubmitting ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <ReplayIcon fontSize="small" />
                          )
                        }
                        onClick={() => onResubmitToMember(member)}
                      >
                        Qayta yuborish
                      </Button>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
