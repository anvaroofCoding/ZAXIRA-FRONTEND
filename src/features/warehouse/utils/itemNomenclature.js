export const NOMENCLATURE_COLUMN_LABEL = 'Nomeklatura'

export const isItemNomenclatureMissing = (item) =>
  !(
    item?.nomenclatureCode?.trim() ||
    item?.receiptNomenclatureCode?.trim()
  )

export const getItemNomenclatureCode = (item) => {
  const value =
    item?.nomenclatureCode?.trim() ||
    item?.receiptNomenclatureCode?.trim() ||
    ''

  return value || '—'
}

export const getItemNomenclatureDisplay = (item) => {
  if (isItemNomenclatureMissing(item)) {
    return 'Yozilmagan'
  }

  return getItemNomenclatureCode(item)
}

export const nomenclatureMissingTableCellSx = {
  color: 'warning.main',
  fontStyle: 'italic',
  fontWeight: 500,
  fontSize: 13,
}

export const nomenclatureTableCellSx = {
  fontFamily: 'monospace',
  fontSize: 13,
  color: 'error.main',
  fontWeight: 600,
  maxWidth: 220,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
}

export const nomenclatureManualInputSx = {
  minWidth: 150,
  '& .MuiInputBase-input': {
    color: 'error.main',
    fontFamily: 'monospace',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
}
