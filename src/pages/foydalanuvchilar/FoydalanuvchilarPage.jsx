import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
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
import { GlobalSecondCodeDialog } from '@/features/settings/components/GlobalSecondCodeDialog'
import { UsersPageSkeleton } from '@/features/users/components/UsersPageSkeleton'
import { UsersTable } from '@/features/users/components/UsersTable'
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  usePermanentDeleteUserMutation,
  useUpdateUserMutation,
} from '@/features/users/api/usersApi'
import { USERS_PAGE_PATH } from '@/features/permissions/constants'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const FoydalanuvchilarPage = () => {
  const navigate = useNavigate()
  const { user: authUser } = usePermissions()
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [search, setSearch] = useState('')
  const [structureFilter, setStructureFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [statusLoadingId, setStatusLoadingId] = useState(null)
  const [permanentTarget, setPermanentTarget] = useState(null)
  const [globalCodeOpen, setGlobalCodeOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, structureFilter])

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'

  const canViewActivity = isSuperAdmin

  const structuresQuery = useGetStructuresQuery()
  const usersQuery = useGetUsersQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    structureId: structureFilter,
  }, {
    pollingInterval: canViewActivity ? 15000 : 0,
  })

  const [deleteUser] = useDeleteUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [permanentDeleteUser, permanentDeleteState] = usePermanentDeleteUserMutation()

  const structures = useMemo(() => structuresQuery.data ?? [], [structuresQuery.data])
  const structuresForFilter = useMemo(
    () => [...structures].sort((a, b) => a.fullName.localeCompare(b.fullName, 'uz')),
    [structures],
  )
  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data?.items])
  const total = usersQuery.data?.total ?? 0

  const canCreate =
    isSuperAdmin || hasPageAction(authUser, USERS_PAGE_PATH, 'create')
  const canUpdate =
    isSuperAdmin || hasPageAction(authUser, USERS_PAGE_PATH, 'update')
  const canDelete =
    isSuperAdmin || hasPageAction(authUser, USERS_PAGE_PATH, 'delete')

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleOpenCreate = () => {
    navigate(`${USERS_PAGE_PATH}/yangi`)
  }

  const handleOpenEdit = (user) => {
    navigate(`${USERS_PAGE_PATH}/${user.id}/tahrirlash`)
  }

  const handleViewActivity = (user) => {
    navigate(`${USERS_PAGE_PATH}/${user.id}/faollik`)
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
                {canViewActivity ? ' · Faollik uchun qatorni bosing' : ''}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {isSuperAdmin ? (
                <Button
                  variant="outlined"
                  startIcon={<VpnKeyOutlinedIcon />}
                  onClick={() => setGlobalCodeOpen(true)}
                >
                  Umumiy kod
                </Button>
              ) : null}
              {canCreate ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
                >
                  Qo‘shish
                </Button>
              ) : null}
            </Stack>
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
                canViewActivity={canViewActivity}
                statusLoadingId={statusLoadingId}
                onEdit={handleOpenEdit}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
                onPermanentDelete={handlePermanentDeleteRequest}
                onViewActivity={handleViewActivity}
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

      <PermanentDeleteDialog
        open={Boolean(permanentTarget)}
        user={permanentTarget}
        loading={permanentDeleteState.isLoading}
        onClose={() => {
          if (!permanentDeleteState.isLoading) setPermanentTarget(null)
        }}
        onConfirm={handlePermanentDeleteConfirm}
      />

      <GlobalSecondCodeDialog
        open={globalCodeOpen}
        onClose={() => setGlobalCodeOpen(false)}
        onSaved={(message) => showSnackbar(message)}
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
