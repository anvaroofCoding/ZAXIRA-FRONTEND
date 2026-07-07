import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'

export const CustomUnitRowActionsMenu = ({
  unit,
  canUpdate,
  canDelete,
  statusLoadingId,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const loading = statusLoadingId === unit.id
  const canRemove = canDelete && !unit.isUsed
  const hasAnyAction = canUpdate || canDelete

  if (!hasAnyAction) {
    return null
  }

  const handleClose = () => setAnchorEl(null)

  const runAction = (action) => {
    handleClose()
    action(unit)
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label="Amallar"
        aria-controls={open ? `unit-actions-${unit.id}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={loading}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        id={`unit-actions-${unit.id}`}
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

        {canDelete ? (
          <Tooltip
            title={unit.isUsed ? 'Birlik ishlatilgani uchun o‘chirib bo‘lmaydi' : ''}
            placement="left"
          >
            <span>
              <MenuItem
                onClick={() => runAction(onDelete)}
                disabled={!canRemove}
              >
                <ListItemIcon>
                  <DeleteOutlinedIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>O‘chirish</ListItemText>
              </MenuItem>
            </span>
          </Tooltip>
        ) : null}
      </Menu>
    </>
  )
}
