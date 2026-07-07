import { useEffect, useMemo, useState } from 'react'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useMarkAppGuideWatchedMutation } from '@/features/app-usage/api/appUsageApi'
import { useGuideVideoSource } from '@/features/app-usage/hooks/useGuideVideoSource'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const GuideVideoPlayer = ({ guideId, open }) => {
  const { src, loading, error } = useGuideVideoSource(guideId, open)

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" align="center" sx={{ py: 4 }}>
        {error}
      </Typography>
    )
  }

  if (!src) return null

  return (
    <Box
      component="video"
      src={src}
      controls
      playsInline
      sx={{
        width: '100%',
        maxHeight: 420,
        borderRadius: 1,
        bgcolor: '#000',
        display: 'block',
      }}
    />
  )
}

const GuideDetailDialog = ({ guide, open, onClose }) => {
  const dispatch = useAppDispatch()
  const [markWatched, markState] = useMarkAppGuideWatchedMutation()
  const [markedWatched, setMarkedWatched] = useState(false)

  useEffect(() => {
    if (!open) {
      setMarkedWatched(false)
    }
  }, [open, guide?.id])

  const isWatched = guide?.watched || markedWatched

  const handleMarkWatched = async () => {
    if (!guide?.id || isWatched) return

    try {
      await markWatched(guide.id).unwrap()
      setMarkedWatched(true)
      dispatch(
        showNotification({
          severity: 'success',
          message: 'Qo‘llanma ko‘rilgan deb belgilandi',
        }),
      )
    } catch (e) {
      dispatch(
        showNotification({
          severity: 'error',
          message: getApiErrorMessage(e, 'Belgilashda xatolik'),
        }),
      )
    }
  }

  if (!guide) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={700}>
            {guide.title}
          </Typography>
          {isWatched ? (
            <Chip
              size="small"
              color="success"
              icon={<CheckCircleOutlinedIcon />}
              label="Ko‘rilgan"
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            />
          ) : null}
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {guide.hasVideo ? <GuideVideoPlayer guideId={guide.id} open={open} /> : null}
          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8 }}>
            {guide.description}
          </Typography>
          {guide.externalLink ? (
            <Button
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              href={guide.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ alignSelf: 'flex-start' }}
            >
              Qo‘shimcha havola
            </Button>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Yopish</Button>
        {!isWatched ? (
          <Button
            variant="contained"
            disabled={markState.isLoading}
            onClick={handleMarkWatched}
            startIcon={
              markState.isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlinedIcon />
            }
          >
            Ko‘rdim
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}

const GuideCard = ({ guide, onOpen }) => {
  const theme = useTheme()
  const isWatched = guide.watched
  const accent = isWatched ? theme.palette.success : theme.palette.primary

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        bgcolor: accent.main,
        color: accent.contrastText,
        border: 'none',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          bgcolor: accent.dark,
          boxShadow: `0 10px 28px ${alpha(accent.main, 0.35)}`,
        },
      }}
    >
      <Stack
        direction="row"
        gap={1}
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(accent.contrastText, 0.18),
            color: accent.contrastText,
          }}
        >
          {isWatched ? <CheckCircleOutlinedIcon /> : <PlayCircleOutlinedIcon />}
        </Box>
        {isWatched ? (
          <Chip
            size="small"
            label="Ko‘rilgan"
            sx={{
              fontWeight: 600,
              bgcolor: alpha(accent.contrastText, 0.18),
              color: accent.contrastText,
              border: `1px solid ${alpha(accent.contrastText, 0.35)}`,
            }}
          />
        ) : null}
      </Stack>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {guide.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.7,
            color: alpha(accent.contrastText, 0.88),
          }}
        >
          {guide.description}
        </Typography>
      </Box>

      <Button
        variant="contained"
        onClick={() => onOpen(guide)}
        sx={{
          alignSelf: 'flex-start',
          bgcolor: accent.contrastText,
          color: accent.main,
          fontWeight: 700,
          '&:hover': {
            bgcolor: alpha(accent.contrastText, 0.9),
          },
        }}
      >
        {guide.watched ? 'Qayta ko‘rish' : 'Qo‘llanmani ochish'}
      </Button>
    </Paper>
  )
}

export const AppGuidesSection = ({ guides = [], loading = false }) => {
  const [selectedGuide, setSelectedGuide] = useState(null)

  const stats = useMemo(() => {
    const watchedCount = guides.filter((guide) => guide.watched).length
    const total = guides.length
    const percent = total ? Math.round((watchedCount / total) * 100) : 0
    return { watchedCount, total, percent }
  }, [guides])

  return (
    <>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
              width: '100%',
            }}
          >
            <Typography variant="h5" component="h2" fontWeight={800}>
              Foydalanish bo‘yicha qo‘llanmalar
            </Typography>
            {stats.total ? (
              <Chip
                label={`${stats.watchedCount} / ${stats.total} ko‘rilgan`}
                color={stats.percent === 100 ? 'success' : 'primary'}
                variant={stats.percent === 100 ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700, ml: { md: 'auto' }, flexShrink: 0 }}
              />
            ) : null}
          </Box>

          {stats.total ? (
            <Box>
              <Stack
                direction="row"
                sx={{
                  mb: 0.75,
                  width: '100%',
                  gap: 1,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Umumiy progress
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ flexShrink: 0 }}>
                  {stats.percent}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={stats.percent}
                sx={{ height: 8, borderRadius: 99 }}
              />
            </Box>
          ) : null}

          {loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 1 }).map((_, index) => (
                <Grid key={`guide-skeleton-${index}`} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={1.5}>
                      <Skeleton variant="rounded" width={42} height={42} />
                      <Skeleton variant="text" width="75%" />
                      <Skeleton variant="text" width="95%" />
                      <Skeleton variant="text" width="82%" />
                      <Skeleton variant="rounded" width={156} height={36} />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : !guides.length ? (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'action.hover',
                borderStyle: 'dashed',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Hozircha qo‘llanmalar yuklanmagan. Administrator tez orada video qo‘llanmalarni
                joylashtiradi.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {guides.map((guide) => (
                <Grid key={guide.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <GuideCard guide={guide} onOpen={setSelectedGuide} />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Paper>

      <GuideDetailDialog
        guide={selectedGuide}
        open={Boolean(selectedGuide)}
        onClose={() => setSelectedGuide(null)}
      />
    </>
  )
}
