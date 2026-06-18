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
export const PURCHASE_HISTORY_PAGE_PATH = '/xaridlar/arizalar-tarixi'
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
export const DISABLED_PAGE_ACTIONS = {
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

export const DISABLED_PAGE_ACTION_TICKETS = {
  [PURCHASE_APPROVAL_PAGE_PATH]:
    "Ticket: Arizalarni tasdiqlash sahifasida Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [PURCHASE_HISTORY_PAGE_PATH]:
    "Ticket: Arizalar tarixi sahifasida Jo'natish, Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [PURCHASED_ITEMS_PAGE_PATH]:
    "Ticket: Xarid qilingan maxsulotlar sahifasida Jo'natish, Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [PURCHASING_QUEUE_PAGE_PATH]:
    "Ticket: Sotib olinadigan maxsulotlar sahifasida Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [WAREHOUSE_RECEIPT_PAGE_PATH]:
    "Ticket: Xaridni qabul qilish sahifasida Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [OTHER_WAREHOUSES_PAGE_PATH]:
    "Ticket: Boshqa omborlar sahifasida Jo'natish, Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [WAREHOUSES_2D_PAGE_PATH]:
    'Faqat ko‘rish ruxsati: sahifaga kirish bo‘lsa, barcha ma’lumotlarni ko‘rish mumkin',
  [WAREHOUSE_EXPENSE_PAGE_PATH]:
    "Ticket: Chiqim qilish sahifasida Tahrirlash vaqtincha o'chirilgan",
  [TAVAR_IMPORT_PAGE_PATH]:
    "Tavar import qilish sahifasida faqat Kirish va Jo'natish (import) ruxsatlari qo'llaniladi",
  [PRODUCTS_PAGE_PATH]:
    "Ticket: Maxsulotlar sahifasida Jo'natish va Tahrirlash vaqtincha o'chirilgan. Arxivlash — O'chirish ruxsati orqali",
  [TRANSFER_PAGE_PATH]:
    "Ticket: Transfer qilish sahifasida Jo'natish, Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [TRANSFER_RECEIPT_PAGE_PATH]:
    "Ticket: Transferni qabul qilish sahifasida Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [TRANSFER_HISTORY_PAGE_PATH]:
    "Ticket: Transferlar tarixi sahifasida Jo'natish va O'chirish vaqtincha o'chirilgan. Bekor qilish — Tahrirlash ruxsati orqali",
}
