import { useMemo, useState } from 'react'
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined'
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
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
import {
  useGetTransferByIdQuery,
  useGetTransferHistoryQuery,
} from '@/features/transfer/api/transferApi'
import { CancelTransferDialog } from '@/features/transfer/components/CancelTransferDialog'
import { PurchaseRequestItemCharacteristicsCell } from '@/features/purchase-requests/components/PurchaseRequestItemCharacteristicsCell'
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
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { filterStructuresWithWarehouse } from '@/features/structures/utils/structureFilters'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useTransferListFilters } from '@/shared/hooks/useTransferListFilters'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { useQueryParamOpen } from '@/shared/hooks/useQueryParamOpen'
import { canCancelDispatchForUser, isDispatchCancelableState } from '@/features/transfer/utils/transferCancel'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

const directionIcons = {
  success: <ArrowDownwardOutlinedIcon fontSize="small" />,
  warning: <ArrowUpwardOutlinedIcon fontSize="small" />,
  default: <SwapHorizOutlinedIcon fontSize="small" />,
}

const resolveCancelReasonText = (dispatch) => {
  const label = dispatch?.cancelReasonLabel?.trim()
  const other = dispatch?.cancelReasonOther?.trim()
  if (!label) return ''
  return other ? `${label}: ${other}` : label
}

export const TransferlarTarixiPage = () => {
  const { user } = usePermissions()
  const viewerStructureId = user?.structureId ?? user?.structure?.id ?? ''

  const {
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    structureFilter,
    setStructureFilter,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    queryParams,
    clearFilters,
    hasActiveFilters,
  } = useTransferListFilters({
    withStructureFilter: true,
    viewerStructureId,
  })

  const [detailId, setDetailId] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  useQueryParamOpen('dispatch', setDetailId)

  const structuresQuery = useGetStructuresQuery()
  const structuresForFilter = useMemo(() => {
    const list = filterStructuresWithWarehouse(structuresQuery.data)
    return [...list].sort((a, b) => a.shortName.localeCompare(b.shortName, 'uz'))
  }, [structuresQuery.data])

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

  const canCancelDispatch = (dispatch) => {
    if (canCancelDispatchForUser(dispatch, user)) return true
    if (!isDispatchCancelableState(dispatch)) return false
    const direction = resolveTransferDirection(dispatch, viewerStructureId)
    return direction.label === 'Ketgan'
  }

  const detailDispatch = detailQuery.data
  const showDetailCancel = Boolean(detailDispatch && canCancelDispatch(detailDispatch))

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
          structureFilter={structureFilter}
          onStructureFilterChange={setStructureFilter}
          structures={structuresForFilter}
          viewerStructureId={viewerStructureId}
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
                  <TableCell width={56} align="center">
                    Amal
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const movement = resolveMovement(item)
                  const statusChip = getDispatchStatusChipProps(item.status, item.statusLabel)
                  const showCancel = canCancelDispatch(item)

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
                      <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                        {showCancel ? (
                          <Tooltip title="Bekor qilish">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setCancelTarget(item)}
                              aria-label="Bekor qilish"
                            >
                              <BlockOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          '—'
                        )}
                      </TableCell>
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
          ) : detailDispatch ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip size="small" label={detailDispatch.dispatchCode} sx={dispatchCodeSx} />
                <Chip
                  size="small"
                  {...getDispatchStatusChipProps(
                    detailDispatch.status,
                    detailDispatch.statusLabel,
                  )}
                />
                {(() => {
                  const movement = resolveMovement(detailDispatch)
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

              <WarehouseDispatchSummaryPanel dispatch={detailDispatch} />

              {detailDispatch.status === 'CANCELLED' ? (
                <Alert severity="warning">
                  Transfer bekor qilingan
                  {resolveCancelReasonText(detailDispatch)
                    ? ` · Sabab: ${resolveCancelReasonText(detailDispatch)}`
                    : ''}
                  {detailDispatch.cancelledAt
                    ? ` · ${formatDateTime(detailDispatch.cancelledAt)}`
                    : ''}
                  {detailDispatch.cancelledBy?.displayName
                    ? ` · ${detailDispatch.cancelledBy.displayName}`
                    : ''}
                </Alert>
              ) : null}

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
                    {detailDispatch.items?.map((row) => (
                      <TableRow key={row.itemIndex}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.name}
                          </Typography>
                          {row.characteristics?.trim() ? (
                            <PurchaseRequestItemCharacteristicsCell
                              value={row.characteristics}
                              modalOnly
                            />
                          ) : null}
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
        {detailDispatch || detailQuery.isLoading ? (
          <DialogActions sx={{ px: 3, py: 2 }}>
            {showDetailCancel ? (
              <Button
                color="error"
                variant="contained"
                startIcon={<BlockOutlinedIcon />}
                onClick={() => setCancelTarget(detailDispatch)}
              >
                Transferni bekor qilish
              </Button>
            ) : null}
            <Button onClick={() => setDetailId('')}>Yopish</Button>
          </DialogActions>
        ) : null}
      </Dialog>

      <CancelTransferDialog
        open={Boolean(cancelTarget)}
        dispatch={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onSuccess={() => {
          inboxQuery.refetch()
          if (cancelTarget?.id === detailId) {
            detailQuery.refetch()
          }
        }}
      />
    </Box>
  )
}
