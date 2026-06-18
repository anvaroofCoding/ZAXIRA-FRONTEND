import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

const DEFAULT_EXPAND_THRESHOLD = 40
const DEFAULT_LINE_CLAMP = 2

const needsExpand = (text, expandThreshold) =>
  text.length > expandThreshold || text.split('\n').length > 1

const DetailDialog = ({ open, title, text, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    onClick={(event) => event.stopPropagation()}
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent dividers>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {text}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Yopish</Button>
    </DialogActions>
  </Dialog>
)

export const PurchaseRequestItemCharacteristicsCell = ({
  value,
  modalOnly = false,
  dialogTitle = 'Tovar xususiyati',
  emphasized = false,
  expandThreshold = DEFAULT_EXPAND_THRESHOLD,
  lineClamp = DEFAULT_LINE_CLAMP,
}) => {
  const [detailOpen, setDetailOpen] = useState(false)
  const text = String(value ?? '').trim()

  if (!text) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    )
  }

  const expandable = needsExpand(text, expandThreshold)

  const openDetail = (event) => {
    event.stopPropagation()
    setDetailOpen(true)
  }

  if (modalOnly) {
    return (
      <>
        <Button
          size="small"
          variant="text"
          onClick={openDetail}
          sx={{ p: 0, minWidth: 0, textTransform: 'none', fontSize: '0.8125rem' }}
        >
          Ko‘rish
        </Button>

        <DetailDialog
          open={detailOpen}
          title={dialogTitle}
          text={text}
          onClose={() => setDetailOpen(false)}
        />
      </>
    )
  }

  const previewNode = (
    <Typography
      variant="body2"
      fontWeight={emphasized ? 600 : 400}
      sx={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...(expandable
          ? {
              display: '-webkit-box',
              WebkitLineClamp: lineClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }
          : {}),
      }}
    >
      {text}
    </Typography>
  )

  return (
    <>
      {expandable ? (
        <Box>
          <Tooltip title="To‘liq matnni ko‘rish uchun bosing" placement="top-start">
            <Box sx={{ cursor: 'pointer' }} onClick={openDetail}>
              {previewNode}
            </Box>
          </Tooltip>
          <Button
            size="small"
            variant="text"
            onClick={openDetail}
            sx={{ mt: 0.25, p: 0, minWidth: 0, textTransform: 'none', fontSize: '0.75rem' }}
          >
            To‘liq ko‘rish
          </Button>
        </Box>
      ) : (
        <Tooltip
          title={text.length > expandThreshold ? text : ''}
          placement="top-start"
          slotProps={{
            popper: {
              sx: { maxWidth: 480 },
            },
          }}
        >
          <Box component="span">{previewNode}</Box>
        </Tooltip>
      )}

      <DetailDialog
        open={detailOpen}
        title={dialogTitle}
        text={text}
        onClose={() => setDetailOpen(false)}
      />
    </>
  )
}
