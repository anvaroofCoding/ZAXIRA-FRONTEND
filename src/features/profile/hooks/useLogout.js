import { useNavigate } from 'react-router-dom'
import { clearCredentials } from '@/features/auth/model/authSlice'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'

export const useLogout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return () => {
    dispatch(clearCredentials())
    navigate('/login', { replace: true })
  }
}
