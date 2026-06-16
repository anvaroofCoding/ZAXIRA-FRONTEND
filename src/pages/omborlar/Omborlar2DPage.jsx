import Box from '@mui/material/Box'
import { Warehouse2DMap } from '@/features/warehouse/components/Warehouse2DMap'
import { usePermissions } from '@/shared/hooks/usePermissions'

export const Omborlar2DPage = () => {
  const { user } = usePermissions()

  return (
    <Box
      sx={{
        width: '100%',
        mx: { xs: -1, sm: -2 },
        px: { xs: 1, sm: 2 },
        minHeight: 'calc(100vh - 120px)',
      }}
    >
      <Warehouse2DMap viewerStructureId={user?.structureId ?? ''} />
    </Box>
  )
}
