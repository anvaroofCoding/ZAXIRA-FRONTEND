import { useEffect, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import PrintIcon from '@mui/icons-material/Print'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
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
import { useCreateWarehouseLocationMutation, useGetWarehouseInventoryByLocationQuery, useGetWarehouseLocationsQuery } from '@/features/warehouse/api/warehouseApi'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { SkeletonBlock } from '@/shared/components/skeleton'
import { formatDateTime } from '@/shared/utils/formatDate'
import { printBarcodeLabels } from '@/shared/utils/printBarcodeLabels'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const LocationsSkeleton = () => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack spacing={1}>
      <SkeletonBlock variant="text" width={160} height={24} />
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonBlock key={index} height={40} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  </Paper>
)

const InventorySkeleton = () => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack spacing={1.5}>
      <SkeletonBlock variant="text" width={200} height={24} />
      <SkeletonBlock height={40} sx={{ borderRadius: 1 }} />
      <SkeletonBlock height={220} sx={{ borderRadius: 1 }} />
    </Stack>
  </Paper>
)

export const MeningOmborimPage = () => {
  const locationsQuery = useGetWarehouseLocationsQuery()
  const [createLocation, createLocationState] = useCreateWarehouseLocationMutation()

  const locations = locationsQuery.data ?? []
  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const [pageError, setPageError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (!selectedLocationId && locations.length) {
      setSelectedLocationId(locations[0].id)
    }
  }, [locations, selectedLocationId])

  const [newLocationName, setNewLocationName] = useState('')
  const canCreate = newLocationName.trim().length >= 2 && !createLocationState.isLoading

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const queryArgs = useMemo(
    () => ({
      locationId: selectedLocationId,
      page: page + 1,
      limit: rowsPerPage,
      search,
    }),
    [page, rowsPerPage, search, selectedLocationId],
  )

  const inventoryQuery = useGetWarehouseInventoryByLocationQuery(queryArgs, {
    skip: !selectedLocationId,
  })

  const inventoryItems = inventoryQuery.data?.items ?? []
  const inventoryTotal = inventoryQuery.data?.total ?? 0
  const locationName = inventoryQuery.data?.location?.name

  const [detailItem, setDetailItem] = useState(null)
  const [printOpen, setPrintOpen] = useState(false)
  const [printName, setPrintName] = useState('')
  const [printCount, setPrintCount] = useState(1)

  const selectedTabIndex = useMemo(() => {
    if (!locations.length || !selectedLocationId) return 0
    const idx = locations.findIndex((loc) => loc.id === selectedLocationId)
    return Math.max(0, idx)
  }, [locations, selectedLocationId])

  const barcodeForItem = (item) => {
    const raw = `${item.name ?? ''}|${item.characteristics ?? ''}`
    let hash = 0
    for (let i = 0; i < raw.length; i += 1) {
      hash = (hash * 31 + raw.charCodeAt(i)) >>> 0
    }
    const suffix = String(hash).padStart(10, '0')
    return `WH${suffix.slice(0, 10)}`
  }

  useEffect(() => {
    if (!detailItem) {
      setPrintOpen(false)
      return
    }
    setPrintName(detailItem.name ?? '')
    setPrintCount(Math.max(1, Number(detailItem.quantity) || 1))
  }, [detailItem])

  const handleCreateLocation = async () => {
    setPageError('')
    const name = newLocationName.trim()
    if (!name) return

    try {
      const created = await createLocation({ name }).unwrap()
      setNewLocationName('')
      setSelectedLocationId(created.id)
      setCreateOpen(false)
    } catch (e) {
      setPageError(e?.data?.message || 'Joy yaratishda xatolik')
    }
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Mening omborim
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Joy qo‘shish
        </Button>
      </Box>

      {pageError ? <Alert severity="error">{pageError}</Alert> : null}

      <QuerySkeleton
        isLoading={locationsQuery.isLoading}
        isFetching={locationsQuery.isFetching}
        isUninitialized={locationsQuery.isUninitialized}
        data={locationsQuery.data}
        skeleton={<LocationsSkeleton />}
      >
        <Paper variant="outlined">
          {!locations.length ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Hali joy yaratilmagan. Yuqoridagi <b>Joy qo‘shish</b> tugmasi orqali joy yarating.
              </Typography>
            </Box>
          ) : (
            <>
              <Tabs
                value={selectedTabIndex}
                onChange={(_e, nextIndex) => {
                  const next = locations[nextIndex]
                  if (!next) return
                  setSelectedLocationId(next.id)
                  setSearch('')
                  setPage(0)
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 1 }}
              >
                {locations.map((loc) => (
                  <Tab key={loc.id} label={loc.name} />
                ))}
              </Tabs>
              <Divider />

              {!selectedLocationId ? (
                <Box sx={{ p: 2 }}>
                  <InventorySkeleton />
                </Box>
              ) : (
                <QuerySkeleton
                  isLoading={inventoryQuery.isLoading}
                  isFetching={inventoryQuery.isFetching}
                  isUninitialized={inventoryQuery.isUninitialized}
                  hasData={!inventoryQuery.isLoading && !inventoryQuery.isUninitialized}
                  skeleton={<InventorySkeleton />}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <TextField
                        size="small"
                        placeholder="Qidirish..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value)
                          setPage(0)
                        }}
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />

                      <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tovar</TableCell>
                              <TableCell width={180}>Barcode</TableCell>
                              <TableCell width={140} align="right">
                                Soni
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {!inventoryItems.length ? (
                              <TableRow>
                                <TableCell colSpan={3}>
                                  <Typography variant="body2" color="text.secondary">
                                    Bu joyda tovarlar yo‘q
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              inventoryItems.map((item) => (
                                <TableRow
                                  key={item.id}
                                  hover
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => setDetailItem(item)}
                                >
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                      {item.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      {item.characteristics}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                      {barcodeForItem(item)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    {item.quantity}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <TablePagination
                        component="div"
                        count={inventoryTotal}
                        page={page}
                        onPageChange={(_e, next) => setPage(next)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(Number(e.target.value))
                          setPage(0)
                        }}
                        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                        labelRowsPerPage="Qatorlar:"
                      />
                    </Stack>
                  </Box>
                </QuerySkeleton>
              )}
            </>
          )}
        </Paper>
      </QuerySkeleton>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Joy qo‘shish</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <TextField
              autoFocus
              size="small"
              label="Joy nomi"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { maxLength: 80 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={createLocationState.isLoading}>
            Bekor
          </Button>
          <Button variant="contained" onClick={handleCreateLocation} disabled={!canCreate}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(detailItem)} onClose={() => setDetailItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Tovar ma’lumoti</DialogTitle>
        <DialogContent dividers>
          {detailItem ? (
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tovar
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {detailItem.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Barcode
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {barcodeForItem(detailItem)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Xususiyat
                </Typography>
                <Typography variant="body2">{detailItem.characteristics}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Miqdor
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {detailItem.quantity} ta
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Oxirgi qabul
                </Typography>
                <Typography variant="body2">
                  {detailItem.lastReceiptAt ? formatDateTime(detailItem.lastReceiptAt) : '—'}
                </Typography>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          {detailItem ? (
            <Button
              startIcon={<PrintIcon />}
              variant="outlined"
              onClick={() => setPrintOpen(true)}
            >
              Print
            </Button>
          ) : null}
          <Button onClick={() => setDetailItem(null)}>Yopish</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(detailItem) && printOpen}
        onClose={() => setPrintOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Barcode print</DialogTitle>
        <DialogContent dividers>
          {detailItem ? (
            <Stack spacing={1.5}>
              <TextField
                size="small"
                label="Chiqariladigan nom"
                value={printName}
                onChange={(e) => setPrintName(e.target.value)}
                fullWidth
                slotProps={{ htmlInput: { maxLength: 80 } }}
              />
              <TextField
                size="small"
                label="Nechta etiketka"
                value={printCount}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10)
                  setPrintCount(Number.isNaN(n) ? '' : n)
                }}
                fullWidth
                inputMode="numeric"
              />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Barcode
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {barcodeForItem(detailItem)}
                </Typography>
              </Box>
              <Alert severity="info">
                Default soni ombordagi miqdorga teng. Xohlasangiz qo‘lda o‘zgartiring. Chop etish
                50×30 mm termal etiket (Xprinter) uchun optimallashtirilgan.
              </Alert>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintOpen(false)}>Bekor</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!detailItem) return
              const count = Number.parseInt(String(printCount), 10)
              if (Number.isNaN(count) || count < 1) return
              printBarcodeLabels({
                items: [
                  {
                    name: printName?.trim() || detailItem.name,
                    barcode: barcodeForItem(detailItem),
                    count,
                  },
                ],
                options: {
                  labelWidthMm: 50,
                  labelHeightMm: 30,
                  layout: 'roll',
                  dpi: 203,
                },
              })
            }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
