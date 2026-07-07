import { NavLink, useLocation } from 'react-router-dom'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import { AppLogo } from '@/shared/components/layout/AppLogo'
import { NavItemIcon } from '@/shared/components/layout/NavItemIcon'
import { resolveNavIcon } from '@/shared/config/navItemIcons'

export const MobileNavDrawer = ({ open, onClose, navItems, badgeCounts = {} }) => {
  const location = useLocation()

  const handleNavigate = () => {
    onClose()
  }

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        role="presentation"
      >
        <Box sx={{ py: 2, px: 2 }}>
          <AppLogo
            component={NavLink}
            to="/dashboard"
            onClick={handleNavigate}
          />
        </Box>

        <Divider />

        <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
          {navItems.map((item) =>
            item.type === 'link' ? (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={handleNavigate}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <NavItemIcon icon={resolveNavIcon(item)} />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ) : (
              <Box key={item.label}>
                <ListSubheader
                  sx={{
                    lineHeight: 2.5,
                    bgcolor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <NavItemIcon icon={resolveNavIcon(item)} />
                  {item.label}
                </ListSubheader>
                {item.children.map((child) => {
                  const badgeCount = child.badgeKey ? badgeCounts[child.badgeKey] ?? 0 : 0

                  return (
                    <ListItemButton
                      key={child.path}
                      component={NavLink}
                      to={child.path}
                      selected={location.pathname === child.path}
                      onClick={handleNavigate}
                      sx={{ pl: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <NavItemIcon icon={resolveNavIcon(child)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          badgeCount > 0 ? (
                            <Badge color="error" badgeContent={badgeCount}>
                              <span>{child.label}</span>
                            </Badge>
                          ) : (
                            child.label
                          )
                        }
                      />
                    </ListItemButton>
                  )
                })}
              </Box>
            ),
          )}
        </List>
      </Box>
    </Drawer>
  )
}
