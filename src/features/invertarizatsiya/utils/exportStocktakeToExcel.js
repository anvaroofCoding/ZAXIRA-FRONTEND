import * as XLSX from 'xlsx'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getItemNomenclatureCode } from '@/features/warehouse/utils/itemNomenclature'

const LINE_HEADERS = [
  '№',
  'Tovar',
  'Nomeklatura',
  'Barcode',
  'Xususiyat',
  'Kitobda',
  'Sanaldi',
  "Ko'p",
  'Kam',
  'Farq',
]

const STATUS_LABELS = {
  completed: 'Yakunlangan',
  cancelled: 'Bekor qilingan',
  in_progress: 'Jarayonda',
}

const sanitizeFilenamePart = (value) =>
  String(value ?? 'invertarizatsiya')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim()
    .slice(0, 48) || 'invertarizatsiya'

const stocktakeModeLabel = (stocktake) =>
  stocktake?.mode === 'location' ? `Joy: ${stocktake.locationName || '—'}` : 'Umumiy'

const formatExcessCell = (line) => (line.excessQuantity > 0 ? line.excessQuantity : '')

const formatShortageCell = (line) => (line.shortageQuantity > 0 ? line.shortageQuantity : '')

export const exportStocktakeToExcel = (stocktake) => {
  if (!stocktake) return

  const lines = stocktake.lines ?? []
  const infoRows = [
    ['Kod', stocktake.code ?? ''],
    ['Tuzilma', stocktake.structureName ?? ''],
    ['Turi', stocktakeModeLabel(stocktake)],
    ['Holat', STATUS_LABELS[stocktake.status] ?? stocktake.status ?? ''],
    ['Yaratilgan sana', stocktake.createdAt ? formatDateTime(stocktake.createdAt) : ''],
    [
      'Yakunlangan sana',
      stocktake.updatedAt && stocktake.status === 'completed'
        ? formatDateTime(stocktake.updatedAt)
        : '',
    ],
    ['Izoh', stocktake.comment?.trim() || ''],
    [],
    LINE_HEADERS,
  ]

  const lineRows = lines.map((line, index) => [
    index + 1,
    line.name ?? '',
    getItemNomenclatureCode(line),
    line.barcode ?? '',
    line.characteristics?.trim() || '',
    line.bookQuantity ?? 0,
    line.countedQuantity ?? 0,
    formatExcessCell(line),
    formatShortageCell(line),
    line.diff ?? 0,
  ])

  const worksheet = XLSX.utils.aoa_to_sheet([...infoRows, ...lineRows])
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 36 },
    { wch: 18 },
    { wch: 18 },
    { wch: 28 },
    { wch: 10 },
    { wch: 10 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invertarizatsiya')

  const datePart = new Date().toISOString().slice(0, 10)
  const filename = `${sanitizeFilenamePart(stocktake.code)}_${datePart}.xlsx`

  XLSX.writeFile(workbook, filename)
}
