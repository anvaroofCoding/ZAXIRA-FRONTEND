import { useMemo, useState } from 'react'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useGetMyPendingTasksQuery } from '@/features/tasks/api/tasksApi'
import { useIsTasksApiUnavailable } from '@/features/tasks/utils/tasksApiAvailability'
import { downloadTaskFile } from '@/features/tasks/utils/downloadTaskFile'
import { isTaskOverdue } from '@/features/tasks/utils/isTaskOverdue'
import { getTaskFiles } from '@/features/tasks/utils/taskFiles'

const formatDate = (value) =>
  new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))

export const MyTasksBanner = () => {
  const tasksApiUnavailable = useIsTasksApiUnavailable()
  const tasksQuery = useGetMyPendingTasksQuery(undefined, {
    pollingInterval: 60_000,
  })
  const [expanded, setExpanded] = useState(true)

  const tasks = tasksQuery.data ?? []
  const overdueCount = useMemo(
    () => tasks.filter((task) => isTaskOverdue(task)).length,
    [tasks],
  )
  const hasOverdue = overdueCount > 0
  const bannerTone = hasOverdue ? 'error' : 'warning'

  if (tasksApiUnavailable || !tasks.length) {
    return null
  }

  return (
    <Box
      sx={{
        flexShrink: 0,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          px: 2,
          py: 1,
          minHeight: 48,
          bgcolor: (theme) => alpha(theme.palette[bannerTone].main, 0.14),
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}
        >
          <AssignmentOutlinedIcon
            fontSize="small"
            color={bannerTone}
            sx={{ flexShrink: 0, display: 'block' }}
          />
          <Typography
            variant="body2"
            fontWeight={600}
            color={`${bannerTone}.dark`}
            sx={{ lineHeight: 1.25, m: 0 }}
          >
            Sizga berilgan vazifalar: {tasks.length}
            {hasOverdue ? (
              <Typography
                component="span"
                variant="body2"
                color="error.dark"
                fontWeight={700}
                sx={{ ml: 0.75 }}
              >
                · Kechiktirildi
              </Typography>
            ) : null}
          </Typography>
        </Stack>

        <Button
          size="small"
          variant="text"
          color={bannerTone}
          startIcon={expanded ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
          onClick={() => setExpanded((prev) => !prev)}
          sx={{ flexShrink: 0, fontWeight: 600 }}
        >
          {expanded ? 'Yig‘ish' : 'Ko‘rish'}
        </Button>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default' }}>
          <Stack spacing={1}>
            {tasks.map((task) => {
              const taskOverdue = isTaskOverdue(task)

              return (
              <Paper
                key={task.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderLeftWidth: 4,
                  borderLeftStyle: 'solid',
                  borderLeftColor: taskOverdue ? 'error.main' : 'primary.main',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    mb: 0.75,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 0, flex: 1 }}>
                    {task.title}
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      taskOverdue ? 'Kechiktirildi' : `Muddat: ${formatDate(task.dueDate)}`
                    }
                    color={taskOverdue ? 'error' : 'primary'}
                    variant="filled"
                    sx={{ flexShrink: 0, fontWeight: 600 }}
                  />
                </Stack>

                <Typography variant="body2" color="text.primary">
                  {task.description}
                </Typography>

                {getTaskFiles(task).length ? (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                    {getTaskFiles(task).map((file) => (
                      <Tooltip key={file.storedName ?? file.originalName} title={file.originalName}>
                        <IconButton
                          size="small"
                          aria-label={`${file.originalName} faylini yuklab olish`}
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
                  </Stack>
                ) : null}
              </Paper>
            )})}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  )
}
