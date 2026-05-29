import { useLocation } from 'react-router-dom'
import { StructuresPageSkeleton } from '@/features/structures/components/StructuresPageSkeleton'
import { UsersPageSkeleton } from '@/features/users/components/UsersPageSkeleton'
import { PurchasingInboxSkeleton } from '@/features/purchase-requests/components/PurchasingInboxSkeletons'
import {
  DashboardSkeleton,
  PageContentSkeleton,
  TableSkeleton,
} from '@/shared/components/skeleton'
import { resolveSkeletonVariant, SKELETON_VARIANTS } from '@/shared/config/skeletonVariants'

const skeletonByVariant = {
  [SKELETON_VARIANTS.dashboard]: DashboardSkeleton,
  [SKELETON_VARIANTS.users]: UsersPageSkeleton,
  [SKELETON_VARIANTS.structures]: StructuresPageSkeleton,
  [SKELETON_VARIANTS.purchasingQueue]: () => (
    <PurchasingInboxSkeleton ariaLabel="Sotib olinadigan tavarlar yuklanmoqda" />
  ),
  [SKELETON_VARIANTS.purchasingPurchased]: () => (
    <PurchasingInboxSkeleton
      variant="purchased"
      showPurchaseTotal
      ariaLabel="Xarid qilingan tavarlar yuklanmoqda"
    />
  ),
  [SKELETON_VARIANTS.purchasingReceipt]: () => (
    <PurchasingInboxSkeleton variant="receipt" ariaLabel="Xaridni qabul qilish yuklanmoqda" />
  ),
  [SKELETON_VARIANTS.table]: TableSkeleton,
  [SKELETON_VARIANTS.page]: PageContentSkeleton,
}

export const RoutePageSkeleton = () => {
  const { pathname } = useLocation()
  const variant = resolveSkeletonVariant(pathname)
  const SkeletonComponent = skeletonByVariant[variant] ?? PageContentSkeleton

  return <SkeletonComponent />
}
