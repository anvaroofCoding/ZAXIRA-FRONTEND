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

const ROW_COUNT = 6
const CARD_COUNT = 3

const FiltersSkeleton = () => (
  <Stack spacing={2}>
    <Stack spacing={0.75}>
      <SkeletonBlock variant="text" width={220} height={28} />
      <SkeletonBlock variant="text" width={{ xs: '90%', sm: 420 }} height={18} />
    </Stack>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr 1fr' },
        gap: 1.5,
      }}
    >
      <SkeletonBlock variant="rounded" height={40} />
      <SkeletonBlock variant="rounded" height={40} />
      <SkeletonBlock variant="rounded" height={40} />
    </Box>
  </Stack>
)

const QueueTableRowSkeleton = ({ showPurchaseTotal }) => (
  <TableRow>
    <TableCell width={120}>
      <SkeletonBlock height={18} width="70%" />
    </TableCell>
    <TableCell width={150}>
      <SkeletonBlock height={18} width="85%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="75%" />
    </TableCell>
    <TableCell width={110}>
      <SkeletonBlock height={18} width="60%" />
    </TableCell>
    <TableCell width={100}>
      <SkeletonBlock height={18} width="45%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="80%" />
    </TableCell>
    <TableCell width={140}>
      <SkeletonBlock height={18} width="70%" />
    </TableCell>
    {showPurchaseTotal ? (
      <TableCell width={160}>
        <SkeletonBlock height={18} width="65%" />
      </TableCell>
    ) : null}
    <TableCell width={200}>
      <SkeletonBlock height={24} width={120} sx={{ borderRadius: 2 }} />
    </TableCell>
  </TableRow>
)

const QueueTableSkeleton = ({ showPurchaseTotal = false }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell width={120}>Ariza ID</TableCell>
          <TableCell width={150}>Sana</TableCell>
          <TableCell>Ariza beruvchi</TableCell>
          <TableCell width={110}>Tuzilma</TableCell>
          <TableCell width={100}>Tovarlar</TableCell>
          <TableCell>Nakladnoy</TableCell>
          <TableCell width={140}>Yetkazuvchi</TableCell>
          {showPurchaseTotal ? <TableCell width={160}>Jami summa</TableCell> : null}
          <TableCell width={200}>Holat</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: ROW_COUNT }).map((_, index) => (
          <QueueTableRowSkeleton key={index} showPurchaseTotal={showPurchaseTotal} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const ReceiptTableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <SkeletonBlock height={18} width="85%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="60%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="80%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="70%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="55%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="45%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={24} width={130} sx={{ borderRadius: 2 }} />
    </TableCell>
  </TableRow>
)

const ReceiptTableSkeleton = () => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell>Nakladnoy</TableCell>
          <TableCell width={120}>Ariza</TableCell>
          <TableCell width={150}>Sana</TableCell>
          <TableCell width={140}>Jo‘natuvchi</TableCell>
          <TableCell width={110}>Tuzilma</TableCell>
          <TableCell width={100}>Qolgan</TableCell>
          <TableCell width={180}>Holat</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: ROW_COUNT }).map((_, index) => (
          <ReceiptTableRowSkeleton key={index} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const PurchasedCardSkeleton = () => (
  <Paper variant="outlined">
    <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <SkeletonBlock width={100} height={22} />
          <SkeletonBlock width={120} height={24} sx={{ borderRadius: 2 }} />
        </Stack>
        <SkeletonBlock variant="rounded" width={88} height={32} />
      </Stack>
    </Box>
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2,
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <Stack key={index} spacing={0.5}>
            <SkeletonBlock width="55%" height={12} />
            <SkeletonBlock width="80%" height={18} />
          </Stack>
        ))}
      </Box>
      <SkeletonBlock width={240} height={18} sx={{ mb: 1.5 }} />

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={48}>T/R</TableCell>
              <TableCell>Tovar</TableCell>
              <TableCell width={80} align="right">
                So‘ralgan
              </TableCell>
              <TableCell width={90} align="right">
                Jo‘natilgan
              </TableCell>
              <TableCell width={80} align="right">
                Qabul
              </TableCell>
              <TableCell width={70} align="right">
                Rad
              </TableCell>
              <TableCell>Sabab</TableCell>
              <TableCell width={130} align="right">
                Xarid summasi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <SkeletonBlock width={18} height={16} />
                </TableCell>
                <TableCell>
                  <SkeletonBlock width="45%" height={16} sx={{ mb: 0.5 }} />
                  <SkeletonBlock width="65%" height={12} />
                </TableCell>
                <TableCell align="right">
                  <SkeletonBlock width={36} height={16} />
                </TableCell>
                <TableCell align="right">
                  <SkeletonBlock width={36} height={16} />
                </TableCell>
                <TableCell align="right">
                  <SkeletonBlock width={36} height={16} />
                </TableCell>
                <TableCell align="right">
                  <SkeletonBlock width={36} height={16} />
                </TableCell>
                <TableCell>
                  <SkeletonBlock width="70%" height={16} />
                </TableCell>
                <TableCell align="right">
                  <SkeletonBlock width={84} height={16} sx={{ mb: 0.5, ml: 'auto' }} />
                  <SkeletonBlock width={110} height={12} sx={{ ml: 'auto' }} />
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={7} sx={{ fontWeight: 700 }}>
                Jami
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                <SkeletonBlock width={120} height={18} sx={{ ml: 'auto' }} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  </Paper>
)

const PurchasedCardsSkeleton = () => (
  <Stack spacing={2}>
    {Array.from({ length: CARD_COUNT }).map((_, index) => (
      <PurchasedCardSkeleton key={index} />
    ))}
  </Stack>
)

const PaginationSkeleton = () => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 1 }}>
    <SkeletonBlock variant="rounded" width={320} height={36} />
  </Box>
)

export const PurchasingInboxSkeleton = ({
  variant = 'queue',
  showPurchaseTotal = false,
  ariaLabel = 'Ma’lumotlar yuklanmoqda',
}) => (
  <Box
    aria-busy="true"
    aria-label={ariaLabel}
    sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
  >
    <FiltersSkeleton />

    {variant === 'purchased' ? (
      <PurchasedCardsSkeleton />
    ) : variant === 'receipt' ? (
      <ReceiptTableSkeleton />
    ) : (
      <QueueTableSkeleton showPurchaseTotal={showPurchaseTotal} />
    )}

    <PaginationSkeleton />
  </Box>
)
