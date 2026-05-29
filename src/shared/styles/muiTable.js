/** MUI docs-style table (Paper + sticky header + outlined). */
export const muiTablePaperSx = {
  width: '100%',
  overflow: 'hidden',
}

export const muiTableHeadCellSx = {
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.43,
  color: 'text.primary',
  bgcolor: 'action.hover',
  borderBottom: 1,
  borderColor: 'divider',
  whiteSpace: 'nowrap',
}

export const muiTableRowSx = {
  '&:last-child td, &:last-child th': { border: 0 },
  '&.MuiTableRow-hover:hover': {
    bgcolor: 'action.hover',
  },
}
