import { useState } from 'react'
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined'
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import Tooltip from '@mui/material/Tooltip'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useGetTransferByIdQuery, useGetTransferHistoryQuery } from '@/features/transfer/api/transferApi'
import { TransferPageFilters } from '@/features/transfer/components/TransferPageFilters'
import {
  getDispatchStatusChipProps,
  resolveTransferDirection,
} from '@/features/warehouse-dispatches/utils/dispatchStatusDisplay'
import { WarehouseDispatchSummaryPanel } from '@/features/warehouse-dispatches/components/WarehouseDispatchSummaryPanel'
import {
  getItemNomenclatureCode,
  NOMENCLATURE_COLUMN_LABEL,
  nomenclatureTableCellSx,
} from '@/features/warehouse/utils/itemNomenclature'
import { dispatchCodeSx } from '@/features/warehouse-dispatches/utils/dispatchCodeDisplay'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTransferListFilters } from '@/shared/hooks/useTransferListFilters'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { useQueryParamOpen } from '@/shared/hooks/useQueryParamOpen'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const directionIcons = {
  success: <ArrowDownwardOutlinedIcon fontSize="small" />,
  warning: <ArrowUpwardOutlinedIcon fontSize="small" />,
  default: <SwapHorizOutlinedIcon fontSize="small" />,
}

export const TransferlarTarixiPage = () => {
  const { user } = usePermissions()
  const viewerStructureId = user?.structureId ?? ''

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
  const [detailId, setDetailId] = useState('')
  useQueryParamOpen('dispatch', setDetailId)

  const inboxQuery = useGetTransferHistoryQuery(queryParams)
  const detailQuery = useGetTransferByIdQuery(
    { id: detailId, markSeen: false },
    { skip: !detailId },
  )
  const items = inboxQuery.data?.items ?? []
  const total = inboxQuery.data?.total ?? 0

  const resolveMovement = (item) => {
    const direction = resolveTransferDirection(item, viewerStructureId)
    return {
      tooltip: direction.label,
      color: direction.color,
      icon: directionIcons[direction.color] ?? directionIcons.default,
    }
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <QuerySkeleton
        isLoading={inboxQuery.isLoading}
        isFetching={inboxQuery.isFetching}
        isUninitialized={inboxQuery.isUninitialized}
        hasData={!inboxQuery.isUninitialized}
      >
        {inboxQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(inboxQuery.error, 'Transfer tarixini yuklab bo‘lmadi')}
          </Alert>
        ) : null}

        <TransferPageFilters
          title="Transferlar tarixi"
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

        {!items.length ? (
          <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Transferlar hozircha yo‘q</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={56} padding="checkbox" />
                  <TableCell width={200}>Nakladnoy</TableCell>
                  <TableCell width={120}>Jo‘natuvchi</TableCell>
                  <TableCell width={120}>Qabul qiluvchi</TableCell>
                  <TableCell width={150}>Sana</TableCell>
                  <TableCell width={160}>Qabul holati</TableCell>
                  <TableCell width={90} align="right">
                    Qolgan
                  </TableCell>
                  <TableCell width={80} align="right">
                    Tovar
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const movement = resolveMovement(item)
                  const statusChip = getDispatchStatusChipProps(item.status, item.statusLabel)

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setDetailId(item.id)}
                    >
                      <TableCell padding="checkbox">
                        <Tooltip title={movement.tooltip}>
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              color:
                                movement.color === 'default'
                                  ? 'text.secondary'
                                  : `${movement.color}.main`,
                            }}
                          >
                            {movement.icon}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography component="span" variant="body2" sx={dispatchCodeSx}>
                          {item.dispatchCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.sourceStructure?.shortName ?? item.dispatchedBy?.displayName ?? '—'}
                      </TableCell>
                      <TableCell>{item.targetStructure?.shortName ?? '—'}</TableCell>
                      <TableCell>{formatDateTime(item.dispatchedAt)}</TableCell>
                      <TableCell>
                        <Chip size="small" {...statusChip} />
                      </TableCell>
                      <TableCell align="right">
                        {item.pendingTotal > 0 ? `${item.pendingTotal} ta` : '—'}
                      </TableCell>
                      <TableCell align="right">{item.items?.length ?? 0}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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
      </QuerySkeleton>

      <Dialog open={Boolean(detailId)} onClose={() => setDetailId('')} maxWidth="md" fullWidth>
        <DialogTitle>Transfer partiyasi batafsil</DialogTitle>
        <DialogContent dividers>
          {detailQuery.isLoading ? (
            <Typography color="text.secondary">Yuklanmoqda...</Typography>
          ) : detailQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(detailQuery.error, 'Transfer tafsilotini yuklab bo‘lmadi')}
            </Alert>
          ) : detailQuery.data ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip size="small" label={detailQuery.data.dispatchCode} sx={dispatchCodeSx} />
                <Chip
                  size="small"
                  {...getDispatchStatusChipProps(
                    detailQuery.data.status,
                    detailQuery.data.statusLabel,
                  )}
                />
                {(() => {
                  const movement = resolveMovement(detailQuery.data)
                  return (
                    <Tooltip title={movement.tooltip}>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color:
                            movement.color === 'default'
                              ? 'text.secondary'
                              : `${movement.color}.main`,
                        }}
                      >
                        {movement.icon}
                      </Box>
                    </Tooltip>
                  )
                })()}
              </Stack>

              <WarehouseDispatchSummaryPanel dispatch={detailQuery.data} />

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tovar</TableCell>
                      <TableCell width={140}>{NOMENCLATURE_COLUMN_LABEL}</TableCell>
                      <TableCell width={120} align="right">
                        Jo‘natilgan
                      </TableCell>
                      <TableCell width={120} align="right">
                        Qabul
                      </TableCell>
                      <TableCell width={120} align="right">
                        Qaytgan
                      </TableCell>
                      <TableCell width={120} align="right">
                        Qolgan
                      </TableCell>
                      <TableCell>Izoh</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailQuery.data.items?.map((row) => (
                      <TableRow key={row.itemIndex}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.characteristics}
                          </Typography>
                        </TableCell>
                        <TableCell sx={nomenclatureTableCellSx}>
                          {getItemNomenclatureCode(row)}
                        </TableCell>
                        <TableCell align="right">{row.quantityDispatched} ta</TableCell>
                        <TableCell align="right">{row.quantityReceived} ta</TableCell>
                        <TableCell align="right">{row.quantityRejected} ta</TableCell>
                        <TableCell align="right">{row.quantityPending} ta</TableCell>
                        <TableCell>{row.rejectReason || '—'}</TableCell>
                      </TableRow>
                    ))}
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
