import Skeleton from '@mui/material/Skeleton'

export const SkeletonBlock = ({
  width = '100%',
  height = 16,
  variant = 'rounded',
  animation = 'wave',
  sx,
}) => (
  <Skeleton
    variant={variant}
    width={width}
    height={height}
    animation={animation}
    sx={sx}
  />
)
