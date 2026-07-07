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

const CustomUnitsTableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <SkeletonBlock height={18} width="70%" />
    </TableCell>
    <TableCell width={220}>
      <SkeletonBlock height={18} width="80%" />
    </TableCell>
    <TableCell width={180}>
      <SkeletonBlock height={18} width="90%" />
    </TableCell>
    <TableCell width={140}>
      <SkeletonBlock height={24} width={88} sx={{ borderRadius: 2 }} />
    </TableCell>
    <TableCell width={120} align="right">
      <SkeletonBlock variant="circular" width={28} height={28} />
    </TableCell>
  </TableRow>
)

export const CustomUnitsPageSkeleton = () => (
  <Box
    aria-busy="true"
    aria-label="Birliklar yuklanmoqda"
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
        <SkeletonBlock variant="text" width={120} height={32} />
        <SkeletonBlock variant="text" width={{ xs: '100%', sm: 360 }} height={20} />
      </Stack>
    </Paper>

    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
      <SkeletonBlock variant="rounded" width={320} height={40} />
    </Box>

    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Birlik nomi</TableCell>
            <TableCell width={220}>Foydalanuvchi</TableCell>
            <TableCell width={180}>Yaratilgan</TableCell>
            <TableCell width={140}>Holat</TableCell>
            <TableCell width={120} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {Array.from({ length: ROW_COUNT }).map((_, index) => (
            <CustomUnitsTableRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)
