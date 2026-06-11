import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { CommissionFormDialog } from '@/features/commissions/components/CommissionFormDialog'
import { CommissionsPageSkeleton } from '@/features/commissions/components/CommissionsPageSkeleton'
import { CommissionsTable } from '@/features/commissions/components/CommissionsTable'
import {
  useCreateCommissionMutation,
  useDeleteCommissionMutation,
  useGetCommissionsPagedQuery,
  useUpdateCommissionMutation,
} from '@/features/commissions/api/commissionsApi'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = '/royxatga-olish/komissiya-azolari'
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const KomissiyaAzolariPage = () => {
  const { user: authUser } = usePermissions()
  const [dialog, setDialog] = useState({ open: false, mode: 'create', commission: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [statusLoadingId, setStatusLoadingId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const commissionsQuery = useGetCommissionsPagedQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
  })
  const [createCommission, createState] = useCreateCommissionMutation()
  const [updateCommission, updateState] = useUpdateCommissionMutation()
  const [deleteCommission] = useDeleteCommissionMutation()

  const commissions = useMemo(
    () => commissionsQuery.data?.items ?? [],
    [commissionsQuery.data?.items],
  )
  const total = commissionsQuery.data?.total ?? 0

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'

  const canCreate = isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'create')
  const canUpdate = isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'update')
  const canDelete = isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'delete')

  const isSaving = createState.isLoading || updateState.isLoading

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleOpenCreate = () => {
    setDialog({ open: true, mode: 'create', commission: null })
  }

  const handleOpenEdit = (commission) => {
    setDialog({ open: true, mode: 'edit', commission })
  }

  const handleCloseDialog = () => {
    if (isSaving) return
    setDialog({ open: false, mode: 'create', commission: null })
  }

  const handleSubmit = async (payload) => {
    try {
      if (dialog.mode === 'create') {
        await createCommission(payload).unwrap()
        showSnackbar('Komissiya saqlandi')
      } else {
        await updateCommission({ id: dialog.commission.id, ...payload }).unwrap()
        showSnackbar('Komissiya yangilandi')
      }
      handleCloseDialog()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Saqlashda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleDeactivate = async (commission) => {
    setStatusLoadingId(commission.id)
    try {
      await deleteCommission(commission.id).unwrap()
      showSnackbar('Komissiya nofaol qilindi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Nofaol qilishda xatolik'), 'error')
    } finally {
      setStatusLoadingId(null)
    }
  }

  const handleActivate = async (commission) => {
    setStatusLoadingId(commission.id)
    try {
      await updateCommission({ id: commission.id, isActive: true }).unwrap()
      showSnackbar('Komissiya faol qilindi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Faol qilishda xatolik'), 'error')
    } finally {
      setStatusLoadingId(null)
    }
  }

  const isReady = !commissionsQuery.isLoading && !commissionsQuery.isUninitialized

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={commissionsQuery.isLoading}
        isFetching={commissionsQuery.isFetching}
        isUninitialized={commissionsQuery.isUninitialized}
        hasData={isReady}
        skeleton={<CommissionsPageSkeleton showAddButton={canCreate} />}
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
                Komissiya a’zolari
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xodimlardan komissiya tuzish va boshqarish
              </Typography>
            </Stack>

            {canCreate ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
              >
                Komissiya tuzish
              </Button>
            ) : null}
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

          {commissionsQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(commissionsQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : (
            <>
              <CommissionsTable
                commissions={commissions}
                canUpdate={canUpdate}
                canDelete={canDelete}
                statusLoadingId={statusLoadingId}
                onEdit={handleOpenEdit}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
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

      <CommissionFormDialog
        open={dialog.open}
        mode={dialog.mode}
        initialCommission={dialog.commission}
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
