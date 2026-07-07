import { useState } from 'react'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import {
  useCancelAssignedTaskMutation,
  useCompleteAssignedTaskMutation,
} from '@/features/tasks/api/tasksApi'
import { isPrivilegedAdminUser } from '@/features/auth/utils/isPrivilegedAdminUser'
import { TASK_ASSIGNMENT_PAGE_PATH } from '@/features/permissions/constants'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { downloadTaskFile } from '@/features/tasks/utils/downloadTaskFile'
import { isTaskOverdue } from '@/features/tasks/utils/isTaskOverdue'
import { getTaskFiles } from '@/features/tasks/utils/taskFiles'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

const getStatusChip = (task) => {
  if (task.status === 'COMPLETED') {
    return { label: 'Bajarildi', color: 'success' }
  }

  if (task.status === 'CANCELLED') {
    return { label: 'Bekor qilindi', color: 'default' }
  }

  if (isTaskOverdue(task)) {
    return { label: 'Kechiktirildi', color: 'error' }
  }

  return { label: 'Kutilmoqda', color: 'warning' }
}

const canManageAssignedTask = (user, task) => {
  if (!user || task.status !== 'PENDING') {
    return false
  }

  if (isPrivilegedAdminUser(user)) {
    return true
  }

  if (task.assignedBy?.userId === user.id) {
    return true
  }

  return hasPageAction(user, TASK_ASSIGNMENT_PAGE_PATH, 'update')
}

export const AssignedTasksTable = ({ items = [] }) => {
  const { user } = usePermissions()
  const showActionsColumn = items.some((task) => canManageAssignedTask(user, task))
  const [completeTask, completeState] = useCompleteAssignedTaskMutation()
  const [cancelTask, cancelState] = useCancelAssignedTaskMutation()
  const [actionError, setActionError] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)

  const isSubmitting = completeState.isLoading || cancelState.isLoading

  const handleConfirm = async () => {
    if (!confirmAction?.task) {
      return
    }

    setActionError('')

    try {
      if (confirmAction.type === 'complete') {
        await completeTask(confirmAction.task.id).unwrap()
      } else {
        await cancelTask(confirmAction.task.id).unwrap()
      }
      setConfirmAction(null)
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          confirmAction.type === 'complete'
            ? 'Vazifani yakunlab bo‘lmadi'
            : 'Vazifani bekor qilib bo‘lmadi',
        ),
      )
    }
  }

  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
        Hozircha berilgan vazifalar yo‘q
      </Paper>
    )
  }

  const confirmTask = confirmAction?.task

  return (
    <Stack spacing={1}>
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Vazifa</TableCell>
              <TableCell>Tuzilma</TableCell>
              <TableCell>Ijrochi</TableCell>
              <TableCell>Muddat</TableCell>
              <TableCell>Holat</TableCell>
              <TableCell align="right" width={showActionsColumn ? 108 : 56}>
                {showActionsColumn ? 'Amallar' : ''}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((task) => {
              const statusChip = getStatusChip(task)
              const canActOnTask = canManageAssignedTask(user, task)

              return (
                <TableRow key={task.id} hover>
                  <TableCell>
                    <strong>{task.title}</strong>
                    <br />
                    <span style={{ color: 'var(--mui-palette-text-secondary)' }}>
                      {task.description}
                    </span>
                  </TableCell>
                  <TableCell>{task.structure?.shortName ?? '—'}</TableCell>
                  <TableCell>{task.assignee?.displayName ?? '—'}</TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <Chip size="small" color={statusChip.color} label={statusChip.label} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.25} sx={{ justifyContent: 'flex-end' }}>
                      {getTaskFiles(task).map((file) => (
                        <Tooltip
                          key={file.storedName ?? file.originalName}
                          title={file.originalName}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              downloadTaskFile(task.id, file.originalName, file.storedName).catch(
                                () => {},
                              )
                            }
                          >
                            <FileDownloadOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ))}
                      {canActOnTask ? (
                        <>
                          <Tooltip title="Bajarildi deb belgilash">
                            <span>
                              <IconButton
                                size="small"
                                color="success"
                                disabled={isSubmitting}
                                onClick={() =>
                                  setConfirmAction({ type: 'complete', task })
                                }
                              >
                                <CheckCircleOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Vazifani bekor qilish">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={isSubmitting}
                                onClick={() => setConfirmAction({ type: 'cancel', task })}
                              >
                                <CancelOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      ) : null}
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={Boolean(confirmAction)}
        onClose={isSubmitting ? undefined : () => setConfirmAction(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmAction?.type === 'complete' ? 'Vazifani bajarildi deb belgilash' : 'Vazifani bekor qilish'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction?.type === 'complete' ? (
              <>
                <strong>{confirmTask?.title}</strong> vazifasini{' '}
                <strong>{confirmTask?.assignee?.displayName}</strong> uchun bajarildi deb
                belgilaysizmi?
              </>
            ) : (
              <>
                <strong>{confirmTask?.title}</strong> vazifasini{' '}
                <strong>{confirmTask?.assignee?.displayName}</strong> uchun bekor qilasizmi?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmAction(null)} disabled={isSubmitting}>
            Yo‘q
          </Button>
          <Button
            variant="contained"
            color={confirmAction?.type === 'complete' ? 'success' : 'error'}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {confirmAction?.type === 'complete' ? 'Ha, bajarildi' : 'Ha, bekor qilish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
