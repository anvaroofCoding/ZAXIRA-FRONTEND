import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { alpha, useTheme } from '@mui/material/styles'

export const navTriggerSx = (theme, { isActive = false, isOpen = false } = {}) => ({
  fontWeight: isActive ? 700 : 500,
  textTransform: 'none',
  fontSize: '0.8125rem',
  letterSpacing: '0.02em',
  px: 1.5,
  py: 0.75,
  minWidth: 0,
  borderRadius: 2,
  color: 'inherit',
  bgcolor: isActive ? alpha(theme.palette.common.white, 0.16) : 'transparent',
  boxShadow: isActive ? `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.22)}` : 'none',
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    bgcolor: isActive
      ? alpha(theme.palette.common.white, 0.2)
      : alpha(theme.palette.common.white, 0.1),
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.18)}`,
  },
  '& .MuiButton-endIcon': {
    ml: 0.25,
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shorter,
    }),
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  },
})

export const navLinkTriggerSx = (theme) => ({
  ...navTriggerSx(theme),
  '&.active': {
    fontWeight: 700,
    bgcolor: alpha(theme.palette.common.white, 0.16),
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.22)}`,
    '&:hover': {
      bgcolor: alpha(theme.palette.common.white, 0.2),
      boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.18)}`,
    },
  },
})

export const NavDropdown = ({ label, items, badgeCounts = {} }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)

  const isOpen = Boolean(anchorEl)
  const isActive = items.some((item) => location.pathname.startsWith(item.path))

  const handleOpen = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleSelect = (path) => {
    navigate(path)
    handleClose()
  }

  return (
    <>
      <Button
        color="inherit"
        onClick={handleOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen ? 'true' : undefined}
        endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
        sx={navTriggerSx(theme, { isActive, isOpen })}
      >
        {label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 1.25,
              minWidth: 248,
              maxWidth: 320,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              overflow: 'hidden',
              py: 0.75,
              px: 0.75,
              '& .MuiList-root': { py: 0 },
            },
          },
          list: {
            dense: true,
            autoFocusItem: isOpen,
          },
        }}
      >
        {items.map((item) => {
          const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : 0
          const isSelected = location.pathname === item.path

          return (
            <MenuItem
              key={item.path}
              selected={isSelected}
              onClick={() => handleSelect(item.path)}
              sx={{
                borderRadius: 1.5,
                py: 1,
                px: 1.25,
                mb: 0.25,
                fontSize: '0.875rem',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'primary.main' : 'text.primary',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&:last-child': { mb: 0 },
              }}
            >
              {badgeCount > 0 ? (
                <Badge
                  color="error"
                  badgeContent={badgeCount}
                  sx={{
                    width: '100%',
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  <Box component="span" sx={{ pr: 2 }}>
                    {item.label}
                  </Box>
                </Badge>
              ) : (
                item.label
              )}
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
