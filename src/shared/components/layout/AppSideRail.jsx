import { NavLink, useLocation } from 'react-router-dom'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { selectAuthUser } from '@/features/auth/model/authSlice'
import { hasPageAccess } from '@/features/permissions/utils/permissions'
import { SIDE_RAIL_ITEMS } from '@/shared/config/sideRailNavigation'
import { APP_SIDE_RAIL_WIDTH } from '@/shared/constants/layout'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { useGetWarehouseReceiptPendingCountQuery } from '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import { filterSideRailByPermissions, isSideRailItemActive } from '@/shared/utils/filterSideRailByPermissions'

const ICON_BUTTON_SIZE = 40

const iconButtonSx = (active) => ({
  width: ICON_BUTTON_SIZE,
  height: ICON_BUTTON_SIZE,
  borderRadius: 1.5,
  opacity: active ? 1 : 0.72,
  bgcolor: active ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
  '&:hover': {
    opacity: 1,
    bgcolor: 'rgba(255, 255, 255, 0.12)',
  },
  '&.active': {
    opacity: 1,
    bgcolor: 'rgba(255, 255, 255, 0.16)',
  },
})

export const AppSideRail = () => {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const location = useLocation()
  const user = useAppSelector(selectAuthUser)
  const visibleItems = filterSideRailByPermissions(SIDE_RAIL_ITEMS, user)
  const canSeeReceipt = hasPageAccess(user, '/xarid-qilish/xaridni-qabul-qilish')

  const pendingReceiptQuery = useGetWarehouseReceiptPendingCountQuery(undefined, {
    skip: !canSeeReceipt,
    pollingInterval: 30000,
  })

  const badgeCounts = {
    'warehouse-receipt': pendingReceiptQuery.data ?? 0,
  }

  if (!isDesktop) return null

  return (
    <Box
      component="nav"
      aria-label="Tezkor navigatsiya"
      sx={{
        flexShrink: 0,
        width: APP_SIDE_RAIL_WIDTH,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 0,
        flex: '0 0 auto',
        alignSelf: 'stretch',
      }}
    >
      <Box
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
          py: 1,
          px: 0.5,
          bgcolor: 'primary.main',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = isSideRailItemActive(item.path, location.pathname)
          const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : 0

          return (
            <Box key={item.path} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {item.dividerBefore ? (
                <Divider
                  sx={{
                    width: '70%',
                    borderColor: 'rgba(255, 255, 255, 0.22)',
                    my: 0.5,
                  }}
                />
              ) : null}

              <Tooltip title={item.label} placement="right" arrow>
                <IconButton
                  component={NavLink}
                  to={item.path}
                  color="inherit"
                  aria-label={item.label}
                  sx={iconButtonSx(active)}
                >
                  {badgeCount > 0 ? (
                    <Badge color="error" badgeContent={badgeCount} max={99}>
                      <Icon sx={{ fontSize: 20 }} />
                    </Badge>
                  ) : (
                    <Icon sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
