import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { hideNotification, selectNotification } from '@/shared/model/notificationSlice'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'

export const GlobalSnackbar = () => {
  const dispatch = useAppDispatch()
  const notification = useAppSelector(selectNotification)

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={4500}
      onClose={() => dispatch(hideNotification())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={notification.severity}
        variant="filled"
        onClose={() => dispatch(hideNotification())}
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  )
}
