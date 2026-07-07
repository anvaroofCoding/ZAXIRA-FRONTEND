import { useEffect, useMemo, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
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
import { BarcodeTableCell } from '@/features/warehouse/components/BarcodeTableCell'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { useSearchParams } from 'react-router-dom'
import {
  useGetAllWarehousesOverviewQuery,
  useGetWarehouseInventoryByAnyLocationQuery,
  useUpdateCrossWarehouseInventoryMutation,
} from '@/features/warehouse/api/warehouseApi'
import { isPrivilegedAdminUser } from '@/features/auth/utils/isPrivilegedAdminUser'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { SkeletonBlock } from '@/shared/components/skeleton'
import { OtherWarehousesVolumeCharts } from '@/features/warehouse/components/OtherWarehousesVolumeCharts'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { usePermissions } from '@/shared/hooks/usePermissions'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const CardsSkeleton = () => (
  <Grid container spacing={1.5}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Grid key={index} size={{ xs: 12, md: 6 }}>
        <SkeletonBlock height={112} sx={{ borderRadius: 2 }} />
      </Grid>
    ))}
  </Grid>
)

export const BoshqaOmborlarPage = () => {
  const { user } = usePermissions()
  const canEditInventory = isPrivilegedAdminUser(user)
  const overviewQuery = useGetAllWarehousesOverviewQuery()
  const structures = overviewQuery.data ?? []
  const [searchParams, setSearchParams] = useSearchParams()
  const [updateCrossWarehouseInventory, updateInventoryState] =
    useUpdateCrossWarehouseInventoryMutation()

  const selectedStructureId = searchParams.get('warehouse')
  const selectedStructure = useMemo(
    () => structures.find((s) => s.structure.id === selectedStructureId) ?? null,
    [structures, selectedStructureId],
  )

  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    characteristics: '',
    nomenclatureCode: '',
    barcode: '',
    quantity: '',
  })
  const [editError, setEditError] = useState('')

  useEffect(() => {
    if (!selectedStructureId) {
      return
    }
    if (structures.length && !structures.some((s) => s.structure.id === selectedStructureId)) {
      setSearchParams({})
    }
  }, [selectedStructureId, setSearchParams, structures])

  useEffect(() => {
    setSearch('')
    setPage(0)
    setRowsPerPage(10)
  }, [selectedStructureId])

  useEffect(() => {
    const locations = selectedStructure?.locations ?? []
    if (!locations.length) {
      setSelectedLocationId(null)
      return
    }
    if (!selectedLocationId || !locations.some((loc) => loc.id === selectedLocationId)) {
      setSelectedLocationId(locations[0].id)
    }
  }, [selectedStructure, selectedLocationId])

  const locationTabs = selectedStructure?.locations ?? []
  const selectedTabIndex = useMemo(() => {
    if (!locationTabs.length || !selectedLocationId) return 0
    const idx = locationTabs.findIndex((loc) => loc.id === selectedLocationId)
    return Math.max(0, idx)
  }, [locationTabs, selectedLocationId])

  const inventoryArgs = useMemo(
    () => ({
      structureId: selectedStructure?.structure.id ?? undefined,
      locationId: selectedLocationId,
      page: page + 1,
      limit: rowsPerPage,
      search,
    }),
    [selectedStructure, selectedLocationId, page, rowsPerPage, search],
  )

  const inventoryQuery = useGetWarehouseInventoryByAnyLocationQuery(inventoryArgs, {
    skip: !selectedStructure?.structure.id || !selectedLocationId,
  })

  const items = inventoryQuery.data?.items ?? []
  const total = inventoryQuery.data?.total ?? 0

  const openEditDialog = (item) => {
    setEditItem(item)
    setEditForm({
      name: item.name ?? '',
      characteristics: item.characteristics ?? '',
      nomenclatureCode:
        item.nomenclatureCode?.trim() || item.receiptNomenclatureCode?.trim() || '',
      barcode: item.barcode ?? '',
      quantity: String(item.quantity ?? 0),
    })
    setEditError('')
  }

  const closeEditDialog = () => {
    if (updateInventoryState.isLoading) return
    setEditItem(null)
    setEditError('')
  }

  const handleSaveEdit = async () => {
    if (!editItem?.id || !selectedStructure?.structure.id || !selectedLocationId) return

    const name = editForm.name.trim()
    const characteristics = editForm.characteristics.trim()
    const quantity = Number.parseInt(editForm.quantity, 10)

    if (!name) {
      setEditError('Tovar nomini kiriting')
      return
    }

    if (!characteristics) {
      setEditError('Tovar xususiyatini kiriting')
      return
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      setEditError('Tovar soni 0 yoki undan katta bo‘lishi kerak')
      return
    }

    setEditError('')

    const payload = {
      structureId: selectedStructure.structure.id,
      locationId: selectedLocationId,
      inventoryId: editItem.id,
    }

    if (name !== (editItem.name ?? '').trim()) payload.name = name
    if (characteristics !== (editItem.characteristics ?? '').trim()) {
      payload.characteristics = characteristics
    }

    const originalNomenclature =
      editItem.nomenclatureCode?.trim() ||
      editItem.receiptNomenclatureCode?.trim() ||
      ''
    const nextNomenclature = editForm.nomenclatureCode.trim()
    if (nextNomenclature !== originalNomenclature) {
      payload.nomenclatureCode = nextNomenclature
    }

    const nextBarcode = editForm.barcode.trim()
    if (nextBarcode !== (editItem.barcode ?? '').trim()) {
      payload.barcode = nextBarcode
    }

    if (quantity !== Number(editItem.quantity ?? 0)) {
      payload.quantity = quantity
    }

    if (
      !payload.name &&
      !payload.characteristics &&
      payload.nomenclatureCode === undefined &&
      payload.barcode === undefined &&
      payload.quantity === undefined
    ) {
      setEditError('Hech qanday o‘zgarish kiritilmadi')
      return
    }

    try {
      await updateCrossWarehouseInventory(payload).unwrap()
      setEditItem(null)
      setEditError('')
    } catch (error) {
      if (error?.status === 404) {
        setEditError(
          'Serverda boshqa ombor tovarini tahrirlash API yo‘q. ZAXIRA-BACKEND ni yangilab, qayta ishga tushiring.',
        )
        return
      }
      setEditError(getApiErrorMessage(error, 'Tovarni saqlashda xatolik'))
    }
  }

  const canSaveEdit =
    Boolean(editItem) &&
    editForm.name.trim().length > 0 &&
    editForm.characteristics.trim().length > 0 &&
    !updateInventoryState.isLoading

  return (
    <Stack spacing={2}>
      {selectedStructure ? (
        <Stack spacing={1}>
          <Box>
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => setSearchParams({})}
            >
              Ro'yxatga qaytish
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Ombor: {selectedStructure.structure.shortName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedStructure.locations.length} ta joy
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Boshqa omborlar
          </Typography>
          {!overviewQuery.isLoading ? (
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ ml: 'auto' }}>
              Jami omborlar: {structures.length}
            </Typography>
          ) : null}
        </Box>
      )}

      {!selectedStructure ? (
        <>
          <QuerySkeleton
            isLoading={overviewQuery.isLoading}
            isFetching={overviewQuery.isFetching}
            isUninitialized={overviewQuery.isUninitialized}
            data={overviewQuery.data}
            skeleton={<CardsSkeleton />}
          >
          {overviewQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(overviewQuery.error, 'Boshqa omborlarni yuklashda xatolik')}
            </Alert>
          ) : !structures.length ? (
            <Alert severity="info">Hozircha boshqa omborlar topilmadi.</Alert>
          ) : (
            <Grid container spacing={1.5}>
              {structures.map((entry) => {
                return (
                  <Grid key={entry.structure.id} size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined" sx={{ position: 'relative' }}>
                      <Chip
                        size="small"
                        color="primary"
                        label={`${entry.totalQuantity} ta`}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 1,
                        }}
                      />
                      <CardActionArea
                        onClick={() => {
                          setSearchParams({ warehouse: entry.structure.id })
                        }}
                      >
                        <CardContent>
                          <Stack spacing={1}>
                            <Stack
                              direction="row"
                              gap={1}
                              sx={{
                                pr: 9,
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight={700}>
                                {entry.structure.shortName}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                              <Chip size="small" label={`Joylar: ${entry.locations.length}`} />
                              <Chip size="small" label={`Turlar: ${entry.itemTypesCount}`} />
                            </Stack>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </QuerySkeleton>

          <OtherWarehousesVolumeCharts
            structures={structures}
            isLoading={overviewQuery.isLoading || overviewQuery.isFetching}
          />
        </>
      ) : null}

      {selectedStructure ? (
        <Box>
          {!locationTabs.length ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="info">Bu omborda joylar topilmadi.</Alert>
            </Box>
          ) : (
            <>
              <Tabs
                value={selectedTabIndex}
                onChange={(_e, idx) => {
                  const next = locationTabs[idx]
                  if (!next) return
                  setSelectedLocationId(next.id)
                  setSearch('')
                  setPage(0)
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 1 }}
              >
                {locationTabs.map((loc) => (
                  <Tab key={loc.id} label={`${loc.name} (${loc.totalQuantity})`} />
                ))}
              </Tabs>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {inventoryQuery.isError ? (
                  <Alert severity="error">
                    {getApiErrorMessage(inventoryQuery.error, 'Joy ichidagi tovarlarni yuklashda xatolik')}
                  </Alert>
                ) : null}
                <TextField
                  size="small"
                  placeholder="Tovar qidirish..."
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

                {!items.length && !inventoryQuery.isFetching ? (
                  <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      {search.trim()
                        ? 'Qidiruv bo‘yicha tovar topilmadi'
                        : 'Bu joyda tovarlar yo‘q'}
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tovar</TableCell>
                          <TableCell width={150}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                          <TableCell width={180}>Barcode</TableCell>
                          <TableCell width={140} align="right">
                            Soni
                          </TableCell>
                          {canEditInventory ? <TableCell width={56} /> : null}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow
                            key={item.id}
                            hover
                            sx={canEditInventory ? { cursor: 'pointer' } : undefined}
                            onClick={
                              canEditInventory
                                ? () => {
                                    openEditDialog(item)
                                  }
                                : undefined
                            }
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {item.characteristics}
                              </Typography>
                            </TableCell>
                            <TableCell sx={nomenclatureTableCellSx}>
                              {getItemNomenclatureCode(item)}
                            </TableCell>
                            <BarcodeTableCell value={item.barcode} productName={item.name} width={150} />
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              {item.quantity}
                            </TableCell>
                            {canEditInventory ? (
                              <TableCell align="right" padding="checkbox">
                                <IconButton
                                  size="small"
                                  aria-label="Tovarni tahrirlash"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    openEditDialog(item)
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <TablePagination
                  component="div"
                  count={total}
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
              </Box>
            </>
          )}
        </Box>
      ) : null}

      <Dialog open={Boolean(editItem)} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Tovarni tahrirlash</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {editError ? <Alert severity="error">{editError}</Alert> : null}
            <TextField
              label="Tovar nomi"
              value={editForm.name}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, name: event.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Tovar xususiyati"
              value={editForm.characteristics}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, characteristics: event.target.value }))
              }
              fullWidth
              required
              multiline
              minRows={2}
            />
            <TextField
              label={NOMENCLATURE_COLUMN_LABEL}
              value={editForm.nomenclatureCode}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, nomenclatureCode: event.target.value }))
              }
              fullWidth
              helperText="Bo‘sh qoldirsangiz, nomeklatura olib tashlanadi"
            />
            <TextField
              label="Barcode"
              value={editForm.barcode}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, barcode: event.target.value }))
              }
              fullWidth
              slotProps={{
                input: {
                  sx: { fontFamily: 'monospace' },
                },
              }}
            />
            <TextField
              label="Soni"
              type="number"
              value={editForm.quantity}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, quantity: event.target.value }))
              }
              fullWidth
              required
              slotProps={{
                htmlInput: { min: 0, step: 1 },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={updateInventoryState.isLoading}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={!canSaveEdit}
          >
            {updateInventoryState.isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
