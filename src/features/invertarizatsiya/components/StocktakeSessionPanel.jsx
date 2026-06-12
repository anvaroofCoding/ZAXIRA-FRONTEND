import { useEffect, useMemo, useRef, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'
import {
  useCancelStocktakeMutation,
  useCompleteStocktakeMutation,
  useLazySearchStocktakeLinesQuery,
  useScanStocktakeBarcodeMutation,
  useUpdateStocktakeLineMutation,
} from '@/features/invertarizatsiya/api/stocktakesApi'
import {
  filterStocktakeLines,
  STOCKTAKE_TABS,
} from '@/features/invertarizatsiya/utils/stocktakeLineFilters'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const clampInt = (value, min) => {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (Number.isNaN(n)) return min
  return Math.max(min, n)
}

const modeLabel = (session) => {
  if (session.mode === 'location') {
    return `Joy: ${session.locationName || '—'}`
  }
  return 'Umumiy (joylar aralash)'
}

export const StocktakeSessionPanel = ({ session, onSessionChange }) => {
  const dispatch = useAppDispatch()
  const [tab, setTab] = useState('hammasi')
  const [barcode, setBarcode] = useState('')
  const [search, setSearch] = useState('')
  const [addQty, setAddQty] = useState('1')
  const [selectedLine, setSelectedLine] = useState(null)
  const [error, setError] = useState('')
  const [completeOpen, setCompleteOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const barcodeRef = useRef(null)
  const searchRef = useRef(null)

  const [searchLines, searchState] = useLazySearchStocktakeLinesQuery()
  const [scanBarcode, scanState] = useScanStocktakeBarcodeMutation()
  const [updateLine, updateState] = useUpdateStocktakeLineMutation()
  const [completeStocktake, completeState] = useCompleteStocktakeMutation()
  const [cancelStocktake, cancelState] = useCancelStocktakeMutation()

  const isBusy =
    scanState.isLoading ||
    updateState.isLoading ||
    completeState.isLoading ||
    cancelState.isLoading

  useEffect(() => {
    const timer = setTimeout(() => barcodeRef.current?.focus(), 0)
    return () => clearTimeout(timer)
  }, [session?.id])

  const lines = session?.lines ?? []
  const filteredLines = useMemo(() => filterStocktakeLines(lines, tab), [lines, tab])

  const tabCounts = useMemo(
    () => ({
      hammasi: lines.length,
      kam: filterStocktakeLines(lines, 'kam').length,
      ko_p: filterStocktakeLines(lines, 'ko_p').length,
    }),
    [lines],
  )

  const searchResults = searchState.data?.items ?? []

  useEffect(() => {
    const term = search.trim()
    if (term.length < 2 || !session?.id) {
      return undefined
    }

    const timer = setTimeout(() => {
      searchLines({ id: session.id, q: term })
    }, 250)

    return () => clearTimeout(timer)
  }, [search, session?.id, searchLines])

  const applySession = (next) => {
    onSessionChange?.(next)
  }

  const handleScan = async () => {
    setError('')
    const value = barcode.trim()
    if (!value || !session?.id) return

    try {
      const next = await scanBarcode({ id: session.id, barcode: value }).unwrap()
      applySession(next)
      setBarcode('')
    } catch (e) {
      setError(getApiErrorMessage(e, 'Barcode topilmadi'))
      barcodeRef.current?.select?.()
    } finally {
      setTimeout(() => barcodeRef.current?.focus(), 0)
    }
  }

  const handleAddCount = async () => {
    if (!selectedLine || !session?.id) return
    setError('')

    const qty = clampInt(addQty, 1)
    const nextCount = (selectedLine.countedQuantity ?? 0) + qty

    try {
      const next = await updateLine({
        id: session.id,
        lineKey: selectedLine.lineKey,
        countedQuantity: nextCount,
      }).unwrap()
      applySession(next)
      setSelectedLine(null)
      setSearch('')
      searchRef.current?.focus()
    } catch (e) {
      setError(getApiErrorMessage(e, 'Sonni saqlashda xatolik'))
    }
  }

  const handleSetCount = async (line, countedQuantity) => {
    if (!session?.id) return
    try {
      const next = await updateLine({
        id: session.id,
        lineKey: line.lineKey,
        countedQuantity: clampInt(countedQuantity, 0),
      }).unwrap()
      applySession(next)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Sonni yangilashda xatolik'))
    }
  }

  const handleComplete = async () => {
    if (!session?.id) return
    setError('')
    try {
      const next = await completeStocktake(session.id).unwrap()
      setCompleteOpen(false)
      setCancelOpen(false)
      dispatch(
        showNotification({
          severity: 'success',
          message: `Invertarizatsiya yakunlandi: ${next.code}`,
        }),
      )
      onSessionChange?.(null)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Yakunlashda xatolik'))
    }
  }

  const handleCancel = async () => {
    if (!session?.id) return
    setError('')
    try {
      await cancelStocktake(session.id).unwrap()
      setCancelOpen(false)
      onSessionChange?.(null)
      dispatch(showNotification({ severity: 'info', message: 'Invertarizatsiya bekor qilindi' }))
    } catch (e) {
      setError(getApiErrorMessage(e, 'Bekor qilishda xatolik'))
    }
  }

  if (!session) return null

  if (session.status === 'completed') {
    return (
      <Alert severity="success">
        <Typography fontWeight={700}>{session.code}</Typography>
        <Typography variant="body2">
          Invertarizatsiya yakunlandi. Tarix sahifasida ko‘rishingiz mumkin.
        </Typography>
      </Alert>
    )
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {session.code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {session.structureName} · {modeLabel(session)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip size="small" label={`Jami: ${session.summary?.total ?? lines.length}`} />
          <Chip size="small" color="warning" label={`Kam: ${tabCounts.kam}`} />
          <Chip size="small" color="error" label={`Ko‘p: ${tabCounts.ko_p}`} />
        </Stack>
      </Box>

      {session.comment ? (
        <Typography variant="body2" color="text.secondary">
          Izoh: {session.comment}
        </Typography>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField
            inputRef={barcodeRef}
            size="small"
            label="Barcode"
            placeholder="Skaner qiling yoki kiriting (har safar +1)"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            disabled={isBusy}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleScan()
              }
            }}
            fullWidth
          />

          <Box>
            <TextField
              inputRef={searchRef}
              size="small"
              label="Tovar nomi bo‘yicha qidirish"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedLine(null)
              }}
              disabled={isBusy}
              fullWidth
            />
            {search.trim().length >= 2 && searchResults.length ? (
              <List dense sx={{ mt: 1, border: 1, borderColor: 'divider', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                {searchResults.map((line) => (
                  <ListItemButton
                    key={line.lineKey}
                    selected={selectedLine?.lineKey === line.lineKey}
                    onClick={() => {
                      setSelectedLine(line)
                      setAddQty('1')
                    }}
                  >
                    <ListItemText
                      primary={line.name}
                      secondary={`Kitobda: ${line.bookQuantity} · Sanaldi: ${line.countedQuantity}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : null}

            {selectedLine ? (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }} flexWrap="wrap">
                <Typography variant="body2" sx={{ flex: 1, minWidth: 160 }}>
                  <b>{selectedLine.name}</b> (kitobda {selectedLine.bookQuantity})
                </Typography>
                <TextField
                  size="small"
                  label="Qo‘shish soni"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  inputMode="numeric"
                  sx={{ width: 120 }}
                  disabled={isBusy}
                />
                <Button variant="contained" onClick={handleAddCount} disabled={isBusy}>
                  Qo‘shish
                </Button>
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </Paper>

      <Tabs
        value={tab}
        onChange={(_e, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {STOCKTAKE_TABS.map((item) => (
          <Tab
            key={item.key}
            value={item.key}
            label={`${item.label} (${tabCounts[item.key] ?? 0})`}
          />
        ))}
      </Tabs>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Tovar</TableCell>
              <TableCell width={130}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
              <TableCell width={130}>Barcode</TableCell>
              <TableCell width={90} align="right">
                Kitobda
              </TableCell>
              <TableCell width={90} align="right">
                Sanaldi
              </TableCell>
              <TableCell width={90} align="right">
                Farq
              </TableCell>
              <TableCell width={200} align="right">
                Sanash
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!filteredLines.length ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary">
                    Bu tabda tovar yo‘q
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLines.map((line) => {
                const diff = line.countedQuantity - line.bookQuantity
                const diffColor =
                  diff > 0 ? 'error.main' : diff < 0 && line.countedQuantity > 0 ? 'warning.main' : 'text.primary'

                return (
                  <TableRow key={line.lineKey} hover selected={line.countedQuantity === 0}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {line.name}
                      </Typography>
                      {line.characteristics ? (
                        <Typography variant="caption" color="text.secondary">
                          {line.characteristics}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell sx={nomenclatureTableCellSx}>
                      {getItemNomenclatureCode(line)}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{line.barcode}</TableCell>
                    <TableCell align="right">{line.bookQuantity}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {line.countedQuantity}
                    </TableCell>
                    <TableCell align="right" sx={{ color: diffColor, fontWeight: 700 }}>
                      {diff > 0 ? `+${diff}` : diff}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
                        <IconButton
                          size="small"
                          disabled={isBusy || line.countedQuantity <= 0}
                          onClick={() => handleSetCount(line, line.countedQuantity - 1)}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          size="small"
                          value={line.countedQuantity}
                          onChange={(e) => handleSetCount(line, e.target.value)}
                          disabled={isBusy}
                          inputMode="numeric"
                          sx={{ width: 72 }}
                        />
                        <IconButton
                          size="small"
                          disabled={isBusy}
                          onClick={() => handleSetCount(line, line.countedQuantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button color="inherit" onClick={() => setCancelOpen(true)} disabled={isBusy}>
          Bekor qilish
        </Button>
        <Button variant="contained" onClick={() => setCompleteOpen(true)} disabled={isBusy}>
          Yakunlash
        </Button>
      </Box>

      <Dialog open={cancelOpen} onClose={cancelState.isLoading ? undefined : () => setCancelOpen(false)}>
        <DialogTitle>Invertarizatsiyani bekor qilish</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <b>{session.code}</b> bekor qilinadi va barcha sanash ma’lumotlari saqlanmaydi. Ishonchingiz
            komilmi?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={cancelState.isLoading}>
            Yo‘q
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleCancel}
            disabled={cancelState.isLoading}
            startIcon={cancelState.isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Ha, bekor qilish
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={completeOpen} onClose={completeState.isLoading ? undefined : () => setCompleteOpen(false)}>
        <DialogTitle>Invertarizatsiyani yakunlash</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Ombor qoldiqlari sanalgan miqdorga moslashtiriladi. Davom etasizmi?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteOpen(false)} disabled={completeState.isLoading}>
            Yo‘q
          </Button>
          <Button
            variant="contained"
            onClick={handleComplete}
            disabled={completeState.isLoading}
            startIcon={completeState.isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Ha, yakunlash
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
