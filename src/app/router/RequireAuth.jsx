import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectIsAuthenticated } from '@/features/auth/model/authSlice'

export const RequireAuth = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
