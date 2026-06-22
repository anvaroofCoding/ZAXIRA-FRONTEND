import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { WarehouseAnalyticsPanel } from '@/features/warehouse/components/WarehouseAnalyticsPanel'

export const WAREHOUSE_DETAIL_PANEL_WIDTH = 360

export const WarehouseDetailPanel = ({
  warehouse,
  viewerStructureId = '',
  onClose,
  width = WAREHOUSE_DETAIL_PANEL_WIDTH,
}) => {
  const navigate = useNavigate()

  if (!warehouse) return null

  const { structure, totalQuantity = 0 } = warehouse
  const isViewerWarehouse = viewerStructureId && structure.id === viewerStructureId

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        bottom: 8,
        width,
        maxWidth: 'calc(100% - 16px)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0, p: 2, pb: 1.5, pr: 5 }}>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Yopish"
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="overline" color="text.secondary" display="block">
          Ombor tafsiloti
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.25, pr: 1 }}>
          {structure.shortName}
        </Typography>
      </Box>

      <Stack spacing={1.5} sx={{ px: 2, pb: 2, flex: 1, overflow: 'auto' }}>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {isViewerWarehouse ? <Chip size="small" color="primary" label="Sizning omboringiz" /> : null}
          <Chip size="small" label={`${totalQuantity.toLocaleString('uz-UZ')} ta joriy qoldiq`} />
        </Stack>

        <Divider />

        <WarehouseAnalyticsPanel structureId={structure.id} />
      </Stack>

      <Box sx={{ p: 2, pt: 0, flexShrink: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon />}
          onClick={() => {
            navigate(`/omborlar/boshqa-omborlar?warehouse=${structure.id}`)
          }}
        >
          To&apos;liq ro&apos;yxat
        </Button>
      </Box>
    </Paper>
  )
}
