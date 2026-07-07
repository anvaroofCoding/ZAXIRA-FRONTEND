import { useState } from 'react'
import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import { BarcodeDetailDialog } from '@/features/warehouse/components/BarcodeDetailDialog'
import { BarcodeImage } from '@/features/warehouse/components/BarcodeImage'

export const BarcodeTableCell = ({
  value,
  productName,
  align,
  width,
  sx,
  imageHeight = 32,
}) => {
  const [open, setOpen] = useState(false)
  const barcode = String(value ?? '').trim()

  return (
    <>
      <TableCell align={align} width={width} sx={sx}>
        {barcode ? (
          <Tooltip title="Barcode ko‘rish" placement="top">
            <Box
              component="button"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setOpen(true)
              }}
              sx={{
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                p: 0.25,
                borderRadius: 1,
                display: 'inline-flex',
                alignItems: 'center',
                maxWidth: '100%',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <BarcodeImage value={barcode} height={imageHeight} maxWidth={140} />
            </Box>
          </Tooltip>
        ) : (
          <BarcodeImage value="" />
        )}
      </TableCell>

      <BarcodeDetailDialog
        open={open}
        onClose={() => setOpen(false)}
        barcode={barcode}
        productName={productName}
      />
    </>
  )
}
