import { useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/features/auth/api/authApi'
import { clearCredentials } from '@/features/auth/model/authSlice'
import { clearLegacyActiveSessionsStorage } from '@/features/purchase-requests/utils/activeSessionsStorage'
import { baseApi } from '@/shared/api/baseApi'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'

export const useLogout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [logout] = useLogoutMutation()

  return async () => {
    try {
      await logout().unwrap()
    } catch {
      // Chiqish davom etadi — token muddati tugagan bo‘lishi mumkin
    }

    clearLegacyActiveSessionsStorage()
    dispatch(clearCredentials())
    dispatch(baseApi.util.resetApiState())
    navigate('/login', { replace: true })
  }
}
