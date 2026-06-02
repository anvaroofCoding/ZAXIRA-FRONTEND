import { useState } from 'react'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DescriptionIcon from '@mui/icons-material/Description'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

export const PurchaseRequestRowActionsMenu = ({
  item,
  loading,
  onView,
  onDownloadPdf,
  onDownloadDocx,
  onDelete,
  canDelete = false,
  onEdit,
  canEdit = false,
  onResubmit,
  canResubmit = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClose = () => setAnchorEl(null)

  const runAction = (action) => {
    handleClose()
    action()
  }

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
        <MenuItem onClick={() => runAction(() => onDownloadPdf(item))}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF yuklab olish</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runAction(() => onDownloadDocx(item))}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Word yuklab olish</ListItemText>
        </MenuItem>
        {canEdit && onEdit ? (
          <MenuItem onClick={() => runAction(() => onEdit(item))}>
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tahrirlash</ListItemText>
          </MenuItem>
        ) : null}
        {canResubmit && onResubmit ? (
          <MenuItem onClick={() => runAction(() => onResubmit(item))}>
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Qayta yuborish</ListItemText>
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
