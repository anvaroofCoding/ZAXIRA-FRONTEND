export const isPrivilegedAdminUser = (user) =>
  Boolean(
    user?.isSuperAdmin ||
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'ADMIN',
  )
