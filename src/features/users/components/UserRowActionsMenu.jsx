import { useState } from 'react'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

export const UserRowActionsMenu = ({
  user,
  currentUserId,
  isSuperAdmin,
  canUpdate,
  canDelete,
  statusLoadingId,
  onEdit,
  onDeactivate,
  onActivate,
  onPermanentDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const isSelf = user.id === currentUserId
  const isTargetSuperAdmin = user.role === 'SUPER_ADMIN'
  const loading = statusLoadingId === user.id

  const canDeactivate =
    canDelete &&
    user.isActive &&
    !isSelf &&
    (isSuperAdmin || !isTargetSuperAdmin)

  const canActivate =
    canUpdate && !user.isActive && !isSelf && (isSuperAdmin || !isTargetSuperAdmin)

  const canPermanentDelete = isSuperAdmin && !isSelf

  const hasAnyAction = canUpdate || canDeactivate || canActivate || canPermanentDelete

  if (!hasAnyAction) {
    return null
  }

  const handleClose = () => setAnchorEl(null)

  const runAction = (action) => {
    handleClose()
    action(user)
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label="Amallar"
        aria-controls={open ? `user-actions-${user.id}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={loading}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        id={`user-actions-${user.id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {canUpdate ? (
          <MenuItem onClick={() => runAction(onEdit)}>
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tahrirlash</ListItemText>
          </MenuItem>
        ) : null}

        {canDeactivate ? (
          <MenuItem onClick={() => runAction(onDeactivate)}>
            <ListItemIcon>
              <DeleteOutlinedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Nofaol qilish</ListItemText>
          </MenuItem>
        ) : null}

        {canActivate ? (
          <MenuItem onClick={() => runAction(onActivate)}>
            <ListItemIcon>
              <CheckCircleOutlinedIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Faol qilish</ListItemText>
          </MenuItem>
        ) : null}

        {canPermanentDelete ? (
          <MenuItem onClick={() => runAction(onPermanentDelete)}>
            <ListItemIcon>
              <DeleteForeverOutlinedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Profilni o‘chirish"
              secondary="Qaytarib bo‘lmaydi"
              slotProps={{ secondary: { variant: 'caption' } }}
            />
          </MenuItem>
        ) : null}
      </Menu>
    </>
  )
}
