import { NAV_ITEMS } from '@/shared/config/navigation'

const WAREHOUSE_EXPENSE_PATH = '/omborlar/chiqim-qilish'
const WAREHOUSE_EXPENSE_LABEL = 'Chiqim qilish (Dashboard tugmasi)'
const ALWAYS_ALLOWED_PATHS = new Set(['/chat'])

const isAlwaysAllowedPath = (path) => ALWAYS_ALLOWED_PATHS.has(path)

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

export const normalizePermissions = (catalog, input) => {
  const base = createEmptyPermissions(catalog)
  const paths = getAllPathsFromCatalog(catalog)

  paths.forEach((path) => {
    const current = input?.[path]
    const access = Boolean(current?.access)

    base[path] = {
      access,
      actions: access
        ? {
            create: current?.actions?.create ?? true,
            update: current?.actions?.update ?? true,
            delete: current?.actions?.delete ?? true,
          }
        : createDefaultActions(false),
    }
  })

  return base
}

export const getGroupPaths = (group) => group.pages.map((page) => page.path)

export const getGroupCheckState = (permissions, paths) => {
  const enabledCount = paths.filter((path) => permissions[path]?.access).length

  if (enabledCount === 0) return { checked: false, indeterminate: false }
  if (enabledCount === paths.length) return { checked: true, indeterminate: false }
  return { checked: false, indeterminate: true }
}

export const getGroupActionState = (permissions, paths, actionKey) => {
  const enabledCount = paths.filter(
    (path) => permissions[path]?.access && permissions[path]?.actions?.[actionKey],
  ).length

  if (enabledCount === 0) return { checked: false, indeterminate: false }
  if (enabledCount === paths.length) return { checked: true, indeterminate: false }
  return { checked: false, indeterminate: true }
}

export const setGroupAccess = (permissions, paths, access) => {
  const next = { ...permissions }

  paths.forEach((path) => {
    next[path] = createDefaultPagePermission(access, access)
  })

  return next
}

export const setGroupAction = (permissions, paths, actionKey, enabled) => {
  const next = { ...permissions }

  paths.forEach((path) => {
    const current = next[path] ?? createDefaultPagePermission(false, false)

    if (!current.access) {
      return
    }

    next[path] = {
      ...current,
      actions: {
        ...current.actions,
        [actionKey]: enabled,
      },
    }
  })

  return next
}

export const setPageAccess = (permissions, path, access) => ({
  ...permissions,
  [path]: createDefaultPagePermission(access, access),
})

export const setPageAction = (permissions, path, actionKey, enabled) => {
  const current = permissions[path] ?? createDefaultPagePermission(false, false)

  if (!current.access) {
    return permissions
  }

  return {
    ...permissions,
    [path]: {
      ...current,
      actions: {
        ...current.actions,
        [actionKey]: enabled,
      },
    },
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

export const hasPageAccess = (user, path) => {
  if (isAlwaysAllowedPath(path)) return true
  if (!user) return false
  if (isSuperAdminUser(user)) return true
  return Boolean(user.permissions?.[path]?.access)
}

export const hasPageAction = (user, path, actionKey) => {
  if (isAlwaysAllowedPath(path)) return true
  if (!user) return false
  if (isSuperAdminUser(user)) return true
  const page = user.permissions?.[path]
  return Boolean(page?.access && page?.actions?.[actionKey])
}
