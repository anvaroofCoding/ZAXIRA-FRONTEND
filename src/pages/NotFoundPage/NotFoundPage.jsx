import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'
import { useNavigate } from 'react-router-dom'
import { ErrorPageLayout } from '@/shared/components/feedback/ErrorPageLayout'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <ErrorPageLayout
      code="404"
      title="Sahifa topilmadi"
      description="Siz qidirayotgan sahifa mavjud emas, ko‘chirilgan yoki o‘chirilgan bo‘lishi mumkin."
      icon={SearchOffOutlinedIcon}
      accentColor="primary"
      primaryAction={{
        label: 'Bosh sahifaga',
        to: '/dashboard',
        startIcon: <HomeOutlinedIcon />,
      }}
      secondaryAction={{
        label: 'Orqaga',
        onClick: () => navigate(-1),
        startIcon: <ArrowBackOutlinedIcon />,
      }}
    />
  )
}
