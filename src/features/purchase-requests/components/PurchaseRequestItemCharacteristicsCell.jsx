import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { truncateText } from '@/features/products/utils/truncateText'

const PREVIEW_MAX_LENGTH = 160
const LINE_CLAMP = 3

const needsExpand = (text) =>
  text.length > PREVIEW_MAX_LENGTH || text.split('\n').length > LINE_CLAMP

export const PurchaseRequestItemCharacteristicsCell = ({ value }) => {
  const [detailOpen, setDetailOpen] = useState(false)
  const text = String(value ?? '').trim()

  if (!text) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    )
  }

  const preview = truncateText(text, PREVIEW_MAX_LENGTH)
  const expandable = needsExpand(text)

  const openDetail = (event) => {
    event.stopPropagation()
    setDetailOpen(true)
  }

  const previewNode = (
    <Typography
      variant="body2"
      sx={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...(expandable
          ? {
              display: '-webkit-box',
              WebkitLineClamp: LINE_CLAMP,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }
          : {}),
      }}
    >
      {expandable ? preview.text : text}
    </Typography>
  )

  return (
    <>
      {expandable ? (
        <Box onClick={openDetail}>
          <Tooltip title="To‘liq matnni ko‘rish uchun bosing" placement="top-start">
            <Box sx={{ cursor: 'pointer' }}>{previewNode}</Box>
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
          title={text.length > 80 ? text : ''}
          placement="top-start"
          slotProps={{
            popper: {
              sx: { maxWidth: 420 },
            },
          }}
        >
          <Box component="span">{previewNode}</Box>
        </Tooltip>
      )}

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        onClick={(event) => event.stopPropagation()}
      >
        <DialogTitle>Tovar xususiyati</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {text}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Yopish</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
