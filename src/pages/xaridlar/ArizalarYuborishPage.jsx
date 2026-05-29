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
import { PurchaseRequestDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestDetailDialog'
import { PurchaseRequestFormDialog } from '@/features/purchase-requests/components/PurchaseRequestFormDialog'
import { ResubmitPurchaseRequestDialog } from '@/features/purchase-requests/components/ResubmitPurchaseRequestDialog'
import { PurchaseRequestsPageSkeleton } from '@/features/purchase-requests/components/PurchaseRequestsPageSkeleton'
import { PurchaseRequestsTable } from '@/features/purchase-requests/components/PurchaseRequestsTable'
import {
  useCreatePurchaseRequestMutation,
  useGetPurchaseRequestsQuery,
  useResubmitPurchaseRequestMutation,
} from '@/features/purchase-requests/api/purchaseRequestsApi'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = '/xaridlar/arizalar-yuborish'
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const ArizalarYuborishPage = () => {
  const { user: authUser } = usePermissions()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [downloadingId, setDownloadingId] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [resubmitTarget, setResubmitTarget] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const requestsQuery = useGetPurchaseRequestsQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
  })
  const [createPurchaseRequest, createState] = useCreatePurchaseRequestMutation()
  const [resubmitPurchaseRequest, resubmitState] = useResubmitPurchaseRequestMutation()

  const items = useMemo(() => requestsQuery.data?.items ?? [], [requestsQuery.data?.items])
  const total = requestsQuery.data?.total ?? 0

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'
  const canCreate =
    isSuperAdmin || hasPageAction(authUser, PAGE_PATH, 'create')

  const isRequestsReady = !requestsQuery.isLoading && !requestsQuery.isUninitialized

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSubmit = async (payload) => {
    try {
      const created = await createPurchaseRequest(payload).unwrap()
      setDialogOpen(false)
      showSnackbar(`Ariza ${created.requestCode} yuborildi`)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Saqlashda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleResubmit = async (payload) => {
    if (!resubmitTarget?.id) return

    try {
      await resubmitPurchaseRequest({ id: resubmitTarget.id, ...payload }).unwrap()
      setResubmitTarget(null)
      setDetailTarget(null)
      showSnackbar('Ariza qayta yuborildi')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Qayta yuborishda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  const handleDownload = async (item, type) => {
    setDownloadingId(item.id)

    try {
      const extension = type === 'pdf' ? 'pdf' : 'docx'
      await downloadAuthenticatedFile(
        `/purchase-requests/${item.id}/export/${extension}`,
        `buyurtma-${item.requestCode}.${extension}`,
      )
    } catch (error) {
      showSnackbar(error.message || 'Yuklab olishda xatolik', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={requestsQuery.isLoading}
        isFetching={requestsQuery.isFetching}
        isUninitialized={requestsQuery.isUninitialized}
        hasData={isRequestsReady}
        skeleton={<PurchaseRequestsPageSkeleton showAddButton={canCreate} />}
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
                Arizalar yuborish
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tovar xarid qilish uchun ariza yuborish va hujjatlarni yuklab olish
              </Typography>
            </Stack>

            {canCreate ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
              >
                Qo‘shish
              </Button>
            ) : null}
          </Paper>

          <TextField
            size="small"
            placeholder="Qidirish"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 280 }, maxWidth: 400 }}
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

          {requestsQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(requestsQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : (
            <>
              <PurchaseRequestsTable
                items={items}
                downloadingId={downloadingId}
                onView={(item) => setDetailTarget(item)}
                onDownloadPdf={(item) => handleDownload(item, 'pdf')}
                onDownloadDocx={(item) => handleDownload(item, 'docx')}
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

      <PurchaseRequestFormDialog
        open={dialogOpen}
        loading={createState.isLoading}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <PurchaseRequestDetailDialog
        open={Boolean(detailTarget)}
        requestId={detailTarget?.id}
        downloading={downloadingId === detailTarget?.id}
        onClose={() => setDetailTarget(null)}
        onDownloadPdf={(item) => handleDownload(item, 'pdf')}
        onDownloadDocx={(item) => handleDownload(item, 'docx')}
        onResubmit={(item) => {
          setResubmitTarget(item)
        }}
      />

      <ResubmitPurchaseRequestDialog
        open={Boolean(resubmitTarget)}
        request={resubmitTarget}
        loading={resubmitState.isLoading}
        onClose={() => setResubmitTarget(null)}
        onSubmit={handleResubmit}
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
