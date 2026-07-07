const ICON_SIZE = 18

export const NavItemIcon = ({ icon: Icon, sx }) => {
  if (!Icon) {
    return null
  }

  return <Icon aria-hidden sx={{ fontSize: ICON_SIZE, display: 'block', ...sx }} />
}
