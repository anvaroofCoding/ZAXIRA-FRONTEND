import { hasPageAccess } from '@/features/permissions/utils/permissions'

export const filterNavByPermissions = (items, user) => {
  // Token bor, profil hali yuklanmagan — menyu vaqtincha ko‘rinadi (keyin filtr qo‘llanadi)
  if (!user) {
    return items
  }

  return items
    .map((item) => {
      if (item.type === 'link') {
        return hasPageAccess(user, item.path) ? item : null
      }

      const children = item.children.filter((child) =>
        hasPageAccess(user, child.path),
      )

      if (!children.length) {
        return null
      }

      return { ...item, children }
    })
    .filter(Boolean)
}
