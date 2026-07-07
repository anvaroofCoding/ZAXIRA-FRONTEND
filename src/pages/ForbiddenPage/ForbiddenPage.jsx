import { useState } from 'react'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import { ErrorPageLayout } from '@/shared/components/feedback/ErrorPageLayout'
import { readSessionExpiredMessage } from '@/shared/utils/sessionExpired'

export const ForbiddenPage = () => {
  const [message] = useState(() => readSessionExpiredMessage())

  return (
    <ErrorPageLayout
      standalone
      code="403"
      title="Ruxsat berilmagan"
      description={message}
      icon={LockOutlinedIcon}
      accentColor="warning"
      primaryAction={{
        label: 'Login sahifasiga',
        to: '/login',
        startIcon: <LoginOutlinedIcon />,
      }}
    />
  )
}
