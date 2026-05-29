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
import { StructureFormDialog } from '@/features/structures/components/StructureFormDialog'
import { StructuresPageSkeleton } from '@/features/structures/components/StructuresPageSkeleton'
import { StructuresTable } from '@/features/structures/components/StructuresTable'
import {
  useCreateStructureMutation,
  useDeleteStructureMutation,
  useGetStructuresPagedQuery,
  useUpdateStructureMutation,
} from '@/features/structures/api/structuresApi'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = '/royxatga-olish/tuzilmalar'
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const TuzilmalarPage = () => {
  const { user: authUser } = usePermissions()
  const [dialog, setDialog] = useState({ open: false, mode: 'create', structure: null })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [statusLoadingId, setStatusLoadingId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const structuresQuery = useGetStructuresPagedQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
  })
  const [createStructure, createState] = useCreateStructureMutation()
  const [updateStructure, updateState] = useUpdateStructureMutation()
  const [deleteStructure] = useDeleteStructureMutation()

  const structures = useMemo(
    () => structuresQuery.data?.items ?? [],
    [structuresQuery.data?.items],
  )
  const total = structuresQuery.data?.total ?? 0

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
    setDialog({ open: true, mode: 'create', structure: null })
  }

  const handleOpenEdit = (structure) => {
    setDialog({ open: true, mode: 'edit', structure })
  }

  const handleCloseDialog = () => {
    if (isSaving) return
    setDialog({ open: false, mode: 'create', structure: null })
  }

  const handleSubmit = async (payload) => {
    try {
      if (dialog.mode === 'create') {
        await createStructure(payload).unwrap()
        showSnackbar('Tarkibiy tuzilma ro‘yxatga olindi')
      } else {
        await updateStructure({ id: dialog.structure.id, ...payload }).unwrap()
        showSnackbar('Tarkibiy tuzilma yangilandi')
      }
      handleCloseDialog()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Saqlashda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleDeactivate = async (structure) => {
    setStatusLoadingId(structure.id)
    try {
      await deleteStructure(structure.id).unwrap()
      showSnackbar('Tarkibiy tuzilma nofaol qilindi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Nofaol qilishda xatolik'), 'error')
    } finally {
      setStatusLoadingId(null)
    }
  }

  const handleActivate = async (structure) => {
    setStatusLoadingId(structure.id)
    try {
      await updateStructure({ id: structure.id, isActive: true }).unwrap()
      showSnackbar('Tarkibiy tuzilma faol qilindi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Faol qilishda xatolik'), 'error')
    } finally {
      setStatusLoadingId(null)
    }
  }

  const isReady = !structuresQuery.isLoading && !structuresQuery.isUninitialized

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={structuresQuery.isLoading}
        isFetching={structuresQuery.isFetching}
        isUninitialized={structuresQuery.isUninitialized}
        hasData={isReady}
        skeleton={<StructuresPageSkeleton showAddButton={canCreate} />}
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
                Tarkibiy tuzilmalar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tarkibiy tuzilmani ro‘yxatga olish va boshqarish
              </Typography>
            </Stack>

            {canCreate ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
              >
                Ro‘yxatga olish
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

          {structuresQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(structuresQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : (
            <>
              <StructuresTable
                structures={structures}
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

      <StructureFormDialog
        open={dialog.open}
        mode={dialog.mode}
        initialStructure={dialog.structure}
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
