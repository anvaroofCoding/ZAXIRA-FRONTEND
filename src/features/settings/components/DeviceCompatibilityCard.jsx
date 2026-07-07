import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { DeviceCompatibilityModal } from '@/features/settings/components/DeviceCompatibilityModal'
import { MIN_REQUIREMENTS } from '@/features/settings/utils/deviceCompatibility'

export const DeviceCompatibilityCard = ({ embedded = false }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const body = (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
          {!embedded ? (
            <DevicesOtherOutlinedIcon color="action" sx={{ flexShrink: 0, mt: 0.25 }} />
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Qurilma mosligi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Minimum: {MIN_REQUIREMENTS.processor}, {MIN_REQUIREMENTS.ramGb} GB RAM,{' '}
              {MIN_REQUIREMENTS.storageGb} GB disk. Tekshiruv natijasi modaldagi tahlilda chiqadi.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setModalOpen(true)}
          sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}
        >
          Qurilma dasturga mosligini tekshirish
        </Button>
      </Stack>

      <DeviceCompatibilityModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
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
