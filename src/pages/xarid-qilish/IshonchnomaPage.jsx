import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import { useGetIshonchnomaInboxQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { IshonchnomaInboxList } from '@/features/purchase-requests/components/IshonchnomaInboxList'
import { IshonchnomaUploadDialog } from '@/features/purchase-requests/components/IshonchnomaUploadDialog'
import { PurchasingPageFilters } from '@/features/purchase-requests/components/PurchasingPageFilters'
import { PurchasingInboxSkeleton } from '@/features/purchase-requests/components/PurchasingInboxSkeletons'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePurchasingListFilters } from '@/shared/hooks/usePurchasingListFilters'
import { canReceiveOnPage, hasPageAction } from '@/features/permissions/utils/permissions'
import { ISHONCHNOMA_PAGE_PATH } from '@/features/permissions/constants'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectAuthUser } from '@/features/auth/model/authSlice'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const IshonchnomaPage = () => {
  const user = useAppSelector(selectAuthUser)
  const canUpload = hasPageAction(user, ISHONCHNOMA_PAGE_PATH, 'create')

  const [statusTab, setStatusTab] = useState('pending')
  const [uploadTarget, setUploadTarget] = useState(null)

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

  const inboxQuery = useGetIshonchnomaInboxQuery({
    ...queryParams,
    ishonchnomaStatus: statusTab,
  })

  const items = inboxQuery.data?.items ?? []
  const total = inboxQuery.data?.total ?? 0
  const isReady = !inboxQuery.isLoading && !inboxQuery.isUninitialized

  const handleTabChange = (_event, value) => {
    setStatusTab(value)
    setPage(0)
  }

  const handleUpload = (entry) => {
    setUploadTarget({
      requestId: entry.requestId,
      requestCode: entry.requestCode,
      batchId: entry.batch.batchId,
      batchNumber: entry.batchNumber,
      organizationName: entry.batch.organizationName,
    })
  }

  const emptyMessages = {
    pending: 'Ishonchnoma kutilayotgan xaridlar topilmadi',
    submitted: 'Ishonchnoma yuborilgan xaridlar topilmadi',
    all: 'Xaridlar topilmadi',
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
            ariaLabel="Ishonchnoma ro‘yxati yuklanmoqda"
          />
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PurchasingPageFilters
            title="Ishonchnoma"
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

          <Tabs
            value={statusTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab value="pending" label="Kutilmoqda" />
            <Tab value="submitted" label="Yuborilgan" />
            <Tab value="all" label="Barchasi" />
          </Tabs>

          <IshonchnomaInboxList
            items={items}
            emptyMessage={emptyMessages[statusTab]}
            onUpload={handleUpload}
            canUpload={canUpload}
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

      <IshonchnomaUploadDialog
        open={Boolean(uploadTarget)}
        target={uploadTarget}
        onClose={() => setUploadTarget(null)}
        onSaved={() => inboxQuery.refetch()}
      />
    </Box>
  )
}
