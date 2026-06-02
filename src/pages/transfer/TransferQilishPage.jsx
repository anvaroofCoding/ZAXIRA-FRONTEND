import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import RemoveIcon from '@mui/icons-material/Remove'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useGetWarehouseInventoryByLocationQuery, useGetWarehouseLocationsQuery } from '@/features/warehouse/api/warehouseApi'
import { CreateTransferDialog } from '@/features/transfer/components/CreateTransferDialog'
import { TransferPageFilters } from '@/features/transfer/components/TransferPageFilters'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { useTransferListFilters } from '@/shared/hooks/useTransferListFilters'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const TransferQilishPage = () => {
  const {
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    queryParams,
    clearFilters,
    hasActiveFilters,
  } = useTransferListFilters()

  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const locationsQuery = useGetWarehouseLocationsQuery()
  const locations = locationsQuery.data ?? []

  useEffect(() => {
    if (!selectedLocationId && locations.length) {
      setSelectedLocationId(locations[0].id)
    }
  }, [locations, selectedLocationId])

  const inventoryQueryArgs = useMemo(
    () => ({
      locationId: selectedLocationId,
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search,
    }),
    [queryParams.limit, queryParams.page, queryParams.search, selectedLocationId],
  )

  const inventoryQuery = useGetWarehouseInventoryByLocationQuery(inventoryQueryArgs, {
    skip: !selectedLocationId,
    refetchOnMountOrArgChange: true,
  })
  const items = inventoryQuery.data?.items ?? []
  const total = inventoryQuery.data?.total ?? 0

  const locationsReady =
    !locationsQuery.isLoading && !locationsQuery.isUninitialized
  const inventoryReady =
    Boolean(selectedLocationId) &&
    !inventoryQuery.isLoading &&
    !inventoryQuery.isUninitialized
  const pageReady = locationsReady && (!selectedLocationId || inventoryReady)

  const selectedMap = useMemo(
    () =>
      new Map(
        selectedItems.map((item) => [
          `${item.locationId}|${item.barcode}`,
          item,
        ]),
      ),
    [selectedItems],
  )

  const transferDraft = selectedItems.length
    ? { items: selectedItems }
    : null

  const addOne = (row) => {
    const key = `${selectedLocationId}|${row.barcode}`
    setSelectedItems((prev) => {
      const existing = prev.find((item) => `${item.locationId}|${item.barcode}` === key)
      if (existing) {
        return prev.map((item) =>
          `${item.locationId}|${item.barcode}` === key
            ? { ...item, quantity: Math.min(item.available, item.quantity + 1) }
            : item,
        )
      }

      return [
        ...prev,
        {
          locationId: selectedLocationId,
          barcode: row.barcode,
          name: row.name,
          quantity: 1,
          available: row.quantity,
        },
      ]
    })
  }

  const decreaseOne = (row) => {
    const key = `${selectedLocationId}|${row.barcode}`
    setSelectedItems((prev) => {
      const existing = prev.find((item) => `${item.locationId}|${item.barcode}` === key)
      if (!existing) return prev
      if (existing.quantity <= 1) {
        return prev.filter((item) => `${item.locationId}|${item.barcode}` !== key)
      }
      return prev.map((item) =>
        `${item.locationId}|${item.barcode}` === key
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      )
    })
  }

  const removeItem = (row) => {
    const key = `${selectedLocationId}|${row.barcode}`
    setSelectedItems((prev) =>
      prev.filter((item) => `${item.locationId}|${item.barcode}` !== key),
    )
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={locationsQuery.isLoading || (Boolean(selectedLocationId) && inventoryQuery.isLoading)}
        isFetching={locationsQuery.isFetching || inventoryQuery.isFetching}
        isUninitialized={locationsQuery.isUninitialized}
        hasData={pageReady}
        skeleton={
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={26} />
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {locationsQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(locationsQuery.error, 'Ombor joylarini yuklab bo‘lmadi')}
            </Alert>
          ) : null}

          {locationsReady && !locations.length ? (
            <Alert severity="info">
              Transfer qilish uchun avval «Mening omborim» bo‘limida ombor joyi yarating.
            </Alert>
          ) : null}

          {inventoryQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(inventoryQuery.error, 'Transfer tovarlarini yuklab bo‘lmadi')}
            </Alert>
          ) : null}

          <TransferPageFilters
            title="Transfer qilish"
            headerAction={
              <Button
                size="small"
                variant="contained"
                onClick={() => setDialogOpen(true)}
                disabled={!selectedItems.length}
              >
                Transfer qilish
              </Button>
            }
            search={search}
            onSearchChange={setSearch}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            dateFromLabel="Sana (dan)"
            dateToLabel="Sana (gacha)"
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {locations.length ? (
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel id="transfer-location">Manba ombor joyi</InputLabel>
              <Select
                labelId="transfer-location"
                label="Manba ombor joyi"
                value={selectedLocationId}
                onChange={(event) => {
                  setSelectedLocationId(event.target.value)
                  setPage(0)
                }}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          {selectedLocationId && inventoryReady && !items.length ? (
            <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">Bu ombor joyida transfer uchun tovar topilmadi</Typography>
            </Paper>
          ) : selectedLocationId && inventoryReady && items.length ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tovar</TableCell>
                    <TableCell width={160}>Barcode</TableCell>
                    <TableCell width={120}>Omborda</TableCell>
                    <TableCell width={130}>Tanlangan</TableCell>
                    <TableCell width={180} align="right">
                      Amal
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.barcode}</TableCell>
                      <TableCell>{item.quantity} ta</TableCell>
                      <TableCell>
                        {(() => {
                          const selected = selectedMap.get(`${selectedLocationId}|${item.barcode}`)
                          const selectedQty = selected?.quantity ?? 0
                          return (
                        <Chip
                          size="small"
                          color="info"
                          label={`${selectedQty} ta`}
                        />
                          )
                        })()}
                      </TableCell>
                      <TableCell align="right">
                        {(() => {
                          const selected = selectedMap.get(`${selectedLocationId}|${item.barcode}`)
                          const selectedQty = selected?.quantity ?? 0
                          const canIncrease = selectedQty < item.quantity

                          return (
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => decreaseOne(item)}
                                disabled={!selectedQty}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => addOne(item)}
                                disabled={!canIncrease}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeItem(item)}
                                disabled={!selectedQty}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}

          {selectedLocationId && inventoryReady ? (
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value))
              setPage(0)
            }}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            labelRowsPerPage="Qatorlar:"
          />
          ) : null}
        </Box>
      </QuerySkeleton>

      <CreateTransferDialog
        open={dialogOpen}
        request={transferDraft}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {}}
      />
    </Box>
  )
}
