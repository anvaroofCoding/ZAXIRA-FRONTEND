export const PERMISSION_ACTIONS = [
  { key: 'create', label: "Jo'natish" },
  { key: 'update', label: 'Tahrirlash' },
  { key: 'delete', label: "O'chirish" },
]

export const PERMISSION_COLUMNS = [
  { key: 'access', label: 'Kirish' },
  ...PERMISSION_ACTIONS,
]

/** Vaqtinchalik (ticket) — faqat «Kirish» qoldiriladi */
export const PURCHASE_APPROVAL_PAGE_PATH = '/xaridlar/arizalarni-tasdiqlash'
export const DASHBOARD_PAGE_PATH = '/dashboard'
export const PURCHASE_HISTORY_PAGE_PATH = '/xaridlar/arizalar-tarixi'
export const PURCHASE_STATISTICS_PAGE_PATH = '/xaridlar/sotib-olish-statistikasi'
export const PURCHASED_ITEMS_PAGE_PATH = '/xarid-qilish/xarid-qilingan-tavarlar'
export const PURCHASING_QUEUE_PAGE_PATH = '/xarid-qilish/sotib-olinadigan-tavarlar'
export const WAREHOUSE_RECEIPT_PAGE_PATH = '/xarid-qilish/xaridni-qabul-qilish'
export const ISHONCHNOMA_PAGE_PATH = '/xarid-qilish/ishonchnoma'
export const OTHER_WAREHOUSES_PAGE_PATH = '/omborlar/boshqa-omborlar'
export const WAREHOUSES_2D_PAGE_PATH = '/dashboard/2d-omborlar'
export const WAREHOUSES_2D_LEGACY_PAGE_PATH = '/omborlar/2d-omborlar'
export const WAREHOUSE_EXPENSE_PAGE_PATH = '/omborlar/chiqim-qilish'
export const TAVAR_IMPORT_PAGE_PATH = '/omborlar/tavar-import-qilish'
export const PRODUCTS_PAGE_PATH = '/dashboard/maxsulotlar'
export const TRANSFER_PAGE_PATH = '/transfer/transfer-qilish'
export const TRANSFER_RECEIPT_PAGE_PATH = '/transfer/transferni-qabul-qilish'
export const TRANSFER_HISTORY_PAGE_PATH = '/transfer/transferlar-tarixi'
export const USERS_PAGE_PATH = '/royxatga-olish/foydalanuvchilar'
export const STRUCTURES_PAGE_PATH = '/royxatga-olish/tuzilmalar'
export const COMMISSIONS_PAGE_PATH = '/royxatga-olish/komissiya-azolari'

/** Kirish va amallar alohida boshqariladigan sahifalar — legacy auto-enable qo‘llanmaydi */
export const GRANULAR_PERMISSION_PATHS = new Set([
  DASHBOARD_PAGE_PATH,
  PRODUCTS_PAGE_PATH,
  ISHONCHNOMA_PAGE_PATH,
  '/invertarizatsiya/invertarizatsiya-qilish',
  '/invertarizatsiya/barcha-invertarizatsiyalar',
  '/invertarizatsiya/boshqaruv',
  USERS_PAGE_PATH,
  STRUCTURES_PAGE_PATH,
  COMMISSIONS_PAGE_PATH,
])

/** Qabul qilish sahifalari — Kirish ruxsati qabul qilish uchun yetarli */
export const RECEIPT_PAGE_PATHS = [
  WAREHOUSE_RECEIPT_PAGE_PATH,
  TRANSFER_RECEIPT_PAGE_PATH,
]

/** Ombor bo‘lmagan tuzilmaga berilmasligi kerak bo‘lgan sahifalar */
export const WAREHOUSE_PERMISSION_PATHS = [
  '/omborlar/mening-omborim',
  '/omborlar/tavar-import-qilish',
  '/omborlar/boshqa-omborlar',
  WAREHOUSES_2D_PAGE_PATH,
  '/omborlar/chiqim-qilish',
]

export const WAREHOUSE_PERMISSION_BLOCKED_MESSAGE =
  'Ushbu tuzilmaning ombori mavjud emas'

export const WAREHOUSE_PERMISSION_SELECT_STRUCTURE_MESSAGE =
  'Avval tarkibiy tuzilmani tanlang'

export const WAREHOUSE_PERMISSION_GROUP_KEY = 'omborlar'

/** Saytda mavjud bo‘lmagan amallar — UI da chiziqcha (—), API da doim false */
export const UNAVAILABLE_PAGE_ACTIONS = {
  [DASHBOARD_PAGE_PATH]: ['update', 'delete'],
  [PURCHASE_APPROVAL_PAGE_PATH]: ['update', 'delete'],
  [PURCHASE_HISTORY_PAGE_PATH]: ['create', 'update', 'delete'],
  [PURCHASED_ITEMS_PAGE_PATH]: ['create', 'update', 'delete'],
  [PURCHASING_QUEUE_PAGE_PATH]: ['update', 'delete'],
  [WAREHOUSE_RECEIPT_PAGE_PATH]: ['update', 'delete'],
  [ISHONCHNOMA_PAGE_PATH]: ['delete'],
  [OTHER_WAREHOUSES_PAGE_PATH]: ['create', 'update', 'delete'],
  [WAREHOUSES_2D_PAGE_PATH]: ['create', 'update', 'delete'],
  [WAREHOUSE_EXPENSE_PAGE_PATH]: ['update'],
  [TAVAR_IMPORT_PAGE_PATH]: ['update', 'delete'],
  [PRODUCTS_PAGE_PATH]: ['create', 'update'],
  [TRANSFER_PAGE_PATH]: ['create', 'update', 'delete'],
  [TRANSFER_RECEIPT_PAGE_PATH]: ['update', 'delete'],
  [TRANSFER_HISTORY_PAGE_PATH]: ['create', 'delete'],
}

/** @deprecated UNAVAILABLE_PAGE_ACTIONS nomidan foydalaning */
export const DISABLED_PAGE_ACTIONS = UNAVAILABLE_PAGE_ACTIONS

export const DISABLED_PAGE_ACTION_TICKETS = {}
