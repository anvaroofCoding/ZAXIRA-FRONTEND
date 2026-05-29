import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { selectIsAuthenticated } from '@/features/auth/model/authSlice'

export const GuestRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
