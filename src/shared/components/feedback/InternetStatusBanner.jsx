import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Slide from '@mui/material/Slide'
import Typography from '@mui/material/Typography'
import { IT_TEAM_PREFIX } from '@/features/settings/utils/internetSpeedTest'
import { useInternetMonitor } from '@/shared/hooks/useInternetMonitor'

export const InternetStatusBanner = () => {
  const { isOnline } = useInternetMonitor()

  return (
    <Slide direction="down" in={!isOnline} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.snackbar + 2,
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          icon={<WifiOffOutlinedIcon fontSize="inherit" />}
          sx={{
            borderRadius: 0,
            py: 1.25,
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Internet ishlamayapdi
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95 }}>
            {IT_TEAM_PREFIX}Aloqa uzildi. Ma’lumotlar yuklanmasligi mumkin — internetni tekshiring.
          </Typography>
        </Alert>
      </Box>
    </Slide>
  )
}
