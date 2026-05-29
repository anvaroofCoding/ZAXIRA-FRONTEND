import { useState } from 'react'
import Box from '@mui/material/Box'
import TablePagination from '@mui/material/TablePagination'
import { useGetPurchasedInboxQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { PurchaseRequestReadOnlyDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestReadOnlyDetailDialog'
import { PurchasedInboxList } from '@/features/purchase-requests/components/PurchasedInboxList'
import { PurchasingPageFilters } from '@/features/purchase-requests/components/PurchasingPageFilters'
import { PurchasingInboxSkeleton } from '@/features/purchase-requests/components/PurchasingInboxSkeletons'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePurchasingListFilters } from '@/shared/hooks/usePurchasingListFilters'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const XaridQilinganTovarlarPage = () => {
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
  const [downloadingId, setDownloadingId] = useState(null)

  const inboxQuery = useGetPurchasedInboxQuery(queryParams)

  const items = inboxQuery.data?.items ?? []
  const total = inboxQuery.data?.total ?? 0
  const isReady = !inboxQuery.isLoading && !inboxQuery.isUninitialized

  const handleDownload = async (request, type) => {
    setDownloadingId(request.id)

    try {
      const extension = type === 'pdf' ? 'pdf' : 'docx'
      await downloadAuthenticatedFile(
        `/purchase-requests/${request.id}/export/${extension}`,
        `buyurtma-${request.requestCode}.${extension}`,
      )
    } catch {
      // ignore
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
        skeleton={
          <PurchasingInboxSkeleton
            variant="purchased"
            showPurchaseTotal
            ariaLabel="Xarid qilingan tavarlar yuklanmoqda"
          />
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PurchasingPageFilters
            title="Xarid qilingan tavarlar"
            subtitle="Har bir xarid bo‘yicha tovarlar, qabul va rad miqdorlari"
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Qidirish..."
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            dateFromLabel="Xarid sanasi (dan)"
            dateToLabel="Xarid sanasi (gacha)"
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <PurchasedInboxList
            items={items}
            emptyMessage="Xarid qilingan arizalar topilmadi"
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
        onDownloadPdf={(request) => handleDownload(request, 'pdf')}
        onDownloadDocx={(request) => handleDownload(request, 'docx')}
        downloading={Boolean(downloadingId)}
      />
    </Box>
  )
}
