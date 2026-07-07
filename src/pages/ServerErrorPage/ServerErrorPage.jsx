import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import { ErrorPageLayout } from '@/shared/components/feedback/ErrorPageLayout'

export const ServerErrorPage = () => (
  <ErrorPageLayout
    standalone
    code="500"
    title="Server xatosi"
    description="Serverda kutilmagan xatolik yuz berdi. Iltimos, birozdan keyin qayta urinib ko‘ring yoki texnik yordamga murojaat qiling."
    icon={CloudOffOutlinedIcon}
    accentColor="error"
    primaryAction={{
      label: 'Qayta urinish',
      onClick: () => window.location.reload(),
      startIcon: <RefreshOutlinedIcon />,
    }}
    secondaryAction={{
      label: 'Bosh sahifaga',
      to: '/dashboard',
      startIcon: <HomeOutlinedIcon />,
    }}
  />
)
