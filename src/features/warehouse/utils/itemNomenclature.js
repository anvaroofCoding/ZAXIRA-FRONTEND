export const NOMENCLATURE_COLUMN_LABEL = 'Nomeklatura raqami'

export const getItemNomenclatureCode = (item) => {
  const value =
    item?.nomenclatureCode?.trim() ||
    item?.receiptNomenclatureCode?.trim() ||
    ''

  return value || '—'
}

export const nomenclatureTableCellSx = {
  fontFamily: 'monospace',
  fontSize: 13,
  whiteSpace: 'nowrap',
  color: 'error.main',
  fontWeight: 600,
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
