import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
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
import Typography from '@mui/material/Typography'
import { CreateStocktakeDialog } from '@/features/invertarizatsiya/components/CreateStocktakeDialog'
import { StocktakeSessionPanel } from '@/features/invertarizatsiya/components/StocktakeSessionPanel'
import {
  useGetActiveStocktakeQuery,
  useGetStocktakeByIdQuery,
  useGetStocktakesQuery,
} from '@/features/invertarizatsiya/api/stocktakesApi'
import { filterStocktakeLines, STOCKTAKE_TABS } from '@/features/invertarizatsiya/utils/stocktakeLineFilters'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const INVERTARIZATSIYA_PAGE_PATH = '/invertarizatsiya/invertarizatsiya-qilish'
export const INVERTARIZATSIYA_TARIX_PAGE_PATH = '/invertarizatsiya/barcha-invertarizatsiyalar'

const resolvePageMeta = (pathname) => {
  if (pathname.includes('/barcha-invertarizatsiyalar')) {
    return { title: 'Barcha invertarizatsiyalar', tab: 'tarix' }
  }
  return { title: 'Invertarizatsiya qilish', tab: 'jarayon' }
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const statusChip = (status) => {
  if (status === 'completed') return { label: 'Yakunlangan', color: 'success' }
  if (status === 'cancelled') return { label: 'Bekor qilingan', color: 'default' }
  return { label: 'Jarayonda', color: 'info' }
}

const modeLabel = (item) =>
  item?.mode === 'location' ? `Joy: ${item.locationName || '—'}` : 'Umumiy'

export const InvertarizatsiyaPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const pageMeta = useMemo(() => resolvePageMeta(location.pathname), [location.pathname])

  const { user, canCreate, canAccess } = usePermissions()
  const canStart = canCreate(INVERTARIZATSIYA_PAGE_PATH)
  const canViewHistory = canAccess(INVERTARIZATSIYA_TARIX_PAGE_PATH)
  const defaultStructureId = user?.structureId ?? ''

  const [tab, setTab] = useState(pageMeta.tab)

  useEffect(() => {
    setTab(pageMeta.tab)
  }, [pageMeta.tab])
  const [createOpen, setCreateOpen] = useState(false)
  const [sessionOverride, setSessionOverride] = useState(undefined)

  const [historyPage, setHistoryPage] = useState(0)
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10)
  const [detailId, setDetailId] = useState('')
  const [detailTab, setDetailTab] = useState('hammasi')

  const activeQuery = useGetActiveStocktakeQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: tab !== 'jarayon',
  })

  const historyQuery = useGetStocktakesQuery(
    { page: historyPage + 1, limit: historyRowsPerPage },
    { skip: tab !== 'tarix' || !canViewHistory },
  )

  const detailQuery = useGetStocktakeByIdQuery(detailId, { skip: !detailId })

  const session =
    sessionOverride !== undefined ? sessionOverride : activeQuery.data ?? null

  const historyItems = historyQuery.data?.items ?? []
  const historyTotal = historyQuery.data?.total ?? 0
  const detail = detailQuery.data
  const detailLines = detail ? filterStocktakeLines(detail.lines ?? [], detailTab) : []

  const handleCreated = (created) => {
    setSessionOverride(created)
    setTab('jarayon')
    activeQuery.refetch()
  }

  const handleSessionChange = (next) => {
    if (!next || next.status === 'completed' || next.status === 'cancelled') {
      setSessionOverride(null)
      activeQuery.refetch()
      historyQuery.refetch()
      return
    }
    setSessionOverride(next)
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h5" component="h1" fontWeight={700}>
            {pageMeta.title}
          </Typography>

          {canStart && tab === 'jarayon' && !session ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Yaratish
            </Button>
          ) : null}
        </Box>

        <Tabs
          value={tab}
          onChange={(_e, value) => {
            setTab(value)
            navigate(
              value === 'tarix' ? INVERTARIZATSIYA_TARIX_PAGE_PATH : INVERTARIZATSIYA_PAGE_PATH,
            )
          }}
        >
          <Tab value="jarayon" label="Jarayon" />
          <Tab value="tarix" label="Tarix" />
        </Tabs>

        {tab === 'jarayon' ? (
          <Stack spacing={2}>
            {!canStart ? (
              <Alert severity="warning">Sizda invertarizatsiya yaratish uchun ruxsat yo‘q.</Alert>
            ) : null}

            <QuerySkeleton
              isLoading={activeQuery.isLoading}
              isFetching={activeQuery.isFetching}
              isUninitialized={activeQuery.isUninitialized}
              hasData={!activeQuery.isLoading}
            >
              {activeQuery.isError ? (
                <Alert severity="error">
                  {getApiErrorMessage(activeQuery.error, 'Faol invertarizatsiyani yuklab bo‘lmadi')}
                </Alert>
              ) : null}

              {session ? (
                <StocktakeSessionPanel session={session} onSessionChange={handleSessionChange} />
              ) : (
                <Alert severity="info">
                  Faol invertarizatsiya yo‘q. Boshlash uchun «Yaratish» tugmasini bosing.
                </Alert>
              )}
            </QuerySkeleton>
          </Stack>
        ) : (
          <QuerySkeleton
            isLoading={historyQuery.isLoading}
            isFetching={historyQuery.isFetching}
            isUninitialized={historyQuery.isUninitialized}
            hasData={!historyQuery.isUninitialized}
          >
            {historyQuery.isError ? (
              <Alert severity="error">
                {getApiErrorMessage(historyQuery.error, 'Tarixni yuklab bo‘lmadi')}
              </Alert>
            ) : null}

            {!historyItems.length && !historyQuery.isLoading ? (
              <Alert severity="info">Invertarizatsiyalar hozircha yo‘q</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Kod</TableCell>
                      <TableCell>Tuzilma</TableCell>
                      <TableCell>Turi</TableCell>
                      <TableCell>Holat</TableCell>
                      <TableCell align="right">Kam</TableCell>
                      <TableCell align="right">Ko‘p</TableCell>
                      <TableCell>Sana</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyItems.map((item) => {
                      const chip = statusChip(item.status)
                      return (
                        <TableRow
                          key={item.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => {
                            setDetailId(item.id)
                            setDetailTab('hammasi')
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700 }}>{item.code}</TableCell>
                          <TableCell>{item.structureName}</TableCell>
                          <TableCell>{modeLabel(item)}</TableCell>
                          <TableCell>
                            <Chip size="small" color={chip.color} label={chip.label} />
                          </TableCell>
                          <TableCell align="right">{item.summary?.kam ?? 0}</TableCell>
                          <TableCell align="right">{item.summary?.ko_p ?? 0}</TableCell>
                          <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={historyTotal}
                  page={historyPage}
                  onPageChange={(_e, next) => setHistoryPage(next)}
                  rowsPerPage={historyRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setHistoryRowsPerPage(Number.parseInt(e.target.value, 10))
                    setHistoryPage(0)
                  }}
                  rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                  labelRowsPerPage="Qatorlar:"
                />
              </TableContainer>
            )}
          </QuerySkeleton>
        )}
      </Stack>

      <CreateStocktakeDialog
        open={createOpen}
        defaultStructureId={defaultStructureId}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <Dialog open={Boolean(detailId)} onClose={() => setDetailId('')} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>{detail?.code ?? 'Invertarizatsiya'}</DialogTitle>
        <DialogContent dividers>
          {detailQuery.isLoading ? (
            <Typography color="text.secondary">Yuklanmoqda…</Typography>
          ) : detailQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(detailQuery.error, 'Ma’lumotni yuklab bo‘lmadi')}
            </Alert>
          ) : detail ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {detail.structureName} · {modeLabel(detail)} · {statusChip(detail.status).label}
              </Typography>
              {detail.comment ? (
                <Typography variant="body2">Izoh: {detail.comment}</Typography>
              ) : null}

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {STOCKTAKE_TABS.map((item) => (
                  <Chip
                    key={item.key}
                    label={item.label}
                    color={detailTab === item.key ? 'primary' : 'default'}
                    onClick={() => setDetailTab(item.key)}
                    variant={detailTab === item.key ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tovar</TableCell>
                      <TableCell align="right">Kitobda</TableCell>
                      <TableCell align="right">Sanaldi</TableCell>
                      <TableCell align="right">Farq</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!detailLines.length ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="body2" color="text.secondary">
                            Tovar yo‘q
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      detailLines.map((line) => (
                        <TableRow key={line.lineKey}>
                          <TableCell>{line.name}</TableCell>
                          <TableCell align="right">{line.bookQuantity}</TableCell>
                          <TableCell align="right">{line.countedQuantity}</TableCell>
                          <TableCell align="right">{line.diff}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
