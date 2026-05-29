import { useState } from 'react'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { ProfileModal } from './ProfileModal'
import { useLogout } from '../hooks/useLogout'

export const ProfileMenu = () => {
  const logout = useLogout()
  const [anchorEl, setAnchorEl] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const open = Boolean(anchorEl)

  const handleCloseMenu = () => setAnchorEl(null)

  const handleOpenProfile = () => {
    handleCloseMenu()
    setProfileOpen(true)
  }

  const handleLogout = () => {
    handleCloseMenu()
    logout()
  }

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="Profil menyusi"
        aria-controls={open ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleOpenProfile}>
          <ListItemIcon>
            <PersonOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profil</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chiqish</ListItemText>
        </MenuItem>
      </Menu>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
