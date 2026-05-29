import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { PermanentDeleteDialog } from '@/features/users/components/PermanentDeleteDialog'
import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import { UsersPageSkeleton } from '@/features/users/components/UsersPageSkeleton'
import { UsersTable } from '@/features/users/components/UsersTable'
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetPermissionCatalogQuery,
  useGetUsersQuery,
  usePermanentDeleteUserMutation,
  useUpdateUserMutation,
} from '@/features/users/api/usersApi'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = '/royxatga-olish/foydalanuvchilar'
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const FoydalanuvchilarPage = () => {
  const { user: authUser } = usePermissions()
  const [dialog, setDialog] = useState({ open: false, mode: 'create', user: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [search, setSearch] = useState('')
  const [structureFilter, setStructureFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [statusLoadingId, setStatusLoadingId] = useState(null)
  const [permanentTarget, setPermanentTarget] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, structureFilter])

  const catalogQuery = useGetPermissionCatalogQuery()
  const structuresQuery = useGetStructuresQuery()
  const usersQuery = useGetUsersQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    structureId: structureFilter,
  })

  const [createUser, createState] = useCreateUserMutation()
  const [updateUser, updateState] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [permanentDeleteUser, permanentDeleteState] = usePermanentDeleteUserMutation()

  const catalog = catalogQuery.data
  const structures = useMemo(() => structuresQuery.data ?? [], [structuresQuery.data])
  const structuresForFilter = useMemo(
    () => [...structures].sort((a, b) => a.fullName.localeCompare(b.fullName, 'uz')),
    [structures],
  )
  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data?.items])
  const total = usersQuery.data?.total ?? 0

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'

  const canCreate =
    isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'create')
  const canUpdate =
    isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'update')
  const canDelete =
    isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'delete')

  const isSaving = createState.isLoading || updateState.isLoading

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleOpenCreate = () => {
    setDialog({ open: true, mode: 'create', user: null })
  }

  const handleOpenEdit = (user) => {
    setDialog({ open: true, mode: 'edit', user })
  }

  const handleCloseDialog = () => {
    if (isSaving) return
    setDialog({ open: false, mode: 'create', user: null })
  }

  const handleSubmit = async (payload) => {
    try {
      if (dialog.mode === 'create') {
        await createUser(payload).unwrap()
        showSnackbar('Foydalanuvchi qo‘shildi')
      } else {
        await updateUser({ id: dialog.user.id, ...payload }).unwrap()
        showSnackbar('Foydalanuvchi yangilandi')
      }
      handleCloseDialog()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Saqlashda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleDeactivate = async (user) => {
    setStatusLoadingId(user.id)
    try {
      await deleteUser(user.id).unwrap()
      showSnackbar('Foydalanuvchi nofaol qilindi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Nofaol qilishda xatolik'), 'error')
    } finally {
      setStatusLoadingId(null)
    }
  }

  const handleActivate = async (user) => {
    setStatusLoadingId(user.id)
    try {
      await updateUser({ id: user.id, isActive: true }).unwrap()
      showSnackbar('Foydalanuvchi faol qilindi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Faol qilishda xatolik'), 'error')
    } finally {
      setStatusLoadingId(null)
    }
  }

  const handlePermanentDeleteRequest = (user) => {
    setPermanentTarget(user)
  }

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentTarget) return

    try {
      await permanentDeleteUser(permanentTarget.id).unwrap()
      showSnackbar('Profil o‘chirildi')
      setPermanentTarget(null)
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'O‘chirishda xatolik'), 'error')
    }
  }

  const isUsersReady = !usersQuery.isLoading && !usersQuery.isUninitialized

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={usersQuery.isLoading}
        isFetching={usersQuery.isFetching}
        isUninitialized={usersQuery.isUninitialized}
        hasData={isUsersReady}
        skeleton={<UsersPageSkeleton showAddButton={canCreate} />}
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
                Foydalanuvchilar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profil ochish va sahifa ruxsatlarini boshqarish
              </Typography>
            </Stack>

            {canCreate ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
              >
                Qo‘shish
              </Button>
            ) : null}
          </Paper>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="users-structure-filter-label">Tuzilma</InputLabel>
              <Select
                labelId="users-structure-filter-label"
                label="Tuzilma"
                value={structureFilter}
                onChange={(event) => setStructureFilter(event.target.value)}
              >
                <MenuItem value="">
                  <em>Barchasi</em>
                </MenuItem>
                {structuresForFilter.map((structure) => (
                  <MenuItem key={structure.id} value={structure.id}>
                    {structure.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Qidirish"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 280 }, maxWidth: 400, flex: 1 }}
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
          </Box>

          {usersQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(usersQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : (
            <>
              <UsersTable
                users={users}
                currentUserId={authUser?.id}
                isSuperAdmin={isSuperAdmin}
                canUpdate={canUpdate}
                canDelete={canDelete}
                statusLoadingId={statusLoadingId}
                onEdit={handleOpenEdit}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
                onPermanentDelete={handlePermanentDeleteRequest}
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

      <UserFormDialog
        open={dialog.open}
        mode={dialog.mode}
        initialUser={dialog.user}
        catalog={catalog}
        catalogLoading={catalogQuery.isLoading}
        structures={structures}
        structuresLoading={structuresQuery.isLoading}
        loading={isSaving}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />

      <PermanentDeleteDialog
        open={Boolean(permanentTarget)}
        user={permanentTarget}
        loading={permanentDeleteState.isLoading}
        onClose={() => {
          if (!permanentDeleteState.isLoading) setPermanentTarget(null)
        }}
        onConfirm={handlePermanentDeleteConfirm}
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
