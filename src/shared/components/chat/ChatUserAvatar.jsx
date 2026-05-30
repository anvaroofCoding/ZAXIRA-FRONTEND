import Avatar from '@mui/material/Avatar'

const palette = [
  '#1976d2',
  '#2e7d32',
  '#ed6c02',
  '#9c27b0',
  '#d32f2f',
  '#00838f',
  '#5d4037',
  '#455a64',
]

const hashString = (value = '') => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const initialsFromName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export const ChatUserAvatar = ({ name, size = 40 }) => {
  const label = initialsFromName(name)
  const bgcolor = palette[hashString(name) % palette.length]

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor,
        fontSize: size > 36 ? 15 : 13,
        fontWeight: 700,
      }}
    >
      {label}
    </Avatar>
  )
}
