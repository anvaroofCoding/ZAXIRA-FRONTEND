import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

const HIGHLIGHT_ICONS = [
  ShoppingCartOutlinedIcon,
  WarehouseOutlinedIcon,
  AssessmentOutlinedIcon,
  SecurityOutlinedIcon,
]

export const AppAboutHero = ({ about }) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Dastur haqida
        </Typography>
      </Stack>

      <Stack spacing={2}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 2.5 },
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderStyle: 'dashed',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
              Dasturning asosiy maqsadi
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8 }}>
              {about?.purpose}
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            {(about?.highlights ?? []).map((item, index) => {
              const Icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]

              return (
                <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      height: '100%',
                      p: 2,
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        flexShrink: 0,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7 }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </Stack>
    </Box>
  )
}
