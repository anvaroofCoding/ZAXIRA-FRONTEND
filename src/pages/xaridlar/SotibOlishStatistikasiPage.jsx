import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useGetPurchaseStatisticsQuery } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { PurchaseStatisticsPanel } from '@/features/purchase-requests/components/PurchaseStatisticsPanel'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const STRUCTURE_LIST_WIDTH = 280

const StructureListSkeleton = () => (
  <Stack spacing={1} sx={{ p: 1.5 }}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Skeleton key={index} variant="rounded" height={56} />
    ))}
  </Stack>
)

export const SotibOlishStatistikasiPage = () => {
  const { user } = usePermissions()
  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'SUPER_ADMIN'
  const viewerStructureId = user?.structureId ?? ''

  const [selectedStructureId, setSelectedStructureId] = useState('')
  const [granularity, setGranularity] = useState('yearly')
  const [year, setYear] = useState(new Date().getFullYear())

  const statsQuery = useGetPurchaseStatisticsQuery(
    {
      structureId: selectedStructureId || undefined,
      granularity,
      year,
    },
    { refetchOnMountOrArgChange: true },
  )

  const structures = statsQuery.data?.structures ?? []
  const canViewAllStructures = statsQuery.data?.canViewAllStructures ?? isSuperAdmin

  useEffect(() => {
    if (selectedStructureId) return

    if (statsQuery.data?.selectedStructureId) {
      setSelectedStructureId(statsQuery.data.selectedStructureId)
      return
    }

    if (!canViewAllStructures && viewerStructureId) {
      setSelectedStructureId(viewerStructureId)
      return
    }

    if (structures[0]?.id) {
      setSelectedStructureId(structures[0].id)
    }
  }, [
    canViewAllStructures,
    selectedStructureId,
    statsQuery.data?.selectedStructureId,
    structures,
    viewerStructureId,
  ])

  const selectedStructure = useMemo(
    () => structures.find((structure) => structure.id === selectedStructureId) ?? null,
    [selectedStructureId, structures],
  )

  const summary = statsQuery.data?.summary ?? selectedStructure?.summary ?? null

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Sotib olish statistikasi
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Tasdiqlangan arizalardagi tovarlar bo‘yicha tuzilmalar kesimida sotib olingan, kutilayotgan
          va mavjud emas holatlar analitikasi.
        </Typography>
      </Box>

      {statsQuery.isError ? (
        <Alert severity="error">
          {getApiErrorMessage(statsQuery.error, 'Statistikani yuklab bo‘lmadi')}
        </Alert>
      ) : null}

      <QuerySkeleton
        isLoading={statsQuery.isLoading}
        isFetching={statsQuery.isFetching}
        isUninitialized={statsQuery.isUninitialized}
        hasData={Boolean(statsQuery.data)}
        skeleton={<StructureListSkeleton />}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: 'stretch', minHeight: 520 }}
        >
          <Paper
            variant="outlined"
            sx={{
              width: { xs: '100%', md: STRUCTURE_LIST_WIDTH },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Tuzilmalar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Analitikani ko‘rish uchun tuzilmani tanlang
              </Typography>
            </Box>

            {!structures.length ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Tasdiqlangan arizalar bo‘yicha tuzilmalar topilmadi.
                </Typography>
              </Box>
            ) : (
              <List disablePadding sx={{ overflow: 'auto', flex: 1 }}>
                {structures.map((structure) => {
                  const isSelected = structure.id === selectedStructureId
                  const waitingPercent = structure.summary?.waitingPercent ?? 0

                  return (
                    <ListItemButton
                      key={structure.id}
                      selected={isSelected}
                      onClick={() => setSelectedStructureId(structure.id)}
                      sx={{
                        alignItems: 'flex-start',
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <ListItemText
                        primary={structure.shortName}
                        secondary={
                          <Box component="span" sx={{ display: 'block' }}>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {structure.fullName}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color={waitingPercent > 0 ? 'warning.main' : 'text.disabled'}
                              sx={{ display: 'block', mt: 0.25 }}
                            >
                              Kutilmoqda: {waitingPercent}%
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: isSelected ? 700 : 600 }}
                      />
                    </ListItemButton>
                  )
                })}
              </List>
            )}
          </Paper>

          <PurchaseStatisticsPanel
            structure={selectedStructure}
            summary={summary}
            points={statsQuery.data?.points ?? []}
            granularity={granularity}
            year={year}
            onGranularityChange={setGranularity}
            onYearChange={setYear}
            isLoading={statsQuery.isFetching}
            isError={statsQuery.isError}
            error={statsQuery.error}
          />
        </Stack>
      </QuerySkeleton>
    </Box>
  )
}
