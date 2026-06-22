import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined'
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { formatDateTime } from '@/shared/utils/formatDate'

const EVENT_META = {
  purchase_receipt: {
    color: 'success.main',
    icon: ShoppingCartCheckoutOutlinedIcon,
  },
  import: {
    color: 'success.main',
    icon: FileUploadOutlinedIcon,
  },
  transfer_in: {
    color: 'info.main',
    icon: ArrowDownwardIcon,
  },
  transfer_out: {
    color: 'warning.main',
    icon: ArrowUpwardIcon,
  },
  transfer_cancelled: {
    color: 'error.main',
    icon: BlockOutlinedIcon,
  },
  expense: {
    color: 'error.main',
    icon: LocalShippingOutlinedIcon,
  },
  fixed_asset: {
    color: 'secondary.main',
    icon: BuildCircleOutlinedIcon,
  },
  fixed_asset_return: {
    color: 'primary.main',
    icon: UndoOutlinedIcon,
  },
  fixed_asset_discard: {
    color: 'text.secondary',
    icon: BuildCircleOutlinedIcon,
  },
  stocktake_increase: {
    color: 'success.main',
    icon: FactCheckOutlinedIcon,
  },
  stocktake_decrease: {
    color: 'warning.main',
    icon: FactCheckOutlinedIcon,
  },
}

export const WarehouseItemHistoryTimeline = ({
  events = [],
  isLoading = false,
  isError = false,
  errorMessage = 'Tarixni yuklab bo‘lmadi',
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (isError) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if (!events.length) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        Bu tovar bo‘yicha saqlangan harakatlar hozircha topilmadi.
      </Alert>
    )
  }

  return (
    <Stack spacing={0} sx={{ mt: 1 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Tovar tarixi
      </Typography>

      {events.map((event, index) => {
        const meta = EVENT_META[event.type] ?? EVENT_META.expense
        const Icon = meta.icon
        const isLast = index === events.length - 1

        return (
          <Box key={event.id} sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 28,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  color: meta.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon sx={{ fontSize: 16 }} />
              </Box>
              {!isLast ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexGrow: 1,
                    my: 0.5,
                    minHeight: 24,
                  }}
                >
                  <Box
                    sx={{
                      width: 1,
                      flexGrow: 1,
                      bgcolor: 'divider',
                    }}
                  />
                  <Box
                    sx={{
                      width: 0,
                      height: 0,
                      borderLeft: '3px solid transparent',
                      borderRight: '3px solid transparent',
                      borderTop: '4px solid',
                      borderTopColor: 'divider',
                      mt: '-1px',
                    }}
                  />
                </Box>
              ) : null}
            </Box>

            <Box sx={{ pb: isLast ? 0 : 2.5, minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={700}>
                {event.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {formatDateTime(event.occurredAt)}
                {event.quantity != null ? ` · ${event.quantity} ta` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {event.description}
              </Typography>
              {event.linkPath ? (
                <Button
                  component={RouterLink}
                  to={event.linkPath}
                  size="small"
                  sx={{ mt: 0.75, px: 0 }}
                >
                  {event.linkLabel || 'Batafsil ko‘rish'}
                </Button>
              ) : null}
            </Box>
          </Box>
        )
      })}
    </Stack>
  )
}
