import {
  DASHBOARD_PAGE_PATH,
  GRANULAR_PERMISSION_PATHS,
  ISHONCHNOMA_PAGE_PATH,
  PRODUCTS_PAGE_PATH,
  PURCHASING_QUEUE_PAGE_PATH,
  RECEIPT_PAGE_PATHS,
  STRUCTURES_PAGE_PATH,
  COMMISSIONS_PAGE_PATH,
  UNAVAILABLE_PAGE_ACTIONS,
  USERS_PAGE_PATH,
  WAREHOUSES_2D_LEGACY_PAGE_PATH,
  WAREHOUSES_2D_PAGE_PATH,
  WAREHOUSE_PERMISSION_PATHS,
} from '@/features/permissions/constants'
import { NAV_ITEMS } from '@/shared/config/navigation'

const unavailableActionsForPath = (path) => UNAVAILABLE_PAGE_ACTIONS[path] ?? []

const RECEIPT_PAGE_PATH_SET = new Set(RECEIPT_PAGE_PATHS)

const PERMISSION_ACTION_KEYS = ['create', 'update', 'delete']

const getEnabledActionKeys = (path) =>
  PERMISSION_ACTION_KEYS.filter((key) => !isPageActionDisabled(path, key))

const isLegacyStrippedActions = (path, actions) => {
  if (GRANULAR_PERMISSION_PATHS.has(path)) {
    return false
  }

  const enabledActionKeys = getEnabledActionKeys(path)
  if (!enabledActionKeys.length) return false
  return enabledActionKeys.every((key) => actions?.[key] === false)
}

export const isPageActionUnavailable = (path, actionKey) =>
  unavailableActionsForPath(path).includes(actionKey)

export const isPageActionDisabled = (path, actionKey) =>
  isPageActionUnavailable(path, actionKey)

export const isAccessOnlyPage = (path) =>
  PERMISSION_ACTION_KEYS.every((key) => isPageActionDisabled(path, key))

const sanitizePageActions = (path, actions = {}) => {
  const next = { ...actions }
  unavailableActionsForPath(path).forEach((key) => {
    next[key] = false
  })
  return next
}

const sanitizePagePermission = (path, page) => {
  if (!page) return page
  return {
    ...page,
    actions: sanitizePageActions(path, page.actions),
  }
}

const WAREHOUSE_EXPENSE_PATH = '/omborlar/chiqim-qilish'
const WAREHOUSE_EXPENSE_LABEL = 'Chiqim (Dashboard tugmasi)'
const ALWAYS_ALLOWED_PATHS = new Set(['/chat', '/sozlamalar'])

const isAlwaysAllowedPath = (path) => ALWAYS_ALLOWED_PATHS.has(path)

export const isWarehousePermissionPath = (path) =>
  WAREHOUSE_PERMISSION_PATHS.includes(path)

export const stripWarehousePermissions = (permissions) => {
  const next = { ...permissions }
  WAREHOUSE_PERMISSION_PATHS.forEach((path) => {
    if (next[path]) {
      next[path] = createDefaultPagePermission(false, false)
    }
  })
  return next
}

export const hasGrantedWarehousePermission = (permissions) =>
  WAREHOUSE_PERMISSION_PATHS.some((path) => permissions?.[path]?.access)

const appendCustomPermissionLinks = (links, groups) => {
  const hasExpensePath =
    links.some((link) => link.path === WAREHOUSE_EXPENSE_PATH) ||
    groups.some((group) => group.pages.some((page) => page.path === WAREHOUSE_EXPENSE_PATH))

  if (hasExpensePath) {
    return links
  }

  return [
    ...links,
    {
      path: WAREHOUSE_EXPENSE_PATH,
      label: WAREHOUSE_EXPENSE_LABEL,
    },
  ]
}

export const buildCatalogFromNav = () => {
  const links = []
  const groups = []

  NAV_ITEMS.forEach((item) => {
    if (item.type === 'link') {
      links.push({ path: item.path, label: item.label })
      return
    }

    groups.push({
      key: item.label.toLowerCase().replace(/\s+/g, '-'),
      label: item.label,
      pages: item.children.map((child) => ({
        path: child.path,
        label: child.label,
      })),
    })
  })

  return { links: appendCustomPermissionLinks(links, groups), groups }
}

export const getAllPathsFromCatalog = (catalog) =>
  [
    ...catalog.links.map((item) => item.path),
    ...catalog.groups.flatMap((group) => group.pages.map((page) => page.path)),
  ].filter((path) => !isAlwaysAllowedPath(path))

export const createDefaultActions = (enabled = false) => ({
  create: enabled,
  update: enabled,
  delete: enabled,
})

export const createDefaultPagePermission = (access = false, actionsEnabled = false) => ({
  access,
  actions: createDefaultActions(access && actionsEnabled),
})

export const createEmptyPermissions = (catalog) => {
  const paths = getAllPathsFromCatalog(catalog)

  return paths.reduce((acc, path) => {
    acc[path] = createDefaultPagePermission(false, false)
    return acc
  }, {})
}

export const createFullPermissions = (catalog) => {
  const paths = getAllPathsFromCatalog(catalog)

  return paths.reduce((acc, path) => {
    acc[path] = createDefaultPagePermission(true, true)
    return acc
  }, {})
}

export const normalizePermissions = (catalog, input, options = {}) => {
  const { applyLegacy = false } = options
  const base = createEmptyPermissions(catalog)
  const paths = getAllPathsFromCatalog(catalog)
  const source = { ...input }

  if (source[WAREHOUSES_2D_LEGACY_PAGE_PATH]?.access && !source[WAREHOUSES_2D_PAGE_PATH]?.access) {
    source[WAREHOUSES_2D_PAGE_PATH] = source[WAREHOUSES_2D_LEGACY_PAGE_PATH]
  }

  paths.forEach((path) => {
    const current = input?.[path]
    const access = Boolean(current?.access)

    let actions = createDefaultActions(false)

    if (access) {
      if (GRANULAR_PERMISSION_PATHS.has(path)) {
        actions = {
          create: Boolean(current?.actions?.create),
          update: Boolean(current?.actions?.update),
          delete: Boolean(current?.actions?.delete),
        }
      } else {
        actions = {
          create: current?.actions?.create ?? true,
          update: current?.actions?.update ?? true,
          delete: current?.actions?.delete ?? true,
        }
      }
    }

    if (applyLegacy && access && isLegacyStrippedActions(path, current?.actions)) {
      actions = createDefaultActions(true)
    }

    if (access && RECEIPT_PAGE_PATH_SET.has(path)) {
      actions = { ...actions, create: true }
    }

    base[path] = sanitizePagePermission(path, {
      access,
      actions,
    })
  })

  return syncDerivedPermissions(base)
}

const syncDerivedPermissions = (permissions) => permissions

export const getGroupPaths = (group) => group.pages.map((page) => page.path)

export const getGroupCheckState = (permissions, paths) => {
  const enabledCount = paths.filter((path) => permissions[path]?.access).length

  if (enabledCount === 0) return { checked: false, indeterminate: false }
  if (enabledCount === paths.length) return { checked: true, indeterminate: false }
  return { checked: false, indeterminate: true }
}

export const getGroupActionState = (permissions, paths, actionKey) => {
  const eligiblePaths = paths.filter((path) => !isPageActionDisabled(path, actionKey))

  if (!eligiblePaths.length) {
    return { unavailable: true }
  }

  const enabledCount = eligiblePaths.filter(
    (path) => permissions[path]?.access && permissions[path]?.actions?.[actionKey],
  ).length

  if (enabledCount === 0) return { checked: false, indeterminate: false, disabled: false }
  if (enabledCount === eligiblePaths.length) {
    return { checked: true, indeterminate: false, disabled: false }
  }
  return { checked: false, indeterminate: true, disabled: false }
}

export const setGroupAccess = (permissions, paths, access) => {
  const next = { ...permissions }

  paths.forEach((path) => {
    if (GRANULAR_PERMISSION_PATHS.has(path)) {
      next[path] = sanitizePagePermission(path, {
        access,
        actions: access
          ? { create: false, update: false, delete: false }
          : createDefaultActions(false),
      })
      return
    }

    next[path] = sanitizePagePermission(
      path,
      createDefaultPagePermission(access, access),
    )
  })

  return next
}

export const setGroupAction = (permissions, paths, actionKey, enabled) => {
  const next = { ...permissions }

  paths.forEach((path) => {
    const current = next[path] ?? createDefaultPagePermission(false, false)

    if (isPageActionDisabled(path, actionKey)) {
      return
    }

    if (!enabled && !current.access) {
      if (!current.actions?.[actionKey]) {
        return
      }

      next[path] = sanitizePagePermission(path, {
        ...current,
        actions: {
          ...current.actions,
          [actionKey]: false,
        },
      })
      return
    }

    if (!current.access && enabled) {
      next[path] = sanitizePagePermission(path, {
        access: true,
        actions: {
          create: actionKey === 'create',
          update: actionKey === 'update',
          delete: actionKey === 'delete',
        },
      })
      return
    }

    next[path] = sanitizePagePermission(path, {
      ...current,
      actions: {
        ...current.actions,
        [actionKey]: enabled,
      },
    })
  })

  return next
}

export const setPageAccess = (permissions, path, access) => ({
  ...permissions,
  [path]: sanitizePagePermission(path, createDefaultPagePermission(access, access)),
})

export const setDashboardPageAccess = (permissions, access) => ({
  ...permissions,
  [DASHBOARD_PAGE_PATH]: sanitizePagePermission(DASHBOARD_PAGE_PATH, {
    access,
    actions: access
      ? { create: false, update: false, delete: false }
      : createDefaultActions(false),
  }),
})

export const setProductsPageAccess = (permissions, access) => ({
  ...permissions,
  [PRODUCTS_PAGE_PATH]: sanitizePagePermission(PRODUCTS_PAGE_PATH, {
    access,
    actions: access
      ? { create: false, update: false, delete: false }
      : createDefaultActions(false),
  }),
})

export const setScopedPageAccess = (permissions, path, access) => ({
  ...permissions,
  [path]: sanitizePagePermission(path, {
    access,
    actions: access
      ? { create: false, update: false, delete: false }
      : createDefaultActions(false),
  }),
})

export const setUsersPageAccess = (permissions, access) =>
  setScopedPageAccess(permissions, USERS_PAGE_PATH, access)

export const setStructuresPageAccess = (permissions, access) =>
  setScopedPageAccess(permissions, STRUCTURES_PAGE_PATH, access)

export const setCommissionsPageAccess = (permissions, access) =>
  setScopedPageAccess(permissions, COMMISSIONS_PAGE_PATH, access)

export const setPageAction = (permissions, path, actionKey, enabled) => {
  if (isPageActionDisabled(path, actionKey)) {
    return permissions
  }

  const current = permissions[path] ?? createDefaultPagePermission(false, false)

  if (!current.access) {
    if (!enabled) {
      if (!current.actions?.[actionKey]) {
        return permissions
      }

      return {
        ...permissions,
        [path]: sanitizePagePermission(path, {
          ...current,
          actions: {
            ...current.actions,
            [actionKey]: false,
          },
        }),
      }
    }

    return {
      ...permissions,
      [path]: sanitizePagePermission(path, {
        access: true,
        actions: {
          create: actionKey === 'create',
          update: actionKey === 'update',
          delete: actionKey === 'delete',
        },
      }),
    }
  }

  return {
    ...permissions,
    [path]: sanitizePagePermission(path, {
      ...current,
      actions: {
        ...current.actions,
        [actionKey]: enabled,
      },
    }),
  }
}

const isSuperAdminUser = (user) =>
  Boolean(user?.isSuperAdmin || user?.role === 'SUPER_ADMIN')

/** API ga faqat ruxsat berilgan sahifalarni yuborish */
export const pickGrantedPermissions = (permissions) =>
  Object.fromEntries(
    Object.entries(permissions).filter(
      ([path, permission]) => !isAlwaysAllowedPath(path) && permission?.access,
    ),
  )

/** API ga barcha sahifalarni aniq access/actions bilan yuborish (olib tashlashlar ham saqlanadi) */
export const serializePermissionsForApi = (catalog, permissions, options = {}) => {
  const normalized = normalizePermissions(catalog, permissions, {
    applyLegacy: false,
    ...options,
  })

  return Object.fromEntries(
    Object.entries(normalized).filter(([path]) => !isAlwaysAllowedPath(path)),
  )
}

const CHIQIM_HISTORY_PATH = '/omborlar/chiqim-tarixi'
const ASOSIY_VOSITALAR_PATH = '/omborlar/asosiy-vositalar'
const DASHBOARD_CALENDAR_PATH = '/dashboard/kalendar'

const resolvePermissionLookupPaths = (path) => {
  if (path === ISHONCHNOMA_PAGE_PATH) {
    return [ISHONCHNOMA_PAGE_PATH]
  }
  if (
    path.startsWith(`${PURCHASING_QUEUE_PAGE_PATH}/`) &&
    path.endsWith('/xarid-qilish')
  ) {
    return [PURCHASING_QUEUE_PAGE_PATH]
  }
  if (path.startsWith(`${USERS_PAGE_PATH}/`)) {
    return [USERS_PAGE_PATH]
  }
  if (
    path === CHIQIM_HISTORY_PATH ||
    path === ASOSIY_VOSITALAR_PATH ||
    path === WAREHOUSE_EXPENSE_PATH
  ) {
    return [WAREHOUSE_EXPENSE_PATH]
  }
  if (path === DASHBOARD_CALENDAR_PATH) {
    return ['/dashboard']
  }
  if (path === WAREHOUSES_2D_PAGE_PATH || path === WAREHOUSES_2D_LEGACY_PAGE_PATH) {
    return [WAREHOUSES_2D_PAGE_PATH, WAREHOUSES_2D_LEGACY_PAGE_PATH]
  }
  return [path]
}

export const hasPageAccess = (user, path) => {
  if (isAlwaysAllowedPath(path)) return true
  if (!user) return false
  if (isSuperAdminUser(user)) return true
  if (
    isWarehousePermissionPath(path) &&
    user.structure &&
    user.structure.hasWarehouse !== true
  ) {
    return false
  }
  return resolvePermissionLookupPaths(path).some((lookupPath) =>
    Boolean(user.permissions?.[lookupPath]?.access),
  )
}

export const hasPageAction = (user, path, actionKey) => {
  if (isAlwaysAllowedPath(path)) return true
  if (!user) return false
  if (isSuperAdminUser(user)) return true
  return resolvePermissionLookupPaths(path).some((lookupPath) => {
    const page = user.permissions?.[lookupPath]
    return Boolean(page?.access && page?.actions?.[actionKey])
  })
}

/** Qabul qilish sahifalarida Kirish ruxsati yetarli */
export const canReceiveOnPage = (user, path) => {
  if (!hasPageAccess(user, path)) return false
  if (RECEIPT_PAGE_PATH_SET.has(path)) return true
  return hasPageAction(user, path, 'create')
}
