import { useState } from 'react'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

export const CommissionRowActionsMenu = ({
  commission,
  canUpdate,
  canDelete,
  statusLoadingId,
  onEdit,
  onDeactivate,
  onActivate,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const loading = statusLoadingId === commission.id

  const canDeactivate = canDelete && commission.isActive
  const canActivate = canUpdate && !commission.isActive

  const hasAnyAction = canUpdate || canDeactivate || canActivate

  if (!hasAnyAction) {
    return null
  }

  const handleClose = () => setAnchorEl(null)

  const runAction = (action) => {
    handleClose()
    action(commission)
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label="Amallar"
        aria-controls={open ? `commission-actions-${commission.id}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={loading}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        id={`commission-actions-${commission.id}`}
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
      </Menu>
    </>
  )
}
