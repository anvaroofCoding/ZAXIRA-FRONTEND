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
import { useGetApprovalInboxQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { PurchaseApprovalsTable } from '@/features/purchase-requests/components/PurchaseApprovalsTable'
import { PurchaseRequestApprovalDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestApprovalDetailDialog'
import { PurchaseRequestsPageSkeleton } from '@/features/purchase-requests/components/PurchaseRequestsPageSkeleton'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const ArizalarniTasdiqlashPage = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [downloadingId, setDownloadingId] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 350)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const inboxQuery = useGetApprovalInboxQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
  })

  const items = useMemo(() => inboxQuery.data?.items ?? [], [inboxQuery.data?.items])
  const total = inboxQuery.data?.total ?? 0
  const isReady = !inboxQuery.isLoading && !inboxQuery.isUninitialized

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
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
        isLoading={inboxQuery.isLoading}
        isFetching={inboxQuery.isFetching}
        isUninitialized={inboxQuery.isUninitialized}
        hasData={isReady}
        skeleton={<PurchaseRequestsPageSkeleton showAddButton={false} />}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              px: 2,
              py: 1.5,
            }}
          >
            <Stack spacing={0.25}>
              <Typography variant="h5" component="h1" fontWeight={600}>
                Arizalarni tasdiqlash
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sizga komissiya a’zosi yoki boshliq sifatida tayinlangan arizalarni ko‘rib chiqish
                va qaror berish
              </Typography>
            </Stack>
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

          {inboxQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(inboxQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : (
            <>
              <PurchaseApprovalsTable items={items} onView={(item) => setDetailTarget(item)} />

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

      <PurchaseRequestApprovalDetailDialog
        open={Boolean(detailTarget)}
        requestId={detailTarget?.id}
        downloading={downloadingId === detailTarget?.id}
        onClose={() => setDetailTarget(null)}
        onDownloadPdf={(item) => handleDownload(item, 'pdf')}
        onDownloadDocx={(item) => handleDownload(item, 'docx')}
        onSuccess={(message) => showSnackbar(message)}
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
