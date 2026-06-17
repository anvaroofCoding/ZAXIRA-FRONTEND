const TABLE_ROUTE_PATTERNS = [
  'tarixi',
  'tasdiqlash',
  'invertarizatsiya',
  'boshqaruv',
  'qilingan-tavarlar',
  'olinadigan-tavarlar',
]

export const SKELETON_VARIANTS = {
  dashboard: 'dashboard',
  users: 'users',
  structures: 'structures',
  commissions: 'commissions',
  purchaseRequestsSubmit: 'purchaseRequestsSubmit',
  purchasingQueue: 'purchasingQueue',
  purchasingPurchased: 'purchasingPurchased',
  purchasingReceipt: 'purchasingReceipt',
  table: 'table',
  page: 'page',
}

export const resolveSkeletonVariant = (pathname) => {
  if (pathname === '/dashboard' || pathname.endsWith('/dashboard')) {
    return SKELETON_VARIANTS.dashboard
  }

  if (pathname.includes('/royxatga-olish/foydalanuvchilar')) {
    return SKELETON_VARIANTS.users
  }

  if (pathname.includes('/royxatga-olish/tuzilmalar')) {
    return SKELETON_VARIANTS.structures
  }

  if (pathname.includes('/royxatga-olish/komissiya-azolari')) {
    return SKELETON_VARIANTS.commissions
  }

  if (pathname.includes('/xaridlar/arizalar-yuborish')) {
    return SKELETON_VARIANTS.purchaseRequestsSubmit
  }

  if (pathname.includes('/xarid-qilish/sotib-olinadigan-tavarlar')) {
    return SKELETON_VARIANTS.purchasingQueue
  }

  if (pathname.includes('/xarid-qilish/xarid-qilingan-tavarlar')) {
    return SKELETON_VARIANTS.purchasingPurchased
  }

  if (pathname.includes('/xarid-qilish/xaridni-qabul-qilish')) {
    return SKELETON_VARIANTS.purchasingReceipt
  }

  if (TABLE_ROUTE_PATTERNS.some((pattern) => pathname.includes(pattern))) {
    return SKELETON_VARIANTS.table
  }

  return SKELETON_VARIANTS.page
}
