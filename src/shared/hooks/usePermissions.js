import { useCallback, useMemo } from 'react'
import {
  canReceiveOnPage as canReceiveOnPageUtil,
  hasPageAccess,
  hasPageAction,
} from '@/features/permissions/utils/permissions'
import { selectAuthUser } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/shared/hooks/useAppSelector'

export const usePermissions = () => {
  const user = useAppSelector(selectAuthUser)

  const canAccess = useCallback((path) => hasPageAccess(user, path), [user])
  const canCreate = useCallback((path) => hasPageAction(user, path, 'create'), [user])
  const canUpdate = useCallback((path) => hasPageAction(user, path, 'update'), [user])
  const canDelete = useCallback((path) => hasPageAction(user, path, 'delete'), [user])
  const canReceiveOnPage = useCallback(
    (path) => canReceiveOnPageUtil(user, path),
    [user],
  )

  return useMemo(
    () => ({
      user,
      canAccess,
      canCreate,
      canUpdate,
      canDelete,
      canReceiveOnPage,
    }),
    [user, canAccess, canCreate, canUpdate, canDelete, canReceiveOnPage],
  )
}
