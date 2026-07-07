import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { renderBarcodeToDataUrl } from '@/features/warehouse/utils/barcodeImage'

export const BarcodeImage = ({
  value,
  height = 36,
  maxWidth = '100%',
  displayValue = false,
  fallback = '—',
}) => {
  const barcode = String(value ?? '').trim()

  const src = useMemo(() => {
    if (!barcode) return null
    try {
      return renderBarcodeToDataUrl(barcode, {
        height,
        displayValue,
        moduleWidth: height <= 40 ? 1 : 2,
        margin: displayValue ? 8 : 4,
      })
    } catch {
      return null
    }
  }, [barcode, height, displayValue])

  if (!barcode) {
    return (
      <Typography variant="body2" color="text.secondary">
        {fallback}
      </Typography>
    )
  }

  if (!src) {
    return (
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {barcode}
      </Typography>
    )
  }

  return (
    <Box
      component="img"
      src={src}
      alt={barcode}
      draggable={false}
      sx={{
        display: 'block',
        maxWidth,
        height: 'auto',
        maxHeight: displayValue ? height + 24 : height,
        imageRendering: 'pixelated',
      }}
    />
  )
}
