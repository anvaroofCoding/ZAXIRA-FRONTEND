import { useMemo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import {
  DISABLED_PAGE_ACTION_TICKETS,
  PERMISSION_COLUMNS,
  WAREHOUSE_PERMISSION_BLOCKED_MESSAGE,
  WAREHOUSE_PERMISSION_GROUP_KEY,
  WAREHOUSE_PERMISSION_SELECT_STRUCTURE_MESSAGE,
} from '@/features/permissions/constants'
import {
  getGroupActionState,
  getGroupCheckState,
  getGroupPaths,
  isPageActionDisabled,
  isWarehousePermissionPath,
  setGroupAccess,
  setGroupAction,
  setPageAccess,
  setPageAction,
} from '@/features/permissions/utils/permissions'

/** allowed — ombor ruxsatlari ochiq; pending — tuzilma tanlanmagan; blocked — ombor yo‘q */
const isWarehousePermissionAllowed = (mode) => mode === 'allowed'

const DisabledActionsHintRow = ({ ticketText }) => (
  <TableRow hover>
    <TableCell sx={{ pl: 5 }} colSpan={PERMISSION_COLUMNS.length + 1}>
      <Typography variant="caption" color="text.secondary">
        {ticketText}
      </Typography>
    </TableCell>
  </TableRow>
)

const PageRow = ({
  label,
  indent = 0,
  permissions,
  path,
  onChange,
  disabled,
  warehousePermissionMode = 'allowed',
}) => {
  const page = permissions[path] ?? { access: false, actions: {} }
  const warehouseBlocked =
    !isWarehousePermissionAllowed(warehousePermissionMode) &&
    isWarehousePermissionPath(path)
  const accessDisabled = disabled || warehouseBlocked

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ pl: 2 + indent * 3 }}>
          <Typography variant="body2">{label}</Typography>
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            checked={Boolean(page.access)}
            disabled={accessDisabled}
            onChange={(event) =>
              onChange(setPageAccess(permissions, path, event.target.checked))
            }
          />
        </TableCell>

        {PERMISSION_COLUMNS.slice(1).map((column) => {
          const actionDisabled =
            accessDisabled ||
            !page.access ||
            isPageActionDisabled(path, column.key)

          return (
            <TableCell key={column.key} align="center" padding="checkbox">
              <Checkbox
                checked={Boolean(page.access && page.actions?.[column.key])}
                disabled={actionDisabled}
                onChange={(event) =>
                  onChange(
                    setPageAction(permissions, path, column.key, event.target.checked),
                  )
                }
              />
            </TableCell>
          )
        })}
      </TableRow>
      {DISABLED_PAGE_ACTION_TICKETS[path] ? (
        <DisabledActionsHintRow ticketText={DISABLED_PAGE_ACTION_TICKETS[path]} />
      ) : null}
    </>
  )
}

const GroupSection = ({
  group,
  permissions,
  onChange,
  disabled,
  warehousePermissionMode = 'allowed',
}) => {
  const [open, setOpen] = useState(true)
  const paths = useMemo(() => getGroupPaths(group), [group])
  const accessState = getGroupCheckState(permissions, paths)
  const isWarehouseGroup = group.key === WAREHOUSE_PERMISSION_GROUP_KEY
  const warehouseBlocked =
    isWarehouseGroup && !isWarehousePermissionAllowed(warehousePermissionMode)
  const warehouseHint =
    warehousePermissionMode === 'pending'
      ? WAREHOUSE_PERMISSION_SELECT_STRUCTURE_MESSAGE
      : WAREHOUSE_PERMISSION_BLOCKED_MESSAGE

  return (
    <>
      <TableRow sx={{ bgcolor: 'action.hover' }}>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={() => setOpen((value) => !value)}>
              {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
            <Typography variant="body2" fontWeight={600}>
              {group.label}
            </Typography>
          </Box>
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            checked={accessState.checked}
            indeterminate={accessState.indeterminate}
            disabled={disabled || warehouseBlocked}
            onChange={(event) =>
              onChange(setGroupAccess(permissions, paths, event.target.checked))
            }
          />
        </TableCell>

        {PERMISSION_COLUMNS.slice(1).map((column) => {
          const actionState = getGroupActionState(permissions, paths, column.key)
          const groupActionDisabled =
            disabled ||
            warehouseBlocked ||
            actionState.disabled ||
            !paths.some((path) => permissions[path]?.access)

          return (
            <TableCell key={column.key} align="center" padding="checkbox">
              <Checkbox
                checked={actionState.checked}
                indeterminate={actionState.indeterminate}
                disabled={groupActionDisabled}
                onChange={(event) =>
                  onChange(
                    setGroupAction(permissions, paths, column.key, event.target.checked),
                  )
                }
              />
            </TableCell>
          )
        })}
      </TableRow>

      {warehouseBlocked ? <DisabledActionsHintRow ticketText={warehouseHint} /> : null}

      <TableRow>
        <TableCell colSpan={PERMISSION_COLUMNS.length + 1} sx={{ p: 0, border: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                {group.pages.map((page) => (
                  <PageRow
                    key={page.path}
                    label={page.label}
                    indent={1}
                    path={page.path}
                    permissions={permissions}
                    onChange={onChange}
                    disabled={disabled}
                    warehousePermissionMode={warehousePermissionMode}
                  />
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export const PermissionTreeTable = ({
  catalog,
  permissions,
  onChange,
  disabled = false,
  maxHeight = 360,
  warehousePermissionMode = 'allowed',
}) => {
  if (!catalog) return null

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ maxHeight, overflow: 'auto' }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Sahifa</TableCell>
            {PERMISSION_COLUMNS.map((column) => (
              <TableCell key={column.key} align="center">
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {catalog.links.map((link) => (
            <PageRow
              key={link.path}
              label={link.label}
              path={link.path}
              permissions={permissions}
              onChange={onChange}
              disabled={disabled}
              warehousePermissionMode={warehousePermissionMode}
            />
          ))}

          {catalog.groups.map((group) => (
            <GroupSection
              key={group.key}
              group={group}
              permissions={permissions}
              onChange={onChange}
              disabled={disabled}
              warehousePermissionMode={warehousePermissionMode}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
