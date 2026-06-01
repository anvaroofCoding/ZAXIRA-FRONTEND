import { Suspense, useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hasPageAccess } from '@/features/permissions/utils/permissions'
import { selectAuthUser } from '@/features/auth/model/authSlice'
import { PERMISSION_DENIED_MESSAGE } from '@/shared/constants/messages'
import { RoutePageSkeleton } from '@/shared/components/feedback/RoutePageSkeleton'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { showNotification } from '@/shared/model/notificationSlice'
import { RouteKeyOutlet } from './RouteKeyOutlet'

export const PermissionRoute = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const user = useAppSelector(selectAuthUser)
  const path = location.pathname
  const lastDeniedPathRef = useRef(null)

  const allowed = hasPageAccess(user, path)

  useEffect(() => {
    if (!user || allowed) return
    if (lastDeniedPathRef.current === path) return

    lastDeniedPathRef.current = path
    dispatch(
      showNotification({
        message: PERMISSION_DENIED_MESSAGE,
        severity: 'warning',
      }),
    )
  }, [allowed, dispatch, path, user])

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Suspense key={path} fallback={<RoutePageSkeleton />}>
      <RouteKeyOutlet />
    </Suspense>
  )
}
