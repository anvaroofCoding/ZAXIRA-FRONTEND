import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { ProfileMenu } from '@/features/profile/components/ProfileMenu'
import { NotificationsDrawer } from '@/features/notifications/components/NotificationsDrawer'
import { SettingsNavButton } from '@/features/settings/components/SettingsNavButton'
import { WeatherNavButton } from '@/features/weather/components/WeatherNavButton'
import { ChatNavButton } from '@/shared/components/chat/ChatFabDrawer'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { AppLogo } from '@/shared/components/layout/AppLogo'
import { APP_SIDE_RAIL_WIDTH, appMobileSafePaddingSx } from '@/shared/constants/layout'
import { selectAuthUser } from '@/features/auth/model/authSlice'
import { NAV_ITEMS } from '@/shared/config/navigation'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { useGetWarehouseReceiptPendingCountQuery } from '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import { hasPageAccess } from '@/features/permissions/utils/permissions'
import { filterNavByPermissions } from '@/shared/utils/filterNavByPermissions'
import { MobileNavDrawer } from './MobileNavDrawer'
import { NavDropdown } from './NavDropdown'

const navLinkSx = {
  fontWeight: 500,
  '&.active': {
    fontWeight: 700,
    opacity: 1,
  },
}

export const AppNavbar = () => {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('lg'))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const user = useAppSelector(selectAuthUser)
  const visibleNavItems = filterNavByPermissions(NAV_ITEMS, user)
  const canSeeReceipt = hasPageAccess(user, '/xarid-qilish/xaridni-qabul-qilish')

  const pendingReceiptQuery = useGetWarehouseReceiptPendingCountQuery(undefined, {
    skip: !canSeeReceipt,
    pollingInterval: 30000,
  })

  const badgeCounts = {
    'warehouse-receipt': pendingReceiptQuery.data ?? 0,
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="primary"
      sx={
        isCompact
          ? {
              pt: 'env(safe-area-inset-top, 0px)',
            }
          : undefined
      }
    >
      <Box sx={{ display: 'flex', width: '100%' }}>
        {!isCompact ? (
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: APP_SIDE_RAIL_WIDTH,
              bgcolor: 'primary.main',
            }}
          />
        ) : null}

        <AppContainer
          sx={{
            flex: 1,
            minWidth: 0,
            ...(isCompact
              ? {
                  px: 0,
                  ...appMobileSafePaddingSx,
                }
              : {}),
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 56, sm: 64 },
              width: '100%',
              gap: { xs: 0.5, sm: 1 },
            }}
          >
          {isCompact ? (
            <IconButton
              color="inherit"
              aria-label="Navigatsiya menyusi"
              onClick={() => setMobileNavOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}

          <AppLogo
            component={NavLink}
            to="/dashboard"
            tone="onPrimary"
            sx={isCompact ? { flexShrink: 0 } : undefined}
          />

          {!isCompact ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.25,
              }}
            >
              {visibleNavItems.map((item) =>
                item.type === 'link' ? (
                  <Button
                    key={item.path}
                    color="inherit"
                    component={NavLink}
                    to={item.path}
                    sx={navLinkSx}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <NavDropdown
                    key={item.label}
                    label={item.label}
                    items={item.children}
                    badgeCounts={badgeCounts}
                  />
                ),
              )}
            </Box>
          ) : null}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.25,
              flexShrink: 0,
              ml: 'auto',
            }}
          >
            <ChatNavButton />
            <NotificationsDrawer />
            <WeatherNavButton />
            <SettingsNavButton />
            <ThemeToggle />
            <ProfileMenu />
          </Box>
        </Toolbar>
        </AppContainer>
      </Box>

      {isCompact ? (
        <MobileNavDrawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          navItems={visibleNavItems}
          badgeCounts={badgeCounts}
        />
      ) : null}
    </AppBar>
  )
}
