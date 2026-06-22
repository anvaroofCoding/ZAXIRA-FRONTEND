import * as XLSX from 'xlsx'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getItemNomenclatureDisplay } from '@/features/warehouse/utils/itemNomenclature'

const EXCEL_HEADERS = [
  '№',
  'Tovar',
  'Nomeklatura',
  'Barcode',
  'Xususiyat',
  'Soni',
  "1 dona narxi (so'm)",
  "Jami summa (so'm)",
  'Oxirgi qabul',
]

const sanitizeFilenamePart = (value) =>
  String(value ?? 'ombor')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim()
    .slice(0, 40) || 'ombor'

export const exportWarehouseInventoryToExcel = ({ items, locationName, search = '' }) => {
  const rows = items.map((item, index) => {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Math.round(Number(item.unitPrice) || 0)
    const lineTotal =
      Math.round(Number(item.lineTotal) || 0) || unitPrice * quantity

    return [
      index + 1,
      item.name ?? '',
      getItemNomenclatureDisplay(item),
      item.barcode ?? '',
      item.characteristics?.trim() || '',
      quantity,
      unitPrice > 0 ? unitPrice : '',
      lineTotal > 0 ? lineTotal : '',
      item.lastReceiptAt ? formatDateTime(item.lastReceiptAt) : '',
    ]
  })

  const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS, ...rows])
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 42 },
    { wch: 18 },
    { wch: 18 },
    { wch: 32 },
    { wch: 10 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tovarlar')

  const datePart = new Date().toISOString().slice(0, 10)
  const searchPart = search.trim() ? '_qidiruv' : ''
  const filename = `Ombor_${sanitizeFilenamePart(locationName)}${searchPart}_${datePart}.xlsx`

  XLSX.writeFile(workbook, filename)
}

export const fetchAllWarehouseInventoryItems = async (fetchInventory, { locationId, search, total }) => {
  const limit = 500
  const pageCount = Math.max(1, Math.ceil((total || 0) / limit))
  const allItems = []

  for (let page = 1; page <= pageCount; page += 1) {
    const result = await fetchInventory({
      locationId,
      page,
      limit,
      search,
    }).unwrap()

    allItems.push(...(result.items ?? []))

    if ((result.items ?? []).length < limit) {
      break
    }
  }

  return allItems
}
