import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { AppLogo } from '@/shared/components/layout/AppLogo'

const ActionButton = ({ action, variant }) => {
  const { label, to, onClick, startIcon } = action

  if (to) {
    return (
      <Button
        component={RouterLink}
        to={to}
        variant={variant}
        size="large"
        startIcon={startIcon}
        sx={{ minWidth: { xs: '100%', sm: 180 } }}
      >
        {label}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size="large"
      startIcon={startIcon}
      onClick={onClick}
      sx={{ minWidth: { xs: '100%', sm: 180 } }}
    >
      {label}
    </Button>
  )
}

export const ErrorPageLayout = ({
  code,
  title,
  description,
  icon: Icon,
  accentColor = 'primary',
  primaryAction,
  secondaryAction,
  standalone = false,
  children,
}) => {
  const content = (
    <Stack
      spacing={3}
      alignItems="center"
      textAlign="center"
      sx={{ position: 'relative', zIndex: 1, py: standalone ? 0 : { xs: 4, sm: 6 }, px: 2 }}
    >
      <Box
        sx={(theme) => ({
          width: 88,
          height: 88,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette[accentColor].main, 0.12),
          color: `${accentColor}.main`,
          boxShadow: `0 0 0 12px ${alpha(theme.palette[accentColor].main, 0.06)}`,
        })}
      >
        <Icon sx={{ fontSize: 44 }} />
      </Box>

      <Typography
        aria-hidden
        sx={(theme) => ({
          fontSize: { xs: '4.5rem', sm: '6.5rem' },
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: `linear-gradient(160deg, ${theme.palette[accentColor].main} 0%, ${alpha(theme.palette[accentColor].main, 0.45)} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          userSelect: 'none',
        })}
      >
        {code}
      </Typography>

      <Stack spacing={1} sx={{ maxWidth: 460 }}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {description}
        </Typography>
        {children}
      </Stack>

      {(primaryAction || secondaryAction) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ pt: 1, width: { xs: '100%', sm: 'auto' }, maxWidth: 400 }}
        >
          {primaryAction ? <ActionButton action={primaryAction} variant="contained" /> : null}
          {secondaryAction ? <ActionButton action={secondaryAction} variant="outlined" /> : null}
        </Stack>
      )}
    </Stack>
  )

  if (!standalone) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        {content}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          top: '-12%',
          right: '-8%',
          width: { xs: 280, sm: 420 },
          height: { xs: 280, sm: 420 },
          borderRadius: '50%',
          bgcolor: alpha(theme.palette[accentColor].main, 0.07),
        })}
      />
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          bottom: '-18%',
          left: '-12%',
          width: { xs: 320, sm: 520 },
          height: { xs: 320, sm: 520 },
          borderRadius: '50%',
          bgcolor: alpha(theme.palette[accentColor].main, 0.04),
        })}
      />

      <Box sx={{ position: 'absolute', top: { xs: 16, sm: 24 }, left: { xs: 16, sm: 24 } }}>
        <AppLogo component={RouterLink} to="/" />
      </Box>

      {content}
    </Box>
  )
}
