import JsBarcode from 'jsbarcode'
import { detectBarcodeFormat } from '@/features/warehouse/utils/barcodeImage'

/** Termal etiket printerlar (Xprinter va h.k.) odatda 203 yoki 300 DPI */
const THERMAL_DPI_DEFAULT = 203
const THERMAL_DPI_HIGH = 300

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const normalizeCount = (value) => {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (Number.isNaN(n) || n < 1) return 1
  return Math.min(500, n)
}

const dotsPerMm = (dpi) => dpi / 25.4

const estimateCode128Modules = (value) => {
  const len = String(value ?? '').length
  if (len < 1) return 60
  return len * 11 + 35
}

const computeModuleWidth = (barcode, innerWidthMm, dpi) => {
  const modules = estimateCode128Modules(barcode)
  const availableDots = Math.floor(innerWidthMm * dotsPerMm(dpi))
  let w = Math.floor(availableDots / modules)
  w = Math.max(2, Math.min(4, w))
  return w
}

const renderBarcodeDataUrl = (barcode, { moduleWidth, barHeightPx }) => {
  const canvas = document.createElement('canvas')
  const format = detectBarcodeFormat(barcode)

  JsBarcode(canvas, barcode, {
    format,
    width: moduleWidth,
    height: barHeightPx,
    displayValue: false,
    margin: 0,
    lineColor: '#000000',
    background: '#ffffff',
    ...(format.startsWith('EAN') ? { flat: true } : {}),
  })

  return {
    dataUrl: canvas.toDataURL('image/png'),
    widthPx: canvas.width,
    heightPx: canvas.height,
  }
}

const pxToMm = (px, dpi) => (px / dpi) * 25.4

const buildPrintHtml = (rendered, { labelWidthMm, labelHeightMm, layout, paddingMm, pageSizeCss, gridCss, labelPageBreak }) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Print</title>
    <style>
      ${pageSizeCss}
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      html, body { margin: 0; padding: 0; }
      body { font-family: Arial, Helvetica, sans-serif; color: #000; background: #fff; }
      ${gridCss}
      .label {
        width: ${labelWidthMm}mm;
        height: ${labelHeightMm}mm;
        padding: ${paddingMm}mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        background: #fff;
        ${labelPageBreak}
      }
      .label:last-child {
        page-break-after: auto;
        break-after: auto;
      }
      .name {
        font-size: 8pt;
        font-weight: 700;
        line-height: 1.1;
        max-height: 9mm;
        overflow: hidden;
        word-break: break-word;
        color: #000;
      }
      .barcode-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
        width: 100%;
      }
      .barcode-img {
        display: block;
        max-width: 100%;
        height: auto;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
      .value {
        font-size: 6.5pt;
        text-align: center;
        font-family: 'Courier New', Courier, monospace;
        letter-spacing: 0.3px;
        color: #000;
        line-height: 1;
      }
      @media print {
        html, body { width: ${labelWidthMm}mm; }
        .label { border: none; outline: none; }
      }
    </style>
  </head>
  <body>
    <div class="grid">
      ${rendered
        .map((l) => {
          const barcodeImg = l.barcodeSrc
            ? `<img
                class="barcode-img"
                src="${l.barcodeSrc}"
                alt=""
                style="width:${l.barcodeWidthMm.toFixed(3)}mm;height:${l.barcodeHeightMm.toFixed(3)}mm;"
              />`
            : ''
          return `<div class="label">
            <div class="name">${escapeHtml(l.name)}</div>
            <div class="barcode-wrap">${barcodeImg}</div>
            <div class="value">${escapeHtml(l.barcode)}</div>
          </div>`
        })
        .join('')}
    </div>
  </body>
</html>`

const waitForImagesThenPrint = (doc, win, onDone) => {
  const triggerPrint = () => {
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      onDone()
    }
    win.focus()
    win.addEventListener('afterprint', finish, { once: true })
    win.print()
    win.setTimeout(finish, 3000)
  }

  const images = doc.querySelectorAll('.barcode-img')
  if (!images.length) {
    win.setTimeout(triggerPrint, 80)
    return
  }

  let pending = images.length
  const onReady = () => {
    pending -= 1
    if (pending <= 0) win.setTimeout(triggerPrint, 120)
  }

  images.forEach((img) => {
    if (img.complete) onReady()
    else {
      img.addEventListener('load', onReady, { once: true })
      img.addEventListener('error', onReady, { once: true })
    }
  })
}

/**
 * Barcode label print helper.
 * Yashirin iframe orqali chop etadi (about:blank popup muammosiz).
 */
export const printBarcodeLabels = ({ items, options = {} }) => {
  const labelWidthMm = options.labelWidthMm ?? 50
  const labelHeightMm = options.labelHeightMm ?? 30
  const dpi = options.dpi === 300 ? THERMAL_DPI_HIGH : THERMAL_DPI_DEFAULT
  const layout = options.layout ?? 'roll'
  const paddingMm = options.paddingMm ?? 2
  const barHeightMm = options.barHeightMm ?? 10

  const innerWidthMm = Math.max(10, labelWidthMm - paddingMm * 2)
  const dpm = dotsPerMm(dpi)
  const barHeightPx = Math.round(barHeightMm * dpm)

  const labels = items.flatMap((item) => {
    const count = normalizeCount(item.count)
    return Array.from({ length: count }).map(() => ({
      name: String(item.name ?? ''),
      barcode: String(item.barcode ?? '').trim(),
    }))
  })

  if (!labels.length) return

  const rendered = labels.map((label) => {
    if (!label.barcode) {
      return { ...label, barcodeSrc: null, barcodeWidthMm: 0, barcodeHeightMm: 0 }
    }
    try {
      const moduleWidth = computeModuleWidth(label.barcode, innerWidthMm, dpi)
      const { dataUrl, widthPx, heightPx } = renderBarcodeDataUrl(label.barcode, {
        moduleWidth,
        barHeightPx,
      })
      return {
        ...label,
        barcodeSrc: dataUrl,
        barcodeWidthMm: pxToMm(widthPx, dpi),
        barcodeHeightMm: pxToMm(heightPx, dpi),
      }
    } catch {
      return { ...label, barcodeSrc: null, barcodeWidthMm: 0, barcodeHeightMm: 0 }
    }
  })

  const pageSizeCss =
    layout === 'roll'
      ? `@page { size: ${labelWidthMm}mm ${labelHeightMm}mm; margin: 0; }`
      : `@page { margin: 4mm; size: auto; }`

  const labelPageBreak =
    layout === 'roll' ? 'page-break-after: always; break-after: page;' : ''

  const gridCss =
    layout === 'sheet'
      ? `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, ${labelWidthMm}mm);
        gap: 2mm;
        padding: 4mm;
        justify-content: start;
      }`
      : `
      .grid {
        margin: 0;
        padding: 0;
      }`

  const html = buildPrintHtml(rendered, {
    labelWidthMm,
    labelHeightMm,
    layout,
    paddingMm,
    pageSizeCss,
    gridCss,
    labelPageBreak,
  })

  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'Barcode print')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:fixed;left:0;top:0;width:0;height:0;border:0;opacity:0;pointer-events:none'

  const cleanup = () => {
    iframe.remove()
  }

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    cleanup()
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  const startPrint = () => waitForImagesThenPrint(doc, win, cleanup)

  if (doc.readyState === 'complete') {
    win.setTimeout(startPrint, 0)
  } else {
    win.addEventListener('load', startPrint, { once: true })
  }
}
