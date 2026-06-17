import { useState } from 'react'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DescriptionIcon from '@mui/icons-material/Description'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {
  hasSubmittedBildirgi,
  hasSubmittedKelishuv,
} from '@/features/purchase-requests/utils/purchaseRequestExport'

export const PurchaseRequestRowActionsMenu = ({
  item,
  loading,
  onView,
  onDownloadBildirgi,
  onDownloadKelishuv,
  onDelete,
  canDelete = false,
  onEdit,
  canEdit = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClose = () => setAnchorEl(null)

  const runAction = (action) => {
    handleClose()
    action()
  }

  const showBildirgi = hasSubmittedBildirgi(item) && typeof onDownloadBildirgi === 'function'
  const showKelishuv = hasSubmittedKelishuv(item) && typeof onDownloadKelishuv === 'function'

  return (
    <>
      <IconButton
        size="small"
        aria-label="Amallar"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={loading}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => runAction(() => onView(item))}>
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ko‘rish</ListItemText>
        </MenuItem>
        {showBildirgi ? (
          <MenuItem onClick={() => runAction(() => onDownloadBildirgi(item))}>
            <ListItemIcon>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Bildirgi</ListItemText>
          </MenuItem>
        ) : null}
        {showKelishuv ? (
          <MenuItem onClick={() => runAction(() => onDownloadKelishuv(item))}>
            <ListItemIcon>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Kelishuv varaqasi</ListItemText>
          </MenuItem>
        ) : null}
        {canEdit && onEdit ? (
          <MenuItem onClick={() => runAction(() => onEdit(item))}>
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tahrirlash</ListItemText>
          </MenuItem>
        ) : null}
        {canDelete && onDelete ? (
          <MenuItem
            onClick={() => runAction(() => onDelete(item))}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>O‘chirish</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  )
}
