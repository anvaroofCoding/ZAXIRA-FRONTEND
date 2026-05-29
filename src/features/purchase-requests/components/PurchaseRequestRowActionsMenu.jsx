import { useState } from 'react'
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
      </Menu>
    </>
  )
}
