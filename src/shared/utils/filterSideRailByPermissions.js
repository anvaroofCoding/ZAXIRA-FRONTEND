import { hasPageAccess } from '@/features/permissions/utils/permissions'

export const filterSideRailByPermissions = (items, user) => {
  if (!user) {
    return items
  }

  return items.filter((item) => hasPageAccess(user, item.path))
}

export const isSideRailItemActive = (path, pathname) => {
  if (path === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/'
  }

  return pathname === path || pathname.startsWith(`${path}/`)
}
