import { hasPageAction } from '@/features/permissions/utils/permissions'
import { PERMISSION_DENIED_MESSAGE } from '@/shared/constants/messages'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'

export const usePermissionToast = () => {
  const dispatch = useAppDispatch()
  const { user } = usePermissions()

  const notifyDenied = () => {
    dispatch(
      showNotification({
        message: PERMISSION_DENIED_MESSAGE,
        severity: 'warning',
      }),
    )
  }

  const guardAction = (path, actionKey, callback) => {
    if (!hasPageAction(user, path, actionKey)) {
      notifyDenied()
      return false
    }

    callback?.()
    return true
  }

  return { notifyDenied, guardAction }
}
