import { useNavigate, useParams } from 'react-router-dom'
import { CompletePurchaseForm } from '@/features/purchase-requests/components/CompletePurchaseForm'
import { PURCHASING_QUEUE_PAGE_PATH } from '@/features/permissions/constants'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'

export const XaridQilishPage = () => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleCancel = () => {
    navigate(PURCHASING_QUEUE_PAGE_PATH)
  }

  const handleSuccess = (message) => {
    if (message) {
      dispatch(
        showNotification({
          message,
          severity: 'success',
        }),
      )
      return
    }

    dispatch(
      showNotification({
        message: 'Xarid muvaffaqiyatli yakunlandi',
        severity: 'success',
      }),
    )
    navigate(PURCHASING_QUEUE_PAGE_PATH)
  }

  return (
    <CompletePurchaseForm
      requestId={requestId}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  )
}
