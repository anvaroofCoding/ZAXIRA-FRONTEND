import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { env } from '@/shared/config/env'

const BetaBadge = ({ tone = 'default' }) => (
  <Box
    component="span"
    sx={(theme) => ({
      fontSize: '0.5rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      px: 0.5,
      py: 0.1,
      borderRadius: 999,
      lineHeight: 1,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      display: 'inline-block',
      ...(tone === 'onPrimary'
        ? {
            bgcolor: theme.palette.common.white,
            color: theme.palette.primary.main,
          }
        : {
            bgcolor: alpha(theme.palette.warning.main, 0.16),
            color: theme.palette.text.secondary,
          }),
    })}
  >
    Beta
  </Box>
)

export const AppLogo = ({
  component = 'div',
  to,
  onClick,
  tone = 'default',
  sx,
}) => (
  <Box
    component={component}
    to={to}
    onClick={onClick}
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      maxWidth: 'fit-content',
      textDecoration: 'none',
      color: tone === 'onPrimary' ? 'inherit' : 'text.primary',
      flexShrink: 0,
      ...sx,
    }}
  >
    <Box
      component="span"
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: 'fit-content',
        lineHeight: 1,
      }}
    >
      <Typography variant="h6" component="span" fontWeight={700} sx={{ lineHeight: 1 }}>
        {env.appName}
      </Typography>
      <Box
        component="span"
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: '100%',
          ml: '2px',
          transform: 'translateY(-58%)',
          pointerEvents: 'none',
        }}
      >
        <BetaBadge tone={tone} />
      </Box>
    </Box>
  </Box>
)
