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

const UsersTableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <SkeletonBlock height={18} width="72%" />
    </TableCell>
    <TableCell>
      <SkeletonBlock height={18} width="80%" />
    </TableCell>
    <TableCell width={140}>
      <SkeletonBlock height={18} width="48%" />
    </TableCell>
    <TableCell width={150}>
      <SkeletonBlock height={18} width="90%" />
    </TableCell>
    <TableCell width={140}>
      <SkeletonBlock height={18} width="70%" />
    </TableCell>
    <TableCell width={100}>
      <SkeletonBlock height={24} width={56} sx={{ borderRadius: 2 }} />
    </TableCell>
    <TableCell width={72} align="right">
      <SkeletonBlock variant="circular" width={28} height={28} />
    </TableCell>
  </TableRow>
)

export const UsersPageSkeleton = ({ showAddButton = true }) => (
  <Box
    aria-busy="true"
    aria-label="Foydalanuvchilar yuklanmoqda"
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
        <SkeletonBlock variant="text" width={160} height={32} />
        <SkeletonBlock variant="text" width={{ xs: '100%', sm: 320 }} height={20} />
      </Stack>

      {showAddButton ? (
        <SkeletonBlock variant="rounded" width={108} height={36} sx={{ flexShrink: 0 }} />
      ) : null}
    </Paper>

    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
      <SkeletonBlock variant="rounded" width={200} height={40} />
      <SkeletonBlock variant="rounded" width={320} height={40} />
    </Box>

    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Login</TableCell>
            <TableCell>Ism</TableCell>
            <TableCell width={140}>Tuzilma</TableCell>
            <TableCell width={150}>Yaratilgan sana</TableCell>
            <TableCell width={140}>Kim yaratdi</TableCell>
            <TableCell width={100}>Holat</TableCell>
            <TableCell width={72} align="right">
              Amallar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {Array.from({ length: ROW_COUNT }).map((_, index) => (
            <UsersTableRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)
