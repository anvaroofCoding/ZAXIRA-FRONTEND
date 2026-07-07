import JsBarcode from 'jsbarcode'

export const detectBarcodeFormat = (value) => {
  const s = String(value ?? '').trim()
  if (/^\d{13}$/.test(s)) return 'EAN13'
  if (/^\d{8}$/.test(s)) return 'EAN8'
  if (/^\d{12}$/.test(s)) return 'UPC'
  return 'CODE128'
}

export const renderBarcodeToDataUrl = (
  barcode,
  { height = 40, displayValue = false, moduleWidth, margin = 2 } = {},
) => {
  const normalized = String(barcode ?? '').trim()
  if (!normalized) return null

  const canvas = document.createElement('canvas')
  const format = detectBarcodeFormat(normalized)
  const width = moduleWidth ?? (normalized.length > 12 ? 1 : 2)

  JsBarcode(canvas, normalized, {
    format,
    width,
    height,
    displayValue,
    margin,
    fontSize: 12,
    lineColor: '#000000',
    background: '#ffffff',
    ...(format.startsWith('EAN') ? { flat: true } : {}),
  })

  return canvas.toDataURL('image/png')
}
