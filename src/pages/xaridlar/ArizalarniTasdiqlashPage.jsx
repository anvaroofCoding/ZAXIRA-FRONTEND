import { useCallback, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import TablePagination from '@mui/material/TablePagination'
import { useGetApprovalInboxQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { PurchaseApprovalsTable } from '@/features/purchase-requests/components/PurchaseApprovalsTable'
import { PurchaseRequestApprovalDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestApprovalDetailDialog'
import { PurchaseRequestsPageSkeleton } from '@/features/purchase-requests/components/PurchaseRequestsPageSkeleton'
import { PurchasingPageFilters } from '@/features/purchase-requests/components/PurchasingPageFilters'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePurchasingListFilters } from '@/shared/hooks/usePurchasingListFilters'
import { useSubmittedDocumentDownload } from '@/features/purchase-requests/hooks/useSubmittedDocumentDownload'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const ArizalarniTasdiqlashPage = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [detailTarget, setDetailTarget] = useState(null)

  const {
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    queryParams,
    clearFilters,
    hasActiveFilters,
    structureFilter,
    setStructureFilter,
    structureFilterReady,
    viewerStructureId,
  } = usePurchasingListFilters(10, {
    withStructureFilter: true,
    structureFilterDefault: 'all',
  })

  const inboxQuery = useGetApprovalInboxQuery(queryParams, {
    skip: !structureFilterReady,
    refetchOnMountOrArgChange: true,
  })

  const items = useMemo(() => inboxQuery.data?.items ?? [], [inboxQuery.data?.items])
  const total = inboxQuery.data?.total ?? 0
  const structuresForFilter = useMemo(
    () => inboxQuery.data?.structureFilters ?? [],
    [inboxQuery.data?.structureFilters],
  )
  const isReady = !inboxQuery.isLoading && !inboxQuery.isUninitialized

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const { downloadingId, downloadHandlers } = useSubmittedDocumentDownload({
    onError: (error) => showSnackbar(error.message || 'Yuklab olishda xatolik', 'error'),
  })

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={inboxQuery.isLoading}
        isFetching={inboxQuery.isFetching}
        isUninitialized={inboxQuery.isUninitialized}
        hasData={isReady}
        skeleton={
          <PurchaseRequestsPageSkeleton
            variant="approval"
            ariaLabel="Tasdiqlash arizalari yuklanmoqda"
          />
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PurchasingPageFilters
            title="Arizalarni tasdiqlash"
            subtitle="Tuzilma va sana bo‘yicha filtrlang"
            search={search}
            onSearchChange={setSearch}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            dateFromLabel="Yuborilgan (dan)"
            dateToLabel="Yuborilgan (gacha)"
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            structureFilter={structureFilter}
            onStructureFilterChange={setStructureFilter}
            structures={structuresForFilter}
            structureFilterDisabled={!structureFilterReady}
            viewerStructureId={viewerStructureId}
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
        {...downloadHandlers}
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
