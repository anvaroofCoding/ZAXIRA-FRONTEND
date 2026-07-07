import MoreVertIcon from '@mui/icons-material/MoreVert'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import BlockIcon from '@mui/icons-material/Block'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

const StatusChip = ({ status }) =>
  status === 'active' ? (
    <Chip size="small" color="success" label="Faol" />
  ) : (
    <Chip size="small" color="default" label="Bekor" />
  )

const GrantRowActions = ({ grant, onView, onDownloadPdf, onRevoke, canManage }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  if (!canManage) {
    return (
      <IconButton size="small" aria-label="Ko‘rish" onClick={() => onView(grant)}>
        <VisibilityOutlinedIcon fontSize="small" />
      </IconButton>
    )
  }

  return (
    <>
      <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onView(grant)
          }}
        >
          <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          Ko‘rish
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onDownloadPdf(grant)
          }}
        >
          <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} />
          PDF
        </MenuItem>
        {grant.status === 'active' ? (
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              onRevoke(grant)
            }}
          >
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            Bekor qilish
          </MenuItem>
        ) : null}
      </Menu>
    </>
  )
}

export const ApiAccessGrantsTable = ({
  grants,
  canManage,
  onView,
  onDownloadPdf,
  onRevoke,
}) => {
  if (!grants.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Hozircha API berish yozuvlari yo‘q</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tashkilot</TableCell>
            <TableCell>STIR</TableCell>
            <TableCell>Mas’ul</TableCell>
            <TableCell>API’lar</TableCell>
            <TableCell>Kalit</TableCell>
            <TableCell>Holat</TableCell>
            <TableCell>Sana</TableCell>
            <TableCell align="right">Amallar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grants.map((grant) => (
            <TableRow key={grant.id} hover>
              <TableCell>
                <Typography fontWeight={600}>{grant.institutionName}</Typography>
              </TableCell>
              <TableCell>{grant.stir}</TableCell>
              <TableCell>{grant.contactPerson}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {(grant.scopeLabels || []).slice(0, 2).map((label) => (
                    <Chip key={`${grant.id}-${label}`} size="small" label={label} />
                  ))}
                  {(grant.scopeLabels || []).length > 2 ? (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`+${grant.scopeLabels.length - 2}`}
                    />
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {grant.keyPrefix}***
                </Typography>
              </TableCell>
              <TableCell>
                <StatusChip status={grant.status} />
              </TableCell>
              <TableCell>{formatDate(grant.createdAt)}</TableCell>
              <TableCell align="right">
                <GrantRowActions
                  grant={grant}
                  canManage={canManage}
                  onView={onView}
                  onDownloadPdf={onDownloadPdf}
                  onRevoke={onRevoke}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
