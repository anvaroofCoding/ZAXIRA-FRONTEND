import { useMemo } from 'react'
import { useGetTransferHistoryQuery } from '@/features/transfer/api/transferApi'
import { useGetAllWarehousesOverviewQuery } from '@/features/warehouse/api/warehouseApi'
import {
  buildTransferLinkPairs,
  getConnectionGeometry,
  getTransferEndpointIds,
  isActiveTransfer,
} from '@/features/warehouse/utils/warehouse2dLayout'

export const TRANSFER_FETCH_LIMIT = 200

export const useWarehouseMapData = () => {
  const overviewQuery = useGetAllWarehousesOverviewQuery()
  const transferQuery = useGetTransferHistoryQuery({
    page: 1,
    limit: TRANSFER_FETCH_LIMIT,
  })

  const warehouses = overviewQuery.data ?? []
  const transfers = transferQuery.data?.items ?? []

  const structureIds = useMemo(
    () => warehouses.map((entry) => entry.structure.id),
    [warehouses],
  )

  const maxTotalQuantity = useMemo(
    () => warehouses.reduce((max, w) => Math.max(max, w.totalQuantity ?? 0), 0),
    [warehouses],
  )

  const activeTransferCount = useMemo(
    () => transfers.filter(isActiveTransfer).length,
    [transfers],
  )

  const buildTransferLinks = (positions, getGeometry = getConnectionGeometry) =>
    buildTransferLinkPairs(structureIds, transfers)
      .map((pair) => {
        const fromPos = positions[pair.fromId]
        const toPos = positions[pair.toId]
        if (!fromPos || !toPos) return null

        const geometry = getGeometry(fromPos, toPos)
        const markers = pair.transfers.map((transfer, index) => {
          const { fromId, toId } = getTransferEndpointIds(transfer)
          const reversed = fromId !== pair.fromId || toId !== pair.toId

          return {
            transfer,
            pathD: geometry.pathD,
            reversed,
            delay: index * 4,
          }
        })

        return {
          key: `${pair.fromId}-${pair.toId}`,
          fromId: pair.fromId,
          toId: pair.toId,
          transferCount: pair.transfers.length,
          geometry,
          markers,
        }
      })
      .filter(Boolean)

  return {
    overviewQuery,
    transferQuery,
    warehouses,
    transfers,
    structureIds,
    maxTotalQuantity,
    activeTransferCount,
    buildTransferLinks,
  }
}
