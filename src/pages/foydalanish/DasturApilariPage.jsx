import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import ApiOutlinedIcon from '@mui/icons-material/ApiOutlined'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  useCreateApiAccessGrantMutation,
  useGetApiAccessGrantsQuery,
  useGetApiCatalogQuery,
  useRevokeApiAccessGrantMutation,
} from '@/features/api-access/api/apiAccessApi'
import { ApiAccessGrantsTable } from '@/features/api-access/components/ApiAccessGrantsTable'
import { ApiKeyRevealDialog } from '@/features/api-access/components/ApiKeyRevealDialog'
import { GrantApiDialog } from '@/features/api-access/components/GrantApiDialog'
import { GrantDetailDialog } from '@/features/api-access/components/GrantDetailDialog'
import { downloadApiGrantPdf } from '@/features/api-access/utils/downloadApiGrantPdf'
import { isPrivilegedAdminUser } from '@/features/auth/utils/isPrivilegedAdminUser'
import { PageShell } from '@/shared/components/layout/PageShell'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { PageContentSkeleton } from '@/shared/components/skeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const DasturApilariPage = () => {
  const theme = useTheme()
  const { user } = usePermissions()
  const isAdmin = isPrivilegedAdminUser(user)

  const [grantDialogOpen, setGrantDialogOpen] = useState(false)
  const [revealState, setRevealState] = useState({ open: false, grant: null, plainKey: '' })
  const [detailGrant, setDetailGrant] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const catalogQuery = useGetApiCatalogQuery()
  const grantsQuery = useGetApiAccessGrantsQuery(
    {
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch,
    },
    { skip: !isAdmin },
  )

  const [createGrant, createState] = useCreateApiAccessGrantMutation()
  const [revokeGrant] = useRevokeApiAccessGrantMutation()

  const grants = useMemo(() => grantsQuery.data?.items ?? [], [grantsQuery.data?.items])
  const total = grantsQuery.data?.total ?? 0
  const stats = grantsQuery.data?.stats ?? { active: 0, revoked: 0, total: 0 }
  const catalogItems = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data])

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCreateGrant = async (payload) => {
    const result = await createGrant(payload).unwrap()
    setGrantDialogOpen(false)
    setRevealState({
      open: true,
      grant: result,
      plainKey: result.plainKey,
    })
    showSnackbar('API muvaffaqiyatli berildi')
  }

  const handleDownloadPdf = async (grant) => {
    try {
      await downloadApiGrantPdf({
        grantId: grant.id,
        fileName: `api-berish-${grant.institutionName || grant.id}.pdf`,
      })
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'PDF yuklab bo‘lmadi'), 'error')
    }
  }

  const handleRevoke = async (grant) => {
    const confirmed = window.confirm(
      `${grant.institutionName} uchun API kalitni bekor qilasizmi?`,
    )
    if (!confirmed) return

    try {
      await revokeGrant(grant.id).unwrap()
      showSnackbar('API kalit bekor qilindi')
    } catch (error) {
      showSnackbar(getApiErrorMessage(error, 'Bekor qilishda xatolik'), 'error')
    }
  }

  return (
    <PageShell>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ApiOutlinedIcon color="primary" />
              <Typography variant="h5" fontWeight={700}>
                Dastur apilari
              </Typography>
            </Stack>
          </Box>

          {isAdmin ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setGrantDialogOpen(true)}
              sx={{
                alignSelf: 'flex-end',
                ml: { sm: 'auto' },
                px: 1.5,
                py: 0.5,
                minHeight: 32,
                whiteSpace: 'nowrap',
              }}
            >
              API berish
            </Button>
          ) : null}
        </Stack>

        {isAdmin ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                bgcolor: 'primary.main',
                borderColor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.9 }}>
                  Faol
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {stats.active}
                </Typography>
              </CardContent>
            </Card>
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                bgcolor: 'primary.main',
                borderColor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.9 }}>
                  Bekor qilingan
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {stats.revoked}
                </Typography>
              </CardContent>
            </Card>
            <Card
              variant="outlined"
              sx={{
                flex: 1,
                bgcolor: 'primary.main',
                borderColor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.9 }}>
                  Jami berilgan
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        ) : null}

        {isAdmin ? (
          <>
            <TextField
              size="small"
              placeholder="Qidiruv"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                  ),
                },
              }}
            />

            <QuerySkeleton
              isLoading={grantsQuery.isLoading}
              data={grants}
              skeleton={<PageContentSkeleton lines={1} />}
            >
              {grantsQuery.isError ? (
                <Alert severity="error">
                  {getApiErrorMessage(grantsQuery.error, 'Ro‘yxatni yuklashda xatolik')}
                </Alert>
              ) : (
                <>
                  <ApiAccessGrantsTable
                    grants={grants}
                    canManage={isAdmin}
                    onView={setDetailGrant}
                    onDownloadPdf={handleDownloadPdf}
                    onRevoke={handleRevoke}
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
                    labelRowsPerPage="Qator:"
                  />
                </>
              )}
            </QuerySkeleton>
          </>
        ) : (
          <Alert severity="info">
            API berish va boshqarish faqat administratorlar uchun. Siz mavjud API katalogi
            bilan tanishishingiz mumkin.
          </Alert>
        )}
      </Stack>

      <GrantApiDialog
        open={grantDialogOpen}
        onClose={() => setGrantDialogOpen(false)}
        onSubmit={handleCreateGrant}
        isSaving={createState.isLoading}
      />

      <ApiKeyRevealDialog
        open={revealState.open}
        grant={revealState.grant}
        plainKey={revealState.plainKey}
        onClose={() => setRevealState({ open: false, grant: null, plainKey: '' })}
      />

      <GrantDetailDialog
        open={Boolean(detailGrant)}
        grant={detailGrant}
        onClose={() => setDetailGrant(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageShell>
  )
}
