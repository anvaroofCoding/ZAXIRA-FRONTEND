import { useNavigate } from 'react-router-dom'
import { clearCredentials } from '@/features/auth/model/authSlice'
import { clearLegacyActiveSessionsStorage } from '@/features/purchase-requests/utils/activeSessionsStorage'
import { baseApi } from '@/shared/api/baseApi'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'

export const useLogout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return () => {
    clearLegacyActiveSessionsStorage()
    dispatch(clearCredentials())
    dispatch(baseApi.util.resetApiState())
    navigate('/login', { replace: true })
  }
}
