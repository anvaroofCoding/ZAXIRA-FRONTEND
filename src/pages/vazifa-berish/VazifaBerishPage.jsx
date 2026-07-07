import { useState } from 'react'
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import { AssignedTasksTable } from '@/features/tasks/components/AssignedTasksTable'
import { VazifaBerishDialog } from '@/features/tasks/components/VazifaBerishForm'
import { useGetAssignedTasksQuery } from '@/features/tasks/api/tasksApi'
import {
  probeTasksApiAvailability,
  resetTasksApiAvailability,
  useTasksApiAvailabilityProbe,
} from '@/features/tasks/utils/tasksApiAvailability'
import { TASK_ASSIGNMENT_PAGE_PATH } from '@/features/permissions/constants'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { SkeletonBlock } from '@/shared/components/skeleton'
import { usePermissions } from '@/shared/hooks/usePermissions'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const VazifaBerishPage = () => {
  const { user } = usePermissions()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'SUPER_ADMIN'
  const canCreate =
    isSuperAdmin || hasPageAction(user, TASK_ASSIGNMENT_PAGE_PATH, 'create')

  const { unavailable: tasksApiUnavailable, probing: tasksApiProbing } =
    useTasksApiAvailabilityProbe()
  const tasksQuery = useGetAssignedTasksQuery({
    page: page + 1,
    limit: rowsPerPage,
  })

  const items = tasksQuery.data?.items ?? []
  const total = tasksQuery.data?.total ?? 0

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {tasksApiUnavailable && !tasksApiProbing ? (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                resetTasksApiAvailability()
                probeTasksApiAvailability().then(() => window.location.reload())
              }}
            >
              Qayta urinish
            </Button>
          }
        >
          Vazifalar moduli serverda topilmadi. Backend yangilangan bo‘lsa, «Qayta urinish»ni
          bosing.
        </Alert>
      ) : null}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography variant="h6" fontWeight={700}>
          Vazifa berish
        </Typography>

        {canCreate ? (
          <Button
            variant="contained"
            startIcon={<AddTaskOutlinedIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            Vazifa berish
          </Button>
        ) : null}
      </Stack>

      {!canCreate ? (
        <Alert severity="info">Vazifa berish uchun «Jo‘natish» ruxsati kerak.</Alert>
      ) : null}

      <VazifaBerishDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(result) => {
          setSnackbar({
            open: true,
            message: `${result.count} ta foydalanuvchiga vazifa berildi`,
          })
        }}
      />

      <Stack spacing={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          Berilgan vazifalar
        </Typography>

        <QuerySkeleton
          isLoading={tasksQuery.isLoading}
          isFetching={tasksQuery.isFetching}
          isUninitialized={tasksQuery.isUninitialized}
          hasData={!tasksQuery.isLoading && !tasksQuery.isUninitialized}
          skeleton={<SkeletonBlock height={280} sx={{ borderRadius: 2 }} />}
        >
          <AssignedTasksTable items={items} />
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number.parseInt(event.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            labelRowsPerPage="Qatorlar:"
          />
        </QuerySkeleton>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  )
}
