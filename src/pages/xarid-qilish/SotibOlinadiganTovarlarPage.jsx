import { useCallback, useMemo, useState } from 'react'
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
import { useSubmittedDocumentDownload } from '@/features/purchase-requests/hooks/useSubmittedDocumentDownload'
import { useQueryParamOpen } from '@/shared/hooks/useQueryParamOpen'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const resolveDispatchableBatch = (request) => {
  const batches = [...(request?.purchaseBatches ?? [])].sort(
    (left, right) => new Date(right.purchasedAt).getTime() - new Date(left.purchasedAt).getTime(),
  )
  const batchIndex = batches.findIndex((batch) => batch.canDispatchToWarehouse)

  if (batchIndex === -1) {
    return null
  }

  return {
    ...batches[batchIndex],
    batchNumber: batches.length - batchIndex,
  }
}

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
    structureFilter,
    setStructureFilter,
    structureFilterReady,
    viewerStructureId,
  } = usePurchasingListFilters(10, {
    withStructureFilter: true,
    structureFilterDefault: 'all',
  })

  const [detailTarget, setDetailTarget] = useState(null)
  const openDetailFromQuery = useCallback((id) => setDetailTarget({ id }), [])
  useQueryParamOpen('detail', openDetailFromQuery)
  const [purchaseTarget, setPurchaseTarget] = useState(null)
  const [dispatchTarget, setDispatchTarget] = useState(null)
  const [dispatchBatch, setDispatchBatch] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const inboxQuery = useGetPurchasingInboxQuery(queryParams, {
    skip: !structureFilterReady,
    refetchOnMountOrArgChange: true,
  })

  const items = inboxQuery.data?.items ?? []
  const total = inboxQuery.data?.total ?? 0
  const structuresForFilter = useMemo(
    () => inboxQuery.data?.structureFilters ?? [],
    [inboxQuery.data?.structureFilters],
  )
  const isReady = !inboxQuery.isLoading && !inboxQuery.isUninitialized

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

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
          <PurchasingInboxSkeleton
            variant="queue"
            showPurchaseTotal
            ariaLabel="Sotib olinadigan maxsulotlar yuklanmoqda"
          />
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PurchasingPageFilters
            title="Sotib olinadigan maxsulotlar"
            subtitle="Xarid qilinmagan yoki omborga jo‘natilmagan tovarlar shu yerda ko‘rinadi"
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
            structureFilter={structureFilter}
            onStructureFilterChange={setStructureFilter}
            structures={structuresForFilter}
            structureFilterDisabled={!structureFilterReady}
            viewerStructureId={viewerStructureId}
          />

          <PurchasingQueueTable
            items={items}
            emptyMessage="Sotib olinadigan maxsulotlar topilmadi"
            onView={setDetailTarget}
            onPurchase={setPurchaseTarget}
            onDispatch={(request) => {
              setDispatchTarget(request)
              setDispatchBatch(resolveDispatchableBatch(request))
            }}
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
        onDispatchBatch={(request, batch) => {
          setDispatchTarget(request)
          setDispatchBatch(batch)
        }}
        {...downloadHandlers}
        downloading={Boolean(downloadingId)}
      />

      <CompletePurchaseDialog
        open={Boolean(purchaseTarget)}
        request={purchaseTarget}
        onClose={() => setPurchaseTarget(null)}
        onSuccess={(message) =>
          showSnackbar(message || 'Xarid muvaffaqiyatli qayd etildi')
        }
      />

      <DispatchToWarehouseDialog
        open={Boolean(dispatchTarget)}
        request={dispatchTarget}
        purchaseBatch={dispatchBatch}
        onClose={() => {
          setDispatchTarget(null)
          setDispatchBatch(null)
        }}
        onSuccess={() => {
          showSnackbar('Partiya omborga jo‘natildi — nakladnoy tayyor')
          setDispatchTarget(null)
          setDispatchBatch(null)
        }}
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
