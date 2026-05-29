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

const ROW_COUNT = 8

const PurchaseRequestsTableRowSkeleton = () => (
  <TableRow>
    <TableCell width={120}>
      <SkeletonBlock height={18} width="72%" />
    </TableCell>
    <TableCell width={150}>
      <SkeletonBlock height={18} width="90%" />
    </TableCell>
    <TableCell width={100}>
      <SkeletonBlock height={18} width="56%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="72%" />
    </TableCell>
    <TableCell width={160}>
      <SkeletonBlock height={24} width={120} sx={{ borderRadius: 2 }} />
    </TableCell>
    <TableCell width={96} align="right">
      <SkeletonBlock variant="rounded" width={72} height={28} />
    </TableCell>
  </TableRow>
)

export const PurchaseRequestsPageSkeleton = ({ showAddButton = true }) => (
  <Box
    aria-busy="true"
    aria-label="Arizalar yuklanmoqda"
    sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
  >
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
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 200 }}>
        <SkeletonBlock variant="text" width={180} height={32} />
        <SkeletonBlock variant="text" width={{ xs: '100%', sm: 360 }} height={20} />
      </Stack>

      {showAddButton ? (
        <SkeletonBlock variant="rounded" width={108} height={36} sx={{ flexShrink: 0 }} />
      ) : null}
    </Paper>

    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
      <SkeletonBlock variant="rounded" width={320} height={40} />
    </Box>

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
          {Array.from({ length: ROW_COUNT }).map((_, index) => (
            <PurchaseRequestsTableRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)
