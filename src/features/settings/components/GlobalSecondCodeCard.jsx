import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GlobalSecondCodeForm } from './GlobalSecondCodeForm'

export const GlobalSecondCodeCard = ({ embedded = false }) => {
  const body = (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {!embedded ? <VpnKeyOutlinedIcon color="action" sx={{ mt: 0.25 }} /> : null}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Umumiy kod
          </Typography>
        </Box>
      </Stack>
      <GlobalSecondCodeForm showDescription />
    </Stack>
  )

  if (embedded) {
    return body
  }

  return (
    <Card variant="outlined">
      <CardContent>{body}</CardContent>
    </Card>
  )
}
