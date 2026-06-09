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
export const OTHER_WAREHOUSES_PAGE_PATH = '/omborlar/boshqa-omborlar'
export const WAREHOUSE_EXPENSE_PAGE_PATH = '/omborlar/chiqim-qilish'
export const PRODUCTS_PAGE_PATH = '/dashboard/maxsulotlar'
export const TRANSFER_PAGE_PATH = '/transfer/transfer-qilish'
export const TRANSFER_RECEIPT_PAGE_PATH = '/transfer/transferni-qabul-qilish'
export const TRANSFER_HISTORY_PAGE_PATH = '/transfer/transferlar-tarixi'
export const DISABLED_PAGE_ACTIONS = {
  [PURCHASE_APPROVAL_PAGE_PATH]: ['update', 'delete'],
  [PURCHASE_HISTORY_PAGE_PATH]: ['create', 'update', 'delete'],
  [PURCHASED_ITEMS_PAGE_PATH]: ['create', 'update', 'delete'],
  [PURCHASING_QUEUE_PAGE_PATH]: ['update', 'delete'],
  [WAREHOUSE_RECEIPT_PAGE_PATH]: ['update', 'delete'],
  [OTHER_WAREHOUSES_PAGE_PATH]: ['create', 'update', 'delete'],
  [WAREHOUSE_EXPENSE_PAGE_PATH]: ['update'],
  [PRODUCTS_PAGE_PATH]: ['create', 'update'],
  [TRANSFER_PAGE_PATH]: ['create', 'update', 'delete'],
  [TRANSFER_RECEIPT_PAGE_PATH]: ['create', 'update', 'delete'],
  [TRANSFER_HISTORY_PAGE_PATH]: ['create', 'update', 'delete'],
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
  [WAREHOUSE_EXPENSE_PAGE_PATH]:
    "Ticket: Chiqim qilish sahifasida Tahrirlash vaqtincha o'chirilgan",
  [PRODUCTS_PAGE_PATH]:
    "Ticket: Maxsulotlar sahifasida Jo'natish va Tahrirlash vaqtincha o'chirilgan. Arxivlash — O'chirish ruxsati orqali",
  [TRANSFER_PAGE_PATH]:
    "Ticket: Transfer qilish sahifasida Jo'natish, Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [TRANSFER_RECEIPT_PAGE_PATH]:
    "Ticket: Transferni qabul qilish sahifasida Jo'natish, Tahrirlash va O'chirish vaqtincha o'chirilgan",
  [TRANSFER_HISTORY_PAGE_PATH]:
    "Ticket: Transferlar tarixi sahifasida Jo'natish, Tahrirlash va O'chirish vaqtincha o'chirilgan",
}
