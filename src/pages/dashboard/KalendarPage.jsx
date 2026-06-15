import { useEffect, useMemo, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { DashboardCalendarPanel } from '@/features/dashboard/components/DashboardCalendarPanel'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { usePermissions } from '@/shared/hooks/usePermissions'

export const KalendarPage = () => {
  const navigate = useNavigate()
  const { user, canAccess } = usePermissions()
  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'SUPER_ADMIN'
  const viewerStructureId = user?.structureId ?? ''
  const hasDashboardAccess = canAccess('/dashboard')

  const { data: structures = [] } = useGetStructuresQuery()
  const structureOptions = useMemo(
    () => structures.filter((structure) => structure.isActive),
    [structures],
  )

  const defaultStructureId = isSuperAdmin ? 'all' : viewerStructureId || 'all'
  const [structureId, setStructureId] = useState(defaultStructureId)

  useEffect(() => {
    if (!structureId) {
      setStructureId(viewerStructureId || structureOptions[0]?.id || 'all')
      return
    }
    if (structureId === 'all') return
    const exists = structureOptions.some((structure) => structure.id === structureId)
    if (!exists) {
      setStructureId(structureOptions[0]?.id || viewerStructureId || 'all')
    }
  }, [isSuperAdmin, structureId, structureOptions, viewerStructureId])

  const scopeParam = structureId || 'all'

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Dashboard
          </Button>
          <Typography variant="h5" component="h1" fontWeight={700}>
            Kalendar
          </Typography>
        </Stack>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 260 } }}>
          <InputLabel id="calendar-structure-label">Tuzilma</InputLabel>
          <Select
            labelId="calendar-structure-label"
            label="Tuzilma"
            value={structureId}
            onChange={(event) => {
              if (hasDashboardAccess) {
                setStructureId(event.target.value)
              }
            }}
            disabled={!hasDashboardAccess}
          >
            <MenuItem value="all">Barchasi</MenuItem>
            {structureOptions.map((structure) => (
              <MenuItem key={structure.id} value={structure.id}>
                {structure.shortName}
              </MenuItem>
            ))}
            {!isSuperAdmin && !structureOptions.length ? (
              <MenuItem value={viewerStructureId || ''}>
                {user?.structure?.shortName || user?.structure?.fullName || 'Tuzilma biriktirilmagan'}
              </MenuItem>
            ) : null}
          </Select>
        </FormControl>
      </Stack>

      <DashboardCalendarPanel
        structureId={scopeParam}
        onNavigate={(path) => navigate(path)}
      />
    </Box>
  )
}
