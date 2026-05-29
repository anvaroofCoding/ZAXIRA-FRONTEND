import { useState } from 'react'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'
import { useGetPurchasingInboxQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { CompletePurchaseDialog } from '@/features/purchase-requests/components/CompletePurchaseDialog'
import { DispatchToWarehouseDialog } from '@/features/warehouse-dispatches/components/DispatchToWarehouseDialog'
import { PurchaseRequestReadOnlyDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestReadOnlyDetailDialog'
import { PurchasingPageFilters } from '@/features/purchase-requests/components/PurchasingPageFilters'
import { PurchasingInboxSkeleton } from '@/features/purchase-requests/components/PurchasingInboxSkeletons'
import { PurchasingQueueTable } from '@/features/purchase-requests/components/PurchasingQueueTable'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePurchasingListFilters } from '@/shared/hooks/usePurchasingListFilters'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const SotibOlinadiganTovarlarPage = () => {
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
  } = usePurchasingListFilters()

  const [detailTarget, setDetailTarget] = useState(null)
  const [purchaseTarget, setPurchaseTarget] = useState(null)
  const [dispatchTarget, setDispatchTarget] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const inboxQuery = useGetPurchasingInboxQuery(queryParams)

  const items = inboxQuery.data?.items ?? []
  const total = inboxQuery.data?.total ?? 0
  const isReady = !inboxQuery.isLoading && !inboxQuery.isUninitialized

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleDownload = async (request, type) => {
    setDownloadingId(request.id)

    try {
      const extension = type === 'pdf' ? 'pdf' : 'docx'
      await downloadAuthenticatedFile(
        `/purchase-requests/${request.id}/export/${extension}`,
        `buyurtma-${request.requestCode}.${extension}`,
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
        skeleton={<PurchasingInboxSkeleton variant="queue" ariaLabel="Sotib olinadigan tavarlar yuklanmoqda" />}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PurchasingPageFilters
            title="Sotib olinadigan tavarlar"
            search={search}
            onSearchChange={setSearch}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            dateFromLabel="Yangilangan (dan)"
            dateToLabel="Yangilangan (gacha)"
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <PurchasingQueueTable
            items={items}
            emptyMessage="Sotib olinadigan arizalar topilmadi"
            onView={setDetailTarget}
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
            labelRowsPerPage="Qatorlar:"
          />
        </Box>
      </QuerySkeleton>

      <PurchaseRequestReadOnlyDetailDialog
        open={Boolean(detailTarget)}
        requestId={detailTarget?.id}
        purchasingView
        onClose={() => setDetailTarget(null)}
        onPurchase={(request) => {
          setDetailTarget(null)
          setPurchaseTarget(request)
        }}
        onDispatch={(request) => {
          setDetailTarget(null)
          setDispatchTarget(request)
        }}
        onDownloadPdf={(request) => handleDownload(request, 'pdf')}
        onDownloadDocx={(request) => handleDownload(request, 'docx')}
        downloading={Boolean(downloadingId)}
      />

      <CompletePurchaseDialog
        open={Boolean(purchaseTarget)}
        request={purchaseTarget}
        onClose={() => setPurchaseTarget(null)}
        onSuccess={() => showSnackbar('Xarid muvaffaqiyatli qayd etildi')}
      />

      <DispatchToWarehouseDialog
        open={Boolean(dispatchTarget)}
        request={dispatchTarget}
        onClose={() => setDispatchTarget(null)}
        onSuccess={() => showSnackbar('Omborga jo‘natildi — nakladnoy tayyor')}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
