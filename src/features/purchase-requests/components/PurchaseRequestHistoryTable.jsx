import { useMemo } from 'react'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import {
  getDecisionChipColor,
  getStatusChipColor,
} from '@/features/purchase-requests/utils/purchaseRequestStatus'
import { formatPurchaseDeadline } from '@/features/purchase-requests/utils/formatPurchaseDeadline'
import { formatDateTime } from '@/shared/utils/formatDate'

const COLUMN_COUNT = 8

const resolveStructureGroupKey = (item) =>
  item.applicantStructure?.structureId ??
  item.applicantStructure?.shortName ??
  '__unknown__'

const resolveStructureGroupLabel = (item) => {
  const structure = item.applicantStructure
  if (!structure) {
    return 'Tuzilma aniqlanmagan'
  }

  const shortName = structure.shortName?.trim()
  const fullName = structure.fullName?.trim()

  if (shortName && fullName && shortName !== fullName) {
    return `${shortName} — ${fullName}`
  }

  return shortName || fullName || 'Tuzilma aniqlanmagan'
}

export const PurchaseRequestHistoryTable = ({ items, onView }) => {
  const groupedRows = useMemo(() => {
    const rows = []
    let lastGroupKey = null

    for (const item of items) {
      const groupKey = resolveStructureGroupKey(item)

      if (groupKey !== lastGroupKey) {
        rows.push({
          type: 'header',
          key: `structure-${groupKey}`,
          label: resolveStructureGroupLabel(item),
        })
        lastGroupKey = groupKey
      }

      rows.push({ type: 'item', key: item.id, item })
    }

    return rows
  }, [items])

  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Hodisalar topilmadi</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={120}>Ariza ID</TableCell>
            <TableCell width={150}>Hodisa vaqti</TableCell>
            <TableCell width={180}>Hodisa turi</TableCell>
            <TableCell width={160}>Kim</TableCell>
            <TableCell width={140}>Qaror</TableCell>
            <TableCell>Izoh</TableCell>
            <TableCell width={180}>Ariza holati</TableCell>
            <TableCell width={140}>Ariza beruvchi</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {groupedRows.map((row) => {
            if (row.type === 'header') {
              return (
                <TableRow key={row.key}>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    sx={{
                      bgcolor: 'action.hover',
                      borderBottom: 1,
                      borderColor: 'divider',
                      py: 1.25,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {row.label}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            }

            const item = row.item

            return (
              <TableRow
                key={row.key}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onView(item)}
              >
                <TableCell sx={{ fontWeight: 600 }}>{item.requestCode}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {formatDateTime(item.eventAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.eventTypeLabel}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={item.actor.login}>
                    {item.actor.displayName}
                  </Typography>
                </TableCell>
                <TableCell>
                  {item.decision ? (
                    <Chip
                      size="small"
                      color={getDecisionChipColor(item.decision)}
                      label={item.decisionLabel}
                    />
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    const deadlineLabel = formatPurchaseDeadline(
                      item.purchaseDeadline,
                      item.purchaseDeadlineMandatory,
                    )
                    const commentText = item.comment?.trim()
                    const displayText = [commentText, deadlineLabel ? `Muddat: ${deadlineLabel}` : null]
                      .filter(Boolean)
                      .join(' · ')

                    return (
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 320,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={displayText}
                      >
                        {displayText || '—'}
                      </Typography>
                    )
                  })()}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={getStatusChipColor(item.requestStatus)}
                    label={item.requestStatusLabel}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {item.applicant.displayName}
                  </Typography>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
