import { useEffect, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
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
import {
  useCreateWarehouseLocationMutation,
  useDeleteWarehouseLocationMutation,
  useGetWarehouseInventoryByLocationQuery,
  useGetWarehouseInventoryItemHistoryQuery,
  useGetWarehouseLocationsQuery,
  useUpdateWarehouseLocationMutation,
} from '@/features/warehouse/api/warehouseApi'
import { WarehouseItemHistoryTimeline } from '@/features/warehouse/components/WarehouseItemHistoryTimeline'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { SkeletonBlock } from '@/shared/components/skeleton'
import { formatDateTime } from '@/shared/utils/formatDate'
import { formatUzs } from '@/shared/utils/formatUzs'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { printBarcodeLabels } from '@/shared/utils/printBarcodeLabels'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const LocationsSkeleton = () => (
  <Stack spacing={1}>
    <SkeletonBlock variant="text" width={160} height={24} />
    {Array.from({ length: 6 }).map((_, index) => (
      <SkeletonBlock key={index} height={40} sx={{ borderRadius: 1 }} />
    ))}
  </Stack>
)

const InventorySkeleton = () => (
  <Stack spacing={1.5}>
    <SkeletonBlock variant="text" width={200} height={24} />
    <SkeletonBlock height={40} sx={{ borderRadius: 1 }} />
    <SkeletonBlock height={220} sx={{ borderRadius: 1 }} />
  </Stack>
)

const MY_WAREHOUSE_PAGE_PATH = '/omborlar/mening-omborim'

export const MeningOmborimPage = () => {
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const canAddLocation = canCreate(MY_WAREHOUSE_PAGE_PATH)
  const canEditLocation = canUpdate(MY_WAREHOUSE_PAGE_PATH)
  const canDeleteLocation = canDelete(MY_WAREHOUSE_PAGE_PATH)

  const locationsQuery = useGetWarehouseLocationsQuery()
  const [createLocation, createLocationState] = useCreateWarehouseLocationMutation()
  const [updateLocation, updateLocationState] = useUpdateWarehouseLocationMutation()
  const [deleteLocation, deleteLocationState] = useDeleteWarehouseLocationMutation()

  const locations = locationsQuery.data ?? []
  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const [pageError, setPageError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!selectedLocationId && locations.length) {
      setSelectedLocationId(locations[0].id)
    }
  }, [locations, selectedLocationId])

  const [newLocationName, setNewLocationName] = useState('')
  const [editLocationName, setEditLocationName] = useState('')
  const canSaveNewLocation = newLocationName.trim().length >= 2 && !createLocationState.isLoading

  const selectedLocation = useMemo(
    () => locations.find((loc) => loc.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  )

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
    refetchOnMountOrArgChange: true,
  })

  const inventoryItems = inventoryQuery.data?.items ?? []
  const inventoryTotal = inventoryQuery.data?.total ?? 0

  const [detailItem, setDetailItem] = useState(null)
  const [printOpen, setPrintOpen] = useState(false)
  const [printName, setPrintName] = useState('')
  const [printCount, setPrintCount] = useState(1)

  const historyQuery = useGetWarehouseInventoryItemHistoryQuery(
    {
      locationId: selectedLocationId,
      inventoryId: detailItem?.id,
    },
    {
      skip: !selectedLocationId || !detailItem?.id,
    },
  )

  const selectedTabIndex = useMemo(() => {
    if (!locations.length || !selectedLocationId) return 0
    const idx = locations.findIndex((loc) => loc.id === selectedLocationId)
    return Math.max(0, idx)
  }, [locations, selectedLocationId])

  const detailForModal = useMemo(() => {
    if (!detailItem) return null
    return inventoryItems.find((row) => row.id === detailItem.id) ?? detailItem
  }, [detailItem, inventoryItems])

  const detailPricing = useMemo(() => {
    if (!detailForModal) return null
    const unitPrice = Math.round(Number(detailForModal.unitPrice) || 0)
    const quantity = Math.max(0, Number(detailForModal.quantity) || 0)
    const lineTotal =
      Math.round(Number(detailForModal.lineTotal) || 0) || unitPrice * quantity
    return { unitPrice, lineTotal }
  }, [detailForModal])

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

  const openEditLocation = () => {
    if (!selectedLocation) return
    setEditLocationName(selectedLocation.name)
    setEditOpen(true)
  }

  const handleUpdateLocation = async () => {
    if (!selectedLocationId) return
    setPageError('')
    const name = editLocationName.trim()
    if (!name) return

    try {
      await updateLocation({ id: selectedLocationId, name }).unwrap()
      setEditOpen(false)
    } catch (e) {
      setPageError(e?.data?.message || 'Joy nomini saqlashda xatolik')
    }
  }

  const handleDeleteLocation = async () => {
    if (!selectedLocationId) return
    setPageError('')

    try {
      const deletedId = selectedLocationId
      await deleteLocation(deletedId).unwrap()
      setDeleteOpen(false)
      const remaining = locations.filter((loc) => loc.id !== deletedId)
      setSelectedLocationId(remaining[0]?.id ?? null)
    } catch (e) {
      setPageError(e?.data?.message || 'Joyni o‘chirishda xatolik')
    }
  }

  const canSaveEditLocation =
    editLocationName.trim().length >= 2 &&
    editLocationName.trim() !== selectedLocation?.name &&
    !updateLocationState.isLoading

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
        {canAddLocation ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Joy qo‘shish
          </Button>
        ) : null}
      </Box>

      {pageError ? <Alert severity="error">{pageError}</Alert> : null}

      <QuerySkeleton
        isLoading={locationsQuery.isLoading}
        isFetching={locationsQuery.isFetching}
        isUninitialized={locationsQuery.isUninitialized}
        data={locationsQuery.data}
        skeleton={<LocationsSkeleton />}
      >
        <Box>
          {!locations.length ? (
            <Typography variant="body2" color="text.secondary">
              {canAddLocation
                ? 'Hali joy yaratilmagan. Yuqoridagi Joy qo‘shish tugmasi orqali joy yarating.'
                : 'Hali joy yaratilmagan.'}
            </Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  {locations.map((loc) => (
                    <Tab key={loc.id} label={loc.name} />
                  ))}
                </Tabs>
                {selectedLocation ? (
                  <Stack direction="row" spacing={0.25}>
                    {canEditLocation ? (
                      <Tooltip title="Joy nomini tahrirlash">
                        <IconButton
                          size="small"
                          aria-label="Joy nomini tahrirlash"
                          onClick={openEditLocation}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    {canDeleteLocation ? (
                      <Tooltip title="Joyni o‘chirish">
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Joyni o‘chirish"
                          onClick={() => setDeleteOpen(true)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Stack>
                ) : null}
              </Box>
              <Divider sx={{ mb: 1.5 }} />

              {!selectedLocationId ? (
                <InventorySkeleton />
              ) : (
                <QuerySkeleton
                  isLoading={inventoryQuery.isLoading}
                  isFetching={inventoryQuery.isFetching}
                  isUninitialized={inventoryQuery.isUninitialized}
                  hasData={!inventoryQuery.isLoading && !inventoryQuery.isUninitialized}
                  skeleton={<InventorySkeleton />}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Qidiruv"
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
                              <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    {!inventoryItems.length && !inventoryQuery.isFetching ? (
                      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          {search.trim()
                            ? 'Qidiruv bo‘yicha tovar topilmadi'
                            : 'Bu joyda tovarlar yo‘q'}
                        </Typography>
                      </Paper>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small" aria-label="Ombor tovarlari">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tovar</TableCell>
                              <TableCell width={150}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                              <TableCell width={160}>Barcode</TableCell>
                              <TableCell width={120} align="right">
                                Soni
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {inventoryItems.map((item) => (
                              <TableRow
                                key={item.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => setDetailItem(item)}
                              >
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600} noWrap>
                                    {item.name}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={nomenclatureTableCellSx}>
                                  {getItemNomenclatureCode(item)}
                                </TableCell>
                                <TableCell>{item.barcode || barcodeForItem(item)}</TableCell>
                                <TableCell align="right">{item.quantity} ta</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    <TablePagination
                      component="div"
                      count={inventoryTotal}
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
                  </Box>
                </QuerySkeleton>
              )}
            </>
          )}
        </Box>
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
          <Button variant="contained" onClick={handleCreateLocation} disabled={!canSaveNewLocation}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Joyni o‘chirish</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            <b>{selectedLocation?.name}</b> joyini o‘chirmoqchimisiz? Joyda tovarlar bo‘lsa, o‘chirib
            bo‘lmaydi.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteLocationState.isLoading}>
            Bekor
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteLocation}
            disabled={deleteLocationState.isLoading}
          >
            O‘chirish
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Joy nomini tahrirlash</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <TextField
              autoFocus
              size="small"
              label="Joy nomi"
              value={editLocationName}
              onChange={(e) => setEditLocationName(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { maxLength: 80 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={updateLocationState.isLoading}>
            Bekor
          </Button>
          <Button variant="contained" onClick={handleUpdateLocation} disabled={!canSaveEditLocation}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(detailItem)} onClose={() => setDetailItem(null)} maxWidth="md" fullWidth>
        <DialogTitle>Tovar ma’lumoti</DialogTitle>
        <DialogContent dividers>
          {detailForModal ? (
            <Stack spacing={2}>
              <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tovar
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {detailForModal.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {NOMENCLATURE_COLUMN_LABEL}
                </Typography>
                <Typography variant="body2" sx={nomenclatureTableCellSx}>
                  {getItemNomenclatureCode(detailForModal)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Barcode
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {detailForModal.barcode || barcodeForItem(detailForModal)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Xususiyat
                </Typography>
                <Typography variant="body2">
                  {detailForModal.characteristics?.trim() ? detailForModal.characteristics : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Miqdor
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {detailForModal.quantity} ta
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  1 dona narxi
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {detailPricing?.unitPrice > 0
                    ? `${formatUzs(detailPricing.unitPrice)} so‘m`
                    : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Jami summa
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {detailPricing?.lineTotal > 0
                    ? `${formatUzs(detailPricing.lineTotal)} so‘m`
                    : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Oxirgi qabul
                </Typography>
                <Typography variant="body2">
                  {detailForModal.lastReceiptAt
                    ? formatDateTime(detailForModal.lastReceiptAt)
                    : '—'}
                </Typography>
              </Box>
              </Stack>

              <WarehouseItemHistoryTimeline
                events={historyQuery.data?.events ?? []}
                isLoading={historyQuery.isLoading}
                isError={historyQuery.isError}
              />
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
