import { useMemo } from 'react'
import {
  useGetDashboardDailyMaxQuery,
  useGetDashboardMonthlyMaxQuery,
} from '@/features/dashboard/api/dashboardApi'
import { useGetWarehouseStructureAnalyticsQuery } from '@/features/warehouse/api/warehouseApi'

const outgoingFromBalance = (received, balance, prevBalance) =>
  Math.max(0, received - (balance - prevBalance))

const mapDashboardDailyPoints = (points = []) =>
  points.map((point, index, arr) => {
    const prevBalance = index > 0 ? arr[index - 1].maxQuantity : point.maxQuantity - point.received
    const outgoing = outgoingFromBalance(point.received, point.maxQuantity, prevBalance)

    return {
      label: point.day,
      received: point.received ?? 0,
      expensed: 0,
      transferred: outgoing,
      balance: point.maxQuantity ?? 0,
    }
  })

const mapDashboardMonthlyPoints = (points = []) =>
  points.map((point, index, arr) => {
    const prevBalance = index > 0 ? arr[index - 1].maxQuantity : point.maxQuantity - point.received
    const outgoing = outgoingFromBalance(point.received, point.maxQuantity, prevBalance)

    return {
      label: point.month,
      received: point.received ?? 0,
      expensed: 0,
      transferred: outgoing,
      balance: point.maxQuantity ?? 0,
    }
  })

const aggregateWeeklyFromDaily = (dailyPoints = [], weeks = 8) => {
  if (!dailyPoints.length) return []

  const startOfWeek = (dayKey) => {
    const date = new Date(`${dayKey}T00:00:00.000Z`)
    const weekday = date.getUTCDay()
    const diff = weekday === 0 ? -6 : 1 - weekday
    date.setUTCDate(date.getUTCDate() + diff)
    return date.toISOString().slice(0, 10)
  }

  const buckets = new Map()

  dailyPoints.forEach((point) => {
    const weekKey = startOfWeek(point.label)
    const bucket = buckets.get(weekKey) ?? {
      label: weekKey,
      received: 0,
      expensed: 0,
      transferred: 0,
      balance: point.balance,
    }
    bucket.received += point.received
    bucket.expensed += point.expensed
    bucket.transferred += point.transferred
    bucket.balance = point.balance
    buckets.set(weekKey, bucket)
  })

  return Array.from(buckets.values()).slice(-weeks)
}

export const useWarehouseAnalyticsData = (structureId) => {
  const analyticsQuery = useGetWarehouseStructureAnalyticsQuery(structureId, {
    skip: !structureId,
  })

  const useFallback = analyticsQuery.isError && analyticsQuery.error?.status === 404

  const dailyFallbackQuery = useGetDashboardDailyMaxQuery(
    { structureId, days: 56, offsetDays: 0 },
    { skip: !structureId || !useFallback },
  )

  const monthlyFallbackQuery = useGetDashboardMonthlyMaxQuery(
    { structureId, months: 6 },
    { skip: !structureId || !useFallback },
  )

  const data = useMemo(() => {
    if (analyticsQuery.data) return analyticsQuery.data

    if (!useFallback) return null

    const dailyPoints = mapDashboardDailyPoints(dailyFallbackQuery.data?.points).slice(-7)
    const weeklyPoints = aggregateWeeklyFromDaily(
      mapDashboardDailyPoints(dailyFallbackQuery.data?.points),
      8,
    )
    const monthlyPoints = mapDashboardMonthlyPoints(monthlyFallbackQuery.data?.points)

    return {
      structureId,
      currentQuantity: dailyPoints.at(-1)?.balance ?? 0,
      daily: { points: dailyPoints },
      weekly: { points: weeklyPoints },
      monthly: { points: monthlyPoints },
      isFallback: true,
    }
  }, [
    analyticsQuery.data,
    dailyFallbackQuery.data,
    monthlyFallbackQuery.data,
    structureId,
    useFallback,
  ])

  const isLoading =
    analyticsQuery.isLoading ||
    analyticsQuery.isFetching ||
    (useFallback &&
      (dailyFallbackQuery.isLoading ||
        dailyFallbackQuery.isFetching ||
        monthlyFallbackQuery.isLoading ||
        monthlyFallbackQuery.isFetching))

  const isError =
    !useFallback &&
    analyticsQuery.isError &&
    analyticsQuery.error?.status !== 404

  return {
    data,
    isLoading,
    isError,
    error: analyticsQuery.error,
    isFallback: Boolean(data?.isFallback),
  }
}
