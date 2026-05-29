import { NavLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ProfileMenu } from '@/features/profile/components/ProfileMenu'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { selectAuthUser } from '@/features/auth/model/authSlice'
import { NAV_ITEMS } from '@/shared/config/navigation'
import { env } from '@/shared/config/env'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { useGetWarehouseReceiptPendingCountQuery } from '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import { hasPageAccess } from '@/features/permissions/utils/permissions'
import { filterNavByPermissions } from '@/shared/utils/filterNavByPermissions'
import { NavDropdown } from './NavDropdown'

const navLinkSx = {
  fontWeight: 500,
  '&.active': {
    fontWeight: 700,
    opacity: 1,
  },
}

export const AppNavbar = () => {
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
    <AppBar position="sticky" elevation={0}>
      <AppContainer>
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 56, sm: 64 },
            width: '100%',
          }}
        >
          <Typography
            variant="h6"
            component={NavLink}
            to="/dashboard"
            sx={{
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              minWidth: { xs: 80, sm: 110 },
              flexShrink: 0,
            }}
          >
            {env.appName}
          </Typography>

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

          <Box
            sx={{
              minWidth: { xs: 80, sm: 96 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.25,
            }}
          >
            <ThemeToggle />
            <ProfileMenu />
          </Box>
        </Toolbar>
      </AppContainer>
    </AppBar>
  )
}
