export const STOCKTAKE_TABS = [
  { key: 'hammasi', label: 'Hammasi' },
  { key: 'kam', label: 'Kam' },
  { key: 'ko_p', label: 'Ko‘p' },
]

export const filterStocktakeLines = (lines, tabKey) => {
  if (tabKey === 'kam') {
    return lines.filter((line) => line.countedQuantity > 0 && line.countedQuantity < line.bookQuantity)
  }
  if (tabKey === 'ko_p') {
    return lines.filter((line) => line.countedQuantity > line.bookQuantity)
  }
  return lines
}
