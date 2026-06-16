import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

const COLLAPSED_MAX_ROWS = 2
const LONG_TEXT_THRESHOLD = 100

const isLongText = (text) =>
  text.length > LONG_TEXT_THRESHOLD || text.split('\n').length > COLLAPSED_MAX_ROWS

export const PurchaseRequestItemCharacteristicsField = ({ value, onChange, disabled }) => {
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const text = String(value ?? '')
  const showExpand = isLongText(text)

  const openEditor = () => {
    setDraft(text)
    setEditOpen(true)
  }

  const saveEditor = () => {
    onChange(draft)
    setEditOpen(false)
  }

  return (
    <>
      <Box sx={{ minWidth: 0 }}>
        <TextField
          value={value}
          onChange={(event) => onChange(event.target.value)}
          size="small"
          fullWidth
          multiline
          minRows={1}
          maxRows={COLLAPSED_MAX_ROWS}
          disabled={disabled}
          placeholder="Xususiyat"
          slotProps={{
            input: {
              sx: {
                alignItems: 'flex-start',
                py: 0.75,
              },
            },
          }}
          sx={{
            '& textarea': {
              overflow: 'auto !important',
              lineHeight: 1.4,
            },
          }}
        />
        {showExpand && !disabled ? (
          <Button
            size="small"
            variant="text"
            onClick={openEditor}
            sx={{
              mt: 0.25,
              p: 0,
              minWidth: 0,
              textTransform: 'none',
              fontSize: '0.75rem',
            }}
          >
            To‘liq tahrirlash
          </Button>
        ) : null}
      </Box>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tovar xususiyatini tahrirlash</DialogTitle>
        <DialogContent dividers>
          <TextField
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            size="small"
            fullWidth
            multiline
            minRows={6}
            maxRows={16}
            autoFocus
            placeholder="Xususiyat"
            sx={{
              '& textarea': {
                lineHeight: 1.5,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Bekor qilish</Button>
          <Button variant="contained" onClick={saveEditor}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
