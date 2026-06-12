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
}
