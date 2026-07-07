import { useEffect, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { CustomUnitFormDialog } from '@/features/measurement-units/components/CustomUnitFormDialog'
import { CustomUnitsPageSkeleton } from '@/features/measurement-units/components/CustomUnitsPageSkeleton'
import { CustomUnitsTable } from '@/features/measurement-units/components/CustomUnitsTable'
import {
  useDeleteCustomMeasurementUnitMutation,
  useGetCustomMeasurementUnitsPagedQuery,
  useUpdateCustomMeasurementUnitMutation,
} from '@/features/measurement-units/api/measurementUnitsApi'
import { UNITS_PAGE_PATH } from '@/features/permissions/constants'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = UNITS_PAGE_PATH
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const BirliklarPage = () => {
  const { user: authUser } = usePermissions()
  const [dialog, setDialog] = useState({ open: false, unit: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [statusLoadingId, setStatusLoadingId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const unitsQuery = useGetCustomMeasurementUnitsPagedQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
  })
  const [updateUnit, updateState] = useUpdateCustomMeasurementUnitMutation()
  const [deleteUnit] = useDeleteCustomMeasurementUnitMutation()

  const units = useMemo(() => unitsQuery.data?.items ?? [], [unitsQuery.data?.items])
  const total = unitsQuery.data?.total ?? 0

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'

  const canUpdate = isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'update')
  const canDelete = isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'delete')

  const isSaving = updateState.isLoading

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleOpenEdit = (unit) => {
    setDialog({ open: true, unit })
  }

  const handleCloseDialog = () => {
    if (isSaving) return
    setDialog({ open: false, unit: null })
  }

  const handleSubmit = async (payload) => {
    try {
      await updateUnit({ id: dialog.unit.id, ...payload }).unwrap()
      showSnackbar('Birlik yangilandi')
      handleCloseDialog()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Saqlashda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleDelete = async (unit) => {
    setStatusLoadingId(unit.id)
    try {
      await deleteUnit(unit.id).unwrap()
      showSnackbar('Birlik o‘chirildi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'O‘chirishda xatolik'), 'error')
    } finally {
      setStatusLoadingId(null)
    }
  }

  const isReady = !unitsQuery.isLoading && !unitsQuery.isUninitialized

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={unitsQuery.isLoading}
        isFetching={unitsQuery.isFetching}
        isUninitialized={unitsQuery.isUninitialized}
        hasData={isReady}
        skeleton={<CustomUnitsPageSkeleton />}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Stack spacing={0.25}>
              <Typography variant="h5" component="h1" fontWeight={600}>
                Birliklar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Foydalanuvchilar qo‘shgan maxsus o‘lchov birliklarini boshqarish
              </Typography>
            </Stack>
          </Paper>

          <TextField
            size="small"
            placeholder="Qidirish"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ maxWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {unitsQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(unitsQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : (
            <>
              <CustomUnitsTable
                units={units}
                canUpdate={canUpdate}
                canDelete={canDelete}
                statusLoadingId={statusLoadingId}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setPage(0)
                }}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Sahifada:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} / ${count !== -1 ? count : `>${to}`}`
                }
              />
            </>
          )}
        </Box>
      </QuerySkeleton>

      <CustomUnitFormDialog
        open={dialog.open}
        initialUnit={dialog.unit}
        loading={isSaving}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
