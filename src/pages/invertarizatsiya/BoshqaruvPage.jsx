import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'
import {
  useApplyExcessAdjustmentsMutation,
  useGetStocktakeManagementDetailQuery,
  useGetStocktakesForManagementQuery,
} from '@/features/invertarizatsiya/api/stocktakesApi'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PAGE_PATH = '/invertarizatsiya/boshqaruv'
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const clampInt = (value, min, max) => {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (Number.isNaN(n)) return min
  return Math.max(min, Math.min(max, n))
}

const parseQtyInput = (value, max) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return String(clampInt(digits, 0, max))
}

const modeLabel = (item) =>
  item?.mode === 'location' ? `Joy: ${item.locationName || '—'}` : 'Umumiy'

const pendingChip = (pending) =>
  pending > 0 ? { color: 'warning', label: `${pending} kutilmoqda` } : { color: 'success', label: 'Tayyor' }

export const BoshqaruvPage = () => {
  const dispatch = useAppDispatch()
  const { canAccess, canUpdate } = usePermissions()
  const canView = canAccess(PAGE_PATH)
  const canApply = canUpdate(PAGE_PATH)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedId, setSelectedId] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTab, setDetailTab] = useState('ko_p')
  const [draftDeduct, setDraftDeduct] = useState({})
  const [draftAdd, setDraftAdd] = useState({})
  const [error, setError] = useState('')

  const listQuery = useGetStocktakesForManagementQuery(
    { page: page + 1, limit: rowsPerPage },
    { skip: !canView },
  )

  const detailQuery = useGetStocktakeManagementDetailQuery(selectedId, {
    skip: !selectedId || !detailOpen || !canView,
  })

  const [applyAdjustments, applyState] = useApplyExcessAdjustmentsMutation()

  const items = listQuery.data?.items ?? []
  const total = listQuery.data?.total ?? 0
  const detail = detailQuery.data
  const excessLines = detail?.excessLines ?? []
  const shortageLines = detail?.shortageLines ?? []

  const handleOpenDetail = (id) => {
    setSelectedId(id)
    setDetailOpen(true)
    setDetailTab('ko_p')
    setError('')
  }

  const handleCloseDetail = () => {
    if (applyState.isLoading) return
    setDetailOpen(false)
    setSelectedId('')
    setDraftDeduct({})
    setDraftAdd({})
    setError('')
  }

  useEffect(() => {
    if (!detail) {
      setDraftDeduct({})
      setDraftAdd({})
      return
    }

    const nextDeduct = {}
    excessLines.forEach((line) => {
      nextDeduct[line.lineKey] = String(line.excessDeductQuantity ?? 0)
    })
    setDraftDeduct(nextDeduct)

    const nextAdd = {}
    shortageLines.forEach((line) => {
      nextAdd[line.lineKey] = String(line.shortageAddQuantity ?? 0)
    })
    setDraftAdd(nextAdd)

    if (excessLines.length) {
      setDetailTab('ko_p')
    } else if (shortageLines.length) {
      setDetailTab('kam')
    }
  }, [detail, excessLines, shortageLines])

  const hasChanges = useMemo(() => {
    const excessChanged = excessLines.some((line) => {
      const draft = clampInt(draftDeduct[line.lineKey], 0, line.excessQuantity)
      return draft !== (line.excessDeductQuantity ?? 0)
    })
    const shortageChanged = shortageLines.some((line) => {
      const draft = clampInt(draftAdd[line.lineKey], 0, line.shortageQuantity)
      return draft !== (line.shortageAddQuantity ?? 0)
    })
    return excessChanged || shortageChanged
  }, [excessLines, shortageLines, draftDeduct, draftAdd])

  const handleApply = async () => {
    if (!selectedId || !canApply) return
    setError('')

    const payloadItems = []

    for (const line of excessLines) {
      const deductQuantity = clampInt(draftDeduct[line.lineKey], 0, line.excessQuantity)
      if (deductQuantity !== (line.excessDeductQuantity ?? 0)) {
        payloadItems.push({ lineKey: line.lineKey, deductQuantity })
      }
    }

    for (const line of shortageLines) {
      const addQuantity = clampInt(draftAdd[line.lineKey], 0, line.shortageQuantity)
      if (addQuantity !== (line.shortageAddQuantity ?? 0)) {
        payloadItems.push({ lineKey: line.lineKey, addQuantity })
      }
    }

    if (!payloadItems.length) {
      setError('O‘zgarish kiritilmagan')
      return
    }

    try {
      await applyAdjustments({ id: selectedId, items: payloadItems }).unwrap()
      dispatch(
        showNotification({
          severity: 'success',
          message: 'Sklad qoldiqlari yangilandi',
        }),
      )
      listQuery.refetch()
      handleCloseDetail()
    } catch (e) {
      setError(getApiErrorMessage(e, 'Saqlashda xatolik'))
    }
  }

  if (!canView) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="warning">Sizda «Boshqaruv» sahifasiga ruxsat yo‘q.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Boshqaruv
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Ko‘p sanalgan tovarlardan skladdan ayiring, kam sanalganlarga esa skladga qo‘shing.
        </Typography>

        {!canApply ? (
          <Alert severity="info">
            Siz faqat ko‘rishingiz mumkin. Tahrirlash uchun «yangilash» ruxsati kerak.
          </Alert>
        ) : null}

        <QuerySkeleton
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          isUninitialized={listQuery.isUninitialized}
          hasData={!listQuery.isUninitialized}
        >
          {listQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(listQuery.error, 'Ro‘yxatni yuklab bo‘lmadi')}
            </Alert>
          ) : null}

          <TableContainer component={Paper} variant="outlined">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Kod</TableCell>
                  <TableCell>Tuzilma</TableCell>
                  <TableCell>Turi</TableCell>
                  <TableCell align="right">Ko‘p</TableCell>
                  <TableCell align="right">Kam</TableCell>
                  <TableCell>Sana</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!items.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        Tuzatish kerak bo‘lgan partiyalar yo‘q
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const excessChip = pendingChip(item.pendingExcessCount ?? 0)
                    const shortageChip = pendingChip(item.pendingShortageCount ?? 0)

                    return (
                      <TableRow
                        key={item.id}
                        hover
                        onClick={() => handleOpenDetail(item.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 700 }}>{item.code}</TableCell>
                        <TableCell>{item.structureName}</TableCell>
                        <TableCell>{modeLabel(item)}</TableCell>
                        <TableCell align="right">
                          {item.excessLinesCount > 0 ? (
                            <Chip size="small" color={excessChip.color} label={`${item.excessLinesCount} · ${excessChip.label}`} />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {item.shortageLinesCount > 0 ? (
                            <Chip size="small" color={shortageChip.color} label={`${item.shortageLinesCount} · ${shortageChip.label}`} />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_e, next) => setPage(next)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number.parseInt(e.target.value, 10))
                setPage(0)
              }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="Qatorlar:"
            />
          </TableContainer>
        </QuerySkeleton>
      </Stack>

      <Dialog open={detailOpen} onClose={handleCloseDetail} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>{detail?.code ?? 'Invertarizatsiya'}</DialogTitle>
        <DialogContent dividers>
          {detailQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : detailQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(detailQuery.error, 'Partiyani yuklab bo‘lmadi')}
            </Alert>
          ) : detail ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {detail.structureName} · {modeLabel(detail)}
              </Typography>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Tabs
                value={detailTab}
                onChange={(_e, value) => setDetailTab(value)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab value="ko_p" label={`Ko‘p (${excessLines.length})`} disabled={!excessLines.length} />
                <Tab value="kam" label={`Kam (${shortageLines.length})`} disabled={!shortageLines.length} />
              </Tabs>

              {detailTab === 'ko_p' ? (
                !excessLines.length ? (
                  <Alert severity="info">Ko‘p sanalgan tovar yo‘q</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Tovar</TableCell>
                          <TableCell align="right">Kitobda</TableCell>
                          <TableCell align="right">Sanaldi</TableCell>
                          <TableCell align="right">Ko‘p</TableCell>
                          <TableCell align="right" width={120}>
                            Ayirish
                          </TableCell>
                          <TableCell align="right">Skladda</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {excessLines.map((line) => {
                          const draft = clampInt(draftDeduct[line.lineKey], 0, line.excessQuantity)
                          const warehouseAfter = line.countedQuantity - draft

                          return (
                            <TableRow key={line.lineKey} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {line.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{line.bookQuantity}</TableCell>
                              <TableCell align="right">{line.countedQuantity}</TableCell>
                              <TableCell align="right" sx={{ color: 'error.main', fontWeight: 700 }}>
                                +{line.excessQuantity}
                              </TableCell>
                              <TableCell align="right">
                                <TextField
                                  size="small"
                                  value={draftDeduct[line.lineKey] ?? '0'}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const next = parseQtyInput(e.target.value, line.excessQuantity)
                                    setDraftDeduct((prev) => ({
                                      ...prev,
                                      [line.lineKey]: next === '' ? '0' : next,
                                    }))
                                  }}
                                  onBlur={() => {
                                    setDraftDeduct((prev) => ({
                                      ...prev,
                                      [line.lineKey]: String(
                                        clampInt(prev[line.lineKey], 0, line.excessQuantity),
                                      ),
                                    }))
                                  }}
                                  disabled={!canApply || applyState.isLoading}
                                  inputMode="numeric"
                                  slotProps={{
                                    htmlInput: {
                                      min: 0,
                                      max: line.excessQuantity,
                                    },
                                  }}
                                  sx={{ width: 96 }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {warehouseAfter}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : !shortageLines.length ? (
                <Alert severity="info">Kam sanalgan tovar yo‘q</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tovar</TableCell>
                        <TableCell align="right">Kitobda</TableCell>
                        <TableCell align="right">Sanaldi</TableCell>
                        <TableCell align="right">Kam</TableCell>
                        <TableCell align="right" width={120}>
                          Qo‘shish
                        </TableCell>
                        <TableCell align="right">Skladda</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shortageLines.map((line) => {
                        const draft = clampInt(draftAdd[line.lineKey], 0, line.shortageQuantity)
                        const warehouseAfter = line.countedQuantity + draft

                        return (
                          <TableRow key={line.lineKey} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {line.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{line.bookQuantity}</TableCell>
                            <TableCell align="right">{line.countedQuantity}</TableCell>
                            <TableCell align="right" sx={{ color: 'warning.main', fontWeight: 700 }}>
                              −{line.shortageQuantity}
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                size="small"
                                value={draftAdd[line.lineKey] ?? '0'}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const next = parseQtyInput(e.target.value, line.shortageQuantity)
                                  setDraftAdd((prev) => ({
                                    ...prev,
                                    [line.lineKey]: next === '' ? '0' : next,
                                  }))
                                }}
                                onBlur={() => {
                                  setDraftAdd((prev) => ({
                                    ...prev,
                                    [line.lineKey]: String(
                                      clampInt(prev[line.lineKey], 0, line.shortageQuantity),
                                    ),
                                  }))
                                }}
                                disabled={!canApply || applyState.isLoading}
                                inputMode="numeric"
                                slotProps={{
                                  htmlInput: {
                                    min: 0,
                                    max: line.shortageQuantity,
                                  },
                                }}
                                sx={{ width: 96 }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              {warehouseAfter}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDetail} disabled={applyState.isLoading}>
            Yopish
          </Button>
          {canApply && detail ? (
            <Button
              variant="contained"
              disabled={!hasChanges || applyState.isLoading || detailQuery.isLoading}
              onClick={handleApply}
              startIcon={
                applyState.isLoading ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              Saqlash
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
