import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import { useGetPurchasedInboxQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { PurchaseRequestReadOnlyDetailDialog } from '@/features/purchase-requests/components/PurchaseRequestReadOnlyDetailDialog'
import { PurchasedInboxList } from '@/features/purchase-requests/components/PurchasedInboxList'
import { PurchasingPageFilters } from '@/features/purchase-requests/components/PurchasingPageFilters'
import { PurchasingInboxSkeleton } from '@/features/purchase-requests/components/PurchasingInboxSkeletons'
import { UnavailableInboxList } from '@/features/purchase-requests/components/UnavailableInboxList'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePurchasingListFilters } from '@/shared/hooks/usePurchasingListFilters'
import { useSubmittedDocumentDownload } from '@/features/purchase-requests/hooks/useSubmittedDocumentDownload'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const XaridQilinganTovarlarPage = () => {
  const [inboxTab, setInboxTab] = useState('purchased')

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

  const inboxQuery = useGetPurchasedInboxQuery({
    ...queryParams,
    inboxType: inboxTab,
  })

  const items = inboxQuery.data?.items ?? []
  const total = inboxQuery.data?.total ?? 0
  const isReady = !inboxQuery.isLoading && !inboxQuery.isUninitialized

  const { downloadingId, downloadHandlers } = useSubmittedDocumentDownload()

  const handleTabChange = (_event, value) => {
    setInboxTab(value)
    setPage(0)
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
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Qidirish..."
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            dateFromLabel={
              inboxTab === 'unavailable' ? 'Belgilangan sana (dan)' : 'Xarid sanasi (dan)'
            }
            dateToLabel={
              inboxTab === 'unavailable' ? 'Belgilangan sana (gacha)' : 'Xarid sanasi (gacha)'
            }
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <Tabs
            value={inboxTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab value="purchased" label="Xarid qilinganlar" />
            <Tab value="unavailable" label="Xarid qilinmaganlar" />
          </Tabs>

          {inboxTab === 'purchased' ? (
            <PurchasedInboxList
              items={items}
              emptyMessage="Xarid qilingan arizalar topilmadi"
              onView={setDetailTarget}
            />
          ) : (
            <UnavailableInboxList
              items={items}
              emptyMessage="Xarid qilinmagan tovarlar topilmadi"
              onView={setDetailTarget}
            />
          )}

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
        {...downloadHandlers}
        downloading={Boolean(downloadingId)}
      />
    </Box>
  )
}
