import { useEffect, useMemo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
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
  COMMISSIONS_PAGE_PATH,
  DASHBOARD_PAGE_PATH,
  PERMISSION_COLUMNS,
  PRODUCTS_PAGE_PATH,
  STRUCTURES_PAGE_PATH,
  UNITS_PAGE_PATH,
  USERS_PAGE_PATH,
  WAREHOUSE_PERMISSION_BLOCKED_MESSAGE,
  WAREHOUSE_PERMISSION_GROUP_KEY,
  WAREHOUSE_PERMISSION_SELECT_STRUCTURE_MESSAGE,
} from '@/features/permissions/constants'
import {
  getGroupActionState,
  getGroupCheckState,
  getGroupPaths,
  isPageActionUnavailable,
  isWarehousePermissionPath,
  setGroupAccess,
  setGroupAction,
  setDashboardPageAccess,
  setPageAccess,
  setPageAction,
  setProductsPageAccess,
  setScopedPageAccess,
} from '@/features/permissions/utils/permissions'

const REGISTRY_SUB_PAGE_PATHS = new Set([
  USERS_PAGE_PATH,
  STRUCTURES_PAGE_PATH,
  COMMISSIONS_PAGE_PATH,
  UNITS_PAGE_PATH,
])

const permissionTableSx = {
  tableLayout: 'fixed',
  width: '100%',
  '& .MuiTableCell-root': {
    py: 2,
    px: 2.5,
    verticalAlign: 'middle',
  },
  '& .MuiTableCell-paddingCheckbox': {
    width: 96,
    minWidth: 96,
    px: 1.5,
  },
  '& .MuiTableHead .MuiTableCell-root': {
    py: 2.25,
    fontWeight: 600,
    bgcolor: 'action.hover',
    whiteSpace: 'nowrap',
  },
  '& .MuiCheckbox-root': {
    p: 1.25,
  },
  '& .MuiIconButton-root': {
    p: 1.25,
  },
}

const labelCellSx = (indent = 0) => ({
  pl: 3 + indent * 4,
  minWidth: 280,
})

const PermissionColGroup = () => (
  <colgroup>
    <col style={{ width: '38%' }} />
    <col style={{ width: '15.5%' }} />
    <col style={{ width: '15.5%' }} />
    <col style={{ width: '15.5%' }} />
    <col style={{ width: '15.5%' }} />
  </colgroup>
)

/** allowed — ombor ruxsatlari ochiq; pending — tuzilma tanlanmagan; blocked — ombor yo‘q */
const isWarehousePermissionAllowed = (mode) => mode === 'allowed'

const UnavailableActionCell = () => (
  <TableCell align="center" padding="checkbox">
    <Typography variant="body2" color="text.disabled">
      —
    </Typography>
  </TableCell>
)

const EmptyActionCell = () => <TableCell align="center" padding="checkbox" />

const DisabledActionsHintRow = ({ ticketText }) => (
  <TableRow hover>
    <TableCell sx={{ pl: 6, py: 2 }} colSpan={PERMISSION_COLUMNS.length + 1}>
      <Typography variant="body2" color="text.secondary">
        {ticketText}
      </Typography>
    </TableCell>
  </TableRow>
)

const DashboardPermissionRow = ({ permissions, onChange, disabled }) => {
  const page = permissions[DASHBOARD_PAGE_PATH] ?? { access: false, actions: {} }
  const hasAccess = Boolean(page.access)
  const hasAnalytics = Boolean(page.actions?.create)
  const [open, setOpen] = useState(hasAnalytics)

  useEffect(() => {
    if (!hasAccess || !hasAnalytics) {
      setOpen(false)
    }
  }, [hasAccess, hasAnalytics])

  return (
    <>
      <TableRow hover>
        <TableCell sx={labelCellSx()}>
          <Typography variant="body1">Dashboard</Typography>
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            size="medium"
            checked={hasAccess}
            disabled={disabled}
            onChange={(event) => {
              const enabled = event.target.checked
              if (!enabled) setOpen(false)
              onChange((prev) => setDashboardPageAccess(prev, enabled))
            }}
          />
        </TableCell>

        <TableCell align="center" padding="checkbox">
          {hasAccess ? (
            <IconButton
              size="medium"
              aria-label="Analitika ruxsatlari"
              disabled={disabled}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )}
        </TableCell>

        <UnavailableActionCell />
        <UnavailableActionCell />
      </TableRow>

      {hasAccess && open ? (
        <TableRow hover sx={{ bgcolor: 'background.default' }}>
          <TableCell sx={labelCellSx(1)}>
            <Typography variant="body2" color="text.secondary">
              Analitika selecti
            </Typography>
          </TableCell>
          <UnavailableActionCell />
          <TableCell align="center" padding="checkbox">
            <Checkbox
              size="medium"
              checked={hasAnalytics}
              disabled={disabled}
              onChange={(event) =>
                onChange((prev) =>
                setPageAction(
                  prev,
                  DASHBOARD_PAGE_PATH,
                  'create',
                  event.target.checked,
                ),
              )
              }
            />
          </TableCell>
          <UnavailableActionCell />
          <UnavailableActionCell />
        </TableRow>
      ) : null}
    </>
  )
}

const ProductsPermissionRow = ({ permissions, onChange, disabled }) => {
  const page = permissions[PRODUCTS_PAGE_PATH] ?? { access: false, actions: {} }
  const hasAccess = Boolean(page.access)
  const hasArchive = Boolean(page.actions?.delete)
  const [open, setOpen] = useState(hasArchive)

  return (
    <>
      <TableRow hover>
        <TableCell sx={labelCellSx()}>
          <Typography variant="body1">Maxsulotlar</Typography>
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            size="medium"
            checked={hasAccess}
            disabled={disabled}
            onChange={(event) => {
              const enabled = event.target.checked
              if (!enabled) setOpen(false)
              onChange((prev) => setProductsPageAccess(prev, enabled))
            }}
          />
        </TableCell>

        <EmptyActionCell />
        <EmptyActionCell />

        <TableCell align="center" padding="checkbox">
          <IconButton
            size="medium"
            aria-label="Arxivlash tugmasi ruxsati"
            disabled={disabled}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
      </TableRow>

      {open ? (
        <TableRow hover sx={{ bgcolor: 'background.default' }}>
          <TableCell sx={labelCellSx(1)}>
            <Typography variant="body2" color="text.secondary">
              Arxivlash tugmasi ruxsati!
            </Typography>
          </TableCell>
          <EmptyActionCell />
          <EmptyActionCell />
          <EmptyActionCell />
          <TableCell align="center" padding="checkbox">
            <Checkbox
              size="medium"
              checked={hasArchive}
              disabled={disabled}
              onChange={(event) =>
                onChange((prev) =>
                setPageAction(
                  prev,
                  PRODUCTS_PAGE_PATH,
                  'delete',
                  event.target.checked,
                ),
              )
              }
            />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}

const RegistrySubPagePermissionRow = ({
  pagePath,
  label,
  indent = 0,
  permissions,
  onChange,
  disabled,
}) => {
  const page = permissions[pagePath] ?? { access: false, actions: {} }
  const hasAccess = Boolean(page.access)
  const hasCreate = Boolean(page.actions?.create)
  const hasUpdate = Boolean(page.actions?.update)
  const hasDeactivate = Boolean(page.actions?.delete)
  const [open, setOpen] = useState(hasDeactivate)

  return (
    <>
      <TableRow hover>
        <TableCell sx={labelCellSx(indent)}>
          <Typography variant="body1">{label}</Typography>
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            size="medium"
            checked={hasAccess}
            disabled={disabled}
            onChange={(event) => {
              const enabled = event.target.checked
              if (!enabled) setOpen(false)
              onChange((prev) => setScopedPageAccess(prev, pagePath, enabled))
            }}
          />
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            size="medium"
            checked={hasCreate}
            disabled={disabled}
            onChange={(event) =>
              onChange((prev) =>
                setPageAction(prev, pagePath, 'create', event.target.checked),
              )
            }
          />
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            size="medium"
            checked={hasUpdate}
            disabled={disabled}
            onChange={(event) =>
              onChange((prev) =>
                setPageAction(prev, pagePath, 'update', event.target.checked),
              )
            }
          />
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <IconButton
            size="medium"
            aria-label="Nofaol qilish tugmasi ruxsati"
            disabled={disabled}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
      </TableRow>

      {open ? (
        <TableRow hover sx={{ bgcolor: 'background.default' }}>
          <TableCell sx={labelCellSx(indent + 1)}>
            <Typography variant="body2" color="text.secondary">
              NoFaol qilish tugmasi ruxsati
            </Typography>
          </TableCell>
          <EmptyActionCell />
          <EmptyActionCell />
          <EmptyActionCell />
          <TableCell align="center" padding="checkbox">
            <Checkbox
              size="medium"
              checked={hasDeactivate}
              disabled={disabled}
              onChange={(event) =>
                onChange((prev) =>
                  setPageAction(
                    prev,
                    pagePath,
                    'delete',
                    event.target.checked,
                  ),
                )
              }
            />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  )
}

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
        <TableCell sx={labelCellSx(indent)}>
          <Typography variant="body1">{label}</Typography>
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            size="medium"
            checked={Boolean(page.access)}
            disabled={accessDisabled}
            onChange={(event) =>
              onChange((prev) => setPageAccess(prev, path, event.target.checked))
            }
          />
        </TableCell>

        {PERMISSION_COLUMNS.slice(1).map((column) => {
          if (isPageActionUnavailable(path, column.key)) {
            return <UnavailableActionCell key={column.key} />
          }

          const actionDisabled = accessDisabled

          return (
            <TableCell key={column.key} align="center" padding="checkbox">
              <Checkbox
                size="medium"
                checked={Boolean(page.actions?.[column.key])}
                disabled={actionDisabled}
                onChange={(event) =>
                  onChange((prev) =>
                    setPageAction(prev, path, column.key, event.target.checked),
                  )
                }
              />
            </TableCell>
          )
        })}
      </TableRow>
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
        <TableCell sx={labelCellSx()}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="medium" onClick={() => setOpen((value) => !value)}>
              {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
            <Typography variant="body1" fontWeight={600}>
              {group.label}
            </Typography>
          </Box>
        </TableCell>

        <TableCell align="center" padding="checkbox">
          <Checkbox
            size="medium"
            checked={accessState.checked}
            indeterminate={accessState.indeterminate}
            disabled={disabled || warehouseBlocked}
            onChange={(event) =>
              onChange((prev) => setGroupAccess(prev, paths, event.target.checked))
            }
          />
        </TableCell>

        {PERMISSION_COLUMNS.slice(1).map((column) => {
          const actionState = getGroupActionState(permissions, paths, column.key)

          if (actionState.unavailable) {
            return <UnavailableActionCell key={column.key} />
          }

          const groupActionDisabled = disabled || warehouseBlocked

          return (
            <TableCell key={column.key} align="center" padding="checkbox">
              <Checkbox
                size="medium"
                checked={actionState.checked}
                indeterminate={actionState.indeterminate}
                disabled={groupActionDisabled}
                onChange={(event) =>
                  onChange((prev) =>
                    setGroupAction(prev, paths, column.key, event.target.checked),
                  )
                }
              />
            </TableCell>
          )
        })}
      </TableRow>

      {warehouseBlocked ? <DisabledActionsHintRow ticketText={warehouseHint} /> : null}

      {open
        ? group.pages.map((page) => {
            if (REGISTRY_SUB_PAGE_PATHS.has(page.path)) {
              return (
                <RegistrySubPagePermissionRow
                  key={page.path}
                  pagePath={page.path}
                  label={page.label}
                  indent={1}
                  permissions={permissions}
                  onChange={onChange}
                  disabled={disabled}
                />
              )
            }

            return (
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
            )
          })
        : null}
    </>
  )
}

export const PermissionTreeTable = ({
  catalog,
  permissions,
  onChange,
  disabled = false,
  warehousePermissionMode = 'allowed',
}) => {
  if (!catalog) return null

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table sx={permissionTableSx}>
        <PermissionColGroup />
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: 280, width: '38%' }}>Sahifa</TableCell>
            {PERMISSION_COLUMNS.map((column) => (
              <TableCell key={column.key} align="center" sx={{ minWidth: 96 }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {catalog.links.map((link) => {
            if (link.path === DASHBOARD_PAGE_PATH) {
              return (
                <DashboardPermissionRow
                  key={link.path}
                  permissions={permissions}
                  onChange={onChange}
                  disabled={disabled}
                />
              )
            }

            if (link.path === PRODUCTS_PAGE_PATH) {
              return (
                <ProductsPermissionRow
                  key={link.path}
                  permissions={permissions}
                  onChange={onChange}
                  disabled={disabled}
                />
              )
            }

            return (
              <PageRow
                key={link.path}
                label={link.label}
                path={link.path}
                permissions={permissions}
                onChange={onChange}
                disabled={disabled}
                warehousePermissionMode={warehousePermissionMode}
              />
            )
          })}

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
