import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

export const NavDropdown = ({ label, items, badgeCounts = {} }) => {
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
        endIcon={<ArrowDropDownIcon />}
        sx={{
          fontWeight: isActive ? 700 : 500,
          opacity: isActive ? 1 : 0.9,
        }}
      >
        {label}
      </Button>

      <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
        {items.map((item) => {
          const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : 0

          return (
            <MenuItem
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => handleSelect(item.path)}
            >
              {badgeCount > 0 ? (
                <Badge color="error" badgeContent={badgeCount} sx={{ width: '100%' }}>
                  <span>{item.label}</span>
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
