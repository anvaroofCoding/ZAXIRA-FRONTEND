import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { SkeletonBlock } from '@/shared/components/skeleton'

const DEFAULT_ROW_COUNT = 10

const SearchFieldSkeleton = ({ sx }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1.5,
      height: 40,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: 'background.paper',
      ...sx,
    }}
  >
    <SkeletonBlock variant="circular" width={20} height={20} />
    <SkeletonBlock variant="text" height={18} sx={{ flex: 1, maxWidth: 72 }} />
  </Box>
)

const PaginationSkeleton = () => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 1 }}>
    <SkeletonBlock variant="rounded" width={320} height={36} />
  </Box>
)

const SubmitTableRowSkeleton = () => (
  <TableRow>
    <TableCell width={120}>
      <SkeletonBlock height={18} width="68%" />
    </TableCell>
    <TableCell width={150}>
      <SkeletonBlock height={18} width="92%" />
    </TableCell>
    <TableCell width={100}>
      <SkeletonBlock height={18} width="52%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="64%" />
    </TableCell>
    <TableCell width={160}>
      <SkeletonBlock height={24} width={120} sx={{ borderRadius: 2 }} />
    </TableCell>
    <TableCell width={72} align="right">
      <SkeletonBlock variant="circular" width={28} height={28} sx={{ ml: 'auto' }} />
    </TableCell>
  </TableRow>
)

const SubmitTableSkeleton = ({ rowCount = DEFAULT_ROW_COUNT }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell width={120}>Ariza ID</TableCell>
          <TableCell width={150}>Sana</TableCell>
          <TableCell width={100}>Tovarlar</TableCell>
          <TableCell>Boshliq</TableCell>
          <TableCell width={160}>Holat</TableCell>
          <TableCell width={72} align="right">
            Amallar
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {Array.from({ length: rowCount }).map((_, index) => (
          <SubmitTableRowSkeleton key={index} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const ApprovalTableRowSkeleton = () => (
  <TableRow>
    <TableCell width={120}>
      <SkeletonBlock height={18} width="68%" />
    </TableCell>
    <TableCell width={150}>
      <SkeletonBlock height={18} width="92%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="72%" />
    </TableCell>
    <TableCell width={100}>
      <SkeletonBlock height={18} width="52%" />
    </TableCell>
    <TableCell width={120}>
      <SkeletonBlock height={18} width="58%" />
    </TableCell>
    <TableCell width={200}>
      <SkeletonBlock height={24} width={130} sx={{ borderRadius: 2 }} />
    </TableCell>
  </TableRow>
)

const ApprovalTableSkeleton = ({ rowCount = DEFAULT_ROW_COUNT }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell width={120}>Ariza ID</TableCell>
          <TableCell width={150}>Sana</TableCell>
          <TableCell>Ariza beruvchi</TableCell>
          <TableCell width={100}>Tovarlar</TableCell>
          <TableCell width={120}>Rolingiz</TableCell>
          <TableCell width={200}>Holat</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {Array.from({ length: rowCount }).map((_, index) => (
          <ApprovalTableRowSkeleton key={index} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const HistoryTableRowSkeleton = () => (
  <TableRow>
    <TableCell width={120}>
      <SkeletonBlock height={18} width="68%" />
    </TableCell>
    <TableCell width={150}>
      <SkeletonBlock height={18} width="92%" />
    </TableCell>
    <TableCell width={180}>
      <SkeletonBlock height={18} width="78%" />
    </TableCell>
    <TableCell width={160}>
      <SkeletonBlock height={18} width="64%" />
    </TableCell>
    <TableCell width={140}>
      <SkeletonBlock height={24} width={96} sx={{ borderRadius: 2 }} />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="82%" />
    </TableCell>
    <TableCell width={180}>
      <SkeletonBlock height={24} width={120} sx={{ borderRadius: 2 }} />
    </TableCell>
    <TableCell width={140}>
      <SkeletonBlock height={18} width="70%" />
    </TableCell>
  </TableRow>
)

const HistoryTableSkeleton = ({ rowCount = DEFAULT_ROW_COUNT }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell width={120}>Ariza ID</TableCell>
          <TableCell width={150}>Hodisa vaqti</TableCell>
          <TableCell width={180}>Hodisa turi</TableCell>
          <TableCell width={160}>Kim</TableCell>
          <TableCell width={140}>Qaror</TableCell>
          <TableCell>Izoh</TableCell>
          <TableCell width={180}>Ariza holati</TableCell>
          <TableCell width={140}>Ariza beruvchi</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {Array.from({ length: rowCount }).map((_, index) => (
          <HistoryTableRowSkeleton key={index} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const SubmitPageSkeleton = ({ showAddButton }) => (
  <>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <SkeletonBlock variant="text" width={190} height={32} />

      {showAddButton ? (
        <SkeletonBlock variant="rounded" width={108} height={36} sx={{ flexShrink: 0 }} />
      ) : null}
    </Box>

    <SearchFieldSkeleton sx={{ minWidth: { xs: '100%', sm: 280 }, maxWidth: 400 }} />

    <SubmitTableSkeleton />
    <PaginationSkeleton />
  </>
)

const ApprovalPageSkeleton = () => (
  <>
    <SkeletonBlock variant="text" width={210} height={32} />

    <SearchFieldSkeleton sx={{ minWidth: { xs: '100%', sm: 280 }, maxWidth: 400 }} />

    <ApprovalTableSkeleton />
    <PaginationSkeleton />
  </>
)

const HistoryPageSkeleton = () => (
  <>
    <SkeletonBlock variant="text" width={160} height={32} />

    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ flexWrap: 'wrap' }}>
      <SearchFieldSkeleton sx={{ flex: 1, minWidth: { xs: '100%', md: 280 } }} />
      <SkeletonBlock
        variant="rounded"
        height={40}
        sx={{ minWidth: { xs: '100%', sm: 220 } }}
      />
      <SkeletonBlock
        variant="rounded"
        height={40}
        sx={{ minWidth: { xs: '100%', sm: 220 } }}
      />
    </Stack>

    <HistoryTableSkeleton />
    <PaginationSkeleton />
  </>
)

const skeletonByVariant = {
  submit: SubmitPageSkeleton,
  approval: ApprovalPageSkeleton,
  history: HistoryPageSkeleton,
}

export const PurchaseRequestsPageSkeleton = ({
  variant = 'submit',
  showAddButton = true,
  ariaLabel = 'Arizalar yuklanmoqda',
}) => {
  const Content = skeletonByVariant[variant] ?? SubmitPageSkeleton

  return (
    <Box
      aria-busy="true"
      aria-label={ariaLabel}
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Content showAddButton={showAddButton} />
    </Box>
  )
}
