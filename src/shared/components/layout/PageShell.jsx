import Paper from '@mui/material/Paper'

/**
 * Sahifa ichidagi asosiy blok — to‘liq kenglikda (AppContainer ichida).
 */
export const PageShell = ({ children, sx, ...props }) => (
  <Paper
    variant="outlined"
    sx={{
      width: '100%',
      p: { xs: 2, sm: 2.5 },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Paper>
)
